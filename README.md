# As-Select3 - Modern JavaScript Select Library

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/sunil4587/As-select3)
[![NPM](https://img.shields.io/npm/v/as-select3.svg)](https://www.npmjs.com/package/as-select3)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![jQuery](https://img.shields.io/badge/jquery-3.0+-yellow.svg)](https://jquery.com)

A lightweight, modern JavaScript library for creating beautiful and interactive select dropdowns. Built with jQuery, it provides advanced features like search, multi-selection, remote data loading, and custom themes.

## 📦 Installation

### Via NPM

```bash
npm install as-select3
```

### Via CDN

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/as-select3/dist/as-select3.min.css">

<!-- JavaScript (requires jQuery) -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.0/dist/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/as-select3/dist/as-select3.min.js"></script>
```

### Direct Download

[Download As-Select3 v1.0.0](https://sunil4587.github.io/As-select3/as-select3.zip) - Complete package with library files and documentation.
``` Library

A lightweight, modern JavaScript library for creating beautiful and interactive select dropdowns. Built with jQuery, it provides advanced features like search, multi-selection, remote data loading, and custom themes.

## ✨ Features

- 🔍 **Searchable** - Built-in search functionality with real-time filtering
- 🏷️ **Multi-select** - Select multiple options with elegant tag interface
- 🌐 **Remote Data** - Load data from APIs with async/await support
- 🎨 **Customizable** - Custom themes and comprehensive styling options
- 📱 **Responsive** - Mobile-friendly design with touch support
- ♿ **Accessible** - Full ARIA compliance and keyboard navigation
- 🚀 **Lightweight** - Minimal footprint with optimized performance
- 🎯 **Events** - Comprehensive event system for custom integrations

## 🎯 Live Demo

Visit the [demo page](https://sunil4587.github.io/As-select3/) to see As-Select3 in action with interactive examples.

## � Installation

### Download Package

[Download As-Select3 v1.0.0](https://sunil4587.github.io/As-select3/as-select3.zip) - Complete package with library files and documentation.

### Include Files

```html
<!-- CSS -->
<link rel="stylesheet" href="lib/as-select3.min.css">

<!-- JavaScript (requires jQuery) -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.0/dist/jquery.min.js"></script>
<script src="lib/as-select3.min.js"></script>
```

### Basic Usage

```html
<select id="my-select" multiple>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
</select>

<script>
$('#my-select').asSelect3({
    placeholder: 'Choose options...',
    searchable: true,
    selectAll: true,
    clearAll: true
});
</script>
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placeholder` | string | "Choose an option..." | Placeholder text |
| `searchable` | boolean | true | Enable search functionality |
| `selectAll` | boolean | false | Show "Select All" button |
| `clearAll` | boolean | false | Show "Clear All" button |
| `maxSelection` | number | null | Maximum selections allowed |
| `remote` | function | null | Function for remote data loading |
| `searchDelay` | number | 300 | Search delay in milliseconds |
| `theme` | string | null | Custom theme class |

## 🌐 Remote Data Example

```javascript
$('#remote-select').asSelect3({
    placeholder: 'Search users...',
    searchable: true,
    remote: async function(searchTerm) {
        const response = await fetch(`/api/users?search=${searchTerm}`);
        const data = await response.json();
        
        return data.map(user => ({
            value: user.id,
            text: user.name,
            icon: user.avatar, // Optional image URL
            html: `<div>
                     <strong>${user.name}</strong>
                     <div class="text-muted">${user.email}</div>
                   </div>`
        }));
    }
});
```

## 🎨 Custom Themes

```css
/* Custom theme example */
.as-select3-container.my-theme .as-select3-selection {
    border-color: #007bff;
    background: linear-gradient(to right, rgba(0, 123, 255, 0.1), rgba(0, 123, 255, 0.2));
}

.as-select3-container.my-theme .as-select3-tag {
    background-color: #007bff;
    color: white;
}
```

```javascript
$('#themed-select').asSelect3({
    theme: 'my-theme'
});
```

## 🔧 Events

```javascript
$('#my-select').on('asSelect3:change', function(e) {
    console.log('Selection changed:', e.detail.value);
});

$('#my-select').on('asSelect3:maxselection', function(e) {
    alert('Maximum selection reached!');
});
```

Available events: `asSelect3:change`, `asSelect3:open`, `asSelect3:close`, `asSelect3:maxselection`, `asSelect3:selectall`, `asSelect3:clearall`

## 📱 Mobile Support

As-Select3 is fully responsive with:
- Touch-friendly interface
- Mobile-optimized dropdown positioning  
- Reduced motion support for accessibility
- Proper viewport handling on iOS/Android

## 🌙 Dark Mode

Automatically adapts to Bootstrap's dark theme:

```html
<html data-bs-theme="dark">
```

Or programmatically:

```javascript
document.documentElement.setAttribute('data-bs-theme', 'dark');
```

## 🔧 API Methods

```javascript
// Get current value(s)
const value = $('#my-select').asSelect3('getValue');

// Set value(s)
$('#my-select').asSelect3('setValue', ['option1', 'option2']);

// Open/close dropdown
$('#my-select').asSelect3('open');
$('#my-select').asSelect3('close');

// Destroy instance
$('#my-select').asSelect3('destroy');
```

## 📋 Requirements

- **jQuery 3.0+** - Required dependency
- **Modern browsers** - Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Bootstrap 5+ CSS variables** - Recommended for optimal styling

## 🏗️ Project Structure

```
As-select3/
├── images/
│   └── icons/           # Project icons and visuals
├── lib/
│   ├── dist/
│   │   ├── as-select3.min.css    # Main stylesheet
│   │   └── as-select3.min.js     # Main JavaScript library
│   ├── package.json     # NPM package configuration
│   └── README.md        # Package documentation
├── index.html           # Demo and documentation page
├── scripts.js           # Demo page JavaScript
├── styles.css           # Demo page styles
└── README.md            # This file
```

## 🧪 Running the Demo

1. Clone the repository:
   ```bash
   git clone https://github.com/sunil4587/As-select3.git
   cd As-select3
   ```

2. Start a local server:
   ```bash
   python3 -m http.server 8080
   # or
   npx live-server
   ```

3. Open `http://localhost:8080` in your browser

## 🎯 Examples

### Multi-select with Search
```javascript
$('#multi-select').select3({
    placeholder: 'Select programming languages',
    searchable: true,
    searchPlaceholder: 'Search languages...',
    selectAll: true,
    clearAll: true
});
```

### Limited Selection
```javascript
$('#skills-select').select3({
    placeholder: 'Select up to 3 skills',
    maxSelection: 3,
    searchable: true
});
```

### Profile Images
```html
<select id="team-select">
    <option value="user1" data-icon="https://avatar.example.com/user1.jpg">John Doe</option>
    <option value="user2" data-icon="https://avatar.example.com/user2.jpg">Jane Smith</option>
</select>
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sunil Kumar**
- GitHub: [@sunil4587](https://github.com/sunil4587)
- Repository: [As-select3](https://github.com/sunil4587/As-select3)

## 🆘 Support

If you encounter any issues:

1. Check the [demo page](https://sunil4587.github.io/As-select3/) for examples
2. Review this documentation
3. Create an issue on [GitHub](https://github.com/sunil4587/As-select3/issues)
4. Ensure jQuery is properly loaded

## 🚀 Roadmap

- [ ] NPM package publication
- [ ] CDN distribution
- [ ] TypeScript definitions
- [ ] React/Vue wrapper components
- [ ] Additional themes and customization options

---

⭐ **If you like this project, please give it a star on GitHub!**
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
