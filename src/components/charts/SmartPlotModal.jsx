import React, { useRef, useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrazione componenti Chart.js (Obbligatorio in React moderno)
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const SmartPlotModal = ({ patient, onClose }) => {
    const allMetrics = useMemo(() => {
        if (!patient.visite || patient.visite.length === 0) return [];
        const sample = patient.visite[patient.visite.length - 1];
        const keys = new Set(['peso']);

        // Cerca metriche nei dettagli
        if (sample.dettagli) {
            Object.keys(sample.dettagli).forEach((k) => {
                const val = sample.dettagli[k];
                // Includi solo se è un numero e non è un oggetto
                if (typeof val !== 'object' && !isNaN(parseFloat(val)) && val !== '') {
                    keys.add(k);
                }
            });
            // Cerca metriche nei risultati calcolati (Metodo A)
            if (sample.dettagli.risultati_metodo_A) {
                Object.keys(sample.dettagli.risultati_metodo_A).forEach((k) => {
                    const val = sample.dettagli.risultati_metodo_A[k];
                    if (!isNaN(parseFloat(val))) keys.add(k);
                });
            }
        }

        return Array.from(keys).map((key, index) => ({
            id: key,
            label: key.replace(/_/g, ' ').toUpperCase(),
            color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
        }));
    }, [patient]);

    const [activeMetrics, setActiveMetrics] = useState(['peso']);

    const toggleMetric = (id) => {
        setActiveMetrics((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
    };

    const getDeepValue = (visit, id) => {
        if (id === 'peso') return parseFloat(visit.peso);
        if (visit.dettagli?.[id] !== undefined) return parseFloat(visit.dettagli[id]);
        if (visit.dettagli?.risultati_metodo_A?.[id] !== undefined) return parseFloat(visit.dettagli.risultati_metodo_A[id]);
        return null;
    };

    // Preparazione Dati
    const sortedVisits = [...patient.visite].sort((a, b) => new Date(a.data) - new Date(b.data));

    const chartData = {
        labels: sortedVisits.map((v) => new Date(v.data).toLocaleDateString('it-IT')),
        datasets: allMetrics
            .filter((m) => activeMetrics.includes(m.id))
            .map((m) => ({
                label: m.label,
                data: sortedVisits.map((v) => getDeepValue(v, m.id)),
                borderColor: m.color,
                backgroundColor: m.color, // Versione trasparente se volessi il fill
                borderWidth: 2,
                tension: 0.3, // Curvatura linea
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
            })),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                backgroundColor: 'rgba(255,255,255,0.9)',
                titleColor: '#000',
                bodyColor: '#333',
                borderColor: '#ddd',
                borderWidth: 1,
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { color: '#f3f4f6' } },
        },
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-7xl h-[92vh] relative z-10 flex flex-col overflow-hidden fade-enter animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Total Analytics Portal</h2>
                        <p className="text-gray-500 text-sm">
                            Analisi trend storico: {patient.nome} {patient.cognome}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:rotate-90 transition-all hover:bg-gray-800"
                    >
                        <i className="ph ph-x text-2xl"></i>
                    </button>
                </div>

                {/* Selettore Metriche */}
                <div className="p-6 bg-white border-b border-gray-100 overflow-y-auto max-h-[25vh]">
                    <div className="flex flex-wrap gap-2">
                        {allMetrics.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => toggleMetric(m.id)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-2 ${activeMetrics.includes(m.id) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}
                            >
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }}></div>
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Area Grafico */}
                <div className="flex-1 p-8 bg-white min-h-0 relative">
                    <Line data={chartData} options={options} />
                </div>
            </div>
        </div>,
        document.body
    );
};
