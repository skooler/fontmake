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

fontStream.pipe(fs.createWriteStream(`${fontName}.svg`))
  .on('finish', async () => {
    const svg = await readFile(`${fontName}.svg`, 'utf8');
    await writeFile(`${fontName}.ttf`, new Buffer(svg2ttf(svg, {}).buffer));
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
  }
});

fontStream.end();
