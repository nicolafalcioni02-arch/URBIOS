// Dal modello del report alla figura Plotly (dati + layout). Funzione pura, i colori arrivano dai token.

export const fmt = (v) => {
    if (!Number.isFinite(v)) return '';
    const a = Math.abs(v);
    return a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(1) : v.toFixed(2);
};

const cssVar = (name, fallback) => {
    try {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    } catch {
        return fallback;
    }
};

export const readTheme = () => ({
    ink: cssVar('--ink', '#121317'),
    muted: cssVar('--muted', '#6E6D69'),
    line: cssVar('--line', '#E6E4DE'),
    soft: cssVar('--soft', '#EFEEEA'),
    accent: cssVar('--accent', '#2F54EB'),
    ok: cssVar('--ok', '#1F8A5B'),
    warn: cssVar('--warn', '#B7791F'),
    bad: cssVar('--bad', '#C2413A'),
});

const rgba = (hex, a) => {
    const h = hex.replace('#', '');
    if (h.length !== 6) return hex;
    const n = parseInt(h, 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};

export const buildFigure = (model, t, compact = false, narrow = false) => {
    const palette = [t.accent, t.ink, t.ok, t.warn, t.muted, t.bad];
    const color = (i) => palette[i % palette.length];
    const { type, labels, series, refs, percent } = model;
    const multi = series.length > 1;
    const font = { family: 'Inter, -apple-system, sans-serif', color: t.muted, size: compact ? 10 : 12 };
    const layout = {
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font,
        margin: compact ? { t: 8, l: 36, r: 8, b: 28 } : narrow ? { t: 16, l: 44, r: 10, b: 40 } : { t: 24, l: 56, r: 24, b: multi ? 84 : 56 },
        showlegend: multi && !compact && series.length <= 12,
        legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: narrow ? -0.3 : -0.2, font: { size: 11, color: t.ink } },
        hoverlabel: { bgcolor: t.ink, font: { color: '#fff', family: font.family, size: 12 }, bordercolor: t.ink },
    };
    const unit = percent ? '%' : model.unit;
    const data = [];

    if (type === 'bar' || type === 'line') {
        const showText = !compact && !narrow && labels.length * series.length <= 16;
        series.forEach((s, i) => {
            const c = color(i);
            const hover = `<b>%{x}</b><br>${s.name}: %{y:.2f} ${s.unit}<extra></extra>`;
            if (type === 'bar') {
                data.push({
                    type: 'bar', x: labels, y: s.values, name: s.name, marker: { color: c },
                    text: showText ? s.values.map(fmt) : undefined, textposition: 'outside', cliponaxis: false,
                    textfont: { size: 11, color: t.ink }, hovertemplate: hover,
                });
            } else {
                data.push({
                    type: 'scatter', mode: 'lines+markers', x: labels, y: s.values, name: s.name,
                    line: { color: c, width: compact ? 2 : 3 }, marker: { color: c, size: compact ? 5 : 8 },
                    fill: multi ? 'none' : 'tozeroy', fillcolor: rgba(c, 0.08), hovertemplate: hover,
                });
            }
        });
        if (type === 'bar') layout.barmode = 'group';

        const peak = Math.max(0, ...series.flatMap((s) => s.values), ...refs.map((r) => r.value));
        layout.yaxis = {
            gridcolor: t.line, zeroline: false, showline: false, rangemode: 'tozero',
            range: [0, peak > 0 ? peak * (showText ? 1.18 : 1.1) : 1],
            title: compact || narrow ? undefined : { text: unit, font: { size: 12 } },
        };
        layout.xaxis = { gridcolor: 'rgba(0,0,0,0)', zeroline: false, showline: true, linecolor: t.line, tickangle: labels.length > (narrow ? 3 : 6) ? -35 : 0, automargin: true };

        layout.shapes = refs.map((r) => ({
            type: 'line', xref: 'paper', x0: 0, x1: 1, y0: r.value, y1: r.value,
            line: { color: r.kind === 'ul' ? t.bad : t.warn, width: 1.5, dash: 'dash' },
        }));
        layout.annotations = compact ? [] : refs.map((r) => ({
            xref: 'paper', x: 1, xanchor: 'right', y: r.value, yanchor: 'bottom', showarrow: false,
            text: `${r.label} ${fmt(r.value)}${percent ? '%' : ' ' + model.unit}`, font: { size: 11, color: r.kind === 'ul' ? t.bad : t.warn },
        }));
    } else if (type === 'pie') {
        const slices = multi ? series.map((s) => ({ l: s.name, v: s.values.reduce((a, b) => a + b, 0) })) : labels.map((l, i) => ({ l, v: series[0].values[i] }));
        const kept = slices.filter((s) => s.v > 0);
        data.push({
            type: 'pie', labels: kept.map((s) => s.l), values: kept.map((s) => s.v), hole: 0.5, sort: false,
            marker: { colors: kept.map((_, i) => color(i)), line: { color: '#fff', width: 2 } },
            textinfo: compact || narrow ? 'percent' : 'label+percent', textfont: { color: '#fff', size: compact ? 10 : 12 },
            hovertemplate: `<b>%{label}</b><br>%{value:.2f} ${unit}<br>%{percent}<extra></extra>`,
        });
        layout.showlegend = narrow;
        layout.legend = { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.05, font: { size: 11, color: t.ink } };
        layout.margin = { t: 12, l: 12, r: 12, b: narrow ? 70 : 12 };
    } else if (type === 'radar') {
        const closed = (a) => (a.length ? [...a, a[0]] : a);
        if (multi) {
            const spokes = series.map((s) => s.name);
            labels.forEach((l, i) => {
                const c = color(i);
                data.push({
                    type: 'scatterpolar', name: l, theta: closed(spokes), r: closed(series.map((s) => s.values[i])), fill: 'toself',
                    line: { color: c, width: 2 }, fillcolor: rgba(c, 0.12), hovertemplate: `<b>${l}</b><br>%{theta}: %{r:.2f} ${unit}<extra></extra>`,
                });
            });
            layout.showlegend = !compact && labels.length > 1 && labels.length <= 12;
        } else {
            const s = series[0];
            data.push({
                type: 'scatterpolar', name: s.name, theta: closed(labels), r: closed(s.values), fill: 'toself',
                line: { color: t.accent, width: 2 }, fillcolor: rgba(t.accent, 0.14), hovertemplate: `<b>%{theta}</b><br>${s.name}: %{r:.2f} ${s.unit}<extra></extra>`,
            });
            layout.showlegend = false;
        }
        const peak = Math.max(percent ? 100 : 0, ...series.flatMap((s) => s.values));
        layout.polar = {
            bgcolor: 'rgba(0,0,0,0)',
            radialaxis: { visible: true, range: [0, peak * 1.1 || 1], gridcolor: t.line, linecolor: t.line, ticksuffix: percent ? '%' : '', tickfont: { size: 10 } },
            angularaxis: { gridcolor: t.line, linecolor: t.line, tickfont: { size: compact || narrow ? 9 : 11, color: t.ink } },
        };
        layout.margin = compact ? { t: 16, l: 24, r: 24, b: 16 } : narrow ? { t: 20, l: 36, r: 36, b: multi ? 60 : 20 } : { t: 32, l: 48, r: 48, b: multi ? 64 : 32 };
    }
    return { data, layout, config: { displayModeBar: false, responsive: true, staticPlot: compact } };
};
