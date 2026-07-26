export const repeat = (list, symbol) => {
    let result = [];
    list.forEach((item) => {
        if (item.startsWith(symbol)) {
            // let repeatNum = Number(item.slice(1)) || 1;
            let repeatNum = item.slice(1) || 1;
            let repeatBuf = result.slice(repeatNum * -1);
            result.push(...repeatBuf);
        } else {
            result.push(item);
        }
    });
    return result;
};
