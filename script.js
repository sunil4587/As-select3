/**
 * MultiSelect Library - JavaScript
 * A powerful, flexible multi-select component for Bootstrap 5
 * Version: 1.0.0
 * 
 * Features:
 * - Single and multiple selection modes
 * - Search/filter functionality
 * - Remote data loading
 * - Keyboard navigation
 * - Accessibility support
 * - Customizable styling
 * - Form validation support
 * 
 * Dependencies:
 * - Bootstrap 5.3+ (for icons and styling variables)
 * 
 * Usage:
 * const multiSelect = new MultiSelect('#mySelect', {
 *   searchable: true,
 *   selectAll: true,
 *   maxSelection: 5
 * });
 */

(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        // CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals
        global.MultiSelect = factory();
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function() {
    'use strict';

    class MultiSelect {
        constructor(element, options = {}) {
            // Handle both selector strings and DOM elements
            if (typeof element === 'string') {
                this.element = document.querySelector(element);
                if (!this.element) {
                    throw new Error(`MultiSelect: Element "${element}" not found`);
                }
            } else {
                this.element = element;
            }
            
            this.container = this.element.closest('.multi-select-container');
            if (!this.container) {
                // Create container if it doesn't exist
                this.container = document.createElement('div');
                this.container.className = 'multi-select-container';
                this.element.parentNode.insertBefore(this.container, this.element);
                this.container.appendChild(this.element);
            }
            
            this.isMultiple = this.element.hasAttribute('multiple');
            
            // Default options
            this.options = {
                placeholder: this.isMultiple ? 'Select options...' : 'Choose an option...',
                searchable: this.element.dataset.search !== 'false',
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
                ...options
            };
            
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
            this.trigger = document.createElement('div');
            this.trigger.className = 'multi-select-trigger';
            this.trigger.tabIndex = 0;
            this.trigger.setAttribute('role', 'combobox');
            this.trigger.setAttribute('aria-expanded', 'false');
            this.trigger.setAttribute('aria-haspopup', 'listbox');
            
            this.selection = document.createElement('div');
            this.selection.className = 'multi-select-selection';
            
            this.placeholder = document.createElement('span');
            this.placeholder.className = 'multi-select-placeholder';
            this.placeholder.textContent = this.options.placeholder;
            this.selection.appendChild(this.placeholder);
            
            this.arrow = document.createElement('i');
            this.arrow.className = 'bi bi-chevron-down multi-select-arrow';
            this.arrow.setAttribute('aria-hidden', 'true');
            
            this.trigger.appendChild(this.selection);
            this.trigger.appendChild(this.arrow);
            
            this.container.appendChild(this.trigger);
            this.element.classList.add('d-none');
        }
        
        createDropdown() {
            this.dropdown = document.createElement('div');
            this.dropdown.className = 'multi-select-dropdown';
            this.dropdown.setAttribute('role', 'listbox');
            this.dropdown.setAttribute('aria-multiselectable', this.isMultiple.toString());
            
            if (this.options.searchable) {
                this.createSearchBox();
            }
            
            this.createOptions();
            
            if (this.options.selectAll || this.options.clearAll) {
                this.createActions();
            }
            
            this.container.appendChild(this.dropdown);
        }
        
        createSearchBox() {
            const searchContainer = document.createElement('div');
            searchContainer.className = 'multi-select-search';
            
            this.searchInput = document.createElement('input');
            this.searchInput.type = 'text';
            this.searchInput.placeholder = this.options.searchPlaceholder;
            this.searchInput.className = 'form-control form-control-sm';
            this.searchInput.setAttribute('role', 'searchbox');
            this.searchInput.setAttribute('aria-label', 'Search options');
            
            searchContainer.appendChild(this.searchInput);
            this.dropdown.appendChild(searchContainer);
        }
        
        createOptions() {
            this.optionsContainer = document.createElement('div');
            this.optionsContainer.className = 'multi-select-options';
            this.optionsContainer.setAttribute('role', 'group');
            
            const options = Array.from(this.element.options);
            options.forEach((option, index) => {
                const optionElement = this.createOptionElement(option, index);
                this.optionsContainer.appendChild(optionElement);
            });
            
            this.dropdown.appendChild(this.optionsContainer);
        }
        
        createOptionElement(option, index) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'multi-select-option';
            optionDiv.dataset.value = option.value;
            optionDiv.dataset.index = index;
            optionDiv.setAttribute('role', 'option');
            optionDiv.setAttribute('aria-selected', option.selected.toString());
            optionDiv.tabIndex = -1;
            
            if (this.isMultiple) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'form-check-input';
                checkbox.checked = option.selected;
                checkbox.tabIndex = -1;
                checkbox.setAttribute('aria-hidden', 'true');
                optionDiv.appendChild(checkbox);
            }
            
            const label = document.createElement('span');
            label.className = 'multi-select-option-text';
            label.textContent = option.text;
            optionDiv.appendChild(label);
            
            if (option.selected) {
                optionDiv.classList.add('selected');
            }
            
            return optionDiv;
        }
        
        createActions() {
            if (!this.isMultiple) return;
            
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'multi-select-actions';
            
            if (this.options.selectAll) {
                const selectAllBtn = document.createElement('button');
                selectAllBtn.type = 'button';
                selectAllBtn.className = 'btn btn-sm btn-outline-primary';
                selectAllBtn.textContent = this.options.selectAllText;
                selectAllBtn.onclick = () => this.selectAll();
                actionsContainer.appendChild(selectAllBtn);
            }
            
            if (this.options.clearAll) {
                const clearAllBtn = document.createElement('button');
                clearAllBtn.type = 'button';
                clearAllBtn.className = 'btn btn-sm btn-outline-secondary';
                clearAllBtn.textContent = this.options.clearAllText;
                clearAllBtn.onclick = () => this.clearAll();
                actionsContainer.appendChild(clearAllBtn);
            }
            
            this.dropdown.appendChild(actionsContainer);
        }
        
        bindEvents() {
            // Trigger events
            this.trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
            
            this.trigger.addEventListener('keydown', (e) => {
                this.handleKeydown(e);
            });
            
            // Search events
            if (this.searchInput) {
                this.searchInput.addEventListener('input', (e) => {
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
                
                this.searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.close();
                    }
                });
            }
            
            // Option events
            this.optionsContainer.addEventListener('click', (e) => {
                const option = e.target.closest('.multi-select-option');
                if (option) {
                    this.toggleOption(option);
                }
            });
            
            // Outside click
            document.addEventListener('click', (e) => {
                if (!this.container.contains(e.target)) {
                    this.close();
                }
            });
            
            // Form validation
            this.element.addEventListener('invalid', () => {
                this.trigger.classList.add('is-invalid');
            });
            
            // Form reset
            const form = this.element.closest('form');
            if (form) {
                form.addEventListener('reset', () => {
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
                            const options = Array.from(this.optionsContainer.children).filter(
                                opt => opt.style.display !== 'none' && !opt.classList.contains('multi-select-no-results')
                            );
                            if (options[this.focusedIndex]) {
                                this.toggleOption(options[this.focusedIndex]);
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
            const options = Array.from(this.optionsContainer.children).filter(
                opt => opt.style.display !== 'none' && !opt.classList.contains('multi-select-no-results')
            );
            if (options.length === 0) return;
            
            this.focusedIndex = (this.focusedIndex + 1) % options.length;
            this.updateFocus(options);
        }
        
        focusPrevious() {
            const options = Array.from(this.optionsContainer.children).filter(
                opt => opt.style.display !== 'none' && !opt.classList.contains('multi-select-no-results')
            );
            if (options.length === 0) return;
            
            this.focusedIndex = this.focusedIndex <= 0 ? options.length - 1 : this.focusedIndex - 1;
            this.updateFocus(options);
        }
        
        updateFocus(visibleOptions) {
            this.optionsContainer.querySelectorAll('.focused').forEach(opt => {
                opt.classList.remove('focused');
            });
            
            if (visibleOptions[this.focusedIndex]) {
                visibleOptions[this.focusedIndex].classList.add('focused');
                visibleOptions[this.focusedIndex].scrollIntoView({ block: 'nearest' });
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
            this.dropdown.classList.add('show');
            this.trigger.classList.add('active');
            this.trigger.setAttribute('aria-expanded', 'true');
            this.focusedIndex = -1;
            
            if (this.searchInput) {
                this.searchInput.focus();
                this.searchInput.value = '';
                this.search('');
            }
            
            this.element.dispatchEvent(new CustomEvent('multiselect:open'));
        }
        
        close() {
            if (!this.isOpen) return;
            
            this.isOpen = false;
            this.dropdown.classList.remove('show');
            this.trigger.classList.remove('active');
            this.trigger.setAttribute('aria-expanded', 'false');
            this.focusedIndex = -1;
            
            this.optionsContainer.querySelectorAll('.focused').forEach(opt => {
                opt.classList.remove('focused');
            });
            
            this.element.dispatchEvent(new CustomEvent('multiselect:close'));
        }
        
        toggleOption(optionElement) {
            const value = optionElement.dataset.value;
            const option = this.element.querySelector(`option[value="${value}"]`);
            
            if (this.isMultiple) {
                const checkbox = optionElement.querySelector('input[type="checkbox"]');
                
                if (checkbox.checked) {
                    // Deselect
                    checkbox.checked = false;
                    optionElement.classList.remove('selected');
                    optionElement.setAttribute('aria-selected', 'false');
                    option.selected = false;
                    this.selectedValues = this.selectedValues.filter(v => v !== value);
                } else {
                    // Select (check max selection limit)
                    if (this.options.maxSelection && this.selectedValues.length >= this.options.maxSelection) {
                        this.element.dispatchEvent(new CustomEvent('multiselect:maxselection', {
                            detail: { maxSelection: this.options.maxSelection }
                        }));
                        return;
                    }
                    
                    checkbox.checked = true;
                    optionElement.classList.add('selected');
                    optionElement.setAttribute('aria-selected', 'true');
                    option.selected = true;
                    this.selectedValues.push(value);
                }
            } else {
                // Single select - clear other selections first
                this.optionsContainer.querySelectorAll('.multi-select-option').forEach(opt => {
                    opt.classList.remove('selected');
                    opt.setAttribute('aria-selected', 'false');
                    const optVal = opt.dataset.value;
                    const optElement = this.element.querySelector(`option[value="${optVal}"]`);
                    if (optElement) optElement.selected = false;
                });
                
                // Select this option
                optionElement.classList.add('selected');
                optionElement.setAttribute('aria-selected', 'true');
                option.selected = true;
                this.selectedValue = value;
                
                // Close dropdown after selection in single select mode
                this.close();
            }
            
            this.updateSelection();
            this.trigger.classList.remove('is-invalid');
            
            // Trigger change event
            this.element.dispatchEvent(new Event('change', { bubbles: true }));
            this.element.dispatchEvent(new CustomEvent('multiselect:change', {
                detail: { value: this.getValue() }
            }));
        }
        
        search(query) {
            const options = Array.from(this.optionsContainer.children).filter(
                child => !child.classList.contains('multi-select-no-results') && 
                         !child.classList.contains('multi-select-loading')
            );
            let hasVisibleOptions = false;
            
            options.forEach(option => {
                const text = option.textContent.toLowerCase();
                const matches = text.includes(query.toLowerCase());
                
                option.style.display = matches ? 'flex' : 'none';
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
            
            let loadingElement = this.optionsContainer.querySelector('.multi-select-loading');
            if (!loadingElement) {
                loadingElement = document.createElement('div');
                loadingElement.className = 'multi-select-loading';
                loadingElement.innerHTML = `<div class="spinner"></div>${this.options.loadingText}`;
                this.optionsContainer.appendChild(loadingElement);
            }
        }
        
        hideLoading() {
            this.isLoading = false;
            const loadingElement = this.optionsContainer.querySelector('.multi-select-loading');
            if (loadingElement) {
                loadingElement.remove();
            }
        }
        
        toggleNoResults(show) {
            let noResultsMsg = this.optionsContainer.querySelector('.multi-select-no-results');
            
            if (show && !noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'multi-select-no-results';
                noResultsMsg.innerHTML = `<i class="bi bi-search me-2"></i>${this.options.noResultsText}`;
                this.optionsContainer.appendChild(noResultsMsg);
            } else if (!show && noResultsMsg) {
                noResultsMsg.remove();
            }
        }
        
        hideNoResults() {
            const noResultsMsg = this.optionsContainer.querySelector('.multi-select-no-results');
            if (noResultsMsg) {
                noResultsMsg.remove();
            }
        }
        
        showNoResults() {
            this.toggleNoResults(true);
        }
        
        selectAll() {
            if (!this.isMultiple) return;
            
            const options = Array.from(this.optionsContainer.children).filter(
                opt => opt.style.display !== 'none' && !opt.classList.contains('multi-select-no-results')
            );
            
            options.forEach(optionElement => {
                const checkbox = optionElement.querySelector('input[type="checkbox"]');
                const value = optionElement.dataset.value;
                const option = this.element.querySelector(`option[value="${value}"]`);
                
                if (!checkbox.checked) {
                    if (this.options.maxSelection && this.selectedValues.length >= this.options.maxSelection) {
                        return;
                    }
                    
                    checkbox.checked = true;
                    optionElement.classList.add('selected');
                    optionElement.setAttribute('aria-selected', 'true');
                    option.selected = true;
                    this.selectedValues.push(value);
                }
            });
            
            this.updateSelection();
            this.element.dispatchEvent(new Event('change', { bubbles: true }));
            this.element.dispatchEvent(new CustomEvent('multiselect:selectall'));
        }
        
        clearAll() {
            if (this.isMultiple) {
                this.selectedValues = [];
                
                Array.from(this.element.options).forEach(option => {
                    option.selected = false;
                });
                
                this.optionsContainer.querySelectorAll('.multi-select-option').forEach(optionElement => {
                    const checkbox = optionElement.querySelector('input[type="checkbox"]');
                    if (checkbox) checkbox.checked = false;
                    optionElement.classList.remove('selected');
                    optionElement.setAttribute('aria-selected', 'false');
                });
            } else {
                this.selectedValue = null;
                
                Array.from(this.element.options).forEach(option => {
                    option.selected = false;
                });
                
                this.optionsContainer.querySelectorAll('.multi-select-option').forEach(optionElement => {
                    optionElement.classList.remove('selected');
                    optionElement.setAttribute('aria-selected', 'false');
                });
            }
            
            this.updateSelection();
            this.element.dispatchEvent(new Event('change', { bubbles: true }));
            this.element.dispatchEvent(new CustomEvent('multiselect:clearall'));
        }
        
        // Dynamic option management
        storeOriginalOptions() {
            this.originalOptions = Array.from(this.element.options).map(option => ({
                value: option.value,
                text: option.text,
                selected: option.selected
            }));
        }
        
        populateOptions(options) {
            // Clear existing options
            this.element.innerHTML = '';
            this.optionsContainer.innerHTML = '';
            
            // Add new options
            options.forEach((optionData, index) => {
                // Add to select element
                const option = document.createElement('option');
                option.value = optionData.value;
                option.text = optionData.text || optionData.label;
                if (optionData.selected) option.selected = true;
                this.element.appendChild(option);
                
                // Add to dropdown
                const optionElement = this.createOptionElement(option, index);
                this.optionsContainer.appendChild(optionElement);
            });
            
            // Update selection display
            this.updateFromSelect();
        }
        
        addOption(optionData) {
            // Add to select element
            const option = document.createElement('option');
            option.value = optionData.value;
            option.text = optionData.text || optionData.label;
            if (optionData.selected) option.selected = true;
            this.element.appendChild(option);
            
            // Add to dropdown
            const index = this.element.options.length - 1;
            const optionElement = this.createOptionElement(option, index);
            this.optionsContainer.appendChild(optionElement);
            
            // Update if selected
            if (optionData.selected) {
                if (this.isMultiple) {
                    this.selectedValues.push(optionData.value);
                } else {
                    this.selectedValue = optionData.value;
                }
                this.updateSelection();
            }
            
            this.element.dispatchEvent(new CustomEvent('multiselect:optionadded', {
                detail: { option: optionData }
            }));
        }
        
        removeOption(value) {
            // Remove from select element
            const option = this.element.querySelector(`option[value="${value}"]`);
            if (option) option.remove();
            
            // Remove from dropdown
            const optionElement = this.optionsContainer.querySelector(`[data-value="${value}"]`);
            if (optionElement) optionElement.remove();
            
            // Update selection if needed
            if (this.isMultiple) {
                this.selectedValues = this.selectedValues.filter(v => v !== value);
            } else if (this.selectedValue === value) {
                this.selectedValue = null;
            }
            this.updateSelection();
            
            this.element.dispatchEvent(new CustomEvent('multiselect:optionremoved', {
                detail: { value: value }
            }));
        }
        
        clearOptions() {
            this.element.innerHTML = '';
            this.optionsContainer.innerHTML = '';
            if (this.isMultiple) {
                this.selectedValues = [];
            } else {
                this.selectedValue = null;
            }
            this.updateSelection();
            
            this.element.dispatchEvent(new CustomEvent('multiselect:optionscleared'));
        }
        
        refreshOptions() {
            // Recreate dropdown options from current select options
            this.optionsContainer.innerHTML = '';
            const options = Array.from(this.element.options);
            options.forEach((option, index) => {
                const optionElement = this.createOptionElement(option, index);
                this.optionsContainer.appendChild(optionElement);
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
                
                this.element.dispatchEvent(new CustomEvent('multiselect:dataloaded', {
                    detail: { data: data }
                }));
            } catch (error) {
                console.error('Error loading data:', error);
                this.showNoResults();
                this.element.dispatchEvent(new CustomEvent('multiselect:dataerror', {
                    detail: { error: error }
                }));
            } finally {
                this.hideLoading();
            }
        }
        
        updateSelection() {
            this.selection.innerHTML = '';
            
            if (this.isMultiple) {
                if (this.selectedValues.length === 0) {
                    this.selection.appendChild(this.placeholder);
                } else {
                    this.selectedValues.forEach(value => {
                        const option = this.element.querySelector(`option[value="${value}"]`);
                        if (option) {
                            const tag = this.createTag(option.text, value);
                            this.selection.appendChild(tag);
                        }
                    });
                }
            } else {
                // Single select
                if (!this.selectedValue) {
                    this.selection.appendChild(this.placeholder);
                } else {
                    const option = this.element.querySelector(`option[value="${this.selectedValue}"]`);
                    if (option) {
                        const selectedText = document.createElement('span');
                        selectedText.textContent = option.text;
                        selectedText.className = 'multi-select-single-value';
                        this.selection.appendChild(selectedText);
                    }
                }
            }
        }
        
        createTag(text, value) {
            const tag = document.createElement('span');
            tag.className = 'multi-select-tag';
            
            const tagText = document.createElement('span');
            tagText.className = 'multi-select-tag-text';
            tagText.textContent = text;
            tagText.title = text; // Tooltip for long text
            
            const removeBtn = document.createElement('i');
            removeBtn.className = 'bi bi-x multi-select-tag-remove';
            removeBtn.setAttribute('aria-label', `Remove ${text}`);
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                this.removeTag(value);
            };
            
            tag.appendChild(tagText);
            tag.appendChild(removeBtn);
            
            return tag;
        }
        
        removeTag(value) {
            if (!this.isMultiple) return;
            
            const option = this.element.querySelector(`option[value="${value}"]`);
            const optionElement = this.optionsContainer.querySelector(`[data-value="${value}"]`);
            
            if (option && optionElement) {
                option.selected = false;
                const checkbox = optionElement.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.checked = false;
                optionElement.classList.remove('selected');
                optionElement.setAttribute('aria-selected', 'false');
                this.selectedValues = this.selectedValues.filter(v => v !== value);
                this.updateSelection();
                this.element.dispatchEvent(new Event('change', { bubbles: true }));
                this.element.dispatchEvent(new CustomEvent('multiselect:tagremoved', {
                    detail: { value: value }
                }));
            }
        }
        
        updateFromSelect() {
            if (this.isMultiple) {
                this.selectedValues = [];
                Array.from(this.element.options).forEach(option => {
                    if (option.selected) {
                        this.selectedValues.push(option.value);
                    }
                });
            } else {
                this.selectedValue = null;
                Array.from(this.element.options).forEach(option => {
                    if (option.selected) {
                        this.selectedValue = option.value;
                    }
                });
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
                    
                    const option = this.element.querySelector(`option[value="${value}"]`);
                    const optionElement = this.optionsContainer.querySelector(`[data-value="${value}"]`);
                    
                    if (option && optionElement) {
                        option.selected = true;
                        const checkbox = optionElement.querySelector('input[type="checkbox"]');
                        if (checkbox) checkbox.checked = true;
                        optionElement.classList.add('selected');
                        optionElement.setAttribute('aria-selected', 'true');
                        this.selectedValues.push(value);
                    }
                });
            } else {
                // Set single value
                const value = Array.isArray(values) ? values[0] : values;
                if (value !== null && value !== undefined) {
                    const option = this.element.querySelector(`option[value="${value}"]`);
                    const optionElement = this.optionsContainer.querySelector(`[data-value="${value}"]`);
                    
                    if (option && optionElement) {
                        option.selected = true;
                        optionElement.classList.add('selected');
                        optionElement.setAttribute('aria-selected', 'true');
                        this.selectedValue = value;
                    }
                }
            }
            
            this.updateSelection();
            this.element.dispatchEvent(new Event('change', { bubbles: true }));
            this.element.dispatchEvent(new CustomEvent('multiselect:valuechanged', {
                detail: { value: this.getValue() }
            }));
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
            this.trigger.classList.remove('disabled');
            this.trigger.removeAttribute('disabled');
            this.trigger.tabIndex = 0;
        }
        
        disable() {
            this.trigger.classList.add('disabled');
            this.trigger.setAttribute('disabled', 'true');
            this.trigger.tabIndex = -1;
            this.close();
        }
        
        isEnabled() {
            return !this.trigger.classList.contains('disabled');
        }
        
        validate() {
            const isValid = this.element.checkValidity();
            if (!isValid) {
                this.trigger.classList.add('is-invalid');
            } else {
                this.trigger.classList.remove('is-invalid');
            }
            return isValid;
        }
        
        destroy() {
            // Remove event listeners
            document.removeEventListener('click', this.handleDocumentClick);
            
            // Remove DOM elements
            this.trigger.remove();
            this.dropdown.remove();
            this.element.classList.remove('d-none');
            
            // Clear references
            this.element = null;
            this.container = null;
            this.trigger = null;
            this.dropdown = null;
            this.optionsContainer = null;
            this.searchInput = null;
            
            this.element.dispatchEvent(new CustomEvent('multiselect:destroyed'));
        }
    }
    
    // Auto-initialization
    MultiSelect.autoInit = function(selector = '.multi-select-container select') {
        const elements = document.querySelectorAll(selector);
        const instances = [];
        
        elements.forEach(element => {
            if (!element._multiSelect) {
                const instance = new MultiSelect(element);
                element._multiSelect = instance;
                instances.push(instance);
            }
        });
        
        return instances;
    };
    
    // jQuery plugin (if jQuery is available)
    if (typeof $ !== 'undefined' && $.fn) {
        $.fn.multiSelect = function(options) {
            return this.each(function() {
                if (!this._multiSelect) {
                    this._multiSelect = new MultiSelect(this, options);
                }
            });
        };
    }
    
    return MultiSelect;
}));