import React from 'react';
import { Icon3D, IconChart, IconClose, IconLine, IconMixed, IconPie, IconRadar, IconReset, IconSave, IconTarget } from '../ui/icons';
import { METRIC_CATALOG } from '../data/metricCatalog';

export const SmartChartModal = ({ activeDay, isSmartOpen, plotRef, saveSmartReport, setIsSmartOpen, setSmartConfig, smartConfig }) => {
    return (
        isSmartOpen && (
            <div className="sc-modal-overlay">
                <div className="sc-modal">
                    {/* HEADER */}
                    <div className="sc-header">
                        <div>
                            <div className="sc-header-title">Smart Report Maker (BETA)</div>
                            <div className="sc-header-sub">Visualizzazione avanzata dati nutrizionali</div>
                        </div>
                        <button className="sc-close-btn" onClick={() => setIsSmartOpen(false)}>
                            <IconClose />
                        </button>
                    </div>

                    {/* BODY: pannello sx + grafico dx */}
                    <div className="sc-body">
                        {/* ── PANNELLO CONTROLLI ── */}
                        <div className="sc-panel">
                            {/* Scope */}
                            <div>
                                <div className="sc-section-label">Vista dati</div>
                                <div className="sc-scope-toggle">
                                    <button
                                        className={`sc-scope-btn ${smartConfig.scope === 'activeDay' ? 'active' : ''}`}
                                        onClick={() => setSmartConfig({ ...smartConfig, scope: 'activeDay' })}
                                    >
                                        Giorno
                                    </button>
                                    <button
                                        className={`sc-scope-btn ${smartConfig.scope === 'allDays' ? 'active' : ''}`}
                                        onClick={() => setSmartConfig({ ...smartConfig, scope: 'allDays' })}
                                    >
                                        Tutti i giorni
                                    </button>
                                </div>
                            </div>

                            {/* Tipo grafico */}
                            <div>
                                <div className="sc-section-label">Tipo di grafico</div>
                                <div className="sc-type-grid">
                                    {[
                                        { id: 'bar', label: 'Istogramma', Icon: IconChart },
                                        { id: 'line', label: 'Linea', Icon: IconLine },
                                        { id: 'pie', label: 'Torta', Icon: IconPie },
                                        { id: 'radar', label: 'Radar', Icon: IconRadar },
                                        { id: 'mixed', label: 'Misto', Icon: IconMixed },
                                        { id: '3d', label: 'Scatter 3D', Icon: Icon3D },
                                    ].map(({ id, label, Icon }) => (
                                        <button
                                            key={id}
                                            className={`sc-type-btn ${smartConfig.type === id ? 'active' : ''}`}
                                            onClick={() => setSmartConfig({ ...smartConfig, type: id })}
                                        >
                                            <Icon /> {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Metrica */}
                            <div>
                                <div className="sc-section-label">Metrica / Nutriente</div>
                                <select
                                    className="sc-select"
                                    value={smartConfig.metric}
                                    onChange={(e) => setSmartConfig({ ...smartConfig, metric: e.target.value })}
                                >
                                    {Object.entries(
                                        Object.entries(METRIC_CATALOG).reduce((groups, [key, meta]) => {
                                            if (!groups[meta.group]) groups[meta.group] = [];
                                            groups[meta.group].push({ key, ...meta });
                                            return groups;
                                        }, {})
                                    ).map(([groupName, items]) => (
                                        <optgroup key={groupName} label={`${groupName}`}>
                                            {items.map((item) => (
                                                <option key={item.key} value={item.key}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Toggle DRV */}
                            <div>
                                <div className="sc-section-label">Riferimento clinico</div>
                                <div
                                    className={`sc-drv-toggle ${smartConfig.showTarget ? 'active' : ''}`}
                                    onClick={() => setSmartConfig({ ...smartConfig, showTarget: !smartConfig.showTarget })}
                                >
                                    <IconTarget />
                                    <span className="sc-drv-toggle-label">Linea target EFSA / DRV</span>
                                    <div className="sc-toggle-pill">
                                        <div className="sc-toggle-dot" />
                                    </div>
                                </div>
                            </div>

                            {/* Note cliniche */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="sc-section-label">Note cliniche</div>
                                <textarea
                                    className="sc-notes"
                                    style={{ flex: 1 }}
                                    value={smartConfig.comment}
                                    onChange={(e) => setSmartConfig({ ...smartConfig, comment: e.target.value })}
                                    placeholder="Osservazioni, variazioni consigliate, feedback..."
                                />
                            </div>
                        </div>

                        {/* ── AREA GRAFICO ── */}
                        <div className="sc-chart-area">
                            <div className="sc-chart-meta">
                                <span className="sc-chart-tag">
                                    {smartConfig.scope === 'activeDay' ? activeDay?.title || 'Giorno corrente' : 'Piano completo'}
                                </span>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#C7C7CC', }}>
                                    {METRIC_CATALOG[smartConfig.metric]?.label || '-'}
                                    {' · '}
                                    {smartConfig.type.toUpperCase()}
                                </span>
                            </div>

                            <div className="sc-chart-container">
                                <div ref={plotRef} style={{ width: '100%', height: '100%' }} />
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="sc-footer">
                        <button
                            className="sc-btn-reset"
                            onClick={() => setSmartConfig({ type: 'bar', metric: 'kcal', scope: 'activeDay', comment: '', showTarget: true })}
                        >
                            <IconReset /> Resetta
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '10px', color: '#C7C7CC', fontWeight: 500 }}>Il grafico verrà salvato nell'archivio</span>
                            <button className="sc-btn-save" onClick={saveSmartReport}>
                                <IconSave /> Salva report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};
