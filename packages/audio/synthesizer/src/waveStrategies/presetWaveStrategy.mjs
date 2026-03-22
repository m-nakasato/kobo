import { spn2freq } from '../utils/spn2freq.mjs';

export const presetWaveStrategy = {
    generateSource: type => type,
    createSourceNode: (audioCtx, source, pitch) => {
        return new OscillatorNode(audioCtx, {
            'type': source,
            'frequency': spn2freq(pitch),
        });
    },
};
