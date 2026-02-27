export class Wave {
    #audioCtx;
    #strategy;
    #source;
    constructor(audioCtx, strategy, material, helper) {
        this.#audioCtx = audioCtx;
        this.#strategy = strategy;
        this.#source = strategy.generateSource(material, audioCtx, helper);
    }
    getSourceNode(pitch) {
        // console.log(this.#source);
        return this.#strategy.createSourceNode(this.#audioCtx, this.#source, pitch);
    }
}
