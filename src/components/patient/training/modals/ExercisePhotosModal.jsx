import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { findDbEntry, getCatalogImages, getOwnPhotos, resizeImageFile } from '../logic/exerciseMedia';

const MAX_PHOTOS = 4;
const btn = { border: '1px solid #ddd', background: '#fff', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' };

// Foto dell'esecuzione fatte dal professionista. Si salvano nel database esercizi: da lì compaiono in tutte le schede e nella stampa.
export const ExercisePhotosModal = ({ exercise, exerciseDB, onSave, onClose }) => {
    const name = exercise.name;
    const entry = findDbEntry(name, exerciseDB);
    const catalog = getCatalogImages(name);
    const [photos, setPhotos] = useState(() => getOwnPhotos(name, exerciseDB));
    const [useCatalog, setUseCatalog] = useState(!!(entry && entry.useCatalog));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const add = async (files) => {
        setBusy(true);
        setError('');
        try {
            const out = [];
            for (const f of Array.from(files)) {
                if (photos.length + out.length >= MAX_PHOTOS) break;
                out.push(await resizeImageFile(f));
            }
            setPhotos((p) => [...p, ...out]);
        } catch {
            setError('Una delle immagini non è valida.');
        }
        setBusy(false);
    };

    const move = (i, d) =>
        setPhotos((p) => {
            const a = [...p];
            const j = i + d;
            if (j < 0 || j >= a.length) return a;
            [a[i], a[j]] = [a[j], a[i]];
            return a;
        });

    return ReactDOM.createPortal(
        <div className="t-modal-overlay" style={{ display: 'flex', zIndex: 26000 }} onClick={onClose}>
            <div
                className="t-modal-card"
                style={{ width: 720, height: 'auto', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Foto dell'esercizio</h2>
                        <div style={{ fontSize: 14, color: '#6E6D69', marginTop: 2 }}>{name || '(senza nome)'}</div>
                    </div>
                    <button style={btn} onClick={onClose}>
                        Annulla
                    </button>
                </div>
                {!name && <p style={{ color: '#C2413A', fontSize: 13 }}>Scrivi prima il nome dell'esercizio: le foto vengono collegate al nome.</p>}
                <p style={{ fontSize: 12, color: '#6E6D69', margin: '0 0 12px' }}>
                    Fotografa l'esecuzione (posizione iniziale e finale): le foto restano nell'archivio, si riusano in ogni scheda con questo esercizio e
                    vengono stampate. Massimo {MAX_PHOTOS}. Da telefono puoi scattarle direttamente.
                </p>

                <div style={{ overflowY: 'auto' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                        {photos.map((src, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                                <img
                                    src={src}
                                    alt=""
                                    style={{ width: 150, height: 112, objectFit: 'cover', borderRadius: 12, border: '1px solid #E6E4DE', display: 'block' }}
                                />
                                <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4 }}>
                                    {i > 0 && (
                                        <button title="Sposta prima" style={{ ...btn, padding: '2px 7px' }} onClick={() => move(i, -1)}>
                                            ←
                                        </button>
                                    )}
                                    {i < photos.length - 1 && (
                                        <button title="Sposta dopo" style={{ ...btn, padding: '2px 7px' }} onClick={() => move(i, 1)}>
                                            →
                                        </button>
                                    )}
                                    <button
                                        title="Elimina"
                                        style={{ ...btn, padding: '2px 7px', color: '#C2413A' }}
                                        onClick={() => setPhotos((p) => p.filter((_, k) => k !== i))}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                        {photos.length < MAX_PHOTOS && (
                            <label
                                style={{
                                    width: 150,
                                    height: 112,
                                    borderRadius: 12,
                                    border: '2px dashed #C7C7CC',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6E6D69',
                                    cursor: busy ? 'wait' : 'pointer',
                                    fontSize: 13,
                                    fontWeight: 700,
                                }}
                            >
                                <i className="ph ph-camera-plus" style={{ fontSize: 28 }}></i>
                                {busy ? 'Caricamento…' : 'Aggiungi foto'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        add(e.target.files);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        )}
                    </div>
                    {error && <p style={{ color: '#C2413A', fontSize: 13 }}>{error}</p>}

                    {catalog.length > 0 && (
                        <div style={{ borderTop: '1px solid #EEE', paddingTop: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#6E6D69', textTransform: '', marginBottom: 8 }}>
                                Figure del catalogo
                            </div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                {catalog.map((src, i) => (
                                    <img
                                        key={i}
                                        src={src}
                                        alt=""
                                        style={{ width: 110, borderRadius: 8, border: '1px solid #E6E4DE', opacity: photos.length && !useCatalog ? 0.4 : 1 }}
                                    />
                                ))}
                                {photos.length > 0 && (
                                    <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={useCatalog} onChange={(e) => setUseCatalog(e.target.checked)} /> Mostra anche queste
                                    </label>
                                )}
                            </div>
                            {photos.length === 0 && (
                                <p style={{ fontSize: 12, color: '#6E6D69', marginTop: 6 }}>Verranno usate queste figure finché non aggiungi le tue.</p>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                    <button
                        style={{ ...btn, background: '#121317', color: '#fff', border: 'none' }}
                        disabled={!name || busy}
                        onClick={() => {
                            onSave(exercise, photos, useCatalog);
                            onClose();
                        }}
                    >
                        Salva
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
