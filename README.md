# MultiSelect v2.1.0

A lightweight, optimized multi-select component for Bootstrap 5 with jQuery integration.

## ✨ Features

- **Single & Multiple Selection** modes
- **Search/Filter** functionality
- **Remote Data Loading** with async support
- **Keyboard Navigation** (Arrow keys, Enter, Escape, Space)
- **Accessibility Support** (ARIA attributes)
- **Bootstrap 5 Integration** using native variables for theming
- **Responsive Design** with mobile optimization
- **Form Validation** integration

## 🚀 Quick Start

### 1. Include Dependencies

```html
<!-- jQuery 3.3+ -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- Bootstrap 5.3+ (JS optional, only needed for other Bootstrap components) -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

<!-- MultiSelect -->
<link href="multiselect.min.css" rel="stylesheet">
<script src="multiselect.min.js"></script>
```

```html
<!-- jQuery 3.3+ -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- Bootstrap 5.3+ -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>

<!-- MultiSelect Library -->
<link href="style.css" rel="stylesheet">
<script src="script.js"></script>
```

### 2. HTML Structure

```html
<div class="multi-select-container">
    <select id="mySelect" name="mySelect" multiple class="d-none">
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
    </select>
</div>
```

### 3. Initialize with jQuery

```javascript
$('#mySelect').multiSelect({
    placeholder: 'Select options...',
    searchable: true,
    selectAll: true
});
```

## 🔧 Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placeholder` | string | 'Select options...' | Placeholder text when no options selected |
| `searchable` | boolean | true | Enable search functionality |
| `selectAll` | boolean | true | Show Select All button (multiple mode only) |
| `clearAll` | boolean | true | Show Clear All button |
| `maxSelection` | number | null | Maximum number of items that can be selected |
| `remote` | function | null | Function for remote data loading, receives search query |
| `searchDelay` | number | 300 | Milliseconds to wait before triggering remote search |
| `noResultsText` | string | 'No results found' | Text to show when no results match search |
| `loadingText` | string | 'Loading...' | Text to show during remote data loading |
| `searchPlaceholder` | string | 'Search options...' | Placeholder for search input |
| `selectAllText` | string | 'Select All' | Text for Select All button |
| `clearAllText` | string | 'Clear All' | Text for Clear All button |

## 📋 Methods

Access methods through the jQuery element:

```javascript
// Examples
$('#mySelect').data('multiSelect').open();
$('#mySelect').data('multiSelect').getValue();
```

| Method | Description |
|--------|-------------|
| `open()` | Opens the dropdown |
| `close()` | Closes the dropdown |
| `getValue()` | Gets selected value(s) |
| `setValue(val)` | Sets selected value(s) |
| `selectAll()` | Selects all options |
| `clearAll()` | Clears all selections |
| `disable()` | Disables the control |
| `enable()` | Enables the control |
## 🔄 Events

Listen for events on the original select element:

```javascript
$('#mySelect').on('multiselect:change', function(e, data) {
    console.log('Selected values:', data.value);
});
```

| Event | Description |
|-------|-------------|
| `multiselect:change` | Triggered when selection changes |
| `multiselect:open` | Triggered when dropdown opens |
| `multiselect:close` | Triggered when dropdown closes |
| `multiselect:selectall` | Triggered when Select All is clicked |
| `multiselect:clearall` | Triggered when Clear All is clicked |
| `multiselect:maxselection` | Triggered when max selection limit is reached |
| `multiselect:optionadded` | Triggered when an option is added |
| `multiselect:optionremoved` | Triggered when an option is removed |

## 🎨 Theming

The component uses Bootstrap CSS variables, making it compatible with Bootstrap themes and dark mode. 
Custom styling can be added by targeting the component's CSS classes.

## �️ Icon/Image Support

You can add icons or images to your options:

```javascript
$('#mySelect').multiSelect({
    // Your other options...
});

// Populate with icons/images
$('#mySelect').data('multiSelect').populateOptions([
    { value: "1", text: "Option with Icon", icon: "bi bi-star-fill" },
    { value: "2", text: "Option with Image", icon: "https://example.com/image.png" },
    { value: "3", text: "Regular Option" }
]);
```

The icons/images will appear in both dropdown options and selected tags.

## �🔍 Remote Data Loading

```javascript
$('#mySelect').multiSelect({
    remote: async function(query) {
        const response = await fetch(`/api/search?q=${query}`);
        return await response.json();
        // Should return: [{ value: "1", text: "Option 1", icon: "bi bi-person" }, ...]
    }
});
```

## 📱 Mobile Support

Automatically adapts for mobile devices with touch-friendly controls and optimized layout.

## License

MIT
    searchable: true,
    selectAll: true,
    clearAll: true,
    maxSelection: 5
});
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placeholder` | string | Auto-generated | Custom placeholder text |
| `searchable` | boolean | `true` | Enable/disable search functionality |
| `selectAll` | boolean | `true` (multiple only) | Show "Select All" button |
| `clearAll` | boolean | `true` | Show "Clear All" button |
| `maxSelection` | number | `null` | Maximum number of selections |
| `remote` | function | `null` | Remote data loading function |
| `searchDelay` | number | `300` | Search input delay in ms |

## 🔧 API Methods

### jQuery Plugin Methods

```javascript
// Get current value(s)
const value = $('#mySelect').multiSelect('getValue');

// Set value(s)
$('#mySelect').multiSelect('setValue', ['option1', 'option2']);

// Reset to original state
$('#mySelect').multiSelect('reset');

// Enable/disable
$('#mySelect').multiSelect('enable');
$('#mySelect').multiSelect('disable');

// Validate
const isValid = $('#mySelect').multiSelect('validate');

// Destroy instance
$('#mySelect').multiSelect('destroy');
```

### Direct Instance Access

```javascript
const instance = $('#mySelect').multiSelect()[0]._multiSelect;
instance.setValue(['option1']);
```

## 📱 Responsive Design

The library includes responsive breakpoints:
- **Mobile (< 576px)**: Optimized touch targets and spacing
- **Tablet (< 768px)**: Adjusted padding and margins
- **Desktop (≥ 768px)**: Full feature set with optimal spacing

## 🎨 Customization

### CSS Variables

The component uses Bootstrap 5 CSS variables for consistent theming:

```css
.multi-select-trigger {
    border-color: var(--bs-primary);
    background: var(--bs-body-bg);
}
```

### Dark Theme Support

Automatically adapts to Bootstrap's dark theme:

```html
<html data-bs-theme="dark">
```

## ♿ Accessibility

- **ARIA attributes** for screen readers
- **Keyboard navigation** support
- **Focus management** and visible focus indicators
- **Reduced motion** support for users with vestibular disorders

## 🧪 Testing

Open `test.html` in your browser to test the jQuery integration and UI improvements.

## 📝 Changelog

### v2.0.0
- ✅ jQuery 3.3+ integration
- ✅ Fixed padding/margin issues
- ✅ Improved responsive design
- ✅ Enhanced UI animations
- ✅ Better form integration
- ✅ Optimized mobile experience

### v1.0.0
- Initial release with vanilla JavaScript

## 🤝 Contributing

Made by Sunil Kumar

## 📄 License

Open source - feel free to use and modify!
