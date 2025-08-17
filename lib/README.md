# As-Select3 - Modern JavaScript Select Library

**Version:** 1.0.0  
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

### Include Files
```html
<!-- CSS -->
<link rel="stylesheet" href="select3.min.css">

<!-- JavaScript (requires jQuery) -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.0/dist/jquery.min.js"></script>
<script src="select3.min.js"></script>
```

### Basic Usage
```html
<select id="my-select" multiple>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
</select>

<script>
$('#my-select').select3({
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
$('#remote-select').select3({
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
.select3-container.my-theme .select3-selection {
    border-color: #007bff;
    background: linear-gradient(to right, rgba(0, 123, 255, 0.1), rgba(0, 123, 255, 0.2));
}

.select3-container.my-theme .select3-tag {
    background-color: #007bff;
    color: white;
}
```

```javascript
$('#themed-select').select3({
    theme: 'my-theme'
});
```

## 🔧 Events

```javascript
$('#my-select').on('select3:change', function(e) {
    console.log('Selection changed:', e.detail.value);
});

$('#my-select').on('select3:maxselection', function(e) {
    alert('Maximum selection reached!');
});
```

## 📋 Requirements

- **jQuery 3.0+** - Required dependency
- **Modern browsers** - Chrome, Firefox, Safari, Edge

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

1. Download and extract the Select3 package
2. Include the CSS and JS files in your HTML
3. Initialize on your select elements
4. Customize as needed!

Happy coding! 🎉
