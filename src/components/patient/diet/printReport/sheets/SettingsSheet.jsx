import React from 'react';

export const SettingsSheet = ({ a4Style, savedReports, targetGrams, targets }) => {
    return (
        <div className="a4-sheet" style={a4Style}>
            <h2
                style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '24pt',
                    borderBottom: '2px solid #000',
                    paddingBottom: '10px',
                    marginBottom: '30px',
                }}
            >
                Impostazioni del Piano
            </h2>
            {targets?.isConfigured && (
                <div
                    style={{
                        marginBottom: '40px',
                        background: '#fafafa',
                        padding: '30px 20px',
                        borderRadius: '16px',
                        border: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <div>
                        <div style={{ fontSize: '10pt', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Obiettivo</div>
                        <div style={{ fontSize: '32pt', fontWeight: 800, color: '#111', lineHeight: 1 }}>
                            {targets.kcal} <span style={{ fontSize: '14pt', fontWeight: 500, color: '#666' }}>kcal</span>
                        </div>
                    </div>
                    <div style={{ width: '1px', height: '50px', background: '#e0e0e0' }}></div>
                    <div>
                        <div style={{ fontSize: '10pt', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Carboidrati ({targets.c}%)</div>
                        <div style={{ fontSize: '26pt', fontWeight: 700, color: '#111', lineHeight: 1 }}>
                            {targetGrams.c.toFixed(0)} <span style={{ fontSize: '14pt', fontWeight: 500, color: '#666' }}>g</span>
                        </div>
                    </div>
                    <div style={{ width: '1px', height: '50px', background: '#e0e0e0' }}></div>
                    <div>
                        <div style={{ fontSize: '10pt', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Proteine ({targets.p}%)</div>
                        <div style={{ fontSize: '26pt', fontWeight: 700, color: '#111', lineHeight: 1 }}>
                            {targetGrams.p.toFixed(0)} <span style={{ fontSize: '14pt', fontWeight: 500, color: '#666' }}>g</span>
                        </div>
                    </div>
                    <div style={{ width: '1px', height: '50px', background: '#e0e0e0' }}></div>
                    <div>
                        <div style={{ fontSize: '10pt', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Grassi ({targets.f}%)</div>
                        <div style={{ fontSize: '26pt', fontWeight: 700, color: '#111', lineHeight: 1 }}>
                            {targetGrams.f.toFixed(0)} <span style={{ fontSize: '14pt', fontWeight: 500, color: '#666' }}>g</span>
                        </div>
                    </div>
                </div>
            )}
            <div>
                <h3 style={{ fontSize: '14pt', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px' }}>
                    Note Professionali
                </h3>
                <div contentEditable suppressContentEditableWarning style={{ minHeight: '150px', outline: 'none' }}>
                    {savedReports && savedReports.filter((r) => r.config.comment).length > 0 ? (
                        savedReports
                            .filter((r) => r.config.comment)
                            .map((report, idx) => (
                                <div key={idx} style={{ marginBottom: '15px' }}>
                                    <strong style={{ fontSize: '9pt', color: '#666', textTransform: 'uppercase' }}>
                                        {report.date} - Riferimento: {report.dayTitle}:
                                    </strong>
                                    <br />
                                    <span style={{ fontSize: '11.5pt', lineHeight: 1.6 }}>{report.config.comment}</span>
                                </div>
                            ))
                    ) : (
                        <div style={{ fontSize: '11pt', fontStyle: 'italic', color: '#888' }}>Puoi scrivere qui le tue note personalizzate...</div>
                    )}
                </div>
            </div>
        </div>
    );
};
