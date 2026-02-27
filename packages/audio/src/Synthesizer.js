export class Synthesizer {
    #audioCtx;
    #waves;
    #analyserNode;
    #tasks = {};
    constructor(audioCtx, waves, analyserNode) {
        this.#audioCtx = audioCtx;
        this.#waves = waves;
        this.#analyserNode = analyserNode;
    }
    #lfo(target, depth, rate = 5, wave = 'sine') {
        let lfo = new OscillatorNode(this.#audioCtx, { 'frequency': rate, 'type': wave });
        lfo.start();
        let gainNode = new GainNode(this.#audioCtx, { 'gain': depth });
        lfo.connect(gainNode).connect(target);
    }
    static envelope(gain, sTime, eTime, vol, adsr = []) {
        let [a = 0.01, d = 0.01, s = 0.5, r = 0.01] = adsr;
        gain.setValueAtTime(0, sTime);
        gain.linearRampToValueAtTime(vol, sTime + a);
        gain.linearRampToValueAtTime(vol * s, sTime + a + d);
        gain.setValueAtTime(vol * s, eTime - r);
        gain.linearRampToValueAtTime(0, eTime);
    }
    play(
        pitch,
        {
            'mode': mode = 0,
            'sTime': sTime = this.#audioCtx.currentTime,
            'dur': dur = 0.03,
            'vol': vol = 1,
            'det': det = 0,
            'swp': swp = 0,
            'env': env,
            'vib': vib,
            'trm': trm,
        } = {},
    ) {
        let eTime = sTime + dur;
        let src = this.#waves[mode].getSourceNode(pitch);
        src.detune.value = det;
        src.detune.linearRampToValueAtTime(det + swp, eTime);
        if (src.frequency != undefined && vib != undefined) this.#lfo(src.frequency, ...vib);
        // if (!(this.#wav instanceof TableWave)) vol /= 4;
        let gainNode = new GainNode(this.#audioCtx);
        Synthesizer.envelope(gainNode.gain, sTime, eTime, vol, env);
        if (trm != undefined) this.#lfo(gainNode.gain, ...trm);
        if (this.#analyserNode) gainNode.connect(this.#analyserNode);
        src.connect(gainNode).connect(this.#audioCtx.destination);
        src.start(sTime);
        src.stop(eTime);
        let UUID = crypto.randomUUID();
        this.#tasks[UUID] = src;
        src.onended = () => {
            src.disconnect();
            // if (this.#wav instanceof NoiseWave) src.buffer = null;
            // if (src instanceof AudioBufferSourceNode) src.buffer = null;
            if (src.buffer) src.buffer = null;
            gainNode.disconnect();
            delete this.#tasks[UUID];
        };
        // return {eTime, freq: this.#wav.freq(pitch)};
        return { eTime };
    }
    discard() {
        Object.keys(this.#tasks).forEach((key) => this.#tasks[key].stop());
    }
}
