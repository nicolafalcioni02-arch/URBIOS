import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const num = (v) => {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : null;
};

// Andamento nel tempo: una riga per visita (peso, vita, % massa grassa). La visita corrente è sempre l'ultimo punto
// se non è già nello storico. Restituisce null se i punti sono meno di due.
export const trendPoints = (patient, visitData, report, date) => {
    const cur = {
        date: date || new Date().toISOString().slice(0, 10),
        peso: num(visitData?.peso),
        vita: num(visitData?.cm_vita_min),
        fm: num(report?.risultati_metodo_A?.fm_percent) || num(report?.risultati_metodo_B?.fm_percent),
    };
    const past = (patient?.visite || [])
        .filter((v) => String(v.data) !== String(cur.date))
        .map((v) => ({
            date: v.data,
            peso: num(v.peso),
            vita: num(v.dettagli?.cm_vita_min),
            fm: num(v.dettagli?.risultati_metodo_A?.fm_percent) || num(v.dettagli?.risultati_metodo_B?.fm_percent),
        }));
    const all = [...past, cur].sort((a, b) => new Date(a.date) - new Date(b.date));
    return all.length >= 2 ? { all, cur } : null;
};

const fmt = (d) => {
    const x = new Date(d);
    return isNaN(x) ? String(d) : x.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export const TrendChart = ({ points, width = 450, height = 150 }) => {
    if (!points) return null;
    const { all, cur } = points;
    const series = [
        { key: 'peso', label: 'Peso (kg)', color: '#6366f1', axis: 'y' },
        { key: 'vita', label: 'Vita (cm)', color: '#10b981', axis: 'y' },
        { key: 'fm', label: 'Massa grassa (%)', color: '#f43f5e', axis: 'y1' },
    ].filter((s) => all.filter((p) => p[s.key] !== null).length >= 1);
    if (!series.length) return null;
    const datasets = series.map((s) => ({
        label: s.label,
        data: all.map((p) => p[s.key]),
        borderColor: s.color,
        backgroundColor: s.color,
        yAxisID: s.axis,
        tension: 0.25,
        spanGaps: true,
        borderWidth: 2,
        pointRadius: all.map((p) => (p === cur ? 5 : 3)),
    }));
    const hasY1 = series.some((s) => s.axis === 'y1');
    return (
        <Line
            width={width}
            height={height}
            data={{ labels: all.map((p) => fmt(p.date)), datasets }}
            options={{
                responsive: false,
                animation: false,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 8, font: { size: 9 } } } },
                scales: {
                    x: { ticks: { font: { size: 9 } } },
                    y: { ticks: { font: { size: 9 } } },
                    ...(hasY1 ? { y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { font: { size: 9 } } } } : {}),
                },
            }}
        />
    );
};
