module.exports = function(base) {
    base = base || 0;
    const mapping = {};

    for (let i = 0; i < 16; i++) {
        let bank = String.fromCharCode(65 + Math.floor(i / 8));
        mapping["GP" + bank + (i % 8)] = base + i;
    }

    return mapping;
};