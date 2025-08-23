/*!
 * As-Select3 - Modern JavaScript Select Library
 * Version: 1.3.0
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
                defaultIconClass: 'as-select3-arrow-down',
                iconPrefix: options.iconPrefix || null,
                allowHtml: options.allowHtml !== false,
                fuzzySearch: options.fuzzySearch !== false,
                highlightMatches: options.highlightMatches !== false,
                virtualScrolling: options.virtualScrolling === true,
                itemHeight: options.itemHeight || 32,
                maxHeight: options.maxHeight || 300,
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
            this.filteredOptions = [];
            this.searchCache = new Map();
            this.performanceMetrics = {
                searchTime: 0,
                renderTime: 0
            };

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
            this.$arrow = $(`<span class="${this.options.defaultIconClass} as-select3-arrow"></span>`);

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
            const $clearIcon = $(`<span class="as-select3-close as-select3-search-clear"></span>`);

            $searchWrapper.find('div').append(this.$searchInput, $clearIcon);
            this.$dropdown.append($searchWrapper);
        }

        createOptionsContainer() {
            this.$optionsContainer = $('<div class="as-select3-options"></div>');
            
            const optionCount = this.$element.find('option').length;
            
            // Use virtual scrolling for large datasets
            if (this.options.virtualScrolling && optionCount > 100) {
                this.setupVirtualScrolling();
            } else {
                this.$element.find('option').each((index, option) => {
                    this.$optionsContainer.append(this.createOptionElement(option, index));
                });
            }

            this.$dropdown.append(this.$optionsContainer);
        }
        
        setupVirtualScrolling() {
            const options = this.$element.find('option').toArray();
            const itemHeight = this.options.itemHeight;
            const containerHeight = this.options.maxHeight;
            const visibleCount = Math.ceil(containerHeight / itemHeight);
            
            this.$optionsContainer.css({
                'max-height': containerHeight + 'px',
                'overflow-y': 'auto'
            });
            
            // Create virtual container
            this.$virtualContainer = $('<div class="as-select3-virtual-container"></div>');
            this.$virtualContainer.css({
                'height': options.length * itemHeight + 'px',
                'position': 'relative'
            });
            
            this.$optionsContainer.append(this.$virtualContainer);
            
            // Initial render
            this.renderVirtualItems(0, Math.min(visibleCount + 5, options.length));
            
            // Handle scroll events
            this.$optionsContainer.on('scroll', () => {
                this.handleVirtualScroll();
            });
        }
        
        renderVirtualItems(startIndex, endIndex) {
            if (!this.$virtualContainer) return;
            
            const options = this.$element.find('option').toArray();
            const itemHeight = this.options.itemHeight;
            
            // Clear existing items
            this.$virtualContainer.empty();
            
            for (let i = startIndex; i < endIndex && i < options.length; i++) {
                const $item = this.createOptionElement(options[i], i);
                $item.css({
                    'position': 'absolute',
                    'top': i * itemHeight + 'px',
                    'left': '0',
                    'right': '0',
                    'height': itemHeight + 'px'
                });
                this.$virtualContainer.append($item);
            }
        }
        
        handleVirtualScroll() {
            if (!this.$virtualContainer) return;
            
            const scrollTop = this.$optionsContainer.scrollTop();
            const containerHeight = this.$optionsContainer.height();
            const itemHeight = this.options.itemHeight;
            const options = this.$element.find('option').toArray();
            
            const startIndex = Math.floor(scrollTop / itemHeight);
            const visibleCount = Math.ceil(containerHeight / itemHeight);
            const endIndex = Math.min(startIndex + visibleCount + 10, options.length);
            
            this.renderVirtualItems(Math.max(0, startIndex - 5), endIndex);
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

            let $optionLeft = $('<div class="as-select3-option-left"></div>');

            if (this.options.templateResult && typeof this.options.templateResult === 'function') {
                const templateResult = this.options.templateResult(data);
                if (templateResult) {
                    $optionLeft.html(templateResult);
                }
            } else if (this.options.allowHtml && data.html && data.html !== data.text) {
                $optionLeft.html(this.options.escapeMarkup(data.html));
            } else {
                if (data.icon) {
                    const $icon = $('<div class="as-select3-option-icon"></div>');
                    this.addIcon($icon, data.icon, '16px');
                    $optionLeft.append($icon);
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

        addIcon($container, icon, size = '14px') {
            if (!icon) return;

            if (icon.match(/^(https?:|data:|\.?\/)/)) {
                // Image URL
                $container.append($('<img>').attr({ src: icon, alt: '' }).css({
                    width: size,
                    height: size,
                    objectFit: 'cover'
                }));
            } else if (this.isIconClass(icon)) {
                // Icon class
                const $icon = $('<i></i>').addClass(icon);
                $container.append($icon);
            } else {
                // Raw HTML/text
                $container.html(icon);
            }
        }

        isIconClass(icon) {
            if (!icon || typeof icon !== 'string') return false;
            
            const iconPrefixes = [
                'bi-', 'fa-', 'fas-', 'far-', 'fab-', 'fal-', 'fad-',
                'material-icons', 'icon-', 'glyphicon-', 'mdi-', 'feather-',
                'lucide-', 'tabler-icon-', 'heroicon-', 'phosphor-', 'remix-'
            ];
            
            return iconPrefixes.some(prefix => icon.includes(prefix)) ||
                   icon.match(/^(bi|fa|fas|far|fab|fal|fad|material-icons|icon|glyphicon|mdi|feather|lucide|tabler|heroicon|phosphor|remix)\s/) ||
                   (this.options.iconPrefix && icon.startsWith(this.options.iconPrefix));
        }

        createActions(showSelectAll) {
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
                if ($(e.target).hasClass('as-select3-clear')) return;
                e.preventDefault();
                this.toggle();
            });

            this.$container.on('click', '.as-select3-clear', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.clearSingle();
                return false;
            }).on('click', '.as-select3-tag-remove', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const value = $(e.target).closest('.as-select3-tag').data('value');
                if (value) {
                    this.removeTag(value);
                }
                return false;
            }).on('click', '.as-select3-search-clear', (e) => {
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
                    const value = e.target.value;
                    if (this.options.remote) {
                        if (this.searchTimer) clearTimeout(this.searchTimer);
                        this.searchTimer = setTimeout(() => this.remoteSearch(value), this.options.searchDelay);
                    } else {
                        this.search(value);
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
                if ($option.hasClass('disabled')) return false;
                this.toggleOption($option);
            });

            $(document).on('click.asSelect3', (e) => {
                if (this.$container.is(e.target) || this.$container.has(e.target).length) return;
                this.close();
            });

            this.$element.on('invalid', () => {
                this.$trigger.addClass('is-invalid');
            }).closest('form').on('reset.asSelect3', () => {
                setTimeout(() => this.reset(), 0);
            });
        }

        handleKeyDown(e) {
            switch (e.key) {
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
                case 'Home':
                    if (this.isOpen) {
                        e.preventDefault();
                        this.focusFirst();
                    }
                    break;
                case 'End':
                    if (this.isOpen) {
                        e.preventDefault();
                        this.focusLast();
                    }
                    break;
                case 'PageDown':
                    if (this.isOpen) {
                        e.preventDefault();
                        this.focusPageDown();
                    }
                    break;
                case 'PageUp':
                    if (this.isOpen) {
                        e.preventDefault();
                        this.focusPageUp();
                    }
                    break;
                case 'Tab':
                    if (this.isOpen && !e.shiftKey) {
                        // Allow tab to close dropdown and move to next element
                        this.close();
                    }
                    break;
                default:
                    // Quick search on letter/number keys
                    if (this.isOpen && e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                        this.quickSearch(e.key);
                    }
                    break;
            }
        }
        
        focusFirst() {
            const $options = this.$optionsContainer.find('.as-select3-option:visible:not(.disabled)');
            if ($options.length) {
                this.$optionsContainer.find('.focused').removeClass('focused');
                this.focusIndex = 0;
                this.scrollToOption($options.eq(0).addClass('focused'));
            }
        }
        
        focusLast() {
            const $options = this.$optionsContainer.find('.as-select3-option:visible:not(.disabled)');
            if ($options.length) {
                this.$optionsContainer.find('.focused').removeClass('focused');
                this.focusIndex = $options.length - 1;
                this.scrollToOption($options.eq(this.focusIndex).addClass('focused'));
            }
        }
        
        focusPageDown() {
            const $options = this.$optionsContainer.find('.as-select3-option:visible:not(.disabled)');
            if ($options.length) {
                this.$optionsContainer.find('.focused').removeClass('focused');
                this.focusIndex = Math.min(this.focusIndex + 10, $options.length - 1);
                this.scrollToOption($options.eq(this.focusIndex).addClass('focused'));
            }
        }
        
        focusPageUp() {
            const $options = this.$optionsContainer.find('.as-select3-option:visible:not(.disabled)');
            if ($options.length) {
                this.$optionsContainer.find('.focused').removeClass('focused');
                this.focusIndex = Math.max(this.focusIndex - 10, 0);
                this.scrollToOption($options.eq(this.focusIndex).addClass('focused'));
            }
        }
        
        quickSearch(char) {
            if (!this.quickSearchTimer) {
                this.quickSearchQuery = '';
            }
            
            clearTimeout(this.quickSearchTimer);
            this.quickSearchQuery += char.toLowerCase();
            
            const $options = this.$optionsContainer.find('.as-select3-option:visible:not(.disabled)');
            let found = false;
            
            $options.each((index, option) => {
                const $option = $(option);
                const text = ($option.data('text') || $option.text()).toLowerCase();
                
                if (text.startsWith(this.quickSearchQuery)) {
                    this.$optionsContainer.find('.focused').removeClass('focused');
                    this.focusIndex = index;
                    this.scrollToOption($option.addClass('focused'));
                    found = true;
                    return false; // Break the loop
                }
            });
            
            // Clear quick search after 1 second
            this.quickSearchTimer = setTimeout(() => {
                this.quickSearchQuery = '';
                this.quickSearchTimer = null;
            }, 1000);
        }

        focusNext() {
            const $options = this.$optionsContainer.find('.as-select3-option:visible:not(.disabled)');
            if (!$options.length) return;

            this.$optionsContainer.find('.focused').removeClass('focused');
            this.focusIndex = this.focusIndex < $options.length - 1 ? this.focusIndex + 1 : 0;
            this.scrollToOption($options.eq(this.focusIndex).addClass('focused'));
        }

        focusPrevious() {
            const $options = this.$optionsContainer.find('.as-select3-option:visible:not(.disabled)');
            if (!$options.length) return;

            this.$optionsContainer.find('.focused').removeClass('focused');
            this.focusIndex = this.focusIndex > 0 ? this.focusIndex - 1 : $options.length - 1;
            this.scrollToOption($options.eq(this.focusIndex).addClass('focused'));
        }

        scrollToOption($option) {
            if (!$option.length) return;

            const container = this.$optionsContainer[0];
            const option = $option[0];
            const optionTop = option.offsetTop;
            const optionBottom = optionTop + option.offsetHeight;

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
            this.$container.addClass('active'); // Add active class for z-index
            
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
            this.$container.removeClass('active'); // Remove active class for z-index
            this.$optionsContainer.find('.focused').removeClass('focused');
            this.focusIndex = -1;
            
            if (this.$searchInput) {
                this.$searchInput.val('');
                this.search('');
            }
            
            // Clear all highlighting when closing
            this.clearHighlighting();
            
            this.$element.trigger('asSelect3:close');
        }

        toggleOption($option) {
            if (!$option || $option.length === 0 || $option.hasClass('disabled')) return false;

            const value = $option.data('value');
            const $originalOption = this.$element.find(`option[value="${value}"]`);
            
            if (!$originalOption.length) return false;

            const isSelected = $option.hasClass('selected');
            
            if (isSelected) {
                $originalOption.prop('selected', false);
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
                    }
                    this.selectedValues.push(value);
            } else {
                    this.$optionsContainer.find('.as-select3-option').removeClass('selected').attr('aria-selected', 'false');
                    this.$element.find('option').prop('selected', false);
                    this.selectedValues = value;
                }
                
                $originalOption.prop('selected', true);
                $option.addClass('selected').attr('aria-selected', 'true');
                
                if (this.isMultiple) {
                    $option.find('input[type="checkbox"]').prop('checked', true);
                } else {
                        this.close();
                }
            }

            if (isSelected && !this.isMultiple) return;
            
            this.$trigger.removeClass('is-invalid');
            this.updateSelection();
            this.$element.trigger('change').trigger('asSelect3:change', { value: this.getValue() });
        }

        search(query) {
            const startTime = performance.now();
            
            // Clear previous highlighting first
            this.clearHighlighting();
            
            // Check cache first
            if (this.searchCache.has(query)) {
                this.applySearchResults(this.searchCache.get(query), query);
                this.performanceMetrics.searchTime = performance.now() - startTime;
                return;
            }
            
            if (this.options.matcher && typeof this.options.matcher === 'function') {
                this.customSearch(query);
            } else {
                const $options = this.$optionsContainer.find('.as-select3-option').not('.as-select3-no-results, .as-select3-loading');
                let hasResults = false;
                const results = [];
                
                $options.each((index, option) => {
                    const $option = $(option);
                    const text = $option.data('text') || $option.text();
                    const matches = this.matchText(text, query);
                    
                    if (matches) {
                        hasResults = true;
                        results.push({
                            element: $option,
                            text: text,
                            matches: true
                        });
                        
                        // Highlight matches if enabled
                        if (this.options.highlightMatches && query) {
                            this.highlightText($option, text, query);
                        }
                    }
                    
                    $option.toggle(matches);
                });
                
                // Cache results for performance
                this.searchCache.set(query, results);
                
                // Limit cache size
                if (this.searchCache.size > 50) {
                    const firstKey = this.searchCache.keys().next().value;
                    this.searchCache.delete(firstKey);
                }
                
                this.toggleNoResults(!hasResults && query.length > 0);
                this.focusIndex = -1;
            }
            
            this.performanceMetrics.searchTime = performance.now() - startTime;
        }
        
        applySearchResults(results, query) {
            // Clear previous highlighting first
            this.clearHighlighting();
            
            const $options = this.$optionsContainer.find('.as-select3-option').not('.as-select3-no-results, .as-select3-loading');
            
            $options.each((index, option) => {
                const $option = $(option);
                const result = results.find(r => r.element.is($option));
                
                if (result) {
                    $option.show();
                    if (this.options.highlightMatches && query) {
                        this.highlightText($option, result.text, query);
                    }
                } else {
                    $option.hide();
                }
            });
            
            this.toggleNoResults(results.length === 0 && query.length > 0);
            this.focusIndex = -1;
        }
        
        highlightText($option, text, query) {
            if (!query) return;
            
            const $textElement = $option.find('.as-select3-option-text');
            if (!$textElement.length) return;
            
            // Store original text if not already stored
            if (!$textElement.data('original-text')) {
                $textElement.data('original-text', $textElement.text());
            }
            
            const originalText = $textElement.data('original-text');
            const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
            const highlightedText = originalText.replace(regex, '<mark class="as-select3-highlight">$1</mark>');
            
            if (highlightedText !== originalText) {
                $textElement.html(highlightedText);
            }
        }
        
        clearHighlighting() {
            const $textElements = this.$optionsContainer.find('.as-select3-option-text');
            $textElements.each((index, element) => {
                const $element = $(element);
                const originalText = $element.data('original-text');
                if (originalText) {
                    $element.text(originalText);
                }
            });
        }
        
        escapeRegex(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        customSearch(query) {
            const $options = this.$optionsContainer.find('.as-select3-option').not('.as-select3-no-results, .as-select3-loading');
            let hasResults = false;
            
            $options.each((index, option) => {
                const $option = $(option);
                const data = {
                    id: $option.data('value'),
                    text: $option.data('text') || $option.text(),
                    html: $option.data('html')
                };
                const matches = this.options.matcher(query, data);
                $option.toggle(matches);
                if (matches) hasResults = true;
            });
            
            this.toggleNoResults(!hasResults && query.length > 0);
            this.focusIndex = -1;
        }

        matchText(text, search) {
            if (!search) return true;
            
            const searchLower = search.toLowerCase();
            const textLower = text.toLowerCase();
            
            // Exact match gets highest priority
            if (textLower === searchLower) return true;
            
            // Starts with match gets second priority
            if (textLower.startsWith(searchLower)) return true;
            
            // Contains match gets third priority
            if (textLower.includes(searchLower)) return true;
            
            // Simple fuzzy matching - check if all characters exist in order
            let searchIndex = 0;
            for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
                if (textLower[i] === searchLower[searchIndex]) {
                    searchIndex++;
                }
            }
            
            return searchIndex === searchLower.length;
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
                this.$optionsContainer.append(`
                    <div class="${loadingClass.substring(1)}">
                        <div class="spinner-border spinner-border-sm me-2"></div>
                        ${this.options.loadingText}
                    </div>
                `);
            }
        }

        hideLoading() {
            this.isLoading = false;
            this.$optionsContainer.find('.as-select3-loading').remove();
            this.$optionsContainer.find('.as-select3-option').show();
        }

        toggleNoResults(show) {
            const noResultsClass = '.as-select3-no-results';
            const $noResults = this.$optionsContainer.find(noResultsClass);
            
            if (show && !$noResults.length) {
                this.$optionsContainer.append(`
                    <div class="${noResultsClass.substring(1)}">
                        <span class="as-select3-search-icon me-2"></span>
                        ${this.options.noResultsText}
                    </div>
                `);
            } else if (!show && $noResults.length) {
                $noResults.remove();
            }
        }

        hideNoResults() {
            this.$optionsContainer.find('.as-select3-no-results').remove();
        }

        selectAll() {
            if (!this.isMultiple) return;
            
            const $options = this.$element.find('option:not(:disabled)');
            $options.prop('selected', true);
            
            $options.each((index, option) => {
                const value = option.value;
                const $option = this.$optionsContainer.find(`[data-value="${value}"]`);
                if ($option.length && !$option.hasClass('disabled')) {
                    $option.addClass('selected').attr('aria-selected', 'true');
                    $option.find('input[type="checkbox"]').prop('checked', true);
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
                if (this.selectedValues.length > 0) {
                    this.selectedValues.forEach(value => {
                        const $originalOption = this.$element.find(`option[value="${value}"]`);
                        const $option = this.$optionsContainer.find(`[data-value="${value}"]`);
                        
                        if ($originalOption.length) {
                            const text = $originalOption.text();
                            const html = $originalOption.attr('data-html') || $option.data('html');
                            const icon = $originalOption.attr('data-icon') || $option.data('icon');
                            this.$selection.append(this.createTag(text, value, html, icon));
                        }
                    });
            } else {
                    this.$selection.append(this.$placeholder);
                }
            } else {
                if (this.selectedValues) {
                    const $originalOption = this.$element.find(`option[value="${this.selectedValues}"]`);
                    const $option = this.$optionsContainer.find(`[data-value="${this.selectedValues}"]`);
                    
                    if ($originalOption.length) {
                        const $singleContainer = $('<div class="as-select3-single-container"></div>');
                        const $singleValue = $('<span class="as-select3-single-value"></span>');
                        const $clearIcon = $(`<span class="as-select3-close as-select3-clear"></span>`).attr('data-value', this.selectedValues);
                        
                        const text = $originalOption.text();
                        const html = $originalOption.attr('data-html') || $option.data('html');
                        const icon = $originalOption.attr('data-icon') || $option.data('icon');
                        
                        if (this.options.templateSelection && typeof this.options.templateSelection === 'function') {
                            const templateSelection = this.options.templateSelection({ id: this.selectedValues, text, html });
                            if (templateSelection) {
                                $singleValue.html(templateSelection);
                            }
                        } else if (this.options.allowHtml && html && html !== text && html.trim() !== '') {
                            $singleValue.html(this.options.escapeMarkup(html));
            } else {
                            if (icon) {
                                const $icon = $('<div class="as-select3-single-icon"></div>');
                                this.addIcon($icon, icon, '16px');
                                $singleValue.append($icon);
                            }
                            $singleValue.append($('<span></span>').text(text));
                        }
                        
                        $singleContainer.append($singleValue, $clearIcon);
                        this.$selection.append($singleContainer);
                    }
                } else {
                    this.$selection.append(this.$placeholder);
                }
            }
            
            this.updateOptionStates();
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
            
        createTag(text, value, html, icon) {
            const $tag = $('<span class="as-select3-tag"></span>').data('value', value);
            let $tagContent, $removeIcon;
            
            if (this.options.templateSelection && typeof this.options.templateSelection === 'function') {
                const templateSelection = this.options.templateSelection({ id: value, text, html });
                if (templateSelection) {
                    $tagContent = $('<span class="as-select3-tag-content"></span>').html(templateSelection);
                }
            }
            
            if (!this.options.templateSelection || !$tagContent) {
                if (this.options.allowHtml && html && html !== text && html.trim() !== '') {
                    $tagContent = $('<span class="as-select3-tag-content"></span>').html(this.options.escapeMarkup(html));
                } else {
                    if (icon) {
                        const $icon = $('<div class="as-select3-tag-icon"></div>');
                        this.addIcon($icon, icon);
                        $tag.append($icon);
                    }
                    $tagContent = $('<span class="as-select3-tag-text"></span>').text(text).attr('title', text);
                }
            }
            
            $removeIcon = $(`<span class="as-select3-close as-select3-tag-remove"></span>`);
            $tag.append($tagContent, $removeIcon);
            
            return $tag;
        }

        removeTag(value) {
            const $originalOption = this.$element.find(`option[value="${value}"]`);
            const $option = this.$optionsContainer.find(`[data-value="${value}"]`);
            
            if ($originalOption.length) {
                $originalOption.prop('selected', false);
                
                if (this.isMultiple) {
                    $option.find('input[type="checkbox"]').prop('checked', false);
                    this.selectedValues = this.selectedValues.filter(v => v !== value);
                } else {
                    this.selectedValues = null;
                }
                
                $option.removeClass('selected').attr('aria-selected', 'false');
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
                const $option = $('<option></option>')
                    .val(option.value)
                    .text(option.text || option.label)
                    .prop('selected', !!option.selected);
                
                if (option.icon) $option.data('icon', option.icon);
                if (option.html) $option.data('html', option.html);
                if (option.disabled) $option.prop('disabled', true);
                
                this.$element.append($option);
                this.$optionsContainer.append(this.createOptionElement(option, index));
            });
            
            this.updateFromSelect();
        }

        addOption(option) {
            const $option = $('<option></option>')
                .val(option.value)
                .text(option.text || option.label)
                .prop('selected', !!option.selected);
            
            if (option.icon) $option.data('icon', option.icon);
            if (option.html) $option.data('html', option.html);
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
            // Clear timers
            if (this.searchTimer) {
                clearTimeout(this.searchTimer);
                this.searchTimer = null;
            }
            
            if (this.quickSearchTimer) {
                clearTimeout(this.quickSearchTimer);
                this.quickSearchTimer = null;
            }
            
            // Close dropdown
            this.close();
            
            // Remove event listeners
            this.$trigger.off();
            this.$container.off();
            this.$optionsContainer.off();
            $(document).off('click.asSelect3');
            this.$element.off('invalid').closest('form').off('reset.asSelect3');
            
            // Clear caches
            this.searchCache.clear();
            this.filteredOptions = [];
            this.originalOptions = [];
            
            // Restore original element
            this.$element.removeClass('d-none').insertAfter(this.$container);
            this.$container.remove();
            
            // Clean up references
            delete this.element._asSelect3;
            this.$element = null;
            this.$container = null;
            this.$trigger = null;
            this.$dropdown = null;
            this.$optionsContainer = null;
            this.$searchInput = null;
            
            return this.$element;
        }
        
        // Performance monitoring
        getPerformanceMetrics() {
            return {
                searchTime: this.performanceMetrics.searchTime,
                renderTime: this.performanceMetrics.renderTime,
                cacheSize: this.searchCache.size,
                optionCount: this.$element ? this.$element.find('option').length : 0
            };
        }
        
        // Clear search cache manually
        clearSearchCache() {
            this.searchCache.clear();
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