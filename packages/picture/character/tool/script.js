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
    // data: [['333']],
    colHeaders: Array(8)
        .fill(undefined)
        .map((_, i) => i.toString(16).toUpperCase()),
    rowHeaders: Array(8)
        .fill(undefined)
        .map((_, i) => 'p' + i),
    minCols: 8,
    maxCols: 8,
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

// const hexValidator = (value, callback) => callback(/^[0-9A-F]$/.test(value));
const octValidator = (value, callback) => callback(/^[0-7]$/.test(value));

Handsontable.renderers.registerRenderer('bmp', (hotInstance, td, row, column, prop, value) => {
    if (value === null || document.querySelector('#bmp select option') === null) return;
    td.innerText = value;
    const paletteId = document.querySelector('#bmp select');
    const paletteTbl = palette.getData();
    const color = paletteTbl[paletteId.value][value];
    console.log(color);
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
    columns: Array(8).fill({ validator: octValidator, allowInvalid: false }),
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
    console.log(data);
    bmp.loadData(data);
};

document.getElementById('view01').classList.add('current');

const ctx01 = document.getElementById('view01').getContext('2d');
ctx01.imageSmoothingEnabled = false;
const imageData01 = ctx01.createImageData(8, 8);
const tempView01 = document.createElement('canvas');
const tempCtx01 = tempView01.getContext('2d');

let bmp01 = Array(64)
    .fill(undefined)
    .map((r, i) => [255 - i * 3, 0, 0]);

document.getElementById('view').onclick = () => {
    bmp01.forEach((b, i) => {
        imageData01.data[i * 4 + 0] = b[0];
        imageData01.data[i * 4 + 1] = b[1];
        imageData01.data[i * 4 + 2] = b[2];
        imageData01.data[i * 4 + 3] = 255;
    });
    tempCtx01.putImageData(imageData01, 0, 0);
    ctx01.drawImage(tempView01, 0, 0, 8, 8, 0, 0, 80, 80);

    const ctx02 = document.getElementById('view02').getContext('2d');
    ctx02.fillStyle = 'green';
    ctx02.fillRect(0, 0, 80, 80);
    const ctx03 = document.getElementById('view03').getContext('2d');
    ctx03.fillStyle = 'blue';
    ctx03.fillRect(0, 0, 80, 80);
};
document.querySelectorAll('#viewer canvas').forEach((canvas) => {
    canvas.onclick = (e) => {
        document
            .querySelectorAll('#viewer canvas')
            .forEach((canvas) => canvas.classList.remove('current'));
        e.target.classList.add('current');
    };
});
