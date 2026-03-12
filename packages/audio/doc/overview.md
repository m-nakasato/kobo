# KOBO Audio Package

## Purpose

This package is an audio processing unit for JavaScript mini-games.  
The synthesizer module generates and plays waveforms (Wraps the Web Audio API), and the sequencer module plays the synthesizer from the musical score format "KMSL".

## Features

- Synthesizer
    - Waveforms
        - Preset
            - Sine
            - Square
            - Sawtooth
            - Triangle
        - Wavetable (4-bit samples)
        - Noise
            - Random (Default)
            - LFSR
            - Custom
    - Multichannel
    - Detune
    - Sweep
    - Envelope (ADSR)
    - LFO
        - Vibration
        - Tremolo
- Sequencer
    - KMSL parser
    - Synth player

## Component diagram

```mermaid
graph TD
    subgraph synthesizerModule[synthesizer module]
        Synthesizer --use--> Wave --has--> waveStrategies
        subgraph waveStrategies
            presetWaveStrategy
            tableWaveStrategy
            noiseWaveStrategy
        end
        subgraph utils
            spn2freq
            dft
            lfsr
        end
        presetWaveStrategy --use--> spn2freq
        tableWaveStrategy --use--> spn2freq
        tableWaveStrategy --use--> dft
        noiseWaveStrategy -- optional--> lfsr
    end
    subgraph sequencerModule[sequencer module]
        KMSL@{shape: lean-r} -.input.-> parseScore -.output.-> parsedScore@{shape: lean-r}
        parsedScore -.input.-> convertEvent -.output.-> event@{shape: lean-r}
        Sequencer --has--> parseScore
        Sequencer --has--> convertEvent
        Sequencer --has--> synthPlayer
        synthPlayer --use--> event
    end
    synthPlayer --use--> Synthesizer
```

## Processing flow

### Synthesizer

### Sequencer

## Example

### Synthesizer

### Sequencer
