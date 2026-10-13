import React from 'react';
import { getExerciseImages } from '../logic/exerciseMedia';

export const ExerciseDatabaseModal = ({
    addCatalog,
    addExerciseToDB,
    dbSearch,
    deleteExDB,
    exerciseDB,
    exportJSON,
    fileInputRef,
    importJSON,
    isSettingsOpen,
    newEx,
    openPhotos,
    resetDatabase,
    setDbSearch,
    setIsSettingsOpen,
    setNewEx,
    updateDbEx,
}) => {
    return (
        isSettingsOpen && (
            <div className="t-modal-overlay" style={{ display: 'flex' }}>
                <div className="t-modal-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
                        <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Gestione Database Esercizi</h3>
                        <button className="t-icon-btn" onClick={() => setIsSettingsOpen(false)}>
                            <i className="ph ph-x"></i>
                        </button>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 40px',
                            gap: '10px',
                            marginBottom: '10px',
                            padding: '10px',
                            background: '#ECEDF1',
                            borderRadius: '10px',
                            border: '1px solid #121317',
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Nome Nuovo Esercizio"
                            value={newEx.name}
                            onChange={(e) => setNewEx({ ...newEx, name: e.target.value })}
                            style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                        />
                        <input
                            type="text"
                            placeholder="Gruppo (es. Petto)"
                            value={newEx.group}
                            onChange={(e) => setNewEx({ ...newEx, group: e.target.value })}
                            style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                        />
                        <input
                            type="text"
                            placeholder="Tipo (es. Forza)"
                            value={newEx.type}
                            onChange={(e) => setNewEx({ ...newEx, type: e.target.value })}
                            style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                        />
                        <button
                            onClick={addExerciseToDB}
                            style={{
                                background: '#121317',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0 15px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            +
                        </button>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            marginBottom: '20px',
                            flexShrink: 0,
                            background: '#F2F2F7',
                            padding: '10px',
                            borderRadius: '12px',
                        }}
                    >
                        <i className="ph ph-magnifying-glass" style={{ fontSize: '20px', color: '#888', alignSelf: 'center' }}></i>
                        <input
                            type="text"
                            placeholder="Cerca nel database..."
                            value={dbSearch}
                            onChange={(e) => setDbSearch(e.target.value)}
                            style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', padding: '8px 12px', fontSize: '14px' }}
                        />
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #E6E4DE', borderRadius: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            width: '64px',
                                            position: 'sticky',
                                            top: 0,
                                            background: '#FAFAFA',
                                            padding: '10px',
                                            textAlign: 'left',
                                            fontSize: '11px',
                                            textTransform: '',
                                            color: '#888',
                                            borderBottom: '1px solid #ddd',
                                            zIndex: 2,
                                        }}
                                    >
                                        Foto
                                    </th>
                                    <th
                                        style={{
                                            width: '50%',
                                            position: 'sticky',
                                            top: 0,
                                            background: '#FAFAFA',
                                            padding: '10px',
                                            textAlign: 'left',
                                            fontSize: '11px',
                                            textTransform: '',
                                            color: '#888',
                                            borderBottom: '1px solid #ddd',
                                            zIndex: 2,
                                        }}
                                    >
                                        Esercizio
                                    </th>
                                    <th
                                        style={{
                                            width: '25%',
                                            position: 'sticky',
                                            top: 0,
                                            background: '#FAFAFA',
                                            padding: '10px',
                                            textAlign: 'left',
                                            fontSize: '11px',
                                            textTransform: '',
                                            color: '#888',
                                            borderBottom: '1px solid #ddd',
                                            zIndex: 2,
                                        }}
                                    >
                                        Gruppo
                                    </th>
                                    <th
                                        style={{
                                            width: '20%',
                                            position: 'sticky',
                                            top: 0,
                                            background: '#FAFAFA',
                                            padding: '10px',
                                            textAlign: 'left',
                                            fontSize: '11px',
                                            textTransform: '',
                                            color: '#888',
                                            borderBottom: '1px solid #ddd',
                                            zIndex: 2,
                                        }}
                                    >
                                        Tipo
                                    </th>
                                    <th
                                        style={{
                                            width: '5%',
                                            position: 'sticky',
                                            top: 0,
                                            background: '#FAFAFA',
                                            padding: '10px',
                                            borderBottom: '1px solid #ddd',
                                            zIndex: 2,
                                        }}
                                    ></th>
                                </tr>
                            </thead>
                            <tbody>
                                {exerciseDB.map((ex, index) => {
                                    if (
                                        dbSearch &&
                                        !ex.name.toLowerCase().includes(dbSearch.toLowerCase()) &&
                                        !ex.group.toLowerCase().includes(dbSearch.toLowerCase())
                                    )
                                        return null;
                                    const thumb = getExerciseImages(ex.name, exerciseDB)[0];
                                    return (
                                        <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                                                <button
                                                    title="Foto dell'esercizio: gestisci le tue foto"
                                                    style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                                                    onClick={() => openPhotos({ name: ex.name, group: ex.group })}
                                                >
                                                    {thumb ? (
                                                        <img
                                                            src={thumb}
                                                            alt=""
                                                            style={{ width: 44, height: 30, objectFit: 'cover', borderRadius: 4, display: 'block' }}
                                                        />
                                                    ) : (
                                                        <span
                                                            style={{
                                                                display: 'flex',
                                                                width: 44,
                                                                height: 30,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: '1px dashed #ccc',
                                                                borderRadius: 4,
                                                                color: '#bbb',
                                                            }}
                                                        >
                                                            +
                                                        </span>
                                                    )}
                                                </button>
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <input
                                                    value={ex.name}
                                                    onChange={(e) => updateDbEx(index, 'name', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        border: '1px solid transparent',
                                                        background: 'transparent',
                                                        padding: '5px',
                                                        borderRadius: '4px',
                                                        fontSize: '13px',
                                                        fontFamily: 'inherit',
                                                        color: '#121317',
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <input
                                                    value={ex.group}
                                                    onChange={(e) => updateDbEx(index, 'group', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        border: '1px solid transparent',
                                                        background: 'transparent',
                                                        padding: '5px',
                                                        borderRadius: '4px',
                                                        fontSize: '13px',
                                                        fontFamily: 'inherit',
                                                        color: '#121317',
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <input
                                                    value={ex.type}
                                                    onChange={(e) => updateDbEx(index, 'type', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        border: '1px solid transparent',
                                                        background: 'transparent',
                                                        padding: '5px',
                                                        borderRadius: '4px',
                                                        fontSize: '13px',
                                                        fontFamily: 'inherit',
                                                        color: '#121317',
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                                <i
                                                    className="ph ph-trash"
                                                    style={{ color: '#C2413A', cursor: 'pointer' }}
                                                    onClick={() => deleteExDB(index)}
                                                ></i>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div
                        style={{
                            marginTop: '20px',
                            paddingTop: '15px',
                            borderTop: '1px solid #E6E4DE',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #ddd',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: '#555',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                                onClick={exportJSON}
                            >
                                <i className="ph ph-download-simple"></i> Export
                            </button>
                            <button
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #ddd',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: '#555',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <i className="ph ph-upload-simple"></i> Import
                            </button>
                            <button
                                title="Aggiunge gli esercizi del catalogo (con figure) che non hai ancora"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #ddd',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: '#555',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                                onClick={addCatalog}
                            >
                                <i className="ph ph-images"></i> Catalogo
                            </button>
                            <input type="file" ref={fileInputRef} accept=".json" style={{ display: 'none' }} onChange={importJSON} />
                        </div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                            Modifica diretta • <span>{exerciseDB.length}</span> esercizi
                        </div>
                        <span style={{ color: '#C2413A', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }} onClick={resetDatabase}>
                            Reset
                        </span>
                    </div>
                </div>
            </div>
        )
    );
};
