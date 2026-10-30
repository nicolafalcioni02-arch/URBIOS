import { useEffect, useRef, useState } from 'react';
import { buildFigure, readTheme } from './figure';

// Plotly arriva dal CDN di index.html; se non è raggiungibile (offline) si usa il pacchetto locale
let plotlyPromise;
const loadPlotly = () => {
    if (window.Plotly) return Promise.resolve(window.Plotly);
    plotlyPromise ||= import('plotly.js-dist-min').then((m) => m.default || m);
    return plotlyPromise;
};

export const ReportChart = ({ model, compact = false }) => {
    const ref = useRef(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || model.empty) return;
        let alive = true;
        let Plotly;
        let ro;
        loadPlotly()
            .then((P) => {
                if (!alive) return;
                Plotly = P;
                const { data, layout, config } = buildFigure(model, readTheme(), compact);
                return P.react(el, data, layout, config).then(() => {
                    if (!alive || typeof ResizeObserver === 'undefined') return;
                    ro = new ResizeObserver(() => P.Plots.resize(el));
                    ro.observe(el);
                });
            })
            .catch(() => alive && setFailed(true));
        return () => {
            alive = false;
            ro?.disconnect();
            try {
                Plotly?.purge(el);
            } catch {
                /* già rimosso */
            }
        };
    }, [model, compact]);

    if (model.empty) return <div className="sr-empty">{model.reason}</div>;
    if (failed) return <div className="sr-empty">Non riesco a caricare la libreria dei grafici.</div>;
    return <div ref={ref} className="sr-plot" />;
};
