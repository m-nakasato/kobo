import {
    Synthesizer,
    Wave,
    presetWaveStrategy,
    tableWaveStrategy,
    noiseWaveStrategy,
    lfsr,
} from '@m-nakasato/kobo-audio';

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

console.log('Sample Rate:', audioCtx.sampleRate);

const presetWaves = [
    new Wave(audioCtx, presetWaveStrategy, 'sine'),
    new Wave(audioCtx, presetWaveStrategy, 'square'),
    new Wave(audioCtx, presetWaveStrategy, 'sawtooth'),
    new Wave(audioCtx, presetWaveStrategy, 'triangle'),
];

const tableWaves = [
    new Wave(audioCtx, tableWaveStrategy, 'F0'),
    new Wave(audioCtx, tableWaveStrategy, 'F000'),
    new Wave(audioCtx, tableWaveStrategy, 'F0000000'),
    new Wave(audioCtx, tableWaveStrategy, '0123456789ABCDEFFEDCBA9876543210'),
];

// let periods = [
//     ...new Set(
//         [...Array(15)].flatMap((_, i) => Math.round(audioCtx.sampleRate / 441 / 1.5 ** i)),
//     ),
// ].filter(Boolean);
const FC_PERIODS = [4068, 2034, 1016, 762, 508, 380, 254, 202, 160, 128, 96, 64, 32, 16, 8, 4];
let periods = [
    ...new Set(FC_PERIODS.map(fcp => Math.round((audioCtx.sampleRate / 1789772.5) * fcp))),
].filter(Boolean);
console.log(periods);
const noiseWaves = [
    new Wave(audioCtx, noiseWaveStrategy),
    new Wave(audioCtx, noiseWaveStrategy, periods),
    new Wave(audioCtx, noiseWaveStrategy, periods, lfsr()),
    new Wave(audioCtx, noiseWaveStrategy, periods, lfsr(6)),
];

const synthesizers = [
    new Synthesizer(audioCtx, presetWaves),
    new Synthesizer(audioCtx, tableWaves),
    new Synthesizer(audioCtx, noiseWaves),
];

document.querySelector('#play').onclick = () => {
    const noteNumber = parseInt(
        document.querySelector('#demo input[name=pitch]:checked').value,
        10,
    );
    const wave = document.querySelector('#demo input[name=wave]:checked').value;
    let mode;
    if (wave === '0') {
        mode = document.querySelector('#demo select[name=presetMode]').value;
    } else if (wave === '1') {
        mode = document.querySelector('#demo select[name=tableMode]').value;
    } else if (wave === '2') {
        mode = document.querySelector('#demo select[name=noiseMode]').value;
    }
    const startTime = document.querySelector('#demo input[name=startTime]').value;
    const duration = document.querySelector('#demo input[name=duration]').valueAsNumber;
    const volume = document.querySelector('#demo input[name=volume]').valueAsNumber;
    const detune = document.querySelector('#demo input[name=detune]').value;
    const sweep = document.querySelector('#demo input[name=sweep]').valueAsNumber;
    const envAttack = document.querySelector('#demo input[name=envAttack]').valueAsNumber;
    const envDecay = document.querySelector('#demo input[name=envDecay]').valueAsNumber;
    const envSustain = document.querySelector('#demo input[name=envSustain]').valueAsNumber;
    const envRelease = document.querySelector('#demo input[name=envRelease]').valueAsNumber;
    const envelope = [envAttack, envDecay, envSustain, envRelease];
    const vibratoDepth = document.querySelector('#demo input[name=vibDepth]').valueAsNumber;
    const vibratoRate = document.querySelector('#demo input[name=vibRate]').valueAsNumber;
    const vibratoWave = document.querySelector(
        '#demo select[name=vibWave] option:checked',
    ).innerText;
    const tremoloDepth = document.querySelector('#demo input[name=trmDepth]').valueAsNumber;
    const tremoloRate = document.querySelector('#demo input[name=trmRate]').valueAsNumber;
    const tremoloWave = document.querySelector(
        '#demo select[name=trmWave] option:checked',
    ).innerText;
    const options = {};
    if (startTime !== '') options.sta = parseFloat(startTime);
    if (mode !== '') options.mod = parseInt(mode, 10);
    options.dur = duration;
    options.vol = volume;
    if (detune !== '') options.det = parseFloat(detune);
    if (sweep !== 0) {
        options.swp = sweep;
    }
    if (envAttack != 0.01 || envDecay != 0.01 || envSustain != 0.5 || envRelease != 0.01) {
        options.env = envelope;
    }
    if (wave != 2 && vibratoDepth > 0 && vibratoRate > 0) {
        options.vib = [vibratoDepth, vibratoRate, vibratoWave];
    }
    if (tremoloDepth > 0 && tremoloRate > 0) {
        options.trm = [tremoloDepth, tremoloRate, tremoloWave];
    }
    console.log(options);
    synthesizers[wave].play(noteNumber, options);
};

document.getElementById('resume').onclick = async () => {
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
        console.log('AudioContext resumed');
    }
};
