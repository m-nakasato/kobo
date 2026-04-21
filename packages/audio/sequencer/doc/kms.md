# About KMS

KMS is a minimal musical score DSL designed for the KOBO Sequencer.

It focuses on clear structure, functional semantics, and compact notation suitable for code golf, while remaining easy for humans and tools to read.

## Structure

KMS is represented as a JavaScript object with the following top-level fields:

```javascript
let kms = {
    bpm: Integer,
    time: String, //Optional
    loop: Integer, //Optional
    value: String, //Optional
    track: [String],
    seq: [Integer],
    opt: [String],
};
```

## Syntax

### BPM

- Beats Per Minute
- Integer
- Range: 1 - 300 (recommended)
- Required
- Cannot be changed during playback

```javascript
bpm: 160;
```

### Time

- Time signature
- String
- Choices: '2/2', '2/4', '3/4', '4/4', '6/8'
- Default: '4/4'
- Cannot be changed during playback

```javascript
time: '3/4';
```

### Loop

- Loop start measure number
- Integer
- Optional
- If omitted, playback does not loop
- If specified, playback returns to the measure after the final measure

```javascript
loop: 3;
```

### Value

- Default note value
- String
- Pattern: `/^(1|2|4|8|16|32)\.?t?$/`
- Default: '8'

```javascript
value: '16';
```

### Track

- Array of long and continuous track strings
- Each track string consists of one or more measures

#### Measure

- Measures are separated by `|`
- Each measure can contains beats as specified by the time signature
- Repeat the previous measure using `%` (see below)
- Playback order is defined by the `seq` (see below)

```javascript
// Time: 2/2
//   ┌── measure 0 ───┐ ┌─── measure 1 ───┐ ┌───────────── measure 2 ──────────────┐ ┌─── measure 3 ───┐
//   ┌ beat ─┐ ┌ beat ┐ ┌ beat ─┐ ┌ beat ─┐ ┌────────── beat ───────────┐ ┌─ beat ─┐ ┌ beat ─┐ ┌ beat ─┐
'...|72 _,4 67/_,4 64 _|_ 69 _ 71/_ 70 69 _|67,4t,tri 76,4t,tri 79,4t,tri/81 _ 77 79|_ 76 _ 72/74 71 _,4|...';
```

#### Beat

- Beats are separated by `/`
- Each beat can contains events
- Events may span beats within the measure size
- If the next beat is empty, the `/` separator may be omitted
- Repeat the previous beat using `*` (see below)

```javascript
// Time: 2/2
//   ┌──────────────────── measure ────────────────────┐
//   ┌────── beat ───────┐ ┌────────── beat ───────────┐
'...|67,4t,tri 77,4t,tri +/77,4t,tri 76,4t,tri 74,4t,tri|...';
```

#### Event

- Events within a beat are separated by a space
- Event types are Note, Rest, and Repeat

##### Note

- Parameters are separated by `,`
- Pitch
    - MIDI note Number
    - Integer
    - Range: 0 - 127
    - Required
- Value
    - Note duration
    - String
    - Pattern: `/^(1|2|4|8|16|32)\.?t?$/`
    - Default: top-level `value`
    - Required if the option is set
- Option
    - Timbre parameters (Synthesizer parameter set)
    - Specifies the key of the applicable track within `opt`
    - Optional

```javascript
'77,4t,tri'; // F4 (698.5Hz), quarter note triplet, opt='tri'
```

##### Rest

##### Repeat

- Note repeat
- Beat repeat
- Measure repeat

### Seq

### Opt

## Track grammar

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
beat_repeat    = "*" , [ power_of_2 ] ;
measure_repeat = "%" , [ power_of_2 ] ;

pitch      = digit | digit , digit | "1" , digit , digit ;

value      = power_of_2 , [ dot ] , [ triplet ] ;
dot        = "." ;
triplet    = "t" ;

option     = digit;

power_of_2 = "1" | "2" | "4" | "8" | "16" | "32";

digit      = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;
```

### RailRoad diagram

<img src="https://img.plantuml.biz/plantuml/dsvg/RLBRJiCm37tFLqIMU85gi8whfadx3uIgRlL6nTPKgJSU6F-ExIIz0AranoV7FiTLrnsLdd3Jx0pvSljXzLdP8vRToQFDx9U52t1EoBTT6fCAvMwmf42y5QAMoj9JceXdR2BD2YtKoWl7o6iSeR73Sx4UEveYS0DJG9GAZosdwKKq6kz4JERtfjgQjkzivjL29gREvU64ezgrLBl6ll6xDEAZxuG2_lG9QUGa4gy3iNMVw0ktAtBb_JB6lAj_UIPOZAfLlQ-9rmevwskOGr-bpBt1Ljfr62mwbICMa1FvkZqWgPoWmuupO2XT1uW4Cl6xZ4o9qq5WfOxOLwxnNkEpnlcZfaKEt1AS9haxYAlqZOjH-uF6qFqq6lWYZjROLFeN_m00"/>

## Examples

### SMB Ground theme

```javascript
let kms = {
    bpm: 100,
    time: '2/2',
    loop: 1,
    track: [
        '76 + _ 76/_ 72 76 _|79 _,4./67 _,4.|72 _,4 67/_,4 64 _|_ 69 _ 71/_ 70 69 _|67,4t,tri 76,4t,tri 79,4t,tri/81 _ 77 79|_ 76 _ 72/74 71 _,4|_,4 79 78/77 75 _ 76|_ 68 69 72/_ 69 72 74|_,4 79 78/77 75 _ 76|_ 84 _ 84/84 _,4.|_,4 79 78/77 75 _ 76|_ 68 69 72/_ 69 72 74|_,4 75 _/_ 74 _,4|72 _,4./_,2|72 + _ 72/_ 72 74 _|76 72 _ 69/67 _,4.|72 + _ 72/_ 72 74 76|_,2/*|76 72 _ 67/_,4 68 _|69 77 _ 77/69 _,4.|71,4t,tri 81,4t,tri +/81,4t,tri 79,4t,tri 77,4t,tri|76 72 _ 69/67 _,4.|71 77 _ 77/77,4t,tri 76,4t,tri 74,4t,tri|72 _,4./_,2',
        '66 + _ 66/_ 66 + _|71 _,4./_,2|64 _,4 60/_,4 55 _|_ 60 _ 62/_ 61 60 _|60,4t,tri 67,4t,tri 71,4t,tri/72 _ 69 71|_ 69 _ 64/65 62 _,4|_,4 76 75/74 71 _ 72|_ 64 65 67/_ 60 64 65|_,4 76 75/74 71 _ 72|_ 77 _ 77/77 _,4.|_,4 76 75/74 71 _ 72|_ 64 65 67/_ 60 64 65|_,4 68 _/_ 65 _,4|64 _,4./_,2|68 + _ 68/_ 68 70 _|67 64 _ 64/60 _,4.|68 + _ 68/_ 68 70 67|_,2/*|72 69 _ 64/_,4 64 _|65 72 _ 72/65 _,4.|67,4t,tri 77,4t,tri +/77,4t,tri 76,4t,tri 74,4t,tri|72 69 _ 65/64 _,4.|67 74 _ 74/74,4t,tri 72,4t,tri 71,4t,tri|67 64 _ 64/60 _,4.',
        '50 + _ 50/_ 50 + _|67 _,4./55 _,4.|55 _,4 52/_,4 48 _|_ 53 _ 55/_ 54 53 _|52,4t 60,4t 64,4t/65 _ 62 64|_ 60 _ 57/59 55 _,4|48 _,4 55/_,4 60 _|53 _,4 60/60 + 53 _|48 _,4 52/_,4 55 60|_ 79 _ 79/79 _ 55 _|48 _,4 55/_,4 60 _|53 _,4 60/60 + 53 _|48 _ 56 _/_ 58 _,4|60 _,4 55/55 _ 48 _|44 _,4 51/_,4 56 _|55 _,4 48/_,4 43 _|%2|48 _,4 54/55 _ 60 _|53 _ 53 _/60 + 53 _|50 _,4 53/55 _ 59 _|55 _ 55 _/60 + 55 _|55 _,4 55/55,4t 57,4t 59,4t|60 _ 55 _/48 _,4.',
        '11 _ 11,8,chh 11/_ 11,8,chh 11 _|11 _,4 11/_ 11,8,chh + +|2,8,bd _ 11,8,chh 11,8,chh2/11 _ 11,8,chh 11,8,chh2|%|%2|%4|%4|11 _,4 11/_,4 11 _|11 _,4 11/_ 11,8,chh + +|%2|11,8,chh _,4 11,8,chh/11 _ 11,8,chh _|%|%2|%2',
    ],
    seq: [
        0, 1, 2, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 7, 0, 1, 2, 1, 2, 9, 10, 9, 11, 9, 10, 9, 11,
        7, 8, 7, 0, 9, 10, 9, 11,
    ],
    opt: [
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
