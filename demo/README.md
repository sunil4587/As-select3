# As-select3

A lightweight, customizable select dropdown library built with jQuery.

## Installation

### NPM
```bash
npm install as-select3
```

### CDN
```html
<!-- CSS -->
<link href="https://cdn.jsdelivr.net/npm/as-select3/dist/as-select3.min.css" rel="stylesheet">

<!-- JS -->
<script src="https://cdn.jsdelivr.net/npm/as-select3/dist/as-select3.min.js"></script>
```

### Direct Download
Include the CSS and JS files from the `dist` folder in your project:

```html
<link href="dist/as-select3.min.css" rel="stylesheet">
<script src="dist/as-select3.min.js"></script>
```

You can also [download the complete package](https://sunil4587.github.io/As-select3/as-select3.zip).

## Dependencies

- jQuery 3.0+
- Bootstrap 5.2+ (for styling, optional but recommended)
- Bootstrap Icons (for icons, optional but recommended)

## Basic Usage

```html
<select class="my-select">
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
</select>

<script>
    $(document).ready(function() {
        $('.my-select').asSelect3();
    });
</script>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| multiple | boolean | false | Enable multiple selection |
| placeholder | boolean | false | Enable placeholder |
| search | boolean | false | Enable search functionality |
| maxHeight | number | 250 | Maximum height of dropdown in pixels |
| minWidth | number | 280 | Minimum width of dropdown in pixels |

## Methods

| Method | Description |
|--------|-------------|
| val() | Get or set the current value |
| open() | Open the dropdown |
| close() | Close the dropdown |
| destroy() | Remove the dropdown and restore original select |

## Events

| Event | Description |
|-------|-------------|
| change | Triggered when the selection changes |
| open | Triggered when the dropdown opens |
| close | Triggered when the dropdown closes |

## License

MIT
