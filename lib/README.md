# As-Select3 - Modern JavaScript Select Library

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/sunil4587/As-select3)
[![NPM](https://img.shields.io/npm/v/as-select3.svg)](https://www.npmjs.com/package/as-select3)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![jQuery](https://img.shields.io/badge/jquery-3.0+-yellow.svg)](https://jquery.com)

**Author:** Sunil Kumar  
**License:** MIT  
**Repository:** https://github.com/sunil4587/As-select3

## 📖 Description

As-Select3 is a lightweight, modern JavaScript library for creating beautiful and interactive select dropdowns. Built with jQuery, it provides advanced features like search, multi-selection, remote data loading, custom themes, and **HTML rendering support** for rich option content.

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

### HTML with Icons and Images

```javascript
$('#media-select').asSelect3({
    allowHtml: true,
    remote: async function(query) {
        const results = await fetchMediaFiles(query);
        return results.map(file => ({
            value: file.id,
            text: file.name,
            html: `<div class="d-flex align-items-center">
                     <img src="${file.thumbnail}" width="40" height="40" class="me-2">
                     <div>
                       <div class="fw-semibold">${file.name}</div>
                       <small class="text-muted">${file.size} • ${file.type}</small>
                     </div>
                   </div>`
        }));
    }
});
```

### Security: HTML Escaping

Control HTML safety with the `escapeMarkup` function:

```javascript
$('#secure-select').asSelect3({
    allowHtml: true,
    escapeMarkup: function(markup) {
        // Custom sanitization
        return DOMPurify.sanitize(markup);
    }
});
```

### Complex Data Structure

```javascript
const complexData = [
    {
        value: 'task1',
        text: 'Update Documentation',
        html: `<div class="task-item">
                 <div class="d-flex justify-content-between">
                   <span class="fw-semibold">Update Documentation</span>
                   <span class="badge bg-warning">Medium</span>
                 </div>
                 <div class="small text-muted mt-1">
                   <i class="bi bi-person"></i> Assigned to: John Doe
                   <i class="bi bi-calendar ms-2"></i> Due: Dec 15, 2024
                 </div>
               </div>`
    }
];

$('#task-select').asSelect3({
    data: complexData,
    allowHtml: true,
    placeholder: 'Select a task...'
});
```

### Custom Matcher for HTML Content

```javascript
$('#searchable-html').asSelect3({
    allowHtml: true,
    matcher: function(query, data) {
        // Search in both text and HTML content
        const searchText = (data.text || '').toLowerCase();
        const searchHtml = (data.html || '').toLowerCase();
        const searchQuery = query.toLowerCase();
        
        return searchText.includes(searchQuery) || 
               searchHtml.includes(searchQuery);
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

## 📋 Requirements

- **jQuery 3.0+** - Required dependency
- **Modern browsers** - Chrome 60+, Firefox 55+, Safari 12+, Edge 79+

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
