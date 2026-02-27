import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { presetWaveStrategy } from '../../src/waveStrategies/presetWaveStrategy.js';

global.__DEV__ = true;

// Stub: Frequency of 'A5' (Self-made utility func)
import * as spn from '../../src/utils/spn2freq.js';
mock.fn(spn, 'spn2freq', () => 880);

// Mock: OscillatorNode for testing (Web Audio API is not available in Node.js)
class MockOscillatorNode {
    constructor(audioCtx, options) {
        this.audioCtx = audioCtx;
        this.options = options;
    }
}

global.OscillatorNode = MockOscillatorNode;

test('presetWaveStrategy generates correct source type', () => {
    const audioCtx = {};
    const type = 'sawtooth';
    const source = presetWaveStrategy.generateSource(type);
    assert.strictEqual(source, type);
});

test('presetWaveStrategy creates OscillatorNode with correct frequency', () => {
    const audioCtx = {};
    const sourceType = 'square';
    const pitch = 'A5';
    const oscillatorNode = presetWaveStrategy.createSourceNode(audioCtx, sourceType, pitch);

    assert.ok(oscillatorNode instanceof MockOscillatorNode);
    assert.strictEqual(oscillatorNode.options.type, sourceType);
    assert.strictEqual(oscillatorNode.options.frequency, 880); // Using stubbed spn2freq
});
