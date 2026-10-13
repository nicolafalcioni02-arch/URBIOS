import React from 'react';
import { SaveIcon } from '../ui/icons';
import { calculateTotals } from '../logic/dietTotals';

export const SaveMealToLibraryModal = ({ confirmSaveToLibrary, isSaveModalOpen, mealToSave, setIsSaveModalOpen, setMealToSave }) => {
    return (
        isSaveModalOpen &&
        mealToSave && (
            <div className="modal-backdrop" style={{ zIndex: 12000 }}>
                <div className="modal-window" style={{ maxWidth: '450px', height: 'auto', padding: '30px' }}>
                    <div className="save-modal-icon">
                        <SaveIcon />
                    </div>

                    <h3 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 900, marginBottom: '10px' }}>Salva nella Libreria</h3>
                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#6E6D69', marginBottom: '25px' }}>
                        Verrà creato un riferimento globale riutilizzabile in qualsiasi piano.
                    </p>

                    <div className="t-input-floating">
                        <label>Nome del Pasto</label>
                        <input
                            type="text"
                            value={mealToSave.customName}
                            onChange={(e) => setMealToSave({ ...mealToSave, customName: e.target.value })}
                            placeholder="Es: Colazione Proteica Standard"
                        />
                    </div>

                    {/* ANTEPRIMA CONTENUTO (Quello che hai chiesto: non solo macro) */}
                    <div style={{ background: '#FBFAF8', padding: '20px', borderRadius: '18px', border: '1px solid #E6E4DE', marginBottom: '25px' }}>
                        <span
                            style={{ fontSize: '10px', fontWeight: 800, color: '#6E6D69', textTransform: '', display: 'block', marginBottom: '12px' }}
                        >
                            Anteprima Alimenti ({mealToSave.items.length})
                        </span>
                        <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '15px' }}>
                            {mealToSave.items.map((it, idx) => (
                                <div key={idx} className="preview-badge">
                                    <span>{it.name || 'Alimento'}</span>
                                    <span style={{ color: '#1F8A5B' }}>{it.weight}g</span>
                                </div>
                            ))}
                        </div>

                        {/* Caratteristiche Macro in linea */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E6E4DE', paddingTop: '10px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '9px', fontWeight: 800, color: '#6E6D69' }}>KCAL</div>
                                <div style={{ fontSize: '14px', fontWeight: 900 }}>{calculateTotals(mealToSave.items).kcal.toFixed(0)}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '9px', fontWeight: 800, color: '#6E6D69' }}>PRO</div>
                                <div style={{ fontSize: '14px', fontWeight: 900, color: '#1F8A5B' }}>{calculateTotals(mealToSave.items).p.toFixed(0)}g</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '9px', fontWeight: 800, color: '#6E6D69' }}>CAR</div>
                                <div style={{ fontSize: '14px', fontWeight: 900 }}>{calculateTotals(mealToSave.items).c.toFixed(0)}g</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '9px', fontWeight: 800, color: '#6E6D69' }}>FAT</div>
                                <div style={{ fontSize: '14px', fontWeight: 900 }}>{calculateTotals(mealToSave.items).f.toFixed(0)}g</div>
                            </div>
                        </div>
                    </div>

                    <textarea
                        placeholder="Aggiungi una nota clinica (es: Post-Workout)..."
                        value={mealToSave.note}
                        onChange={(e) => setMealToSave({ ...mealToSave, note: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid #E6E4DE',
                            fontSize: '13px',
                            marginBottom: '20px',
                            minHeight: '60px',
                            outline: 'none',
                        }}
                    />

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setIsSaveModalOpen(false)}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                border: 'none',
                                background: '#F2F2F7',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Annulla
                        </button>
                        <button
                            onClick={confirmSaveToLibrary}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                border: 'none',
                                background: '#121317',
                                color: 'white',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                            }}
                        >
                            Salva Modifiche
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};
