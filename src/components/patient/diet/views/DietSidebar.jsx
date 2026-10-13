import React from 'react';

export const DietSidebar = ({
    activeMealInfo,
    addNewDay,
    dietDays,
    dragOverId,
    duplicateDay,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    handleDrop,
    removeDay,
    open,
    setActiveMealInfo,
    setDragOverId,
    setIsDbOpen,
    setIsSetupOpen,
    targets,
}) => {
    return (
        <nav className={`t-sidebar${open ? ' open' : ''}`} style={{ paddingBottom: 0 }}>
            {/* 2. INDICE DRAG & DROP DEI GIORNI E PASTI */}
            {/* 2. INDICE DRAG & DROP DEI GIORNI E LISTA PASTI SINCRONIZZATA */}
            <ul className="t-nav-list" style={{ paddingBottom: '20px' }}>
                {dietDays.map((day, dIndex) => (
                    <div
                        key={day.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'day', { dayId: day.id })}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, 'day', day.id)}
                        onDragLeave={() => setDragOverId(null)}
                        onDrop={(e) => {
                            handleDrop(e, 'day', { dayId: day.id });
                            setDragOverId(null);
                        }}
                        className={dragOverId === day.id ? 'drag-over-active' : ''}
                        style={{ marginBottom: '10px', borderRadius: '12px', transition: '0.2s' }}
                    >
                        {/* LIVELLO 1: IL GIORNO (Spostabile e Duplicabile) */}
                        <li className="premium-item" style={{ cursor: 'grab', color: '#121317' }}>
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {day.title || `Giorno ${dIndex + 1}`}
                                </span>
                                {/* MENU HOVER A DESTRA PER IL GIORNO */}
                                <div className="hover-actions">
                                    <span
                                        className="mini-action"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            duplicateDay(day.id);
                                        }}
                                    >
                                        Copia
                                    </span>
                                    <span
                                        className="mini-action del"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeDay(day.id);
                                        }}
                                    >
                                        Del
                                    </span>
                                </div>
                            </div>
                        </li>

                        {/* LIVELLO 2: I PASTI DEL GIORNO (Sola Lettura / Navigazione) */}
                        <div className="premium-subitem">
                            {day.meals &&
                                day.meals.map((meal, mIndex) => {
                                    const isSelected = activeMealInfo?.mealId === meal.id;
                                    const foodCount = meal.items ? meal.items.length : 0; // Conta quanti alimenti ci sono

                                    return (
                                        <div key={meal.id} style={{ borderRadius: '8px', transition: '0.2s', marginBottom: '2px' }}>
                                            <li
                                                className={`premium-item ${isSelected ? 'active-meal' : ''}`}
                                                style={{ padding: '8px 10px', fontSize: '13px', cursor: 'pointer', border: 'none' }}
                                                onClick={() => setActiveMealInfo({ dayId: day.id, mealId: meal.id })}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                    <span style={{ fontWeight: isSelected ? 800 : 600 }}>{meal.title || `Pasto ${mIndex + 1}`}</span>

                                                    {/* BADGE: Mostra il numero di alimenti inseriti */}
                                                    {foodCount > 0 && (
                                                        <span
                                                            style={{
                                                                fontSize: '10px',
                                                                background: isSelected ? '#1F8A5B' : '#E6E4DE',
                                                                color: isSelected ? 'white' : '#6E6D69',
                                                                padding: '2px 6px',
                                                                borderRadius: '10px',
                                                                fontWeight: 800,
                                                            }}
                                                        >
                                                            {foodCount} cibi
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ))}
            </ul>

            {/* 3. FOOTER FISSO DELLA SIDEBAR (Pulsanti globali) */}
            <div className="t-sidebar-footer">
                <button
                    className="t-btn-sidebar-action t-btn-new"
                    onClick={targets?.isConfigured ? addNewDay : undefined}
                    disabled={!targets?.isConfigured}
                    style={
                        !targets?.isConfigured
                            ? {
                                  opacity: 0.3,
                                  cursor: 'not-allowed',
                                  filter: 'grayscale(1)',
                                  pointerEvents: 'none',
                              }
                            : {}
                    }
                >
                    + Nuovo Giorno
                </button>

                <button
                    className="t-btn-sidebar-action t-btn-settings"
                    onClick={targets?.isConfigured ? () => setIsSetupOpen(true) : undefined}
                    disabled={!targets?.isConfigured}
                    style={
                        !targets?.isConfigured
                            ? {
                                  opacity: 0.3,
                                  cursor: 'not-allowed',
                                  filter: 'grayscale(1)',
                                  pointerEvents: 'none',
                                  background: '#F6F5F2',
                                  color: '#121317',
                                  border: 'none',
                              }
                            : {
                                  background: '#F6F5F2',
                                  color: '#121317',
                                  border: 'none',
                              }
                    }
                >
                    Setup Obiettivi
                </button>

                <button className="t-btn-sidebar-action t-btn-settings" onClick={() => setIsDbOpen(true)}>
                    Database Alimenti
                </button>
            </div>
        </nav>
    );
};
