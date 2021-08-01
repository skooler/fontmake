#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const svg2ttf = require('svg2ttf');
const SVGIcons2SVGFontStream = require('svgicons2svgfont');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const fontName = process.argv[2];

const fontStream = new SVGIcons2SVGFontStream({
  fontName
});

let css = `@font-face {
  font-family: '${fontName}';
  font-style: normal;
  font-weight: normal;
  src: url('${fontName}.ttf');
}

[class^="icon-"], [class*=" icon-"] {
  font-family: '${fontName}' !important;
  font-style: normal;
  font-variant: normal;
  font-weight: normal;
  line-height: 1;
  text-transform: none;
  speak: none;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
}
`;

function canonicalize(name) {
  return name.replace(/[^A-Za-z0-9]+/, '-').toLowerCase();
}

fontStream.pipe(fs.createWriteStream(`${fontName}.svg`))
  .on('finish', async () => {
    const svg = await readFile(`${fontName}.svg`, 'utf8');
    await writeFile(`${fontName}.ttf`, svg2ttf(svg, {}).buffer);
    await writeFile(`${fontName}.css`, css);
    console.log('TTF created');
  })
  .on('error', (err) => console.log(err));

process.argv.slice(3).forEach((filename) => {
  const m = path.basename(filename).match(/^[Uu]([0-9A-Fa-f]+?)-(.+?)\.svg$/);
  if (m) {
    const glyph = fs.createReadStream(filename);
    glyph.metadata = {
      unicode: [
        String.fromCharCode(parseInt(m[1], 16))
      ],
      name: m[2]
    };
    fontStream.write(glyph);
    css += `
.icon-${canonicalize(m[2])}:before {
  content: "\\${m[1]}";
}
`;
  }
});

fontStream.end();
