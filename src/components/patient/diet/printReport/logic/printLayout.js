// 1. FUNZIONE MAGICA: "Taglia" le liste lunghe in blocchi più piccoli per creare i "sotto-fogli"
// Funzione che taglia gli array lunghi
export const chunkArray = (array, size) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
};

// Funzione per stimare altezza in mm di un pasto completo (titolo + righe + sottorighe)
export const estimateMealHeight = (meal) => {
    const baseTitleHeight = 14; // mm per intestazione pasto
    const mealTitleMargin = 6; // mm tra titolo e tabella
    const itemRowHeight = 11; // mm a riga per item principale
    const subItemRowHeight = 8; // mm a riga per item sostitutivo
    const mealPadding = 10; // mm (spaziatura esterna, border e gap)

    const totalItemHeight = meal.items.reduce((acc, item) => {
        const subsCount = (item.subs || []).length;
        return acc + itemRowHeight + subsCount * subItemRowHeight;
    }, 0);

    // Aggiungo un fattore di sicurezza per evitare sottostime e tagli
    const safetyBuffer = 6;

    return baseTitleHeight + mealTitleMargin + totalItemHeight + mealPadding + safetyBuffer;
};

// Funzione per dividere i pasti in chunk basati su spazio disponibile del foglio A4 (2cm margini top/bottom)
export const chunkMealsByHeight = (meals) => {
    const chunks = [];
    let currentChunk = [];
    let currentHeight = 0;

    const pageHeight = 297; // mm
    const totalPadding = 20 + 20; // top + bottom padding del foglio
    const usableHeight = pageHeight - totalPadding - 16; // 257 - 16 extra (header e tail)
    const dayHeaderHeight = 30; // mm per header "day title + piano alimentare" nella pagina

    meals.forEach((meal) => {
        const mealHeight = estimateMealHeight(meal);
        const overhead = currentChunk.length === 0 ? dayHeaderHeight : 0;
        const needHeight = (currentHeight || 0) + overhead + mealHeight;

        if (needHeight > usableHeight && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentHeight = 0;
        }

        if (currentChunk.length === 0) {
            currentHeight = dayHeaderHeight;
        }

        // Se un singolo meal è troppo grande, lo mettiamo comunque in un foglio intero
        if (mealHeight > usableHeight) {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk);
            }
            chunks.push([meal]);
            currentChunk = [];
            currentHeight = 0;
            return;
        }

        currentChunk.push(meal);
        currentHeight += mealHeight;
    });

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
};
