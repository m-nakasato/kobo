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
    static envelope(gain, startTime, endTime, volume, envelope) {
        let [a = 0.01, d = 0.01, s = 0.5, r = 0.01] = envelope;
        gain.setValueAtTime(0, startTime);
        gain.linearRampToValueAtTime(volume, startTime + a);
        gain.linearRampToValueAtTime(volume * s, startTime + a + d);
        gain.setValueAtTime(volume * s, endTime - r);
        gain.linearRampToValueAtTime(0, endTime);
    }
    play(
        noteNumber,
        {
            'mod': mode = 0,
            'sta': startTime = this.#audioCtx.currentTime,
            'dur': duration = 0.03,
            'vol': volume = 1,
            'det': detune = 0,
            'swp': sweep = 0,
            'env': envelope = [],
            'vib': vibration,
            'trm': tremolo,
        } = {},
    ) {
        if (__DEV__) {
            if (Number.isInteger(mode) == false || mode < 0 || mode >= this.#waves.length)
                throw new Error('Invalid mode');
            if (Number.isNaN(startTime) || startTime < 0) throw new Error('Invalid start time');
            if (Number.isNaN(duration) || duration <= 0) throw new Error('Invalid duration');
            if (Number.isNaN(volume) || volume < 0 || volume > 2) throw new Error('Invalid volume');
            if (Number.isNaN(detune) || detune < -3600 || detune > 3600)
                throw new Error('Invalid detune');
            if (Number.isNaN(sweep) || sweep < -3600 || sweep > 3600)
                throw new Error('Invalid sweep');
            if (Array.isArray(envelope) == false || envelope.length > 4)
                throw new Error('Invalid envelope');
            if (envelope[0] + envelope[1] + envelope[3] > duration)
                throw new Error('Invalid envelope');
            if (envelope[2] < 0 || envelope[2] > 1)
                throw new Error('Invalid envelope sustain level');
            envelope.forEach(value => {
                if (Number.isNaN(value) || value < 0) throw new Error('Invalid envelope value');
            });
            if (vibration != undefined) {
                if (Array.isArray(vibration) == false || vibration.length > 3)
                    throw new Error('Invalid vibration');
                let [depth, rate, wave] = vibration;
                if (Number.isNaN(depth) || depth < 0 || depth > 100)
                    throw new Error('Invalid vibration depth');
                if (Number.isNaN(rate) || rate <= 0 || rate > 10)
                    throw new Error('Invalid vibration rate');
                if (typeof wave != 'string') throw new Error('Invalid vibration wave');
            }
            if (tremolo != undefined) {
                if (Array.isArray(tremolo) == false || tremolo.length > 3)
                    throw new Error('Invalid tremolo');
                let [depth, rate, wave] = tremolo;
                if (Number.isNaN(depth) || depth < 0 || depth > 1)
                    throw new Error('Invalid tremolo depth');
                if (Number.isNaN(rate) || rate <= 0 || rate > 10)
                    throw new Error('Invalid tremolo rate');
                if (typeof wave != 'string') throw new Error('Invalid tremolo wave');
            }
        }
        let endTime = startTime + duration;
        let src = this.#waves[mode].getSourceNode(noteNumber);
        src.detune.value = detune;
        src.detune.linearRampToValueAtTime(detune + sweep, endTime);
        if (src.frequency != undefined && vibration != undefined)
            this.#lfo(src.frequency, ...vibration);
        // if (!(this.#wav instanceof TableWave)) volume /= 4;
        let gainNode = new GainNode(this.#audioCtx);
        Synthesizer.envelope(gainNode.gain, startTime, endTime, volume, envelope);
        if (tremolo != undefined) this.#lfo(gainNode.gain, ...tremolo);
        if (this.#analyserNode) gainNode.connect(this.#analyserNode);
        src.connect(gainNode).connect(this.#audioCtx.destination);
        src.start(startTime);
        src.stop(endTime);
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
        return { end: endTime };
    }
    discard() {
        Object.keys(this.#tasks).forEach(key => this.#tasks[key].stop());
    }
}
