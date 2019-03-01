# fontmake

Make TTF font from SVG files.

## Installation

```bash
$ npm install --global fontmake
```

## Usage

Save the filename of SVG file as `{Unicode code point}-{Glyph name}.svg`.

Then execute the following command:

```bash
$ fontmake fontname /path/to/*.svg
```

It is output to `<fontname>.ttf`.

## License

[MIT](LICENSE)
