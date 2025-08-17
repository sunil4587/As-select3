# As-Select3 - Modern JavaScript Select Library

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://github.com/sunil4587/As-select3)
[![NPM](https://img.shields.io/npm/v/as-select3.svg)](https://www.npmjs.com/package/as-select3)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![jQuery](https://img.shields.io/badge/jquery-3.0+-yellow.svg)](https://jquery.com)

**Author:** Sunil Kumar  
**License:** MIT  
**Repository:** https://github.com/sunil4587/As-select3

## 📖 Description

As-Select3 is a lightweight, modern JavaScript library for creating beautiful and interactive select dropdowns. Built with jQuery, it provides advanced features like search, multi-selection, remote data loading, and custom themes.

## ✨ Features

- 🔍 **Searchable** - Built-in search functionality
- 🏷️ **Multi-select** - Select multiple options with tags
- 🌐 **Remote Data** - Load data from APIs
- 🎨 **Customizable** - Custom themes and styling
- 📱 **Responsive** - Mobile-friendly design
- ♿ **Accessible** - ARIA compliant
- 🚀 **Lightweight** - Minimal footprint

## 📦 Installation

### Via NPM
```bash
npm install as-select3
```

### Via Yarn
```bash
yarn add as-select3
```

### Via CDN
```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/as-select3/dist/as-select3.min.css">

<!-- JavaScript (requires jQuery) -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.0/dist/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/as-select3/dist/as-select3.min.js"></script>
```

### Direct Include
```html
<!-- CSS -->
<link rel="stylesheet" href="dist/as-select3.min.css">

<!-- JavaScript (requires jQuery) -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.0/dist/jquery.min.js"></script>
<script src="dist/as-select3.min.js"></script>
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

### ES Module Usage
```javascript
// Import styles
import 'as-select3/dist/as-select3.min.css';

// Import jQuery if you haven't already
import $ from 'jquery';

// Import as-select3
import 'as-select3';

// Initialize
$('#my-select').asSelect3({
    placeholder: 'Choose options...',
    searchable: true
});
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

## 📋 Requirements

- **jQuery 3.0+** - Required dependency
- **Modern browsers** - Chrome, Firefox, Safari, Edge

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

## 🐛 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 License

MIT License - feel free to use in personal and commercial projects.

## 👨‍💻 Author

**Sunil Kumar**  
- GitHub: [@sunil4587](https://github.com/sunil4587)
- Repository: [As-select3](https://github.com/sunil4587/As-select3)

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation above
2. Review the demo examples
3. Create an issue on GitHub
4. Ensure jQuery is properly loaded

## 🚀 Quick Start

1. Install via npm: `npm install as-select3` 
2. Import the CSS and JS files in your project
3. Initialize on your select elements
4. Customize as needed!

Alternatively, use CDN or download files directly.

Happy coding! 🎉
