import React from 'react';
import ReactDOM from 'react-dom';
import { getSchede, summarize } from '../logic/trainingModel';

const fmt = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('it-IT');
};

const btn = { border: '1px solid #ddd', background: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };

// "Schede Salvate": le schede di questo paziente (si può averne più d'una: mesocicli, fasi, ecc.)
export const SchedeModal = ({ patient, schedaId, header, weeks, onOpen, onNew, onDuplicate, onDelete, onClose }) => {
    const saved = getSchede(patient);
    const isCurrentSaved = saved.some((s) => s.id === schedaId);
    const rows = isCurrentSaved ? saved : [...saved, { id: schedaId, ...header, weeks, _unsaved: true }];

    return ReactDOM.createPortal(
        <div className="t-modal-overlay" style={{ display: 'flex', zIndex: 25000 }} onClick={onClose}>
            <div
                className="t-modal-card"
                style={{ width: 640, height: 'auto', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Schede salvate</h2>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            style={{ ...btn, background: '#121317', color: '#fff', border: 'none' }}
                            onClick={() => {
                                onNew();
                                onClose();
                            }}
                        >
                            + Nuova scheda
                        </button>
                        <button style={btn} onClick={onClose}>
                            Chiudi
                        </button>
                    </div>
                </div>
                <p style={{ fontSize: 12, color: '#6E6D69', margin: '0 0 12px' }}>
                    Ogni paziente può avere più schede (per esempio un mesociclo dopo l'altro). Le modifiche vengono salvate in automatico nell'archivio.
                </p>
                <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {rows.map((s) => {
                        const sum = summarize(s);
                        const active = s.id === schedaId;
                        return (
                            <div
                                key={s.id}
                                style={{
                                    border: active ? '2px solid #121317' : '1px solid #E6E4DE',
                                    borderRadius: 14,
                                    padding: '12px 14px',
                                    background: active ? '#F2F8FF' : '#fff',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 15 }}>
                                            {s.titolo || 'Scheda senza titolo'}
                                            {active && (
                                                <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#121317', textTransform: '' }}>
                                                    in uso
                                                </span>
                                            )}
                                            {s._unsaved && (
                                                <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, color: '#6E6D69' }}>
                                                    (vuota, non ancora salvata)
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#6E6D69', marginTop: 2 }}>
                                            {[s.obiettivo, fmt(s.data)].filter(Boolean).join(' · ') || '-'} · {sum.weeks} sett. · {sum.days} giorni ·{' '}
                                            {sum.exercises} esercizi
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                        {!active && (
                                            <button
                                                style={btn}
                                                onClick={() => {
                                                    onOpen(s.id);
                                                    onClose();
                                                }}
                                            >
                                                Apri
                                            </button>
                                        )}
                                        {!s._unsaved && (
                                            <button
                                                style={btn}
                                                onClick={() => {
                                                    onDuplicate(s.id);
                                                    onClose();
                                                }}
                                            >
                                                Duplica
                                            </button>
                                        )}
                                        {!s._unsaved && (
                                            <button
                                                style={{ ...btn, color: '#C2413A' }}
                                                onClick={() => window.confirm('Eliminare questa scheda?') && onDelete(s.id)}
                                            >
                                                Elimina
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>,
        document.body
    );
};
