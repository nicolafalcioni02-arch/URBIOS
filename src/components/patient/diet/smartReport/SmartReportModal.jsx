import { useMemo } from 'react';
import { IconChart, IconClose, IconLine, IconPie, IconRadar, IconReset, IconSave } from '../ui/icons';
import { CHART_TYPES, METRICS, METRIC_GROUPS, typesFor } from './metrics';
import { buildReport, targetHint } from './reportModel';
import { ReportChart } from './ReportChart';

export const DEFAULT_REPORT_CONFIG = { type: 'bar', metric: 'kcal', scope: 'activeDay', dayId: null, comment: '', showTarget: true };

const TYPE_ICONS = { bar: IconChart, line: IconLine, pie: IconPie, radar: IconRadar };

export const SmartReportModal = ({ config, dietDays, foodDB, isOpen, kcalTarget, onClose, onSave, patientTargets, setConfig }) => {
    const model = useMemo(
        () => (isOpen ? buildReport({ config, dietDays, foodDB, patientTargets, kcalTarget }) : null),
        [isOpen, config, dietDays, foodDB, patientTargets, kcalTarget]
    );
    if (!isOpen || !model) return null;

    const set = (patch) => setConfig({ ...config, ...patch });
    const allowed = typesFor(config.metric);
    const hint = targetHint(config, model);
    const day = dietDays.find((d) => d.id === config.dayId) || dietDays[0];
    const subject = config.scope === 'allDays' ? 'Tutti i giorni' : day?.title || 'Giorno';

    return (
        <div className="sr-overlay" onClick={onClose}>
            <div className="sr-modal" onClick={(e) => e.stopPropagation()}>
                <div className="sr-head">
                    <div>
                        <div className="sr-title">Report grafico</div>
                        <div className="sr-sub">Scegli cosa mostrare: il grafico si aggiorna da solo</div>
                    </div>
                    <button className="sr-close" onClick={onClose} aria-label="Chiudi">
                        <IconClose />
                    </button>
                </div>

                <div className="sr-body">
                    <div className="sr-panel">
                        <div>
                            <div className="sr-label">Cosa confrontare</div>
                            <div className="sr-seg">
                                <button className={config.scope !== 'allDays' ? 'on' : ''} onClick={() => set({ scope: 'activeDay' })}>
                                    Pasti di un giorno
                                </button>
                                <button className={config.scope === 'allDays' ? 'on' : ''} onClick={() => set({ scope: 'allDays' })}>
                                    Tutti i giorni
                                </button>
                            </div>
                            {config.scope !== 'allDays' && dietDays.length > 1 && (
                                <select className="sr-select" style={{ marginTop: 8 }} value={day?.id ?? ''} onChange={(e) => set({ dayId: e.target.value })}>
                                    {dietDays.map((d, i) => (
                                        <option key={d.id} value={d.id}>
                                            {d.title || `Giorno ${i + 1}`}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <div className="sr-label">Metrica</div>
                            <select className="sr-select" value={config.metric} onChange={(e) => set({ metric: e.target.value })}>
                                {METRIC_GROUPS.map((g) => (
                                    <optgroup key={g} label={g}>
                                        {Object.entries(METRICS)
                                            .filter(([, v]) => v.group === g)
                                            .map(([id, v]) => (
                                                <option key={id} value={id}>
                                                    {v.label}
                                                </option>
                                            ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="sr-label">Tipo di grafico</div>
                            <div className="sr-types">
                                {CHART_TYPES.map(({ id, label }) => {
                                    const Icon = TYPE_ICONS[id];
                                    return (
                                        <button key={id} className={model.type === id ? 'on' : ''} disabled={!allowed.includes(id)} onClick={() => set({ type: id })}>
                                            <Icon /> {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className={`sr-check ${!model.canTarget ? 'off' : ''}`}>
                                <input type="checkbox" checked={config.showTarget !== false && model.canTarget} disabled={!model.canTarget} onChange={(e) => set({ showTarget: e.target.checked })} />
                                <span>Linea di riferimento</span>
                            </label>
                            {!model.canTarget && <div className="sr-hint">{hint}</div>}
                        </div>

                        <div className="sr-notes-wrap">
                            <div className="sr-label">Note cliniche</div>
                            <textarea className="sr-notes" value={config.comment} onChange={(e) => set({ comment: e.target.value })} placeholder="Osservazioni da stampare con il piano…" />
                        </div>
                    </div>

                    <div className="sr-chart-area">
                        <div className="sr-meta">
                            <span className="sr-tag">{subject}</span>
                            <span>{model.metric.label}</span>
                        </div>
                        <div className="sr-chart">
                            <ReportChart model={model} />
                        </div>
                        {model.notes.length > 0 && (
                            <div className="sr-notes-list">
                                {model.notes.map((n) => (
                                    <div key={n}>{n}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="sr-foot">
                    <button className="sr-btn" onClick={() => setConfig({ ...DEFAULT_REPORT_CONFIG })}>
                        <IconReset /> Ripristina
                    </button>
                    <button className="sr-btn primary" onClick={onSave} disabled={model.empty && !config.comment.trim()}>
                        <IconSave /> Salva nel piano
                    </button>
                </div>
            </div>
        </div>
    );
};
