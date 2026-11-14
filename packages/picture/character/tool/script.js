const COLOR_DEPTH = 16;

function hsv2Rgb(h, s, v) {
    // console.log(h, s, v);
    const hue = h / COLOR_DEPTH + 0.02;
    const saturation = s / (COLOR_DEPTH - 1);
    const value = v / (COLOR_DEPTH - 1);

    let r, g, b;
    const i = Math.floor(hue * 6);
    const f = hue * 6 - i;
    const p = value * (1 - saturation);
    const q = value * (1 - f * saturation);
    const t = value * (1 - (1 - f) * saturation);

    if (i % 6 === 0) {
        r = value;
        g = t;
        b = p;
    } else if (i % 6 === 1) {
        r = q;
        g = value;
        b = p;
    } else if (i % 6 === 2) {
        r = p;
        g = value;
        b = t;
    } else if (i % 6 === 3) {
        r = p;
        g = q;
        b = value;
    } else if (i % 6 === 4) {
        r = t;
        g = p;
        b = value;
    } else {
        r = value;
        g = p;
        b = q;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function dec2hex(dec) {
    return dec.toString(16).toUpperCase().padStart(2, '0');
}

function getBgColor(value) {
    const rgb = hsv2Rgb(parseInt(value[0], 16), parseInt(value[1], 16), parseInt(value[2], 16));
    return '#' + dec2hex(rgb[0]) + dec2hex(rgb[1]) + dec2hex(rgb[2]);
}

function getColor(value) {
    return value[1] < Math.round(COLOR_DEPTH / 2) ? 'white' : 'black';
}

function setColorSliders(hsv) {
    const e = new Event('input', { bubbles: true });
    document.querySelectorAll('#colors > div:first-child input').forEach((colorSlider, i) => {
        colorSlider.value = parseInt(hsv[i], 16);
        colorSlider.dispatchEvent(e);
    });
    document
        .querySelector('#source .chr textarea')
        .dispatchEvent(new Event('input', { bubbles: true }));
}
// setColorSliders('000');

const colorSliders = document.querySelectorAll('#colors > div:first-child input');
colorSliders.forEach((colorSlider) => {
    colorSlider.oninput = (e) => {
        e.target.nextElementSibling.innerText = Number(e.target.value).toString(16).toUpperCase();
        const hsv = Array.from(colorSliders, ({ value }) => value);
        colorSlider.parentElement.parentElement.style.background =
            'rgb(' + hsv2Rgb(...hsv).join(',') + ')';
        const sliderEvent = new CustomEvent('sliderChange', {
            detail: {
                hsv: [
                    Number(colorSliders[0].value).toString(16).toUpperCase(),
                    Number(colorSliders[1].value).toString(16).toUpperCase(),
                    Number(colorSliders[2].value).toString(16).toUpperCase(),
                ].join(''),
            },
        });
        document.querySelector('#editor .palette').dispatchEvent(sliderEvent);
    };
});

const subRenderer = (td, value) => {
    if (value === null) {
        td.style.backgroundColor = '';
    } else {
        td.style.backgroundColor = getBgColor(value);
    }
};

Handsontable.renderers.registerRenderer('colors', (hotInstance, td, row, column, prop, value) => {
    subRenderer(td, value);
});

const colorList = Array.from({ length: COLOR_DEPTH }, (_, h) =>
    Array.from({ length: COLOR_DEPTH }, (_, s) =>
        Array.from({ length: COLOR_DEPTH }, (_, v) =>
            [h.toString(16), s.toString(16), v.toString(16)].join(''),
        ),
    ),
);
colorList.forEach((tbl, i) => {
    const div = document.createElement('div');
    div.id = 'tbl' + i;
    document.querySelector('#colors > div:last-child').appendChild(div);
    // eslint-disable-next-line no-new
    new Handsontable(div, {
        data: tbl,
        colWidths: 6,
        editor: false,
        fillHandle: false,
        beforePaste: () => false,
        afterOnCellMouseDown(event, coords) {
            const hsv = this.getDataAtCell(coords.row, coords.col);
            this.deselectCell();
            setColorSliders(hsv);
        },
        renderer: 'colors',
        licenseKey: 'non-commercial-and-evaluation',
    });
});

Handsontable.renderers.registerRenderer('palette', (hotInstance, td, row, column, prop, value) => {
    td.innerText = value ?? '';
    subRenderer(td, value);
});

const palette = new Handsontable(document.querySelector('#editor .palette'), {
    colHeaders: Array(16)
        .fill(undefined)
        .map((_, i) => i.toString(16).toUpperCase()),
    rowHeaders: Array(8)
        .fill(undefined)
        .map((_, i) => 'p' + i),
    minCols: 16,
    maxCols: 16,
    minRows: 8,
    maxRows: 8,
    outsideClickDeselects: false,
    selectionMode: 'single',
    cells(row, col) {
        if (col === 0) return { readOnly: true };
    },
    editor: false,
    fillHandle: false,
    afterInit() {
        const paletteElement = document.querySelector('#editor .palette');
        const colorsElement = document.getElementById('colors');
        paletteElement.addEventListener('sliderChange', (e) => {
            const selection = this.getSelected();
            if (selection && selection.length > 0) {
                const [activeRow, activeCol] = selection[0];
                const hsvStr = e.detail.hsv;
                if (activeCol !== 0 && this.getDataAtCell(activeRow, activeCol) != hsvStr) {
                    this.setDataAtCell(activeRow, activeCol, hsvStr);
                    const source = this.getData()
                        .map((row) => row.join(''))
                        .join('\n');
                    document.querySelector('#source .palette textarea').value = source;
                }
            }
        });
        document.addEventListener('mousedown', (event) => {
            const target = event.target;
            if (!paletteElement.contains(target) && !colorsElement.contains(target)) {
                this.deselectCell();
            }
        });
    },
    beforeSetRangeStart(coords) {
        if (coords.col === 0) {
            this.deselectCell();
            return false;
        }
    },
    beforeSetRangeEnd(coords) {
        if (coords.col === 0) {
            this.deselectCell();
            return false;
        }
    },
    afterSelectionEnd(row, col) {
        let hsv = this.getDataAtCell(row, col);
        if (hsv !== null) setColorSliders(hsv);
    },
    renderer: 'palette',
    licenseKey: 'non-commercial-and-evaluation',
});

const hexValidator = (value, callback) => callback(/^[0-9A-F]$/.test(value));
// const octValidator = (value, callback) => callback(/^[0-7]$/.test(value));

Handsontable.renderers.registerRenderer('bmp', (hotInstance, td, row, column, prop, value) => {
    if (value === null || document.querySelector('#editor .bmp select option') === null) return;
    td.innerText = value;
    const paletteId = document.querySelector('#editor .bmp select');
    const paletteTbl = palette.getData();
    const colorIndex = Number.parseInt(value, 16);
    const color = paletteTbl[paletteId.value][colorIndex];
    if (color === null) return;
    td.style.backgroundColor = getBgColor(color);
    td.style.color = getColor(color);
});

const bmp = new Handsontable(document.querySelector('#editor .bmp'), {
    data: Array(8)
        .fill(undefined)
        .map(() => ['0', '0', '0', '0', '0', '0', '0', '0']),
    colWidths: 30,
    minRowHeights: 30,
    columns: Array(8).fill({ validator: hexValidator, allowInvalid: false }),
    autoWrapRow: true,
    autoWrapCol: true,
    beforeChange: (changes) => {
        changes.forEach(
            (change) => (change[3] = change[3].replace(/[a-f]/g, (match) => match.toUpperCase())),
        );
    },
    afterChange(changes) {
        if (changes) {
            const data = this.getData().flat();
            // document.querySelector('#source .chr textarea').value = writeChr(data);
        }
    },
    // outsideClickDeselects: false,
    renderer: 'bmp',
    licenseKey: 'non-commercial-and-evaluation',
});
const bmpSelect = document.createElement('select');
Array.from({ length: 8 }, (_, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.innerText = 'p' + i;
    bmpSelect.appendChild(option);
});
document.querySelector('#editor .bmp').appendChild(bmpSelect);

palette.addHook('afterChange', () => bmp.render());

document.querySelector('#editor .bmp select').onchange = () => bmp.render();

document.getElementById('test').onclick = () => {
    const data = bmp.getData();
    data[2][2] = 2;
    // console.log(data);
    bmp.loadData(data);
};

function readChr(base64Str) {
    if (/[^A-Za-z0-9+/]/.test(base64Str)) throw new Error('Invalid Base64 character data');

    const bytes = Uint8Array.fromBase64(base64Str, {
        lastChunkHandling: 'loose',
    });
    const values = [];

    for (const byte of bytes) {
        values.push(byte >> 4, byte & 0x0f);
    }
    return values;
}

function writeChr(bmp) {
    const pixels = bmp.join('');
    if (!/^[0-9A-F]{64}$/.test(pixels)) {
        throw new Error('Expected 64 hexadecimal pixel values');
    }

    const bytes = new Uint8Array(32);
    for (let i = 0; i < bytes.length; i++) {
        const p = i * 2;
        bytes[i] = Number.parseInt(pixels.slice(p, p + 2), 16);
    }

    return bytes.toBase64({ omitPadding: true });
}

const canvasCtx = [];
const canvasCtxTmp = [];
const imageData = [];

function initView(rows, cols) {
    const view = document.getElementById('viewer');
    view.replaceChildren();
    canvasCtx.length = 0;
    canvasCtxTmp.length = 0;
    imageData.length = 0;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const canvas = document.createElement('canvas');
            canvas.id = 'view' + i + j;
            // canvas.width = 80;
            // canvas.height = 80;
            canvas.width = 40;
            canvas.height = 40;
            canvas.onclick = (e) => {
                view.querySelectorAll('canvas').forEach((canvas) =>
                    canvas.classList.remove('current'),
                );
                e.currentTarget.classList.add('current');
                // console.log(i * cols + (j % cols)); // TODO: BMPにロード
                const src = document.querySelector('#source .chr textarea').value.split(/\r\n|\n/);
                // console.log(src[i * cols + (j % cols)]);
                const pixels = readChr(src[i * cols + (j % cols)]);
                // console.log(pixels);
                const data = Array.from({ length: 8 }, (_, row) =>
                    pixels
                        .slice(row * 8, (row + 1) * 8)
                        .map((value) => value.toString(16).toUpperCase()),
                );
                // console.log(data);
                bmp.loadData(data);
            };
            view.appendChild(canvas);
            canvasCtx.push(canvas.getContext('2d'));
            canvasCtx[canvasCtx.length - 1].imageSmoothingEnabled = false;
            imageData.push(canvasCtx[canvasCtx.length - 1].createImageData(8, 8));

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 8;
            tempCanvas.height = 8;
            canvasCtxTmp.push(tempCanvas.getContext('2d'));
        }
    }
    view.querySelector('canvas')?.dispatchEvent(
        new Event('click', { bubbles: true, cancelable: true }),
    );
}

function color2hsv(color, paletteId) {
    const paletteTbl = palette.getData();
    // console.log(paletteTbl);
    return paletteTbl[paletteId][color].split('');
}

document.querySelector('#source .palette textarea').oninput = (e) => {
    const paletteTbl = e.target.value.split(/\r\n|\n/).map((line) => {
        const cells = line.match(/.{3}/g);
        if (cells !== null) {
            cells.unshift(null);
            return cells;
        }
    });
    // console.log(paletteTbl);
    palette.loadData(paletteTbl);
};
document
    .querySelector('#source .palette textarea')
    .dispatchEvent(new Event('input', { bubbles: true }));

document.querySelector('#source .chr textarea').oninput = (e) => {
    initView(4, 2); // TODO: BMPの行数と列数を取得して反映する
    const src = e.target.value.split(/\r\n|\n/);
    // console.log(src);
    src.forEach((line, i) => {
        const bmp = readChr(line);
        // console.log(bmp);
        bmp.forEach((b, j) => {
            if (b === 0) return;
            const hsv = color2hsv(b, 0);
            // console.log(hsv);
            const rgb = hsv2Rgb(parseInt(hsv[0], 16), parseInt(hsv[1], 16), parseInt(hsv[2], 16));
            // console.log(rgb);
            imageData[i].data[j * 4 + 0] = rgb[0];
            imageData[i].data[j * 4 + 1] = rgb[1];
            imageData[i].data[j * 4 + 2] = rgb[2];
            imageData[i].data[j * 4 + 3] = 255;
        });
        canvasCtxTmp[i].putImageData(imageData[i], 0, 0);
        // canvasCtx[i].drawImage(canvasCtxTmp[i].canvas, 0, 0, 8, 8, 0, 0, 80, 80);
        canvasCtx[i].drawImage(canvasCtxTmp[i].canvas, 0, 0, 8, 8, 0, 0, 40, 40);
    });
};
document
    .querySelector('#source .chr textarea')
    .dispatchEvent(new Event('input', { bubbles: true }));
