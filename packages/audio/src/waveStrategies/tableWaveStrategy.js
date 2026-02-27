import { spn2freq } from '../utils/spn2freq.js';
import { dft } from '../utils/dft.js';

export const tableWaveStrategy = {
    generateSource: (table, audioCtx) => {
        let d = [];
        for (let i = 0; i < table.length; i++) {
            d[i] = parseInt(table.charAt(i), 16);
        }
        return new PeriodicWave(audioCtx, dft(d, 512));
    },
    createSourceNode: (audioCtx, source, pitch) => {
        return new OscillatorNode(audioCtx, {
            'periodicWave': source,
            'frequency': spn2freq(pitch),
        });
    },
};
