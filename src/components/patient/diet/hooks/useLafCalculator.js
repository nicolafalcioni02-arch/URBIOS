import { useState } from 'react';

// Calcolatore LAF 24h
export const useLafCalculator = () => {
    const [lafActivities, setLafActivities] = useState([
        { id: 1, name: 'Sonno', pal: 0.95, hours: 8 },
        { id: 2, name: 'Attività sedentaria', pal: 1.2, hours: 6 },
        { id: 3, name: 'Attività leggera (camm.)', pal: 2.5, hours: 4 },
        { id: 4, name: 'Attività moderata', pal: 3.5, hours: 4 },
        { id: 5, name: 'Attività intensa', pal: 6.0, hours: 2 },
    ]);

    // --- CALCOLI DERIVATI LAF ---
    const totalLafHours = Math.round(lafActivities.reduce((acc, a) => acc + (Number(a.hours) || 0), 0) * 100) / 100;

    const calculatedLAF =
        totalLafHours === 24 ? (lafActivities.reduce((acc, a) => acc + (Number(a.pal) || 0) * (Number(a.hours) || 0), 0) / 24).toFixed(2) : '---';

    // --- TEMPLATE GIORNATE TIPO ---
    const applyLafTemplate = (type) => {
        const templates = {
            sedentario: [
                { id: 1, name: 'Sonno', pal: 0.95, hours: 8 },
                { id: 2, name: 'Riposo/TV/PC', pal: 1.2, hours: 10 },
                { id: 3, name: 'Attività domestica', pal: 1.8, hours: 3 },
                { id: 4, name: 'Camminata lenta', pal: 2.5, hours: 2 },
                { id: 5, name: 'Pasti e igiene personale', pal: 1.4, hours: 1 },
            ],
            leggero: [
                { id: 1, name: 'Sonno', pal: 0.95, hours: 8 },
                { id: 2, name: "Lavoro d'ufficio", pal: 1.5, hours: 8 },
                { id: 3, name: 'Camminata moderata', pal: 3.0, hours: 2 },
                { id: 4, name: 'Attività domestica', pal: 1.8, hours: 3 },
                { id: 5, name: 'Riposo/TV', pal: 1.2, hours: 3 },
            ],
            attivo: [
                { id: 1, name: 'Sonno', pal: 0.95, hours: 8 },
                { id: 2, name: 'Lavoro fisico/sport', pal: 5.0, hours: 3 },
                { id: 3, name: 'Camminata veloce', pal: 3.5, hours: 2 },
                { id: 4, name: "Lavoro d'ufficio", pal: 1.5, hours: 5 },
                { id: 5, name: 'Riposo/TV', pal: 1.2, hours: 4 },
                { id: 6, name: 'Pasti e igiene personale', pal: 1.4, hours: 2 },
            ],
        };
        setLafActivities(templates[type] || templates.sedentario);
    };

    return { lafActivities, setLafActivities, totalLafHours, calculatedLAF, applyLafTemplate };
};
