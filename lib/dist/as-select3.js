/*!
 * As-Select3 - Modern JavaScript Select Library with HTML Rendering Support
 * Version: 1.1.0
 * Author: Sunil Kumar
 * Repository: https://github.com/sunil4587/As-select3
 * License: MIT
 */
(function($) {
    'use strict';

    class AsSelect3 {
        constructor(element, options = {}) {
            if (!$(element).length) {
                throw new Error(`As-Select3: Element "${element}" not found`);
            }

            this.$element = $(element);
            this.element = this.$element[0];
            let $container = this.$element.closest('.as-select3-container');
            if (!$container.length) {
                $container = $('<div class="as-select3-container"></div>');
                this.$element.before($container);
                $container.append(this.$element);
            }
            this.$container = $container;

            this.isMultiple = this.$element.attr('multiple') !== undefined;
            this.options = $.extend({
                placeholder: this.isMultiple ? 'Select options...' : 'Choose an option...',
                searchable: this.$element.data('search') !== false,
                selectAll: options.selectAll !== false && this.isMultiple,
                clearAll: options.clearAll !== false,
                maxSelection: options.maxSelection || null,
                remote: options.remote || null,
                searchDelay: options.searchDelay || 300,
                noResultsText: 'No results found',
                loadingText: 'Loading...',
                searchPlaceholder: 'Search options...',
                selectAllText: 'Select All',
                clearAllText: 'Clear All',
                defaultIconClass: 'bi bi-chevron-down',
                iconPrefix: options.iconPrefix || null,
                

                allowHtml: options.allowHtml !== false,
                escapeMarkup: options.escapeMarkup || function(markup) {
                    return markup;
                },
                templateResult: options.templateResult || null,
                templateSelection: options.templateSelection || null,
                matcher: options.matcher || null
            }, options);

            this.isOpen = false;
            this.focusIndex = -1;
            this.selectedValues = this.isMultiple ? [] : (this.$element.find('option:selected').val() || null);
            this.isLoading = false;
            this.searchTimer = null;
            this.originalOptions = [];

            this.init();
        }

        init() {
            this.createUI();
            this.bindEvents();
            this.updateFromSelect();
            this.storeOriginalOptions();
        }

        createUI() {

            this.$trigger = $('<div class="as-select3-trigger" tabindex="0" role="combobox" aria-expanded="false"></div>');
            this.$selection = $('<div class="as-select3-selection"></div>');
            this.$placeholder = $(`<span class="as-select3-placeholder">${this.options.placeholder}</span>`);
            this.$arrow = $(`<i class="${this.options.defaultIconClass} as-select3-arrow"></i>`);

            this.$selection.append(this.$placeholder);
            this.$trigger.append(this.$selection, this.$arrow);
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

            const availableOptionsCount = this.$element.find('option:not(:disabled)').length;
            const shouldShowSelectAll = this.options.selectAll && 
                (!this.options.maxSelection || this.options.maxSelection >= availableOptionsCount);
            
            if (shouldShowSelectAll || this.options.clearAll) {
                this.createActions(shouldShowSelectAll);
            }

            this.$container.append(this.$dropdown);
        }

        createSearch() {
            const $searchWrapper = $('<div class="as-select3-search"><div class="position-relative w-100"></div></div>');
            this.$searchInput = $('<input type="text" class="form-control form-control-sm" role="searchbox">')
                .attr('placeholder', this.options.searchPlaceholder);
            const $clearIcon = $(`<i class="${this.getCloseIcon()} as-select3-search-clear"></i>`);

            $searchWrapper.find('div').append(this.$searchInput, $clearIcon);
            this.$dropdown.append($searchWrapper);
        }

        createOptionsContainer() {
            this.$optionsContainer = $('<div class="as-select3-options"></div>');
            
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
            } : {
                value: optionData.value || optionData.val,
                text: optionData.text || optionData.label,
                selected: !!optionData.selected,
                icon: optionData.icon,
                html: optionData.html || optionData.text || optionData.label,
                disabled: !!optionData.disabled
            };

            const $option = $('<div class="as-select3-option" role="option" tabindex="-1"></div>')
                .data({
                    value: data.value,
                    index: index,
                    icon: data.icon,
                    html: data.html,
                    text: data.text
                })
                .attr('aria-selected', data.selected.toString());

            const $optionLeft = $('<div class="as-select3-option-left"></div>');
            if (this.options.templateResult && typeof this.options.templateResult === 'function') {
                const templateResult = this.options.templateResult(data);
                if (templateResult) {
                    $optionLeft.html(templateResult);
                }
            } else if (this.options.allowHtml && data.html && data.html !== data.text) {

                $optionLeft.html(this.options.escapeMarkup(data.html));
            } else {

                if (data.icon) {
                    const $iconContainer = $('<div class="as-select3-option-icon"></div>');
                    this.addIcon($iconContainer, data.icon, '16px');
                    $optionLeft.append($iconContainer);
                }
                $optionLeft.append($('<span class="as-select3-option-text"></span>').text(data.text));
            }

            $option.append($optionLeft);
            if (this.isMultiple) {
                $option.append($('<input type="checkbox" class="form-check-input">').prop('checked', data.selected));
            }

            if (data.selected) {
                $option.addClass('selected');
            }

            if (data.disabled) {
                $option.addClass('disabled').attr('aria-disabled', 'true');
            }

            return $option;
        }

        addIcon($container, iconData, size = '14px') {
            if (!iconData) return;

            if (iconData.match(/^(https?:|data:|\.?\/)/)) {

                $container.append($('<img>').attr({
                    src: iconData,
                    alt: ''
                }).css({
                    width: size,
                    height: size,
                    objectFit: 'cover'
                }));
            } else if (this.isIconClass(iconData)) {

                const $icon = $('<i></i>').addClass(iconData);
                $container.append($icon);
            } else {

                $container.html(iconData);
            }
        }

        isIconClass(className) {
            if (!className || typeof className !== 'string') return false;

            const iconPrefixes = [
                'bi-', 'fa-', 'fas-', 'far-', 'fab-', 'fal-', 'fad-',
                'material-icons', 'icon-', 'glyphicon-', 'mdi-',
                'feather-', 'lucide-', 'tabler-icon-', 'heroicon-',
                'phosphor-', 'remix-'
            ];

            return iconPrefixes.some(prefix => className.includes(prefix)) ||
                   className.match(/^(bi|fa|fas|far|fab|fal|fad|material-icons|icon|glyphicon|mdi|feather|lucide|tabler|heroicon|phosphor|remix)\s/) ||
                   (this.options.iconPrefix && className.startsWith(this.options.iconPrefix));
        }

        getCloseIcon() {
            if (this.options.defaultIconClass.includes('fa')) return 'fas fa-times';
            if (this.options.defaultIconClass.includes('material')) return 'material-icons';
            if (this.options.defaultIconClass.includes('feather')) return 'feather feather-x';
            if (this.options.defaultIconClass.includes('lucide')) return 'lucide lucide-x';
            return 'bi bi-x';
        }

        getSearchIcon() {
            if (this.options.defaultIconClass.includes('fa')) return 'fas fa-search';
            if (this.options.defaultIconClass.includes('material')) return 'material-icons';
            if (this.options.defaultIconClass.includes('feather')) return 'feather feather-search';
            if (this.options.defaultIconClass.includes('lucide')) return 'lucide lucide-search';
            return 'bi bi-search';
        }

        createActions(showSelectAll = this.options.selectAll) {
            if (!this.isMultiple) return;

            const $actions = $('<div class="as-select3-actions"></div>');

            if (showSelectAll) {
                $actions.append(
                    $('<button type="button" class="btn btn-sm btn-outline-primary"></button>')
                        .text(this.options.selectAllText)
                        .on('click', () => this.selectAll())
                );
            }

            if (this.options.clearAll) {
                $actions.append(
                    $('<button type="button" class="btn btn-sm btn-outline-secondary"></button>')
                        .text(this.options.clearAllText)
                        .on('click', () => this.clearAll())
                );
            }

            this.$dropdown.append($actions);
        }

        bindEvents() {

            this.$trigger.on('click', (e) => {
                if (!$(e.target).hasClass('as-select3-clear')) {
                    e.preventDefault();
                    this.toggle();
                }
            });
            this.$container
                .on('click', '.as-select3-clear', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.clearSingle();
                    return false;
                })
                .on('click', '.as-select3-tag-remove', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const value = $(e.target).closest('.as-select3-tag').data('value');
                    if (value) {
                        this.removeTag(value);
                    }
                    return false;
                })
                .on('click', '.as-select3-search-clear', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (this.$searchInput) {
                        this.$searchInput.val('').trigger('input').focus();
                    }
                    return false;
                });
            this.$trigger.on('keydown', (e) => this.handleKeyDown(e));
            if (this.$searchInput) {
                this.$searchInput.on('input', (e) => {
                    const query = e.target.value;
                    if (this.options.remote) {
                        if (this.searchTimer) {
                            clearTimeout(this.searchTimer);
                        }
                        this.searchTimer = setTimeout(() => this.remoteSearch(query), this.options.searchDelay);
                    } else {
                        this.search(query);
                    }
                });

                this.$searchInput.on('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.close();
                    }
                });
            }
            this.$optionsContainer.on('click', '.as-select3-option', (e) => {
                const $option = $(e.currentTarget);
                if ($option.hasClass('disabled')) {
                    return false;
                }
                this.toggleOption($option);
            });
            $(document).on('click.asSelect3', (e) => {
                if (!this.$container.is(e.target) && !this.$container.has(e.target).length) {
                    this.close();
                }
            });
            this.$element
                .on('invalid', () => this.$trigger.addClass('is-invalid'))
                .closest('form').on('reset.asSelect3', () => {
                    setTimeout(() => this.reset(), 0);
                });
        }

        handleKeyDown(e) {
            const { key } = e;

            switch (key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (this.isOpen) {
                        const $focused = this.$optionsContainer.find('.focused');
                        if ($focused.length) {
                            this.toggleOption($focused);
                        }
                    } else {
                        this.open();
                    }
                    break;

                case 'Escape':
                    if (this.isOpen) {
                        e.preventDefault();
                        this.close();
                    }
                    break;

                case 'ArrowDown':
                    e.preventDefault();
                    if (this.isOpen) {
                        this.focusNext();
                    } else {
                        this.open();
                    }
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    if (this.isOpen) {
                        this.focusPrevious();
                    } else {
                        this.open();
                    }
                    break;

                case 'Tab':
                    if (this.isOpen) {
                        e.preventDefault();
                        this.focusNext();
                    }
                    break;
            }
        }

        focusNext() {
            const $visibleOptions = this.$optionsContainer.find('.as-select3-option:visible:not(.disabled)');
            if (!$visibleOptions.length) return;

            this.$optionsContainer.find('.focused').removeClass('focused');
            this.focusIndex = this.focusIndex < $visibleOptions.length - 1 ? this.focusIndex + 1 : 0;
            this.scrollToOption($visibleOptions.eq(this.focusIndex).addClass('focused'));
        }

        focusPrevious() {
            const $visibleOptions = this.$optionsContainer.find('.as-select3-option:visible:not(.disabled)');
            if (!$visibleOptions.length) return;

            this.$optionsContainer.find('.focused').removeClass('focused');
            this.focusIndex = this.focusIndex > 0 ? this.focusIndex - 1 : $visibleOptions.length - 1;
            this.scrollToOption($visibleOptions.eq(this.focusIndex).addClass('focused'));
        }

        scrollToOption($option) {
            if (!$option.length) return;

            const container = this.$optionsContainer[0];
            const optionTop = $option[0].offsetTop;
            const optionBottom = optionTop + $option[0].offsetHeight;

            if (optionTop < container.scrollTop) {
                container.scrollTop = optionTop;
            } else if (optionBottom > container.scrollTop + container.clientHeight) {
                container.scrollTop = optionBottom - container.clientHeight;
            }
        }

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        open() {
            if (this.isOpen) return;

            this.isOpen = true;
            this.$dropdown.addClass('show');
            this.$trigger.addClass('active').attr('aria-expanded', 'true');

            if (this.$searchInput) {
                this.$searchInput.focus();
            }

            this.$element.trigger('asSelect3:open');
        }

        close() {
            if (!this.isOpen) return;

            this.isOpen = false;
            this.$dropdown.removeClass('show');
            this.$trigger.removeClass('active').attr('aria-expanded', 'false');
            this.$optionsContainer.find('.focused').removeClass('focused');
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
            const $selectOption = this.$element.find(`option[value="${value}"]`);
            
            if (!$selectOption.length) return;

            const isSelected = $option.hasClass('selected');

            if (isSelected) {

                $selectOption.prop('selected', false);
                $option.removeClass('selected').attr('aria-selected', 'false');

                if (this.isMultiple) {
                    $option.find('input[type="checkbox"]').prop('checked', false);
                    this.selectedValues = this.selectedValues.filter(v => v !== value);
                } else {
                    this.selectedValues = null;
                }
            } else {

                if (this.isMultiple) {
                    if (this.options.maxSelection && this.selectedValues.length >= this.options.maxSelection) {
                        this.$element.trigger('asSelect3:maxselection', { max: this.options.maxSelection });
                        return;
                    } else {
                        this.selectedValues.push(value);
                    }
                } else {

                    this.$optionsContainer.find('.as-select3-option').removeClass('selected').attr('aria-selected', 'false');
                    this.$element.find('option').prop('selected', false);
                    this.selectedValues = value;
                }

                $selectOption.prop('selected', true);
                $option.addClass('selected').attr('aria-selected', 'true');

                if (this.isMultiple) {
                    $option.find('input[type="checkbox"]').prop('checked', true);
                } else {
                    this.close();
                }
            }

            if (!isSelected || this.isMultiple) {
                this.$trigger.removeClass('is-invalid');
                this.updateSelection();
                this.$element.trigger('change').trigger('asSelect3:change', { value: this.getValue() });
            }
        }

        search(query) {
            if (this.options.matcher && typeof this.options.matcher === 'function') {
                this.customSearch(query);
                return;
            }

            const $options = this.$optionsContainer.find('.as-select3-option').not('.as-select3-no-results, .as-select3-loading');
            let hasVisibleOptions = false;

            $options.each((index, option) => {
                const $option = $(option);
                const text = $option.data('text') || $option.text();
                const matches = this.matchText(text, query);
                $option.toggle(matches);
                if (matches) {
                    hasVisibleOptions = true;
                }
            });

            this.toggleNoResults(!hasVisibleOptions && query.length > 0);
            this.focusIndex = -1;
        }

        customSearch(query) {
            const $options = this.$optionsContainer.find('.as-select3-option').not('.as-select3-no-results, .as-select3-loading');
            let hasVisibleOptions = false;

            $options.each((index, option) => {
                const $option = $(option);
                const data = {
                    id: $option.data('value'),
                    text: $option.data('text') || $option.text(),
                    html: $option.data('html')
                };
                const matches = this.options.matcher(query, data);
                $option.toggle(matches);
                if (matches) {
                    hasVisibleOptions = true;
                }
            });

            this.toggleNoResults(!hasVisibleOptions && query.length > 0);
            this.focusIndex = -1;
        }

        matchText(text, query) {
            return text.toLowerCase().includes(query.toLowerCase());
        }

        async remoteSearch(query) {
            if (!this.options.remote || typeof this.options.remote !== 'function') return;

            this.showLoading();

            try {
                const results = await this.options.remote(query);
                if (Array.isArray(results)) {
                    this.populateOptions(results);
                } else if (results?.options && Array.isArray(results.options)) {
                    this.populateOptions(results.options);
                } else {
                    console.warn('Invalid remote response');
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

            const loadingClass = '.as-select3-loading';
            if (!this.$optionsContainer.find(loadingClass).length) {
                this.$optionsContainer.append(
                    $(`<div class="${loadingClass.substring(1)}">
                        <div class="spinner-border spinner-border-sm me-2"></div>
                        ${this.options.loadingText}
                    </div>`)
                );
            }
        }

        hideLoading() {
            this.isLoading = false;
            this.$optionsContainer.find('.as-select3-loading').remove();
            this.$optionsContainer.find('.as-select3-option').show();
        }

        toggleNoResults(show) {
            const noResultsClass = '.as-select3-no-results';
            const $existing = this.$optionsContainer.find(noResultsClass);

            if (show && !$existing.length) {
                this.$optionsContainer.append(
                    $(`<div class="${noResultsClass.substring(1)}">
                        <i class="${this.getSearchIcon()} me-2"></i>
                        ${this.options.noResultsText}
                    </div>`)
                );
            } else if (!show && $existing.length) {
                $existing.remove();
            }
        }

        hideNoResults() {
            this.$optionsContainer.find('.as-select3-no-results').remove();
        }

        selectAll() {
            if (!this.isMultiple) return;
            const $enabledOptions = this.$element.find('option:not(:disabled)');
            

            $enabledOptions.prop('selected', true);
            

            $enabledOptions.each((index, option) => {
                const value = option.value;
                const $optionElement = this.$optionsContainer.find(`[data-value="${value}"]`);
                if ($optionElement.length && !$optionElement.hasClass('disabled')) {
                    $optionElement.addClass('selected').attr('aria-selected', 'true');
                    $optionElement.find('input[type="checkbox"]').prop('checked', true);
                }
            });
            
            this.updateFromSelect();
            this.$element.trigger('change').trigger('asSelect3:selectall');
        }

        clearAll() {
            this.$element.find('option').prop('selected', false);

            if (this.isMultiple) {
                this.selectedValues = [];
                this.$optionsContainer.find('.as-select3-option').removeClass('selected').attr('aria-selected', 'false');
                this.$optionsContainer.find('input[type="checkbox"]').prop('checked', false);
            } else {
                this.selectedValues = null;
                this.$optionsContainer.find('.as-select3-option').removeClass('selected').attr('aria-selected', 'false');
            }

            this.updateSelection();
            this.$element.trigger('change').trigger('asSelect3:clearall');
        }

        updateSelection() {
            this.$selection.empty();

            if (this.isMultiple) {
                if (this.selectedValues.length) {
                    this.selectedValues.forEach(value => {
                        const $option = this.$element.find(`option[value="${value}"]`);
                        const $optionElement = this.$optionsContainer.find(`[data-value="${value}"]`);
                        if ($option.length) {

                            const text = $option.text();
                            const html = $option.attr('data-html') || $optionElement.data('html');
                            const icon = $option.attr('data-icon') || $optionElement.data('icon');
                            
                            this.$selection.append(
                                this.createTag(text, value, html, icon)
                            );
                        }
                    });
                } else {
                    this.$selection.append(this.$placeholder);
                }
            } else if (this.selectedValues) {
                const $option = this.$element.find(`option[value="${this.selectedValues}"]`);
                const $optionElement = this.$optionsContainer.find(`[data-value="${this.selectedValues}"]`);
                
                if ($option.length) {
                    const $singleContainer = $('<div class="as-select3-single-container"></div>');
                    const $singleValue = $('<span class="as-select3-single-value"></span>');
                    const $clearIcon = $(`<i class="${this.getCloseIcon()} as-select3-clear"></i>`)
                        .attr('data-value', this.selectedValues);
                    const text = $option.text();
                    const html = $option.attr('data-html') || $optionElement.data('html');
                    const icon = $option.attr('data-icon') || $optionElement.data('icon');
                    if (this.options.templateSelection && typeof this.options.templateSelection === 'function') {
                        const templateResult = this.options.templateSelection({
                            id: this.selectedValues,
                            text: text,
                            html: html
                        });
                        if (templateResult) {
                            $singleValue.html(templateResult);
                        }
                    } else if (this.options.allowHtml && html && html !== text && html.trim() !== '') {
                        $singleValue.html(this.options.escapeMarkup(html));
                    } else {
        
                        if (icon) {
                            const $iconContainer = $('<div class="as-select3-single-icon"></div>');
                            this.addIcon($iconContainer, icon, '16px');
                            $singleValue.append($iconContainer);
                        }
                        $singleValue.append($('<span></span>').text(text));
                    }

                    $singleContainer.append($singleValue, $clearIcon);
                    this.$selection.append($singleContainer);
                }
            } else {
                this.$selection.append(this.$placeholder);
            }

            this.updateOptionStates();
        }

        renderSingleValueWithIcon($container, $optionElement, $option) {
            const iconData = $optionElement.data('icon') || $option.data('icon');
            if (iconData) {
                const $iconContainer = $('<div class="as-select3-single-icon"></div>');
                this.addIcon($iconContainer, iconData, '16px');
                $container.append($iconContainer);
            }
            $container.append($('<span></span>').text($optionElement.data('text') || $option.text()));
        }

        updateOptionStates() {
            if (!this.isMultiple || !this.options.maxSelection) return;

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

        createTag(text, value, html, icon) {
            const $tag = $('<span class="as-select3-tag"></span>').data('value', value);
            let $content, $removeIcon;
            if (this.options.templateSelection && typeof this.options.templateSelection === 'function') {
                const templateResult = this.options.templateSelection({
                    id: value,
                    text: text,
                    html: html
                });
                if (templateResult) {
                    $content = $('<span class="as-select3-tag-content"></span>').html(templateResult);
                    $removeIcon = $(`<i class="${this.getCloseIcon()} as-select3-tag-remove"></i>`);
                    $tag.append($content, $removeIcon);
                    return $tag;
                }
            } 
            
            if (this.options.allowHtml && html && html !== text && html.trim() !== '') {
                $content = $('<span class="as-select3-tag-content"></span>').html(this.options.escapeMarkup(html));
                $removeIcon = $(`<i class="${this.getCloseIcon()} as-select3-tag-remove"></i>`);
                $tag.append($content, $removeIcon);
            } else {

                if (icon) {
                    const $iconContainer = $('<div class="as-select3-tag-icon"></div>');
                    this.addIcon($iconContainer, icon);
                    $tag.append($iconContainer);
                }

                $content = $('<span class="as-select3-tag-text"></span>').text(text).attr('title', text);
                $removeIcon = $(`<i class="${this.getCloseIcon()} as-select3-tag-remove"></i>`);
                $tag.append($content, $removeIcon);
            }

            return $tag;
        }

        removeTag(value) {
            const $option = this.$element.find(`option[value="${value}"]`);
            const $optionElement = this.$optionsContainer.find(`[data-value="${value}"]`);

            if ($option.length) {
                $option.prop('selected', false);

                if (this.isMultiple) {
                    $optionElement.find('input[type="checkbox"]').prop('checked', false);
                    this.selectedValues = this.selectedValues.filter(v => v !== value);
                } else {
                    this.selectedValues = null;
                }

                $optionElement.removeClass('selected').attr('aria-selected', 'false');
                this.updateSelection();
                this.$element.trigger('change').trigger('asSelect3:tagremoved', { value });
            }
        }

        clearSingle() {
            this.selectedValues = null;
            this.$element.find('option').prop('selected', false);
            this.$optionsContainer.find('.as-select3-option').removeClass('selected').attr('aria-selected', 'false');
            this.updateSelection();
            this.$element.trigger('change').trigger('asSelect3:cleared');
        }

        clearSelection() {
            if (this.isMultiple) {
                this.clearAll();
            } else {
                this.clearSingle();
            }
        }

        updateFromSelect() {
            if (this.isMultiple) {
                this.selectedValues = [];
                this.$element.find('option:selected').each((index, option) => {
                    this.selectedValues.push(option.value);
                });
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
                    selected: this.selected,
                    html: $(this).data('html'),
                    icon: $(this).data('icon')
                };
            }).get();
        }

        populateOptions(options = []) {
            this.$element.empty();
            this.$optionsContainer.empty();

            options.forEach((option, index) => {
                const $selectOption = $('<option></option>')
                    .val(option.value)
                    .text(option.text || option.label)
                    .prop('selected', !!option.selected);

                if (option.icon) {
                    $selectOption.data('icon', option.icon);
                }
                if (option.html) {
                    $selectOption.data('html', option.html);
                }
                if (option.disabled) {
                    $selectOption.prop('disabled', true);
                }

                this.$element.append($selectOption);
                this.$optionsContainer.append(this.createOptionElement({
                    value: option.value,
                    text: option.text || option.label,
                    selected: !!option.selected,
                    icon: option.icon,
                    html: option.html,
                    disabled: !!option.disabled
                }, index));
            });

            this.updateFromSelect();
        }
        addOption(option) {
            const $selectOption = $('<option></option>')
                .val(option.value)
                .text(option.text || option.label)
                .prop('selected', !!option.selected);

            if (option.icon) {
                $selectOption.data('icon', option.icon);
            }
            if (option.html) {
                $selectOption.data('html', option.html);
            }
            if (option.disabled) {
                $selectOption.prop('disabled', !!option.disabled);
            }

            this.$element.append($selectOption);
            this.$optionsContainer.append(this.createOptionElement(option, this.$element.find('option').length - 1));

            if (option.selected) {
                this.updateFromSelect();
            }

            this.$element.trigger('asSelect3:optionadded', { option });
            return $selectOption;
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

        clearOptions() {
            this.$element.empty();
            this.$optionsContainer.empty();
            this.selectedValues = this.isMultiple ? [] : null;
            this.updateSelection();
            this.$element.trigger('asSelect3:optionscleared');
        }

        refreshOptions() {
            this.$optionsContainer.empty();
            this.$element.find('option').each((index, option) => {
                this.$optionsContainer.append(this.createOptionElement(option, index));
            });
            this.updateFromSelect();
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

        reset() {
            this.clearAll();
            this.originalOptions.forEach(option => {
                if (option.selected) {
                    if (this.isMultiple) {
                        this.selectedValues.push(option.value);
                    } else {
                        this.selectedValues = option.value;
                    }
                }
            });
            this.updateFromSelect();
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

        destroy() {
            this.close();
            this.$trigger.off();
            this.$container.off();
            this.$optionsContainer.off();
            $(document).off('click.asSelect3');
            this.$element.off('invalid').closest('form').off('reset.asSelect3');
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
