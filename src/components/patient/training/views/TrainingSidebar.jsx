import React from 'react';

export const TrainingSidebar = ({
    open,
    activeDayInfo,
    addNewWeek,
    addDay,
    dragOverId,
    duplicateDay,
    duplicateWeek,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    handleDrop,
    removeDay,
    removeWeek,
    setActiveDayInfo,
    setDragOverId,
    setIsSettingsOpen,
    setIsSchedeOpen,
    weeks,
}) => {
    return (
        <nav className={`t-sidebar${open ? ' open' : ''}`} style={{ paddingBottom: 0 }}>
            <ul className="t-nav-list" style={{ paddingBottom: '20px' }}>
                {weeks.map((w, wIndex) => (
                    <div
                        key={w.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'week', { weekId: w.id })}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, 'week', w.id)}
                        onDragLeave={() => setDragOverId(null)}
                        onDrop={(e) => {
                            handleDrop(e, 'week', { weekId: w.id });
                            setDragOverId(null);
                        }}
                        className={dragOverId === w.id ? 'drag-over-active' : ''}
                        style={{ marginBottom: '10px', borderRadius: '12px', transition: '0.2s' }}
                    >
                        {/* LIVELLO SETTIMANA */}
                        <li className="t-nav-item premium-item" onClick={() => document.getElementById(w.id)?.scrollIntoView({ behavior: 'smooth' })}>
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <span style={{ fontWeight: 700, color: '#121317', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="ph ph-calendar-blank"></i> {w.title || `Settimana ${wIndex + 1}`}
                                </span>
                                {/* MINI SHORTCUTS A DESTRA */}
                                <div className="hover-actions">
                                    <i
                                        className="ph ph-copy mini-action"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            duplicateWeek(w.id);
                                        }}
                                    ></i>
                                    <i
                                        className="ph ph-trash mini-action del"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeWeek(w.id);
                                        }}
                                    ></i>
                                </div>
                            </div>
                        </li>

                        {/* LIVELLO GIORNI */}
                        {/* LIVELLO GIORNI */}
                        <div className="premium-subitem">
                            {w.days &&
                                w.days.map((d, dIndex) => {
                                    // Creiamo una costante per verificare se questo è il giorno attivo
                                    const isSelected = activeDayInfo?.dayId === d.id;

                                    return (
                                        <div
                                            key={d.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, 'day', { weekId: w.id, dayId: d.id })}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => handleDragOver(e, 'day', d.id)}
                                            onDragLeave={() => setDragOverId(null)}
                                            onDrop={(e) => {
                                                handleDrop(e, 'day', { weekId: w.id, dayId: d.id });
                                                setDragOverId(null);
                                            }}
                                            className={dragOverId === d.id ? 'drag-over-active' : ''}
                                            style={{ borderRadius: '8px', transition: '0.2s', marginBottom: '2px' }}
                                        >
                                            <li
                                                className="t-nav-item premium-item"
                                                style={{
                                                    padding: '6px 8px',
                                                    fontSize: '12px',
                                                    background: isSelected ? '#ECEDF1' : 'transparent',
                                                    color: isSelected ? '#121317' : '#555',
                                                }}
                                                onClick={() => setActiveDayInfo({ weekId: w.id, dayId: d.id })}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <i className="ph ph-lightning"></i> {d.title || `Giorno ${dIndex + 1}`}
                                                    </span>

                                                    {/* MINI SHORTCUTS A DESTRA */}
                                                    <div className="hover-actions">
                                                        <i
                                                            className="ph ph-copy mini-action"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                duplicateDay(w.id, d.id);
                                                            }}
                                                        ></i>
                                                        <i
                                                            className="ph ph-trash mini-action del"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeDay(w.id, d.id);
                                                            }}
                                                        ></i>
                                                    </div>
                                                </div>
                                            </li>

                                            {/* Miniature esercizi (Scompaiono se il giorno è selezionato per pulizia, o lasciale se preferisci) */}
                                            {!isSelected && (
                                                <div className="premium-subitem" style={{ marginBottom: '4px', marginLeft: '12px', borderLeft: 'none' }}>
                                                    {d.exercises &&
                                                        d.exercises.slice(0, 3).map((ex) => (
                                                            <div
                                                                key={ex.id}
                                                                style={{
                                                                    padding: '1px 4px',
                                                                    fontSize: '9px',
                                                                    color: '#999',
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                }}
                                                            >
                                                                • {ex.name || '...'}
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            <div
                                className="t-nav-item premium-item"
                                style={{ padding: '6px 8px', fontSize: '12px', color: '#6E6D69' }}
                                onClick={() => addDay(w.id)}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="ph ph-plus"></i> Aggiungi giorno
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </ul>

            {/* FOOTER FISSO */}
            <div className="t-sidebar-footer">
                <button className="t-btn-sidebar-action t-btn-new" onClick={addNewWeek}>
                    <i className="ph ph-plus-circle" style={{ fontSize: '16px' }}></i> Nuova Settimana
                </button>
                <button className="t-btn-sidebar-action t-btn-settings" onClick={() => setIsSettingsOpen(true)}>
                    <i className="ph ph-database" style={{ fontSize: '16px' }}></i> Gestione Esercizi
                </button>
                <button
                    className="t-btn-sidebar-action"
                    style={{ background: '#ECEDF1', color: '#121317', border: 'none' }}
                    onClick={() => setIsSchedeOpen(true)}
                >
                    <i className="ph ph-folder-notch" style={{ fontSize: '16px' }}></i> Schede Salvate
                </button>
            </div>
        </nav>
    );
};
