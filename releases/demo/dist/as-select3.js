/*!
 * As-Select3 - Modern JavaScript Select Library
 * Version: 1.4.0
 * Author: Sunil Kumar
 * Repository: https://github.com/sunil4587/As-select3
 * License: MIT
 */
(function($) {
    'use strict';

    const DEFAULTS = {
        placeholder: 'Choose an option...',
        searchable: true,
        selectAll: true,
        clearAll: true,
        maxSelection: null,
        remote: null,
        searchDelay: 300,
        noResultsText: 'No results found',
        loadingText: 'Loading...',
        searchPlaceholder: 'Search options...',
        selectAllText: 'Select All',
        clearAllText: 'Clear All',
        defaultIconClass: 'as-select3-arrow-down',
        iconPrefix: null,
        allowHtml: true,
        fuzzySearch: true,
        highlightMatches: true,
        virtualScrolling: false,
        itemHeight: 32,
        maxHeight: 300,
        escapeMarkup: markup => markup,
        templateResult: null,
        templateSelection: null,
        matcher: null
    };

    class AsSelect3 {
        constructor(element, options = {}) {
            if (!$(element).length) {
                throw new Error(`As-Select3: Element "${element}" not found`);
            }

            this.$element = $(element);
            this.element = this.$element[0];
            this.isMultiple = this.$element.attr('multiple') !== undefined;
            
            this.options = Object.assign({}, DEFAULTS, {
                placeholder: this.isMultiple ? 'Select options...' : DEFAULTS.placeholder,
                selectAll: this.isMultiple && DEFAULTS.selectAll,
                searchable: this.$element.data('search') !== false
            }, options);

            this._initContainer();
            this._initState();
            this.init();
        }

        _initContainer() {
            let $container = this.$element.closest('.as-select3-container');
            if (!$container.length) {
                $container = $('<div class="as-select3-container"></div>');
                this.$element.before($container);
                $container.append(this.$element);
            }
            this.$container = $container;
        }

        _initState() {
            this.isOpen = false;
            this.focusIndex = -1;
            this.selectedValues = this.isMultiple ? [] : (this.$element.find('option:selected').val() || null);
            this.isLoading = false;
            this.searchTimer = null;
            this.searchCache = new Map();
            this.boundHandlers = {};
        }

        init() {
            this.createUI();
            this.bindEvents();
            this.updateFromSelect();
            this.storeOriginalOptions();
        }

        createUI() {
            const triggerHTML = `
                <div class="as-select3-trigger" tabindex="0" role="combobox" aria-expanded="false">
                    <div class="as-select3-selection">
                        <span class="as-select3-placeholder">${this.options.placeholder}</span>
                    </div>
                    <span class="${this.options.defaultIconClass} as-select3-arrow"></span>
                </div>
            `;
            
            this.$trigger = $(triggerHTML);
            this.$selection = this.$trigger.find('.as-select3-selection');
            this.$placeholder = this.$trigger.find('.as-select3-placeholder');
            this.$arrow = this.$trigger.find('.as-select3-arrow');
            
            this.$container.append(this.$trigger);
            this.$element.addClass('d-none');
            
            this.createDropdown();
        }

        createDropdown() {
            this.$dropdown = $('<div class="as-select3-dropdown" role="listbox"></div>');

            if (this.options.searchable) {
                this.createSearch();
            }
            
            this.createOptionsContainer();
            
            if (this.isMultiple && (this.shouldShowSelectAll() || this.options.clearAll)) {
                this.createActions();
            }
            
            this.$container.append(this.$dropdown);
        }

        createSearch() {
            const searchHTML = `
                <div class="as-select3-search">
                    <div class="position-relative w-100">
                        <input type="text" class="form-control form-control-sm" 
                               role="searchbox" placeholder="${this.options.searchPlaceholder}">
                        <span class="as-select3-close as-select3-search-clear"></span>
                    </div>
                </div>
            `;
            
            const $searchWrapper = $(searchHTML);
            this.$searchInput = $searchWrapper.find('input');
            this.$dropdown.append($searchWrapper);
        }

        createOptionsContainer() {
            this.$optionsContainer = $('<ul class="as-select3-options"></ul>');
            
            this.$element.find('option').each((index, option) => {
                this.$optionsContainer.append(this.createOptionElement(option, index));
            });

            this.$dropdown.append(this.$optionsContainer);
        }

        createOptionElement(optionData, index) {
            const isHtmlOption = optionData instanceof HTMLOptionElement;
            const data = isHtmlOption ? {
                value: optionData.value,
                text: optionData.text,
                selected: optionData.selected,
                icon: $(optionData).data('icon') || $(optionData).attr('data-icon'),
                html: $(optionData).data('html') || $(optionData).attr('data-html') || $(optionData).html(),
                disabled: optionData.disabled
            } : optionData;

            const $option = $('<li class="as-select3-option" role="option" tabindex="-1"></li>')
                .addClass(data.selected ? 'selected' : '')
                .addClass(data.disabled ? 'disabled' : '')
                .attr({
                    'data-value': data.value,
                    'data-index': index,
                    'data-text': data.text,
                    'data-icon': data.icon || '',
                    'data-html': data.html || '',
                    'aria-selected': data.selected.toString()
                });

            const $optionLeft = $('<div class="as-select3-option-left"></div>');

            if (data.icon) {
                const $iconContainer = $('<div class="as-select3-option-icon"></div>');
                this.addIcon($iconContainer, data.icon);
                $optionLeft.append($iconContainer);
            }

            $optionLeft.append($('<span class="as-select3-option-text"></span>').text(data.text));
            $option.append($optionLeft);

            if (this.isMultiple) {
                $option.append($('<input type="checkbox" class="form-check-input">').prop('checked', data.selected));
            }

            return $option;
        }

        addIcon($container, icon, size = '16px') {
            if (!icon) return;

            if (icon.match(/^(https?:|data:|\.?\/)/)) {
                $container.append($('<img>').attr({ src: icon, alt: '' }).css({
                    width: size,
                    height: size,
                    objectFit: 'cover'
                }));
            } else if (this.isIconClass(icon)) {
                const $icon = $('<i></i>').addClass(icon);
                $container.append($icon);
            } else {
                $container.html(icon);
            }
        }

        isIconClass(icon) {
            const iconPrefixes = ['bi-', 'fa-', 'fas-', 'far-', 'fab-', 'material-icons', 'icon-'];
            return iconPrefixes.some(prefix => icon.includes(prefix)) || 
                   (this.options.iconPrefix && icon.startsWith(this.options.iconPrefix));
        }

        shouldShowSelectAll() {
            if (!this.options.selectAll) return false;
            if (!this.options.maxSelection) return true;
            
            const availableOptionsCount = this.$element.find('option:not(:disabled)').length;
            return this.options.maxSelection >= availableOptionsCount;
        }

        createActions() {
            if (!this.isMultiple) return;

            const showSelectAll = this.shouldShowSelectAll();
            const actionsHTML = `
                <div class="as-select3-actions">
                    ${showSelectAll ? `<button type="button" class="btn btn-sm btn-outline-primary select-all">${this.options.selectAllText}</button>` : ''}
                    ${this.options.clearAll ? `<button type="button" class="btn btn-sm btn-outline-secondary clear-all">${this.options.clearAllText}</button>` : ''}
                </div>
            `;
            
            this.$dropdown.append(actionsHTML);
        }

        bindEvents() {
            this.boundHandlers = {
                triggerClick: this.handleTriggerClick.bind(this),
                documentClick: this.handleDocumentClick.bind(this),
                keyDown: this.handleKeyDown.bind(this),
                optionClick: this.handleOptionClick.bind(this),
                searchInput: this.debounce(this.handleSearchInput.bind(this), this.options.searchDelay),
                clearClick: this.handleClearClick.bind(this),
                actionClick: this.handleActionClick.bind(this)
            };

            this.$trigger.on('click', this.boundHandlers.triggerClick);
            this.$trigger.on('keydown', this.boundHandlers.keyDown);
            this.$container.on('click', '.as-select3-option', this.boundHandlers.optionClick);
            this.$container.on('click', '.as-select3-clear, .as-select3-tag-remove, .as-select3-search-clear', this.boundHandlers.clearClick);
            this.$container.on('click', '.select-all, .clear-all', this.boundHandlers.actionClick);
            
            if (this.$searchInput) {
                this.$searchInput.on('input', this.boundHandlers.searchInput);
            }

            $(document).on('click.asSelect3', this.boundHandlers.documentClick);
        }

        handleTriggerClick(e) {
            if ($(e.target).hasClass('as-select3-clear')) return;
            e.preventDefault();
            this.toggle();
        }

        handleDocumentClick(e) {
            if (this.$container.is(e.target) || this.$container.has(e.target).length) return;
            this.close();
        }

        handleKeyDown(e) {
            const keyActions = {
                'Enter': () => this.isOpen ? this.selectFocused() : this.open(),
                ' ': () => this.isOpen ? this.selectFocused() : this.open(),
                'Escape': () => this.isOpen && this.close(),
                'ArrowDown': () => this.isOpen ? this.focusNext() : this.open(),
                'ArrowUp': () => this.isOpen ? this.focusPrevious() : this.open()
            };

            if (keyActions[e.key]) {
                e.preventDefault();
                keyActions[e.key]();
            }
        }

        handleOptionClick(e) {
            const $option = $(e.currentTarget);
            if ($option.hasClass('disabled')) return;
            this.toggleOption($option);
        }

        handleSearchInput(e) {
            const query = e.target.value;
            if (this.options.remote && typeof this.options.remote === 'function') {
                this.remoteSearch(query);
            } else {
                this.search(query);
            }
        }

        handleClearClick(e) {
            e.stopPropagation();
            const $target = $(e.target);
            
            if ($target.hasClass('as-select3-search-clear')) {
                this.$searchInput.val('').trigger('input').focus();
            } else if ($target.hasClass('as-select3-tag-remove')) {
                const value = $target.closest('.as-select3-tag').data('value');
                this.removeTag(value);
            } else if ($target.hasClass('as-select3-clear')) {
                this.clearSingle();
            }
        }

        handleActionClick(e) {
            const $target = $(e.target);
            if ($target.hasClass('select-all')) {
                this.selectAll();
            } else if ($target.hasClass('clear-all')) {
                this.clearAll();
            }
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        open() {
            if (this.isOpen) return;
            
            this.isOpen = true;
            this.$dropdown.addClass('show');
            this.$trigger.addClass('active').attr('aria-expanded', 'true');
            this.$container.addClass('active');
            
            if (this.$searchInput) {
                requestAnimationFrame(() => this.$searchInput.focus());
            }
            
            this.$element.trigger('asSelect3:open');
        }

        close() {
            if (!this.isOpen) return;
            
            this.isOpen = false;
            this.$dropdown.removeClass('show');
            this.$trigger.removeClass('active').attr('aria-expanded', 'false');
            this.$container.removeClass('active');
            this.focusIndex = -1;
            
            if (this.$searchInput) {
                this.$searchInput.val('');
                this.search('');
            }
            
            this.$element.trigger('asSelect3:close');
        }

        toggleOption($option) {
            if (!$option?.length || $option.hasClass('disabled')) return;

            const value = $option.data('value');
            const isSelected = $option.hasClass('selected');
            
            if (isSelected) {
                this.deselectOption($option, value);
            } else {
                this.selectOption($option, value);
            }
            
            this.updateSelection();
            this.$element.trigger('change').trigger('asSelect3:change', { value: this.getValue() });
        }

        selectOption($option, value) {
            if (this.isMultiple) {
                if (this.options.maxSelection && this.selectedValues.length >= this.options.maxSelection) {
                    this.$element.trigger('asSelect3:maxselection', { max: this.options.maxSelection });
                    return;
                }
                this.selectedValues.push(value);
                $option.addClass('selected').attr('aria-selected', 'true');
                $option.find('input[type="checkbox"]').prop('checked', true);
                this.updateOptionStates();
            } else {
                this.$optionsContainer.find('.as-select3-option').removeClass('selected').attr('aria-selected', 'false');
                this.$element.find('option').prop('selected', false);
                this.selectedValues = value;
                $option.addClass('selected').attr('aria-selected', 'true');
                this.close();
            }
            
            this.$element.find(`option[value="${value}"]`).prop('selected', true);
        }

        updateOptionStates() {
            if (this.isMultiple && this.options.maxSelection) {
                const isMaxReached = this.selectedValues.length >= this.options.maxSelection;
                
                this.$optionsContainer.find('.as-select3-option').each((index, option) => {
                    const $option = $(option);
                    const isSelected = $option.hasClass('selected');
                    const $checkbox = $option.find('input[type="checkbox"]');
                    
                    if (isMaxReached && !isSelected) {
                        $option.addClass('disabled').attr('aria-disabled', 'true');
                        $checkbox.prop('disabled', true);
                    } else {
                        $option.removeClass('disabled').attr('aria-disabled', 'false');
                        $checkbox.prop('disabled', false);
                    }
                });
            }
        }

        deselectOption($option, value) {
            $option.removeClass('selected').attr('aria-selected', 'false');
            this.$element.find(`option[value="${value}"]`).prop('selected', false);
            
            if (this.isMultiple) {
                $option.find('input[type="checkbox"]').prop('checked', false);
                this.selectedValues = this.selectedValues.filter(v => v !== value);
                this.updateOptionStates();
            } else {
                this.selectedValues = null;
            }
        }

        search(query) {
            if (this.searchCache.has(query)) {
                this.applySearchResults(this.searchCache.get(query));
                return;
            }

            const $options = this.$optionsContainer.find('.as-select3-option');
            const results = [];
            let hasResults = false;

            $options.each((index, option) => {
                const $option = $(option);
                const text = $option.data('text') || $option.text();
                const matches = this.matchText(text, query);
                
                if (matches) {
                    hasResults = true;
                    results.push($option);
                    if (this.options.highlightMatches && query) {
                        this.highlightText($option, text, query);
                    }
                }
                
                $option.toggle(matches);
            });

            this.searchCache.set(query, results);
            this.toggleNoResults(!hasResults && query.length > 0);
        }

        applySearchResults(results) {
            const $options = this.$optionsContainer.find('.as-select3-option');
            $options.each((index, option) => {
                const $option = $(option);
                const isMatch = results.some(result => result.is($option));
                $option.toggle(isMatch);
            });
        }

        matchText(text, query) {
            if (!query) return true;
            
            const textLower = text.toLowerCase();
            const queryLower = query.toLowerCase();
            
            return textLower.includes(queryLower);
        }

        highlightText($option, text, query) {
            const $textElement = $option.find('.as-select3-option-text');
            if (!query || !$textElement.length) return;
            
            const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
            const highlighted = text.replace(regex, '<mark class="as-select3-highlight">$1</mark>');
            $textElement.html(highlighted);
        }

        escapeRegex(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        async remoteSearch(query) {
            if (!this.options.remote || typeof this.options.remote !== 'function') return;

            this.showLoading();

            try {
                const results = await this.options.remote(query);
                
                if (Array.isArray(results)) {
                    this.populateOptions(results);
                } else if (results && results.options && Array.isArray(results.options)) {
                    this.populateOptions(results.options);
                } else if (results && results.data && Array.isArray(results.data)) {
                    this.populateOptions(results.data);
                } else {
                    console.warn('Invalid remote response:', results);
                    this.showNoResults();
                }
            } catch (error) {
                console.error('Remote search error:', error);
                this.showNoResults();
                this.$element.trigger('asSelect3:error', { error });
            } finally {
                this.hideLoading();
            }
        }

        showLoading() {
            this.isLoading = true;
            this.hideNoResults();
            this.$optionsContainer.find('.as-select3-option').hide();
            
            if (!this.$optionsContainer.find('.as-select3-loading').length) {
                this.$optionsContainer.append(`
                    <li class="as-select3-loading">
                        <div class="spinner-border spinner-border-sm me-2"></div>
                        ${this.options.loadingText}
                    </li>
                `);
            }
        }

        hideLoading() {
            this.isLoading = false;
            this.$optionsContainer.find('.as-select3-loading').remove();
            this.$optionsContainer.find('.as-select3-option').show();
        }

        showNoResults() {
            this.toggleNoResults(true);
        }

        hideNoResults() {
            this.toggleNoResults(false);
        }

        populateOptions(options = []) {
            // Clear existing options
            this.$optionsContainer.find('.as-select3-option').remove();
            this.$optionsContainer.find('.as-select3-no-results, .as-select3-loading').remove();
            
            // Clear original select options for remote data
            if (this.options.remote) {
                this.$element.empty();
            }
            
            if (!options || options.length === 0) {
                this.showNoResults();
                return;
            }
            
            options.forEach((option, index) => {
                // Normalize option data
                const optionData = {
                    value: option.value || option.id,
                    text: option.text || option.label || option.name || option.title,
                    selected: !!option.selected,
                    disabled: !!option.disabled,
                    icon: option.icon,
                    html: option.html
                };
                
                // Create the option element and add to dropdown
                const $optionElement = this.createOptionElement(optionData, index);
                this.$optionsContainer.append($optionElement);
                
                // Also add to the original select element for form submission
                const $selectOption = $('<option></option>')
                    .val(optionData.value)
                    .text(optionData.text)
                    .prop('selected', optionData.selected);
                
                if (optionData.icon) $selectOption.attr('data-icon', optionData.icon);
                if (optionData.html) $selectOption.attr('data-html', optionData.html);
                if (optionData.disabled) $selectOption.prop('disabled', true);
                
                this.$element.append($selectOption);
            });
            
            this.hideNoResults();
            
            // Trigger event to notify that options have been populated
            this.$element.trigger('asSelect3:optionsPopulated', { options: options });
        }

        toggleNoResults(show) {
            this.$optionsContainer.find('.as-select3-no-results').remove();
            
            if (show) {
                this.$optionsContainer.append(`
                    <li class="as-select3-no-results">
                        ${this.options.noResultsText}
                    </li>
                `);
            }
        }

        focusNext() {
            const $options = this.$optionsContainer.find('.as-select3-option:visible:not(.disabled)');
            if (!$options.length) return;

            this.$optionsContainer.find('.focused').removeClass('focused');
            this.focusIndex = this.focusIndex < $options.length - 1 ? this.focusIndex + 1 : 0;
            $options.eq(this.focusIndex).addClass('focused');
        }

        focusPrevious() {
            const $options = this.$optionsContainer.find('.as-select3-option:visible:not(.disabled)');
            if (!$options.length) return;

            this.$optionsContainer.find('.focused').removeClass('focused');
            this.focusIndex = this.focusIndex > 0 ? this.focusIndex - 1 : $options.length - 1;
            $options.eq(this.focusIndex).addClass('focused');
        }

        selectFocused() {
            const $focused = this.$optionsContainer.find('.focused');
            if ($focused.length) {
                this.toggleOption($focused);
            }
        }

        updateSelection() {
            this.$selection.empty();
            
            if (this.isMultiple) {
                if (this.selectedValues.length > 0) {
                    this.selectedValues.forEach(value => {
                        const $originalOption = this.$element.find(`option[value="${value}"]`);
                        const $dropdownOption = this.$optionsContainer.find(`[data-value="${value}"]`);
                        
                        if ($originalOption.length) {
                            const text = $originalOption.text();
                            const icon = $originalOption.attr('data-icon') || $dropdownOption.data('icon');
                            this.$selection.append(this.createTag(text, value, icon));
                        }
                    });
                } else {
                    this.$selection.append(this.$placeholder);
                }
            } else {
                if (this.selectedValues) {
                    const $originalOption = this.$element.find(`option[value="${this.selectedValues}"]`);
                    const $dropdownOption = this.$optionsContainer.find(`[data-value="${this.selectedValues}"]`);
                    
                    if ($originalOption.length) {
                        const text = $originalOption.text();
                        const icon = $originalOption.attr('data-icon') || $dropdownOption.data('icon');
                        this.$selection.append(this.createSingleValue(text, icon));
                    }
                } else {
                    this.$selection.append(this.$placeholder);
                }
            }
        }

        createTag(text, value, icon) {
            const $tag = $('<span class="as-select3-tag"></span>').data('value', value);
            
            if (icon) {
                const $icon = $('<div class="as-select3-tag-icon"></div>');
                this.addIcon($icon, icon);
                $tag.append($icon);
            }
            
            $tag.append($('<span class="as-select3-tag-text"></span>').text(text).attr('title', text));
            $tag.append($('<span class="as-select3-close as-select3-tag-remove"></span>'));
            
            return $tag;
        }

        createSingleValue(text, icon) {
            const $container = $('<div class="as-select3-single-container"></div>');
            const $value = $('<span class="as-select3-single-value"></span>');
            
            if (icon) {
                const $icon = $('<div class="as-select3-single-icon"></div>');
                this.addIcon($icon, icon);
                $value.append($icon);
            }
            
            $value.append($('<span></span>').text(text));
            $container.append($value);
            $container.append($('<span class="as-select3-close as-select3-clear"></span>'));
            
            return $container;
        }

        selectAll() {
            if (!this.isMultiple) return;
            
            this.$element.find('option:not(:disabled)').prop('selected', true);
            this.selectedValues = this.$element.find('option:selected').map((i, opt) => opt.value).get();
            
            this.$optionsContainer.find('.as-select3-option:not(.disabled)')
                .addClass('selected')
                .attr('aria-selected', 'true')
                .find('input[type="checkbox"]').prop('checked', true);
            
            this.updateSelection();
            this.$element.trigger('change').trigger('asSelect3:selectall');
        }

        clearAll() {
            this.$element.find('option').prop('selected', false);
            this.selectedValues = this.isMultiple ? [] : null;
            
            this.$optionsContainer.find('.as-select3-option')
                .removeClass('selected')
                .attr('aria-selected', 'false')
                .find('input[type="checkbox"]').prop('checked', false);
            
            this.updateSelection();
            this.$element.trigger('change').trigger('asSelect3:clearall');
        }

        clearSingle() {
            this.selectedValues = null;
            this.$element.find('option').prop('selected', false);
            this.$optionsContainer.find('.as-select3-option').removeClass('selected').attr('aria-selected', 'false');
            this.updateSelection();
            this.$element.trigger('change').trigger('asSelect3:cleared');
        }

        removeTag(value) {
            if (!this.isMultiple) return;
            
            this.selectedValues = this.selectedValues.filter(v => v !== value);
            this.$element.find(`option[value="${value}"]`).prop('selected', false);
            this.$optionsContainer.find(`[data-value="${value}"]`)
                .removeClass('selected')
                .attr('aria-selected', 'false')
                .find('input[type="checkbox"]').prop('checked', false);
            
            this.updateSelection();
            this.$element.trigger('change').trigger('asSelect3:tagremoved', { value });
        }

        updateFromSelect() {
            if (this.isMultiple) {
                this.selectedValues = this.$element.find('option:selected').map((i, opt) => opt.value).get();
            } else {
                this.selectedValues = this.$element.find('option:selected').val() || null;
            }
            this.updateSelection();
        }

        storeOriginalOptions() {
            this.originalOptions = this.$element.find('option').map(function() {
                return {
                    value: this.value,
                    text: this.text,
                    selected: this.selected
                };
            }).get();
        }

        getValue() {
            return this.selectedValues;
        }

        setValue(value) {
            if (Array.isArray(value) && this.isMultiple) {
                this.$element.find('option').prop('selected', false);
                value.forEach(v => {
                    this.$element.find(`option[value="${v}"]`).prop('selected', true);
                });
            } else if (!Array.isArray(value) && !this.isMultiple) {
                this.$element.find('option').prop('selected', false);
                this.$element.find(`option[value="${value}"]`).prop('selected', true);
            }
            
            this.updateFromSelect();
            this.$element.trigger('change').trigger('asSelect3:valuechanged', { value: this.getValue() });
        }

        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        addOption(option) {
            const $option = $('<option></option>')
                .val(option.value)
                .text(option.text || option.label)
                .prop('selected', !!option.selected);
            
            if (option.icon) $option.attr('data-icon', option.icon);
            if (option.html) $option.attr('data-html', option.html);
            if (option.disabled) $option.prop('disabled', !!option.disabled);
            
            this.$element.append($option);
            this.$optionsContainer.append(this.createOptionElement(option, this.$element.find('option').length - 1));
            
            if (option.selected) {
                this.updateFromSelect();
            }
            
            this.$element.trigger('asSelect3:optionadded', { option });
            return $option;
        }

        removeOption(value) {
            this.$element.find(`option[value="${value}"]`).remove();
            this.$optionsContainer.find(`[data-value="${value}"]`).remove();
            
            if (this.isMultiple) {
                this.selectedValues = this.selectedValues.filter(v => v !== value);
            } else if (this.selectedValues === value) {
                this.selectedValues = null;
            }
            
            this.updateSelection();
            this.$element.trigger('asSelect3:optionremoved', { value });
        }

        enable() {
            this.$container.removeClass('disabled');
            this.$trigger.attr('tabindex', '0');
            this.$element.prop('disabled', false);
        }

        disable() {
            this.close();
            this.$container.addClass('disabled');
            this.$trigger.attr('tabindex', '-1');
            this.$element.prop('disabled', true);
        }

        refresh() {
            this.$optionsContainer.empty();
            this.$element.find('option').each((index, option) => {
                this.$optionsContainer.append(this.createOptionElement(option, index));
            });
            this.updateFromSelect();
        }

        reinitializeFromDOM() {
            const currentValue = this.getValue();
            const currentOptions = this.options;
            this.destroy();
            
            const newInstance = new AsSelect3(this.element, currentOptions);
            this.element._asSelect3 = newInstance;
            
            if (currentValue) {
                setTimeout(() => {
                    try {
                        newInstance.setValue(currentValue);
                    } catch (e) {
                        console.warn('As-Select3: Could not restore value after reinitialize');
                    }
                }, 10);
            }
            
            return newInstance;
        }



        destroy() {
            if (this.searchTimer) {
                clearTimeout(this.searchTimer);
            }
            
            if (this.mutationObserver) {
                this.mutationObserver.disconnect();
                this.mutationObserver = null;
            }
            
            this.close();
            
            Object.values(this.boundHandlers).forEach(handler => {
                this.$trigger.off('click', handler);
                this.$trigger.off('keydown', handler);
                this.$container.off('click', handler);
                if (this.$searchInput) {
                    this.$searchInput.off('input', handler);
                }
            });
            
            $(document).off('click.asSelect3', this.boundHandlers.documentClick);
            
            this.searchCache.clear();
            this.$element.removeClass('d-none').insertAfter(this.$container);
            this.$container.remove();
            
            delete this.element._asSelect3;
            return this.$element;
        }
    }

    $.fn.asSelect3 = function(options) {
        return this.each(function() {
            if (!this._asSelect3) {
                this._asSelect3 = new AsSelect3(this, options);
            }
        });
    };

    AsSelect3.autoInit = function(selector = '.as-select3-container select') {
        return $(selector).filter(function() {
            return !this._asSelect3;
        }).map(function() {
            const instance = new AsSelect3(this);
            this._asSelect3 = instance;
            return instance;
        }).get();
    };

    window.AsSelect3 = AsSelect3;

})(jQuery);