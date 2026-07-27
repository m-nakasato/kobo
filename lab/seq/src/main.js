import {
    Synthesizer,
    Wave,
    // presetWaveStrategy,
    tableWaveStrategy,
    noiseWaveStrategy,
    lfsr,
    // lfo,
} from '@m-nakasato/kobo-audio/synthesizer';

import { parse } from '@m-nakasato/kobo-audio/sequencer';

const kms = {
    bpm: 100,
    time: '2/4',
    loop: 1,
    track: [
        '76 + _ 76 _ 72 76 _|79 _,4. 67 _,4.|72 _,4 67 _,4 64 _|_ 69 _ 71 _ 70 69 _|67,4t,1 76,4t,1 79,4t,1 81 _ 77 79|_ 76 _ 72 74 71 _,4|_,4 79 78 77 75 _ 76|_ 68 69 72 _ 69 72 74|_,4 79 78 77 75 _ 76|_ 84 _ 84 84 _,4.|_,4 79 78 77 75 _ 76|_ 68 69 72 _ 69 72 74|_,4 75 _,4 74 _,4|72 _,4. _,2|72 + _ 72 _ 72 74 _|76 72 _ 69 67 _,4.|72 + _ 72 _ 72 74 76|_,1|76 72 _ 67 _,4 68 _|69 77 _ 77 69 _,4.|71,4t,1 81,4t,1 + 81,4t,1 79,4t,1 77,4t,1|76 72 _ 69 67 _,4.|71 77 _ 77 77,4t,1 76,4t,1 74,4t,1|72 _,4. _,2',
        '66 + _ 66 _ 66 + _|71 _,4. _,2|64 _,4 60 _,4 55 _|_ 60 _ 62 _ 61 60 _|60,4t,1 67,4t,1 71,4t,1 72 _ 69 71|_ 69 _ 64 65 62 _,4|_,4 76 75 74 71 _ 72|_ 64 65 67 _ 60 64 65|_,4 76 75 74 71 _ 72|_ 77 _ 77 77 _,4.|_,4 76 75 74 71 _ 72|_ 64 65 67 _ 60 64 65|_,4 68 _,4 65 _,4|64 _,4. _,2|68 + _ 68 _ 68 70 _|67 64 _ 64 60 _,4.|68 + _ 68 _ 68 70 67|_,1|72 69 _ 64 _,4 64 _|65 72 _ 72 65 _,4.|67,4t,1 77,4t,1 + 77,4t,1 76,4t,1 74,4t,1|72 69 _ 65 64 _,4.|67 74 _ 74 74,4t,1 72,4t,1 71,4t,1|67 64 _ 64 60 _,4.',
        '50 + _ 50 _ 50 + _|67 _,4. 55 _,4.|55 _,4 52 _,4 48 _|_ 53 _ 55 _ 54 53 _|52,4t 60,4t 64,4t 65 _ 62 64|_ 60 _ 57 59 55 _,4|48 _,4 55 _,4 60 _|53 _,4 60 60 + 53 _|48 _,4 52 _,4 55 60|_ 79 _ 79 79 _ 55 _|48 _,4 55 _,4 60 _|53 _,4 60 60 + 53 _|48 _ 56 _,4 58 _,4|60 _,4 55 55 _ 48 _|44 _,4 51 _,4 56 _|55 _,4 48 _,4 43 _|%2|48 _,4 54 55 _ 60 _|53 _ 53 _ 60 + 53 _|50 _,4 53 55 _ 59 _|55 _ 55 _ 60 + 55 _|55 _,4 55 55,4t 57,4t 59,4t|60 _ 55 _ 48 _,4.',
        '11 _ 11,8,1 11 _ 11,8,1 11 _|11 _,4 11 _ 11,8,1 + +|2,8,3 _ 11,8,1 11,8,2 11 _ 11,8,1 11,8,2|%|%2|%4|%4|11 _,4 11 _,4 11 _|11 _,4 11 _ 11,8,1 + +|%2|11,8,1 _,4 11,8,1 11 _ 11,8,1 _|%|%2|%2',
    ],
    // seq: [
    //     0, 1, 2, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 7, 0, 1, 2, 1, 2, 9, 10, 9, 11, 9, 10, 9, 11,
    //     7, 8, 7, 0, 9, 10, 9, 11,
    // ],
    //prettier-ignore
    seq: [
        0,1, // 0,
        2,3,4,5,2,3,4,5, // 1,2,1,2,
        6,7,8,9,10,11,12,13, // 3,4,5,6,
        6,7,8,9,10,11,12,13, // 3,4,5,6,
        14,15,16,17,14,15,0,1, // 7,8,7,0,
        2,3,4,5,2,3,4,5, // 1,2,1,2,
        18,19,20,21,18,19,22,23, // 9,10,9,11,
        18,19,20,21,18,19,22,23, // 9,10,9,11,
        14,15,16,17,14,15,0,1, // 7,8,7,0,
        18,19,20,21,18,19,22,23, // 9,10,9,11,
    ],
    opt: [
        [
            { env: [0.01, 0.15, 0.75, 0.05], vol: 0.85 },
            { env: [0.01, 0.151, 0, 0], vol: 0.85 }, // triplet
        ],
        [
            { env: [0.01, 0.15, 0.75, 0.05], vol: 0.85 },
            { env: [0.01, 0, 1, 0.03], vol: 0.85 }, // triplet
        ],
        [{ env: [0.01, 0.15, 1, 0.05] }],
        [
            { env: [0, 0.15, 0, 0.05], vol: 0.5 },
            { env: [0.01, 0.01, 0, 0], vol: 0.5 }, // closed hi-hat
            { env: [0.01, 0.01, 0, 0], vol: 0.5, swg: 1 }, // closed hi-hat swing
            { env: [0, 0.2, 0, 0.13], vol: 0.5 }, // bass drum
        ],
    ],
};

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
// const sequencer = new Sequencer();
// console.log('Sequencer:', sequencer);

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

document.querySelector('#test').onclick = () => {
    const playbackData = parse(kms);
    console.log(playbackData);
    // synthesizers[0].play(76, { env: [0.01, 0.15, 0.75, 0.05], vol: 0.85, dur: 0.3 });
    // synthesizers[3].play(11, { env: [0, 0.15, 0, 0.05], vol: 0.5, dur: 0.3 });
    playbackData.forEach((track, tid) => {
        // console.log(track);
        kms.seq.forEach((mid) => {
            track[mid].forEach((event, eid) => {
                if (mid == 0 && eid == 0) {
                    synthesizers[tid].play(...event);
                }
            });
        });
    });
};

// document.getElementById('resume').onclick = async () => {
//     if (audioCtx.state === 'suspended') {
//         await audioCtx.resume();
//         console.log('AudioContext resumed');
//     }
// };
