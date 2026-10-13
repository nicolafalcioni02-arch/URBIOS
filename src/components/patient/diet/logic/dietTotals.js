export const calculateTotals = (items) => {
    return items.reduce(
        (acc, curr) => {
            const weight = parseFloat(curr.weight) || 0;
            const ratio = weight / 100;
            return {
                kcal: acc.kcal + (parseFloat(curr.kcal) || 0) * ratio,
                p: acc.p + (parseFloat(curr.p) || 0) * ratio,
                c: acc.c + (parseFloat(curr.c) || 0) * ratio,
                f: acc.f + (parseFloat(curr.f) || 0) * ratio,
            };
        },
        { kcal: 0, p: 0, c: 0, f: 0 }
    );
};
