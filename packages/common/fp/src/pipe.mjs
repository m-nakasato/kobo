export const pipe =
    (...fns) =>
    initialV =>
        fns.reduce((v, f) => f(v), initialV);
