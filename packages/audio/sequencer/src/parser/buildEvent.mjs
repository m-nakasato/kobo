import { duration } from './duration.mjs';

export const buildEvent = (event, bpm, opt) => {
    let result;
    const value = event[1] ? event[1] : 8;
    const dur = duration(value, bpm);
    if (event[0] == '_') {
        result = [event[0], { dur }];
    } else {
        const optNum = event[2] ? event[2] : 0;
        result = [event[0] * 1, { dur, ...opt[optNum] }];
    }
    return result;
};
