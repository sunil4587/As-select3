# As-Select3 - Modern JavaScript Select Library

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/sunil4587/As-select3)
[![NPM](https://img.shields.io/npm/v/as-select3.svg)](https://www.npmjs.com/package/as-select3)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![jQuery](https://img.shields.io/badge/jquery-3.0+-yellow.svg)](https://jquery.com)

A lightweight, modern JavaScript library for creating beautiful and interactive select dropdowns. Built with jQuery, it provides advanced features like search, multi-selection, remote data loading, custom themes, and HTML rendering support.

## ✨ Features

- 🔍 **Searchable** - Built-in search functionality with real-time filtering
- 🏷️ **Multi-select** - Select multiple options with elegant tag interface
- 🌐 **Remote Data** - Load data from APIs with async/await support
- 🎨 **Customizable** - Custom themes and comprehensive styling options
- 📱 **Responsive** - Mobile-friendly design with touch support
- ♿ **Accessible** - Full ARIA compliance and keyboard navigation
- 🚀 **Lightweight** - Minimal footprint with optimized performance
- 🎭 **HTML Rendering** - Rich HTML content in options and selections
- 🔧 **Template Support** - Custom templates for advanced formatting
- 🎯 **Events** - Comprehensive event system for custom integrations

## 🎯 Live Demo

Visit the [demo page](https://sunil4587.github.io/As-select3/) to see As-Select3 in action with interactive examples.

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

[Download As-Select3 v1.1.0](https://sunil4587.github.io/As-select3/as-select3.zip) - Complete package with library files and documentation.

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
| `placeholder` | string | Auto-generated | Custom placeholder text |
| `searchable` | boolean | `true` | Enable/disable search functionality |
| `selectAll` | boolean | `true` (multiple only) | Show "Select All" button |
| `clearAll` | boolean | `true` | Show "Clear All" button |
| `maxSelection` | number | `null` | Maximum number of selections |
| `remote` | function | `null` | Remote data loading function |
| `searchDelay` | number | `300` | Search input delay in ms |
| `noResultsText` | string | 'No results found' | Text when no results match |
| `loadingText` | string | 'Loading...' | Text during remote loading |
| `searchPlaceholder` | string | 'Search options...' | Search input placeholder |
| `selectAllText` | string | 'Select All' | Select All button text |
| `clearAllText` | string | 'Clear All' | Clear All button text |
| `defaultIconClass` | string | 'bi bi-chevron-down' | Default arrow icon class |
| `iconPrefix` | string | `null` | Icon prefix for custom icons |
| `allowHtml` | boolean | `true` | Enable HTML content in options |
| `escapeMarkup` | function | identity | HTML sanitization function |
| `templateResult` | function | `null` | Custom option rendering template |
| `templateSelection` | function | `null` | Custom selection rendering template |
| `matcher` | function | `null` | Custom search matching function |

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

## 🎭 HTML Rendering & Templating

### Basic HTML Content

Add rich HTML content to options using the `html` property or `data-html` attribute:

```html
<select id="rich-select">
    <option value="user1" data-html="<strong>John Doe</strong><br><small>Administrator</small>">John Doe</option>
    <option value="user2" data-html="<strong>Jane Smith</strong><br><small>Editor</small>">Jane Smith</option>
</select>

<script>
$('#rich-select').asSelect3({
    allowHtml: true,
    placeholder: 'Select a user...'
});
</script>
```

### Custom Templates

Use `templateResult` and `templateSelection` for advanced customization:

```javascript
$('#custom-select').asSelect3({
    templateResult: function(data) {
        if (!data.id) return data.text;
        
        return `<div class="d-flex align-items-center">
                  <img src="/avatars/${data.id}.jpg" width="32" height="32" class="rounded-circle me-2">
                  <div>
                    <div class="fw-semibold">${data.text}</div>
                    <small class="text-muted">ID: ${data.id}</small>
                  </div>
                </div>`;
    },
    templateSelection: function(data) {
        if (!data.id) return data.text;
        
        return `<div class="d-flex align-items-center">
                  <img src="/avatars/${data.id}.jpg" width="20" height="20" class="rounded-circle me-1">
                  <span>${data.text}</span>
                </div>`;
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

Available events: `asSelect3:change`, `asSelect3:open`, `asSelect3:close`, `asSelect3:maxselection`, `asSelect3:selectall`, `asSelect3:clearall`, `asSelect3:optionadded`, `asSelect3:optionremoved`, `asSelect3:optionscleared`, `asSelect3:valuechanged`

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

### Instance Methods

Access methods through the instance:

```javascript
// Get the instance
const instance = $('#my-select')[0]._asSelect3;

// Get current value(s)
const value = instance.getValue();

// Set value(s)
instance.setValue(['option1', 'option2']);

// Open/close dropdown
instance.open();
instance.close();

// Reset to original state
instance.reset();

// Enable/disable
instance.enable();
instance.disable();

// Add/remove options
instance.addOption({ value: 'new', text: 'New Option' });
instance.removeOption('option1');

// Clear all options
instance.clearOptions();

// Refresh options
instance.refreshOptions();

// Destroy instance
instance.destroy();
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
$('#multi-select').asSelect3({
    placeholder: 'Select programming languages',
    searchable: true,
    searchPlaceholder: 'Search languages...',
    selectAll: true,
    clearAll: true
});
```

### Limited Selection
```javascript
$('#skills-select').asSelect3({
    placeholder: 'Select up to 3 skills',
    maxSelection: 3,
    searchable: true
});
```

### Profile Images with HTML
```javascript
$('#team-select').asSelect3({
    placeholder: 'Select team members',
    allowHtml: true,
    templateResult: function(data) {
        return `<div class="d-flex align-items-center">
                  <img src="${data.icon}" width="32" height="32" class="rounded-circle me-2">
                  <span>${data.text}</span>
                </div>`;
    }
});
```

### Remote Data with Custom Formatting
```javascript
$('#users-select').asSelect3({
    placeholder: 'Search users...',
    searchable: true,
    remote: async function(query) {
        const response = await fetch(`/api/users?q=${query}`);
        const users = await response.json();
        
        return users.map(user => ({
            value: user.id,
            text: user.name,
            icon: user.avatar,
            html: `<div class="d-flex align-items-center">
                     <img src="${user.avatar}" width="40" height="40" class="rounded-circle me-2">
                     <div>
                       <div class="fw-semibold">${user.name}</div>
                       <small class="text-muted">${user.role}</small>
                     </div>
                   </div>`
        }));
    }
});
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

- [x] NPM package publication
- [x] CDN distribution
- [ ] TypeScript definitions
- [ ] React/Vue wrapper components
- [ ] Additional themes and customization options
- [ ] Enhanced jQuery plugin methods

---

⭐ **If you like this project, please give it a star on GitHub!**
