import {
    Synthesizer,
    Wave,
    // presetWaveStrategy,
    tableWaveStrategy,
    noiseWaveStrategy,
    lfsr,
    // lfo,
} from '@m-nakasato/kobo-audio/synthesizer';

import { parse, loop, stop } from '@m-nakasato/kobo-audio/sequencer';

const kms = {
    bpm: 100,
    value: '16',
    time: '4/4',
    loop: 1,
    track: [
        '76 + _ 76 _ 72 76 _ 79 _,8. 67 _,8.|72 _,8 67 _,8 64 _ _ 69 _ 71 _ 70 69 _|67,8t,1 76,8t,1 79,8t,1 81 _ 77 79 _ 76 _ 72 74 71 _,8|_,8 79 78 77 75 _ 76 _ 68 69 72 _ 69 72 74|_,8 79 78 77 75 _ 76 _ 84 _ 84 84 _,8.|_,8 79 78 77 75 _ 76 _ 68 69 72 _ 69 72 74|_,8 75 _,8 74 _,8 72 _,8. _,4|72 + _ 72 _ 72 74 _ 76 72 _ 69 67 _,8.|72 + _ 72 _ 72 74 76 _,2|76 72 _ 67 _,8 68 _ 69 77 _ 77 69 _,8.|71,8t,1 81,8t,1 + 81,8t,1 79,8t,1 77,8t,1 76 72 _ 69 67 _,8.|71 77 _ 77 77,8t,1 76,8t,1 74,8t,1 72 _,8. _,4',
        '66 + _ 66 _ 66 + _ 71 _,8. _,4|64 _,8 60 _,8 55 _ _ 60 _ 62 _ 61 60 _|60,8t,1 67,8t,1 71,8t,1 72 _ 69 71 _ 69 _ 64 65 62 _,8|_,8 76 75 74 71 _ 72 _ 64 65 67 _ 60 64 65|_,8 76 75 74 71 _ 72 _ 77 _ 77 77 _,8.|_,8 76 75 74 71 _ 72 _ 64 65 67 _ 60 64 65|_,8 68 _,8 65 _,8 64 _,8. _,4|68 + _ 68 _ 68 70 _ 67 64 _ 64 60 _,8.|68 + _ 68 _ 68 70 67 _,2|72 69 _ 64 _,8 64 _ 65 72 _ 72 65 _,8.|67,8t,1 77,8t,1 + 77,8t,1 76,8t,1 74,8t,1 72 69 _ 65 64 _,8.|67 74 _ 74 74,8t,1 72,8t,1 71,8t,1 67 64 _ 64 60 _,8.',
        '50 + _ 50 _ 50 + _ 67 _,8. 55 _,8.|55 _,8 52 _,8 48 _ _ 53 _ 55 _ 54 53 _|52,8t 60,8t 64,8t 65 _ 62 64 _ 60 _ 57 59 55 _,8|48 _,8 55 _,8 60 _ 53 _,8 60 60 + 53 _|48 _,8 52 _,8 55 60 _ 79 _ 79 79 _ 55 _|48 _,8 55 _,8 60 _ 53 _,8 60 60 + 53 _|48 _ 56 _,8 58 _,8 60 _,8 55 55 _ 48 _|44 _,8 51 _,8 56 _ 55 _,8 48 _,8 43 _|%|48 _,8 54 55 _ 60 _ 53 _ 53 _ 60 + 53 _|50 _,8 53 55 _ 59 _ 55 _ 55 _ 60 + 55 _|55 _,8 55 55,8t 57,8t 59,8t 60 _ 55 _ 48 _,8.',
        '11 _ 11,16,1 11 _ 11,16,1 11 _ 11 _,8 11 _ 11,16,1 + +|2,16,3 _ 11,16,1 11,16,2 11 _ 11,16,1 11,16,2 2,16,3 _ 11,16,1 11,16,2 11 _ 11,16,1 11,16,2|%|%2|%2|11 _,8 11 _,8 11 _ 11 _,8 11 _ 11,16,1 + +|%|11,16,1 _,8 11,16,1 11 _ 11,16,1 _ 11,16,1 _,8 11,16,1 11 _ 11,16,1 _|%|%',
    ],
    seq: [
        0, 1, 2, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 7, 0, 1, 2, 1, 2, 9, 10, 9, 11, 9, 10, 9, 11,
        7, 8, 7, 0, 9, 10, 9, 11,
    ],
    opt: [
        [
            { env: [0.01, 0.09, 0.75, 0.05], vol: 0.85 },
            { env: [0.01, 0, 1, 0.18], vol: 0.85 }, // triplet
        ],
        [
            { env: [0.01, 0.09, 0.75, 0.05], vol: 0.85 },
            { env: [0.01, 0, 1, 0.18], vol: 0.85 }, // triplet
        ],
        [{ env: [0.01, 0.09, 1, 0.05] }],
        [
            { env: [0, 0.09, 0, 0.05], vol: 0.4 },
            { env: [0.01, 0.01, 0, 0], vol: 0.4 }, // closed hi-hat
            { env: [0.01, 0.01, 0, 0], vol: 0.4, swg: 1 }, // closed hi-hat swing
            { env: [0, 0.02, 0, 0.13], vol: 0.3 }, // bass drum
        ],
    ],
};

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// console.log('Sample Rate:', audioCtx.sampleRate);

const FC_PERIODS = [4068, 2034, 1016, 762, 508, 380, 254, 202, 160, 128, 96, 64, 32, 16, 8, 4];
let periods = [
    ...new Set(FC_PERIODS.map((fcp) => Math.round((audioCtx.sampleRate / 1789772.5) * fcp))),
].filter(Boolean);
// console.log(periods);

const synthesizers = [
    new Synthesizer(audioCtx, [new Wave(audioCtx, tableWaveStrategy, 'F0')]),
    new Synthesizer(audioCtx, [new Wave(audioCtx, tableWaveStrategy, 'F0')]),
    new Synthesizer(audioCtx, [
        new Wave(audioCtx, tableWaveStrategy, '0123456789ABCDEFFEDCBA9876543210'),
    ]),
    new Synthesizer(audioCtx, [new Wave(audioCtx, noiseWaveStrategy, periods, lfsr())]),
];

let playID = null;

document.querySelector('#play').onclick = () => {
    const playbackData = parse(kms);
    console.log(playbackData);
    playID = loop(synthesizers, playbackData, kms);
};

document.querySelector('#stop').onclick = () => {
    clearInterval(playID);
    stop(synthesizers);
};

// document.getElementById('resume').onclick = async () => {
//     if (audioCtx.state === 'suspended') {
//         await audioCtx.resume();
//         console.log('AudioContext resumed');
//     }
// };
