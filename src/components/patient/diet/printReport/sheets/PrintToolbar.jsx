import React from 'react';

export const PrintToolbar = ({ onClose }) => {
    return (
        <div
            id="editor-toolbar"
            style={{
                position: 'sticky',
                top: 0,
                background: '#1D1D1F',
                color: 'white',
                padding: '15px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100,
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            }}
        >
            <div style={{ fontSize: '12pt', fontWeight: 600 }}>Fascicolo Nutrizionale</div>
            <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ fontSize: '9pt', color: '#aaa', alignSelf: 'center', marginRight: '10px' }}></div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        color: 'white',
                        border: '1px solid #555',
                        padding: '8px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}
                >
                    Chiudi Editor
                </button>
                <button
                    onClick={() => window.print()}
                    style={{
                        background: '#007AFF',
                        color: 'white',
                        border: 'none',
                        padding: '8px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}
                >
                    Stampa
                </button>
            </div>
        </div>
    );
};
