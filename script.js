/**
 * MultiSelect Library - JavaScript
 * A powerful, flexible multi-select component for Bootstrap 5
 * Version: 2.0.0
 * 
 * Features:
 * - Single and multiple selection modes
 * - Search/filter functionality
 * - Remote data loading
 * - Keyboard navigation
 * - Accessibility support
 * - Customizable styling
 * - Form validation support
 * - jQuery 3.3+ optimized
 * 
 * Dependencies:
 * - jQuery 3.3+
 * - Bootstrap 5.3+ (for icons and styling variables)
 * 
 * Usage:
 * $('#mySelect').multiSelect({
 *   searchable: true,
 *   selectAll: true,
 *   maxSelection: 5
 * });
 */

(function($) {
    'use strict';

    class MultiSelect {
        constructor(element, options = {}) {
            this.$element = $(element);
            if (this.$element.length === 0) {
                throw new Error(`MultiSelect: Element "${element}" not found`);
            }
            
            this.element = this.$element[0];
            this.$container = this.$element.closest('.multi-select-container');
            
            if (this.$container.length === 0) {
                // Create container if it doesn't exist
                this.$container = $('<div class="multi-select-container"></div>');
                this.$element.parent().insertBefore(this.$container);
                this.$container.append(this.$element);
            }
            
            this.isMultiple = this.$element.attr('multiple') !== undefined;
            
            // Default options
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
                tagMaxWidth: '200px',
                dropdownMaxHeight: '300px',
                optionsMaxHeight: '200px'
            }, options);
            
            // Internal state
            this.isOpen = false;
            this.focusedIndex = -1;
            this.selectedValues = [];
            this.selectedValue = null;
            this.isLoading = false;
            this.searchTimeout = null;
            this.originalOptions = [];
            
            this.init();
            this.bindEvents();
            this.updateFromSelect();
            this.storeOriginalOptions();
        }
        
        init() {
            this.createMultiSelect();
            this.createDropdown();
            this.updateSelection();
        }
        
        createMultiSelect() {
            this.$trigger = $('<div class="multi-select-trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox"></div>');
            
            this.$selection = $('<div class="multi-select-selection"></div>');
            
            this.$placeholder = $(`<span class="multi-select-placeholder">${this.options.placeholder}</span>`);
            this.$selection.append(this.$placeholder);
            
            this.$arrow = $('<i class="bi bi-chevron-down multi-select-arrow" aria-hidden="true"></i>');
            
            this.$trigger.append(this.$selection).append(this.$arrow);
            this.$container.append(this.$trigger);
            this.$element.addClass('d-none');
        }
        
        createDropdown() {
            this.$dropdown = $('<div class="multi-select-dropdown" role="listbox" aria-multiselectable="' + this.isMultiple.toString() + '"></div>');
            
            if (this.options.searchable) {
                this.createSearchBox();
            }
            
            this.createOptions();
            
            if (this.options.selectAll || this.options.clearAll) {
                this.createActions();
            }
            
            this.$container.append(this.$dropdown);
        }
        
        createSearchBox() {
            const $searchContainer = $('<div class="multi-select-search"></div>');
            
            // Create search input wrapped in a container for positioning
            const $inputWrapper = $('<div class="position-relative w-100"></div>');
            this.$searchInput = $('<input type="text" class="form-control form-control-sm" role="searchbox" aria-label="Search options">')
                .attr('placeholder', this.options.searchPlaceholder);
            
            // Add clear search icon - simple X icon at the end of input
            const $searchClearBtn = $('<i class="bi bi-x multi-select-search-clear" aria-label="Clear search"></i>');
            
            // Append in the correct order for proper positioning
            $inputWrapper.append(this.$searchInput).append($searchClearBtn);
            $searchContainer.append($inputWrapper);
            this.$dropdown.append($searchContainer);
        }
        
        createOptions() {
            this.$optionsContainer = $('<div class="multi-select-options" role="group"></div>');
            
            const options = this.$element.find('option').toArray();
            options.forEach((option, index) => {
                const $optionElement = this.createOptionElement(option, index);
                this.$optionsContainer.append($optionElement);
            });
            
            this.$dropdown.append(this.$optionsContainer);
        }
        
        createOptionElement(option, index) {
            const $optionDiv = $('<div class="multi-select-option" role="option" tabindex="-1"></div>')
                .data('value', option.value)
                .data('index', index)
                .attr('aria-selected', option.selected.toString());
            
            if (this.isMultiple) {
                const $checkbox = $('<input type="checkbox" class="form-check-input" aria-hidden="true">')
                    .prop('checked', option.selected);
                $optionDiv.append($checkbox);
            }
            
            const $label = $('<span class="multi-select-option-text"></span>').text(option.text);
            $optionDiv.append($label);
            
            if (option.selected) {
                $optionDiv.addClass('selected');
            }
            
            return $optionDiv;
        }
        
        createActions() {
            if (!this.isMultiple) return;
            
            const $actionsContainer = $('<div class="multi-select-actions"></div>');
            
            if (this.options.selectAll) {
                const $selectAllBtn = $('<button type="button" class="btn btn-sm btn-outline-primary"></button>')
                    .text(this.options.selectAllText)
                    .on('click', () => this.selectAll());
                $actionsContainer.append($selectAllBtn);
            }
            
            if (this.options.clearAll) {
                const $clearAllBtn = $('<button type="button" class="btn btn-sm btn-outline-secondary"></button>')
                    .text(this.options.clearAllText)
                    .on('click', () => this.clearAll());
                $actionsContainer.append($clearAllBtn);
            }
            
            this.$dropdown.append($actionsContainer);
        }
        
        bindEvents() {
            // Trigger events
            this.$trigger.on('click', (e) => {
                // Don't toggle if clicking on clear button
                if ($(e.target).hasClass('multi-select-clear')) {
                    return;
                }
                e.preventDefault();
                this.toggle();
            });

            // Delegated event for single select clear icon
            this.$container.on('click', '.multi-select-clear', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('Clear icon clicked - clearing single selection');
                this.clearSingleSelection();
                return false; // Ensure no other handlers are triggered
            });

            // Delegated event for multi-select tag remove icon
            this.$container.on('click', '.multi-select-tag-remove', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const $tag = $(e.target).closest('.multi-select-tag');
                const value = $tag.data('value');
                console.log('Remove tag clicked - removing tag with value:', value);
                if (value) {
                    this.removeTag(value);
                }
                return false; // Ensure no other handlers are triggered
            });
            
            // Delegated event for search clear icon
            this.$container.on('click', '.multi-select-search-clear', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('Search clear icon clicked');
                if (this.$searchInput) {
                    this.$searchInput.val('').trigger('input').focus();
                }
                return false; // Ensure no other handlers are triggered
            });
            
            this.$trigger.on('keydown', (e) => {
                this.handleKeydown(e);
            });
            
            // Search events
            if (this.$searchInput) {
                this.$searchInput.on('input', (e) => {
                    const query = e.target.value;
                    
                    if (this.options.remote) {
                        if (this.searchTimeout) {
                            clearTimeout(this.searchTimeout);
                        }
                        
                        this.searchTimeout = setTimeout(() => {
                            this.remoteSearch(query);
                        }, this.options.searchDelay);
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
            
            // Option events
            this.$optionsContainer.on('click', '.multi-select-option', (e) => {
                this.toggleOption($(e.currentTarget));
            });
            
            // Outside click
            $(document).on('click.multiselect', (e) => {
                if (!this.$container.is(e.target) && this.$container.has(e.target).length === 0) {
                    this.close();
                }
            });
            
            // Form validation
            this.$element.on('invalid', () => {
                this.$trigger.addClass('is-invalid');
            });
            
            // Form reset
            const $form = this.$element.closest('form');
            if ($form.length) {
                $form.on('reset.multiselect', () => {
                    setTimeout(() => this.reset(), 0);
                });
            }
        }
        
        handleKeydown(e) {
            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (this.isOpen) {
                        if (this.focusedIndex >= 0) {
                            const $options = this.$optionsContainer.find('.multi-select-option:visible').not('.multi-select-no-results');
                            if ($options.eq(this.focusedIndex).length) {
                                this.toggleOption($options.eq(this.focusedIndex));
                            }
                        }
                    } else {
                        this.open();
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (!this.isOpen) {
                        this.open();
                    } else {
                        this.focusNext();
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (this.isOpen) {
                        this.focusPrevious();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.close();
                    break;
            }
        }
        
        focusNext() {
            const $options = this.$optionsContainer.find('.multi-select-option:visible').not('.multi-select-no-results');
            if ($options.length === 0) return;
            
            this.focusedIndex = (this.focusedIndex + 1) % $options.length;
            this.updateFocus($options);
        }
        
        focusPrevious() {
            const $options = this.$optionsContainer.find('.multi-select-option:visible').not('.multi-select-no-results');
            if ($options.length === 0) return;
            
            this.focusedIndex = this.focusedIndex <= 0 ? $options.length - 1 : this.focusedIndex - 1;
            this.updateFocus($options);
        }
        
        updateFocus($visibleOptions) {
            this.$optionsContainer.find('.focused').removeClass('focused');
            
            const $focusedOption = $visibleOptions.eq(this.focusedIndex);
            if ($focusedOption.length) {
                $focusedOption.addClass('focused');
                $focusedOption[0].scrollIntoView({ block: 'nearest' });
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
            this.$trigger.addClass('active');
            this.$trigger.attr('aria-expanded', 'true');
            this.focusedIndex = -1;
            
            if (this.$searchInput) {
                this.$searchInput.focus().val('');
                this.search('');
            }
            
            this.$element.trigger('multiselect:open');
        }
        
        close() {
            if (!this.isOpen) return;
            
            this.isOpen = false;
            this.$dropdown.removeClass('show');
            this.$trigger.removeClass('active');
            this.$trigger.attr('aria-expanded', 'false');
            this.focusedIndex = -1;
            
            this.$optionsContainer.find('.focused').removeClass('focused');
            
            this.$element.trigger('multiselect:close');
        }
        
        toggleOption($optionElement) {
            const value = $optionElement.data('value');
            const $option = this.$element.find(`option[value="${value}"]`);
            
            if (this.isMultiple) {
                const $checkbox = $optionElement.find('input[type="checkbox"]');
                
                if ($checkbox.prop('checked')) {
                    // Deselect
                    $checkbox.prop('checked', false);
                    $optionElement.removeClass('selected').attr('aria-selected', 'false');
                    $option.prop('selected', false);
                    this.selectedValues = this.selectedValues.filter(v => v !== value);
                } else {
                    // Select (check max selection limit)
                    if (this.options.maxSelection && this.selectedValues.length >= this.options.maxSelection) {
                        this.$element.trigger('multiselect:maxselection', { maxSelection: this.options.maxSelection });
                        return;
                    }
                    
                    $checkbox.prop('checked', true);
                    $optionElement.addClass('selected').attr('aria-selected', 'true');
                    $option.prop('selected', true);
                    this.selectedValues.push(value);
                }
            } else {
                // Single select - clear other selections first
                this.$optionsContainer.find('.multi-select-option').removeClass('selected').attr('aria-selected', 'false');
                this.$element.find('option').prop('selected', false);
                
                // Select this option
                $optionElement.addClass('selected').attr('aria-selected', 'true');
                $option.prop('selected', true);
                this.selectedValue = value;
                
                // Close dropdown after selection in single select mode
                this.close();
            }
            
            this.updateSelection();
            this.$trigger.removeClass('is-invalid');
            
            // Trigger change event
            this.$element.trigger('change').trigger('multiselect:change', { value: this.getValue() });
        }
        
        search(query) {
            const $options = this.$optionsContainer.find('.multi-select-option').not('.multi-select-no-results, .multi-select-loading');
            let hasVisibleOptions = false;
            
            // We don't need to manually toggle clear icon visibility anymore - CSS handles it
            
            $options.each((index, option) => {
                const $option = $(option);
                const text = $option.text().toLowerCase();
                const matches = text.includes(query.toLowerCase());
                
                $option.toggle(matches);
                if (matches) hasVisibleOptions = true;
            });
            
            this.toggleNoResults(!hasVisibleOptions && query.length > 0);
            this.focusedIndex = -1;
        }
        
        async remoteSearch(query) {
            if (!this.options.remote || typeof this.options.remote !== 'function') return;
            
            this.showLoading();
            
            try {
                const results = await this.options.remote(query);
                this.populateOptions(results);
            } catch (error) {
                console.error('MultiSelect remote search error:', error);
                this.showNoResults();
            } finally {
                this.hideLoading();
            }
        }
        
        showLoading() {
            this.isLoading = true;
            this.hideNoResults();
            
            let $loadingElement = this.$optionsContainer.find('.multi-select-loading');
            if ($loadingElement.length === 0) {
                $loadingElement = $(`<div class="multi-select-loading"><div class="spinner"></div>${this.options.loadingText}</div>`);
                this.$optionsContainer.append($loadingElement);
            }
        }
        
        hideLoading() {
            this.isLoading = false;
            this.$optionsContainer.find('.multi-select-loading').remove();
        }
        
        toggleNoResults(show) {
            let $noResultsMsg = this.$optionsContainer.find('.multi-select-no-results');
            
            if (show && $noResultsMsg.length === 0) {
                $noResultsMsg = $(`<div class="multi-select-no-results"><i class="bi bi-search me-2"></i>${this.options.noResultsText}</div>`);
                this.$optionsContainer.append($noResultsMsg);
            } else if (!show && $noResultsMsg.length > 0) {
                $noResultsMsg.remove();
            }
        }
        
        hideNoResults() {
            this.$optionsContainer.find('.multi-select-no-results').remove();
        }
        
        showNoResults() {
            this.toggleNoResults(true);
        }
        
        selectAll() {
            if (!this.isMultiple) return;
            
            const $options = this.$optionsContainer.find('.multi-select-option:visible').not('.multi-select-no-results');
            
            $options.each((index, option) => {
                const $option = $(option);
                const $checkbox = $option.find('input[type="checkbox"]');
                const value = $option.data('value');
                const $selectOption = this.$element.find(`option[value="${value}"]`);
                
                if (!$checkbox.prop('checked')) {
                    if (this.options.maxSelection && this.selectedValues.length >= this.options.maxSelection) {
                        return;
                    }
                    
                    $checkbox.prop('checked', true);
                    $option.addClass('selected').attr('aria-selected', 'true');
                    $selectOption.prop('selected', true);
                    this.selectedValues.push(value);
                }
            });
            
            this.updateSelection();
            this.$element.trigger('change').trigger('multiselect:selectall');
        }
        
        clearAll() {
            if (this.isMultiple) {
                this.selectedValues = [];
                this.$element.find('option').prop('selected', false);
                this.$optionsContainer.find('.multi-select-option').removeClass('selected').attr('aria-selected', 'false');
                this.$optionsContainer.find('input[type="checkbox"]').prop('checked', false);
            } else {
                this.selectedValue = null;
                this.$element.find('option').prop('selected', false);
                this.$optionsContainer.find('.multi-select-option').removeClass('selected').attr('aria-selected', 'false');
            }
            
            this.updateSelection();
            this.$element.trigger('change').trigger('multiselect:clearall');
        }
        
        // Dynamic option management
        storeOriginalOptions() {
            this.originalOptions = this.$element.find('option').map(function() {
                return {
                    value: this.value,
                    text: this.text,
                    selected: this.selected
                };
            }).get();
        }
        
        populateOptions(options) {
            // Clear existing options
            this.$element.empty();
            this.$optionsContainer.empty();
            
            // Add new options
            options.forEach((optionData, index) => {
                // Add to select element
                const $option = $('<option></option>')
                    .val(optionData.value)
                    .text(optionData.text || optionData.label)
                    .prop('selected', optionData.selected || false);
                this.$element.append($option);
                
                // Add to dropdown
                const $optionElement = this.createOptionElement($option[0], index);
                this.$optionsContainer.append($optionElement);
            });
            
            // Update selection display
            this.updateFromSelect();
        }
        
        addOption(optionData) {
            // Add to select element
            const $option = $('<option></option>')
                .val(optionData.value)
                .text(optionData.text || optionData.label)
                .prop('selected', optionData.selected || false);
            this.$element.append($option);
            
            // Add to dropdown
            const index = this.$element.find('option').length - 1;
            const $optionElement = this.createOptionElement($option[0], index);
            this.$optionsContainer.append($optionElement);
            
            // Update if selected
            if (optionData.selected) {
                if (this.isMultiple) {
                    this.selectedValues.push(optionData.value);
                } else {
                    this.selectedValue = optionData.value;
                }
                this.updateSelection();
            }
            
            this.$element.trigger('multiselect:optionadded', { option: optionData });
        }
        
        removeOption(value) {
            // Remove from select element
            this.$element.find(`option[value="${value}"]`).remove();
            
            // Remove from dropdown
            this.$optionsContainer.find(`[data-value="${value}"]`).remove();
            
            // Update selection if needed
            if (this.isMultiple) {
                this.selectedValues = this.selectedValues.filter(v => v !== value);
            } else if (this.selectedValue === value) {
                this.selectedValue = null;
            }
            this.updateSelection();
            
            this.$element.trigger('multiselect:optionremoved', { value: value });
        }
        
        clearOptions() {
            this.$element.empty();
            this.$optionsContainer.empty();
            if (this.isMultiple) {
                this.selectedValues = [];
            } else {
                this.selectedValue = null;
            }
            this.updateSelection();
            
            this.$element.trigger('multiselect:optionscleared');
        }
        
        refreshOptions() {
            // Recreate dropdown options from current select options
            this.$optionsContainer.empty();
            const options = this.$element.find('option').toArray();
            options.forEach((option, index) => {
                const $optionElement = this.createOptionElement(option, index);
                this.$optionsContainer.append($optionElement);
            });
            this.updateFromSelect();
        }
        
        // Server-side data fetching
        async loadData(url, params = {}) {
            this.showLoading();
            
            try {
                const queryString = new URLSearchParams(params).toString();
                const fullUrl = queryString ? `${url}?${queryString}` : url;
                
                const response = await fetch(fullUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                
                // Expect data format: { options: [{ value, text/label, selected? }] }
                if (data.options && Array.isArray(data.options)) {
                    this.populateOptions(data.options);
                } else if (Array.isArray(data)) {
                    this.populateOptions(data);
                } else {
                    throw new Error('Invalid data format received');
                }
                
                this.$element.trigger('multiselect:dataloaded', { data: data });
            } catch (error) {
                console.error('Error loading data:', error);
                this.showNoResults();
                this.$element.trigger('multiselect:dataerror', { error: error });
            } finally {
                this.hideLoading();
            }
        }
        
        updateSelection() {
            this.$selection.empty();
            
            if (this.isMultiple) {
                if (this.selectedValues.length === 0) {
                    this.$selection.append(this.$placeholder);
                } else {
                    this.selectedValues.forEach(value => {
                        const $option = this.$element.find(`option[value="${value}"]`);
                        if ($option.length) {
                            const $tag = this.createTag($option.text(), value);
                            this.$selection.append($tag);
                        }
                    });
                }
            } else {
                // Single select
                if (!this.selectedValue) {
                    this.$selection.append(this.$placeholder);
                } else {
                    const $option = this.$element.find(`option[value="${this.selectedValue}"]`);
                    if ($option.length) {
                        const $selectedText = $('<span class="multi-select-single-value"></span>').text($option.text());
                        // Don't add click handler here - use the delegated handler in bindEvents instead
                        const $clearBtn = $('<i class="bi bi-x multi-select-clear" aria-label="Clear selection" data-value="' + this.selectedValue + '"></i>');
                        const $singleContainer = $('<div class="multi-select-single-container"></div>')
                            .append($selectedText)
                            .append($clearBtn);
                        this.$selection.append($singleContainer);
                    }
                }
            }
        }
        
        createTag(text, value) {
            const $tag = $('<span class="multi-select-tag" data-value="' + value + '"></span>');
            
            const $tagText = $('<span class="multi-select-tag-text"></span>').text(text).attr('title', text);
            
            // Don't add click handler here - use the delegated handler in bindEvents instead
            const $removeBtn = $('<i class="bi bi-x multi-select-tag-remove" aria-label="Remove ' + text + '"></i>');
            
            $tag.append($tagText).append($removeBtn);
            
            return $tag;
        }
        
        removeTag(value) {
            console.log('removeTag called with value:', value);
            const $option = this.$element.find(`option[value="${value}"]`);
            const $optionElement = this.$optionsContainer.find(`[data-value="${value}"]`);
            
            // Ensure proper element selections
            console.log('Found option:', $option.length > 0);
            console.log('Found option element:', $optionElement.length > 0);
            
            if ($option.length) {
                $option.prop('selected', false);
                
                if (this.isMultiple) {
                    const $checkbox = $optionElement.find('input[type="checkbox"]');
                    if ($checkbox.length) $checkbox.prop('checked', false);
                    this.selectedValues = this.selectedValues.filter(v => v !== value);
                } else {
                    this.selectedValue = null;
                }
                
                if ($optionElement.length) {
                    $optionElement.removeClass('selected').attr('aria-selected', 'false');
                }
                
                // Force UI update
                this.updateSelection();
                this.$element.trigger('change').trigger('multiselect:tagremoved', { value: value });
            }
        }
        
        clearSingleSelection() {
            console.log('clearSingleSelection called');
            // Clear the single selected value
            this.selectedValue = null;
            this.$element.find('option').prop('selected', false);
            this.$optionsContainer.find('.multi-select-option').removeClass('selected').attr('aria-selected', 'false');
            
            // Force UI update
            this.updateSelection();
            this.$element.trigger('change').trigger('multiselect:cleared');
            
            console.log('Selection cleared');
        }
        
        clearSelection() {
            if (this.isMultiple) {
                this.clearAll();
            } else {
                this.clearSingleSelection();
            }
        }
        
        updateFromSelect() {
            if (this.isMultiple) {
                this.selectedValues = [];
                this.$element.find('option:selected').each((index, element) => {
                    this.selectedValues.push(element.value);
                });
            } else {
                this.selectedValue = null;
                const $selectedOption = this.$element.find('option:selected');
                if ($selectedOption.length) {
                    this.selectedValue = $selectedOption.val();
                }
            }
            this.updateSelection();
        }
        
        // Public API methods
        getValue() {
            return this.isMultiple ? [...this.selectedValues] : this.selectedValue;
        }
        
        setValue(values) {
            // Clear current selection
            this.clearAll();
            
            if (this.isMultiple) {
                // Set new values for multiple select
                const valueArray = Array.isArray(values) ? values : [values];
                valueArray.forEach(value => {
                    if (value === null || value === undefined) return;
                    
                    const $option = this.$element.find(`option[value="${value}"]`);
                    const $optionElement = this.$optionsContainer.find(`[data-value="${value}"]`);
                    
                    if ($option.length && $optionElement.length) {
                        $option.prop('selected', true);
                        const $checkbox = $optionElement.find('input[type="checkbox"]');
                        if ($checkbox.length) $checkbox.prop('checked', true);
                        $optionElement.addClass('selected').attr('aria-selected', 'true');
                        this.selectedValues.push(value);
                    }
                });
            } else {
                // Set single value
                const value = Array.isArray(values) ? values[0] : values;
                if (value !== null && value !== undefined) {
                    const $option = this.$element.find(`option[value="${value}"]`);
                    const $optionElement = this.$optionsContainer.find(`[data-value="${value}"]`);
                    
                    if ($option.length && $optionElement.length) {
                        $option.prop('selected', true);
                        $optionElement.addClass('selected').attr('aria-selected', 'true');
                        this.selectedValue = value;
                    }
                }
            }
            
            this.updateSelection();
            this.$element.trigger('change').trigger('multiselect:valuechanged', { value: this.getValue() });
        }
        
        reset() {
            // Reset to original state
            this.clearAll();
            this.originalOptions.forEach(optionData => {
                if (optionData.selected) {
                    if (this.isMultiple) {
                        this.selectedValues.push(optionData.value);
                    } else {
                        this.selectedValue = optionData.value;
                    }
                }
            });
            this.updateFromSelect();
        }
        
        enable() {
            this.$trigger.removeClass('disabled').removeAttr('disabled').prop('tabIndex', 0);
        }
        
        disable() {
            this.$trigger.addClass('disabled').attr('disabled', 'true').prop('tabIndex', -1);
            this.close();
        }
        
        isEnabled() {
            return !this.$trigger.hasClass('disabled');
        }
        
        validate() {
            const isValid = this.element.checkValidity();
            if (!isValid) {
                this.$trigger.addClass('is-invalid');
            } else {
                this.$trigger.removeClass('is-invalid');
            }
            return isValid;
        }
        
        destroy() {
            // Remove event listeners
            $(document).off('click.multiselect');
            
            // Remove DOM elements
            this.$trigger.remove();
            this.$dropdown.remove();
            this.$element.removeClass('d-none');
            
            // Clear references
            this.$element = null;
            this.$container = null;
            this.$trigger = null;
            this.$dropdown = null;
            this.$optionsContainer = null;
            this.$searchInput = null;
            
            this.$element.trigger('multiselect:destroyed');
        }
    }
    
    // jQuery plugin
    $.fn.multiSelect = function(options) {
        return this.each(function() {
            if (!this._multiSelect) {
                this._multiSelect = new MultiSelect(this, options);
            }
        });
    };
    
    // Auto-initialization
    MultiSelect.autoInit = function(selector = '.multi-select-container select') {
        const $elements = $(selector);
        const instances = [];
        
        $elements.each(function() {
            if (!this._multiSelect) {
                const instance = new MultiSelect(this);
                this._multiSelect = instance;
                instances.push(instance);
            }
        });
        
        return instances;
    };
    
    // Expose to global scope
    window.MultiSelect = MultiSelect;
    
})(jQuery);