const COLOR_DEPTH = 7;

function getBgColor(value) {
    function hex(base7) {
        return Math.round(base7 * (255 / (COLOR_DEPTH - 1)))
            .toString(16)
            .toUpperCase()
            .padStart(2, '0');
    }
    return ['#', hex(value[0]), hex(value[1]), hex(value[2])].join('');
}

function getColor(value) {
    return value[1] < Math.round(COLOR_DEPTH / 2) ? 'white' : 'black';
}

function setColorSliders(rgb) {
    const e = new Event('input', { bubbles: true });
    document.querySelectorAll('#colors > div:first-child input').forEach((colorSlider, i) => {
        colorSlider.value = rgb[i];
        colorSlider.dispatchEvent(e);
    });
}
setColorSliders('000');

const colorSliders = document.querySelectorAll('#colors > div:first-child input');
colorSliders.forEach((colorSlider) => {
    colorSlider.oninput = (e) => {
        e.target.nextElementSibling.innerText = e.target.value;
        const rgb = Array.from(colorSliders, ({ value }) => value * (255 / (COLOR_DEPTH - 1))).join(
            ',',
        );
        colorSlider.parentElement.parentElement.style.background = `rgb(${rgb})`;
        const sliderEvent = new CustomEvent('sliderChange', {
            detail: {
                rgb: [colorSliders[0].value, colorSliders[1].value, colorSliders[2].value].join(''),
            },
        });
        document.getElementById('palette').dispatchEvent(sliderEvent);
    };
});

Handsontable.renderers.registerRenderer('palette', (hotInstance, td, row, column, prop, value) => {
    td.innerText = value ?? '';
    td.style.backgroundColor = '';
    td.style.color = '';
    if (value === null) return;
    td.style.backgroundColor = getBgColor(value);
    td.style.color = getColor(value);
});

const colorList = Array.from({ length: COLOR_DEPTH }, (_, r) =>
    Array.from({ length: COLOR_DEPTH }, (_, g) =>
        Array.from({ length: COLOR_DEPTH }, (_, b) => [r, g, b].join('')),
    ),
);
colorList.forEach((tbl, i) => {
    const div = document.createElement('div');
    div.id = 'tbl' + i;
    document.getElementById('colors').appendChild(div);
    // eslint-disable-next-line no-new
    new Handsontable(div, {
        data: tbl,
        colWidths: 21,
        editor: false,
        fillHandle: false,
        beforePaste: () => false,
        afterOnCellMouseDown(event, coords) {
            const rgb = this.getDataAtCell(coords.row, coords.col);
            this.deselectCell();
            setColorSliders(rgb);
        },
        renderer: 'palette',
        licenseKey: 'non-commercial-and-evaluation',
    });
});

const palette = new Handsontable(document.getElementById('palette'), {
    data: [
        [
            '666',
            '200',
            '613',
            '412',
            '000',
            '653',
            '540',
            '633',
            '666',
            '655',
            '320',
            '013',
            '244',
            '355',
        ],
    ],
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
        const paletteElement = document.getElementById('palette');
        const colorsElement = document.getElementById('colors');
        paletteElement.addEventListener('sliderChange', (e) => {
            const selection = this.getSelected();
            if (selection && selection.length > 0) {
                const [activeRow, activeCol] = selection[0];
                const nerRgbStr = e.detail.rgb;
                if (activeCol !== 0 && this.getDataAtCell(activeRow, activeCol) != nerRgbStr) {
                    this.setDataAtCell(activeRow, activeCol, nerRgbStr);
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
        let rgb = this.getDataAtCell(row, col);
        if (rgb !== null) setColorSliders(rgb);
    },
    renderer: 'palette',
    licenseKey: 'non-commercial-and-evaluation',
});

const hexValidator = (value, callback) => callback(/^[0-9A-F]$/.test(value));
// const octValidator = (value, callback) => callback(/^[0-7]$/.test(value));

Handsontable.renderers.registerRenderer('bmp', (hotInstance, td, row, column, prop, value) => {
    if (value === null || document.querySelector('#bmp select option') === null) return;
    td.innerText = value;
    const paletteId = document.querySelector('#bmp select');
    const paletteTbl = palette.getData();
    const colorIndex = Number.parseInt(value, 16);
    const color = paletteTbl[paletteId.value][colorIndex];
    if (color === null) return;
    td.style.backgroundColor = getBgColor(color);
    td.style.color = getColor(color);
});

const bmp = new Handsontable(document.getElementById('bmp'), {
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
document.getElementById('bmp').appendChild(bmpSelect);

palette.addHook('afterChange', () => bmp.render());

document.querySelector('#bmp select').onchange = () => bmp.render();

document.getElementById('test').onclick = () => {
    const data = bmp.getData();
    data[2][2] = 2;
    // console.log(data);
    bmp.loadData(data);
};

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
    view.querySelector('canvas')?.classList.add('current');
}
initView(4, 2);

function readChr(base64Str) {
    if (/[^A-Za-z0-9+/]/.test(base64Str)) throw new Error('Invalid Base64 character data');

    const TBL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const values = [];
    let buffer = 0;
    let bits = 0;

    for (const chr of base64Str) {
        buffer = (buffer << 6) | TBL.indexOf(chr);
        bits += 6;
        while (bits >= 4) {
            bits -= 4;
            values.push((buffer >> bits) & 0xf);
            buffer &= (1 << bits) - 1;
        }
    }
    return values;
}

function color2rgb(color, paletteId) {
    const paletteTbl = palette.getData();
    const rgb = paletteTbl[paletteId][color];
    return rgb.split('').map((v) => Math.round(v * (255 / (COLOR_DEPTH - 1))));
}

document.getElementById('view').onclick = () => {
    const src = document.querySelector('#source textarea').value.split(/\r\n|\n/);
    // console.log(src);
    src.forEach((line, i) => {
        const bmp = readChr(line);
        // console.log(bmp);
        bmp.forEach((b, j) => {
            imageData[i].data[j * 4 + 0] = color2rgb(b, 0)[0];
            imageData[i].data[j * 4 + 1] = color2rgb(b, 0)[1];
            imageData[i].data[j * 4 + 2] = color2rgb(b, 0)[2];
            imageData[i].data[j * 4 + 3] = 255;
        });
        canvasCtxTmp[i].putImageData(imageData[i], 0, 0);
        // canvasCtx[i].drawImage(canvasCtxTmp[i].canvas, 0, 0, 8, 8, 0, 0, 80, 80);
        canvasCtx[i].drawImage(canvasCtxTmp[i].canvas, 0, 0, 8, 8, 0, 0, 40, 40);
    });
};
