# Select3 - Advanced Select Component

A modern, lightweight, and feature-rich select library for web applications. Built with accessibility, performance, and developer experience in mind.

## ✨ Features

- **Single & Multiple Selection** modes with intuitive interface
- **Advanced Search** functionality with customizable filters
- **Remote Data Loading** with async support and error handling
- **Keyboard Navigation** (Arrow keys, Enter, Escape, Space, Tab)
- **Full Accessibility Support** (ARIA attributes, screen reader friendly)
- **Bootstrap 5 Integration** with native theming variables
- **Dark/Light Mode** automatic theme switching
- **Responsive Design** optimized for mobile devices
- **Form Validation** integration with native HTML5 validation
- **Custom Icons** support (emoji, CSS classes, images)
- **Maximum Selection Limits** with visual feedback
- **Event System** for custom integrations

## 🎯 Recent Updates (v3.0)

### ✅ Fixed Issues
- **Complete Dark/Light Mode Support**: All components now properly adapt to theme changes
- **Working Demos**: Added fully functional Select3 demos instead of mock-ups
- **Comprehensive Installation Guide**: Step-by-step instructions with examples
- **Enhanced Documentation**: Better configuration options and event handling examples

### 🚀 New Features
- Real-time theme switching without page reload
- Interactive hero demo showcasing multi-select functionality
- Advanced configuration options table
- Event handling examples
- Mobile-optimized dropdown positioning
- Improved icon support (emoji, CSS classes, image URLs)

## 🚀 Quick Start

### 1. Include Dependencies

```html
<!-- jQuery 3.7+ -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- Bootstrap 5.3+ -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

<!-- Select3 -->
<link href="lib/select3.min.css" rel="stylesheet">
<script src="lib/select3.min.js"></script>
```

### 2. HTML Structure

```html
<select id="my-select" multiple>
    <option value="1" data-icon="🚀">Option 1</option>
    <option value="2" data-icon="⭐">Option 2</option>
    <option value="3" selected data-icon="🎯">Option 3</option>
</select>
```

### 3. Initialize Select3

```javascript
$('#my-select').select3({
    searchable: true,
    placeholder: 'Choose options...',
    searchPlaceholder: 'Type to search...',
    selectAll: true,
    clearAll: true
});
```

## 📖 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `searchable` | boolean | `false` | Enable search functionality |
| `placeholder` | string | `"Choose an option..."` | Placeholder text when nothing is selected |
| `searchPlaceholder` | string | `"Search options..."` | Placeholder text in search input |
| `maxSelection` | number | `null` | Maximum number of selections allowed |
| `selectAll` | boolean | `false` | Show "Select All" button for multi-select |
| `clearAll` | boolean | `false` | Show "Clear All" button |
| `remote` | function | `null` | Function for loading remote data |
| `searchDelay` | number | `300` | Delay in milliseconds before triggering search |
| `noResultsText` | string | `"No results found"` | Text shown when no options match |
| `loadingText` | string | `"Loading..."` | Text shown while loading remote data |

## 🎮 Event Handling

```javascript
$('#my-select')
    .on('select3:change', function(e) {
        console.log('Selection changed:', e.detail.value);
    })
    .on('select3:open', function() {
        console.log('Dropdown opened');
    })
    .on('select3:close', function() {
        console.log('Dropdown closed');
    })
    .on('select3:maxselection', function(e) {
        console.log('Maximum selections reached:', e.detail.max);
    });
```

## 🌙 Theme Support

Select3 automatically adapts to your Bootstrap theme. For custom dark/light mode switching:

```javascript
// Switch to dark mode
document.documentElement.setAttribute('data-bs-theme', 'dark');

// Switch to light mode  
document.documentElement.setAttribute('data-bs-theme', 'light');
```

## 🔧 Advanced Usage

### Remote Data Loading

```javascript
$('#remote-select').select3({
    searchable: true,
    remote: async function(query) {
        const response = await fetch(`/api/search?q=${query}`);
        const data = await response.json();
        return data.map(item => ({
            value: item.id,
            text: item.name,
            icon: item.avatar
        }));
    }
});
```

### Custom Icons

Icons can be specified using:
- **Emoji**: `data-icon="🚀"`
- **CSS Classes**: `data-icon="bi bi-star-fill"`
- **Image URLs**: `data-icon="https://example.com/icon.png"`

## 📱 Mobile Support

Select3 is fully responsive and includes:
- Touch-friendly interface
- Mobile-optimized dropdown positioning
- Reduced motion support for accessibility
- Proper viewport handling

## 🎨 Live Demo

Visit our [demo page](index.html) to see Select3 in action with:
- Multi-select countries with search
- Single-select priority picker
- Skills selector with maximum limits
- Remote data loading simulation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
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
