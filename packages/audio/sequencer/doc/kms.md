# About KMS

KMS is a minimal musical score DSL designed for the KOBO Sequencer.

It focuses on clear structure, functional semantics, and compact notation suitable for code golf, while remaining easy for humans and tools to read.

## Syntax

### BPM

- Beats Per Minute
- Integer
- Range: 1 - 300 (recommended)
- Required
- Cannot be changed during playback

```
bpm: 100
```

### Beat

### Key

### Loop

### Intro

### Value

### Track

#### Measure

#### Beat

#### Event

##### Note

- Pitch
- Value
- Option

##### Rest

##### Repeat

- Note repeat
- Beat repeat
- Measure repeat

## Grammar

### EBNF

```EBNF
track      = measure , { "|" , measure } ;

measure    = beat , { "/" , beat } ;

beat       = event , { " " , event } ;

event      = note
           | rest
           | "+"
           | beat_repeat
           | measure_repeat ;

note       = pitch , [ "," , value , [ "," , option ] ] ;

rest       = "_" , [ "," , value ] ;

beat_repeat    = "*" , [ repeat_count ] ;
measure_repeat = "%" , [ repeat_count ] ;

repeat_count   = "2" | "4" | "8" ;

pitch      = letter , [ accidental ] , octave ;
letter     = "C" | "D" | "E" | "F" | "G" | "A" | "B" ;

accidental = "#" | "b" | "n" ;
octave     = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" ;

value      = base_value , [ dot ] , [ triplet ] ;
base_value = "2" | "4" | "8" | "16" | "32" ;
dot        = "." ;
triplet    = "t" ;

option     = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;
```

### RailRoad diagram

<img src="https://www.plantuml.com/plantuml/dsvg/dLFRJiCm37tlLrX1l435PUC2GaZZ_X5egjBEY8gILgct5yQ_Wq-MfTN42tquIkpZusD7dVLYlN3ftZBnjleWVBVqoRPVUgQSliYi3UNRo3VTP5cyW5kobK0yLYAkOE4K5Nd5RaCZfU4UU3X6dck5CqhVcZptCewOGpCAe6VXkMCxPaRNcvmsK_sjgQwMwfroUYMJgwcLRPOykBUTrAsZESsrL8riIqrXTWh16dZPC0y2CyIAgbqw0NLiJfdxVp2pKGIY4wEBE0DU6ULWc6YlOH7sKBDLLI_OYMrehZDLObVyMn0eSPmxADq37u2Fm2VWC_15-oGvBTj3eWGwJGVvg7g2n2amE9uEV9y3Bu2Nc05xZ3EKjkSYFScYrMNeINpTDHnMaqYxMq7l83-TgBvAf1Syqb3K2Y61Y_3i_vaXzRs6KZPZjz3VwmS0"/>

## Examples

### SMB Ground theme

```javascript
let score = {
    bpm: 100,
    beat: '2/2',
    key: 'C',
    loop: 1,
    intro: 1,
    value: '8',
    track: [
        'E5 + _ E5/_ C5 E5 _|' +
            'G5 _,4./G4 _,4.|' +
            'C5 _,4 G4/_,4 E4 _|' +
            '_ A4 _ B4/_ A#4 A4 _|' +
            'G4,4t,tri E5,4t,tri G5,4t,tri/A5 _ F5 G5|' +
            '_ E5 _ C5/D5 B4 _,4|' +
            '_,4 G5 F#5/F5 D#5 _ E5|' +
            '_ G#4 A4 C5/_ A4 C5 D5|' +
            '_,4 G5 F#5/F5 D#5 _ E5|' +
            '_ C6 _ C6/C6 _,4.|' +
            '_,4 G5 F#5/F5 D#5 _ E5|' +
            '_ G#4 A4 C5/_ A4 C5 D5|' +
            '_,4 D#5 _/_ D5 _,4|' +
            'C5 _,4./_,2|' +
            'C5 + _ C5/_ C5 D5 _|' +
            'E5 C5 _ A4/G4 _,4.|' +
            'C5 + _ C5/_ C5 D5 E5|' +
            '_,2/*|' +
            'E5 C5 _ G4/_,4 G#4 _|' +
            'A4 F5 _ F5/A4 _,4.|' +
            'B4,4t,tri A5,4t,tri +/A5,4t,tri G5,4t,tri F5,4t,tri|' +
            'E5 C5 _ A4/G4 _,4.|' +
            'B4 F5 _ F5/F5,4t,tri E5,4t,tri D5,4t,tri|' +
            'C5 _,4./_,2',

        'F#4 + _ F#4/_ F#4 + _|' +
            'B4 _,4./_,2|' +
            'E4 _,4 C4/_,4 G3 _|' +
            '_ C4 _ D4/_ C#4 C4 _|' +
            'C4,4t,tri G4,4t,tri B4,4t,tri/C5 _ A4 B4|' +
            '_ A4 _ E4/F4 D4 _,4|' +
            '_,4 E5 D#5/D5 B4 _ C5|' +
            '_ E4 F4 G4/_ C4 E4 F4|' +
            '_,4 E5 D#5/D5 B4 _ C5|' +
            '_ F5 _ F5/F5 _,4.|' +
            '_,4 E5 D#5/D5 B4 _ C5|' +
            '_ E4 F4 G4/_ C4 E4 F4|' +
            '_,4 G#4 _/_ F4 _,4|' +
            'E4 _,4./_,2|' +
            'G#4 + _ G#4/_ G#4 A#4 _|' +
            'G4 E4 _ E4/C4 _,4.|' +
            'G#4 + _ G#4/_ G#4 A#4 G4|' +
            '_,2/*|' +
            'C5 A4 _ E4/_,4 E4 _|' +
            'F4 C5 _ C5/F4 _,4.|' +
            'G4,4t,tri F5,4t,tri +/F5,4t,tri E5,4t,tri D5,4t,tri|' +
            'C5 A4 _ F4/E4 _,4.|' +
            'G4 D5 _ D5/D5,4t,tri C5,4t,tri B4,4t,tri|' +
            'G4 E4 _ E4/C4 _,4.',

        'D3 + _ D3/_ D3 + _|' +
            'G4 _,4./G3 _,4.|' +
            'G3 _,4 E3/_,4 C3 _|' +
            '_ F3 _ G3/_ F#3 F3 _|' +
            'E3,4t C4,4t E4,4t/F4 _ D4 E4|' +
            '_ C4 _ A3/B3 G3 _,4|' +
            'C3 _,4 G3/_,4 C4 _|' +
            'F3 _,4 C4/C4 + F3 _|' +
            'C3 _,4 E3/_,4 G3 C4|' +
            '_ G5 _ G5/G5 _ G3 _|' +
            'C3 _,4 G3/_,4 C4 _|' +
            'F3 _,4 C4/C4 + F3 _|' +
            'C3 _ G#3 _/_ A#3 _,4|' +
            'C4 _,4 G3/G3 _ C3 _|' +
            'G#2 _,4 D#3/_,4 G#3 _|' +
            'G3 _,4 C3/_,4 G2 _|' +
            '%2|' +
            'C3 _,4 F#3/G3 _ C4 _|' +
            'F3 _ F3 _/C4 + F3 _|' +
            'D3 _,4 F3/G3 _ B3 _|' +
            'G3 _ G3 _/C4 + G3 _|' +
            'G3 _,4 G3/G3,4t A3,4t B3,4t|' +
            'C4 _ G3 _/C3 _,4.',

        '11 _ 11,8,chh 11/_ 11,8,chh 11 _|' +
            '11 _,4 11/_ 11,8,chh + +|' +
            '2,8,bd _ 11,8,chh 11,8,chh2/11 _ 11,8,chh 11,8,chh2|' +
            '%|' +
            '%2|' +
            '%4|' +
            '%4|' +
            '11 _,4 11/_,4 11 _|' +
            '11 _,4 11/_ 11,8,chh + +|' +
            '%2|' +
            '11,8,chh _,4 11,8,chh/11 _ 11,8,chh _|' +
            '%|' +
            '%2|' +
            '%2',
    ],
    seq: [
        0, 1, 2, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 7, 0, 1, 2, 1, 2, 9, 10, 9, 11, 9, 10, 9, 11,
        7, 8, 7, 0, 9, 10, 9, 11,
    ],
    set: [
        {
            ini: 'env:.01-.15-.75-.05,vol:.85',
            tri: 'env:.01-.151-.0-.0,vol:.85',
        },
        {
            ini: 'env:.01-.15-.75-.05,vol:.85',
            tri: 'env:.01-0-1-.03,vol:.85',
        },
        {
            ini: 'env:.01-.15-1-.05',
        },
        {
            ini: 'env:0-.15-0-.05,vol:.5',
            chh: 'env:.01-.01-0-0,vol:.5',
            chh2: 'env:.01-.01-0-0,vol:.5,swg:1',
            bd: 'env:0-.2-0-.13,vol:.5',
        },
    ],
};
```
