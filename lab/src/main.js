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

document.getElementById('playPreset').onclick = () => {
    const waves = [
        new Wave(audioCtx, presetWaveStrategy, 'sine'),
        new Wave(audioCtx, presetWaveStrategy, 'square'),
        new Wave(audioCtx, presetWaveStrategy, 'sawtooth'),
        new Wave(audioCtx, presetWaveStrategy, 'triangle'),
    ];

    const synthesizer = new Synthesizer(audioCtx, waves);
    // synthesizer.play(null);
    // synthesizer.play(69, { 'dur': 0.25, 'mode': 2, 'swp': 300 });
    synthesizer.play(60, { dur: 0.5, mode: 2, vib: [20, 5, 'sawtooth'] });
    // synthesizer.play('A4', { dur: 1, mode: 2, trm: [0.15, 5, 'sine'] });
    // synthesizer.play('A4', { dur: 1, mode: 2 });
};

document.getElementById('playTable').onclick = () => {
    const waves = [
        new Wave(audioCtx, tableWaveStrategy, 'F0'),
        new Wave(audioCtx, tableWaveStrategy, 'F000'),
        new Wave(audioCtx, tableWaveStrategy, 'F0000000'),
        new Wave(audioCtx, tableWaveStrategy, '0123456789ABCDEFFEDCBA9876543210'),
    ];

    const synthesizer = new Synthesizer(audioCtx, waves);
    // synthesizer.play(null);
    synthesizer.play(69, { 'dur': 0.25, 'mode': 0, 'swp': 300 });
    // synthesizer.play('A4', { dur: 1, mode: 2, vib: [20, 5, 'sawtooth'] });
    // synthesizer.play('A4', { dur: 1, mode: 2, trm: [0.15, 5, 'sine'] });
    // synthesizer.play('A4', { dur: 1, mode: 2 });
};

document.getElementById('playNoise').onclick = () => {
    // const waves = [new Wave(audioCtx, noiseWaveStrategy)];

    // let periods = [
    //     ...new Set(
    //         [...Array(15)].flatMap((_, i) => Math.round(audioCtx.sampleRate / 441 / 1.5 ** i)),
    //     ),
    // ].filter(Boolean);
    // // console.log(JSON.stringify(periods));
    // const waves = [new Wave(audioCtx, noiseWaveStrategy, periods, Math.random)];

    let FC_PERIODS = [4068, 2034, 1016, 762, 508, 380, 254, 202, 160, 128, 96, 64, 32, 16, 8, 4];
    let periods = [
        ...new Set(FC_PERIODS.map(fcp => Math.round((audioCtx.sampleRate / 1789772.5) * fcp))),
    ].filter(Boolean);
    console.log(periods);
    const waves = [
        new Wave(audioCtx, noiseWaveStrategy, periods, lfsr()),
        new Wave(audioCtx, noiseWaveStrategy, periods, lfsr(6)),
    ];

    const synthesizer = new Synthesizer(audioCtx, waves);
    // synthesizer.play(null);
    // synthesizer.play('C4', { 'dur': 0.25, 'mode': 0, 'swp': 300 });
    // synthesizer.play('A4', { dur: 1, mode: 2, vib: [20, 5, 'sawtooth'] });
    // synthesizer.play('A4', { dur: 1, mode: 2, trm: [0.15, 5, 'sine'] });
    // synthesizer.play('A4', { dur: 1, mode: 2 });
    synthesizer.play(0, { dur: 0.5, mode: 0, trm: [0.15, 5, 'square'] });
    // synthesizer.play(0, { dur: 0.5, mode: 0, trm: [0.15] });
    // synthesizer.play(0, { dur: 0.5, mode: 0 });
};

document.querySelectorAll('#keyboard input').forEach(button => {
    button.onclick = () => {
        const waves = [new Wave(audioCtx, presetWaveStrategy, 'sawtooth')];

        const noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
        const noteName = button.value.toLowerCase();
        const index = noteNames.indexOf(noteName);

        const synthesizer = new Synthesizer(audioCtx, waves);
        synthesizer.play(60 + index, { dur: 0.5 });
    };
});

document.getElementById('resume').onclick = async () => {
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
        console.log('AudioContext resumed');
    }
};
