# MultiSelect v2.1.0

A lightweight, optimized multi-select component for Bootstrap 5 with jQuery 3.3+ integration.

## ✨ Features

- **Single & Multiple Selection** modes
- **Search/Filter** functionality with configurable search
- **Remote Data Loading** with async support
- **Keyboard Navigation** (Arrow keys, Enter, Escape, Space)
- **Accessibility Support** (ARIA attributes, screen reader friendly)
- **jQuery 3.3+ Integration** for easier development
- **Responsive Design** with mobile optimization
- **Theme Support** (light/dark mode)
- **Form Validation** integration

## 🚀 Quick Start

### 1. Include Dependencies

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
