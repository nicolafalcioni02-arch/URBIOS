import React from 'react';

export const FinalSheet = ({ a4Style, fullDisclaimer, prof }) => {
    return (
        <div className="a4-sheet" style={a4Style}>
            <div>
                <h2
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '24pt',
                        borderBottom: '2px solid #000',
                        paddingBottom: '10px',
                        marginBottom: '20px',
                    }}
                >
                    Diario delle Misurazioni
                </h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ccc', padding: '12px', background: '#fafafa' }}>Data</th>
                            <th style={{ border: '1px solid #ccc', padding: '12px', background: '#fafafa' }}>Peso (kg)</th>
                            <th style={{ border: '1px solid #ccc', padding: '12px', background: '#fafafa' }}>Vita (cm)</th>
                            <th style={{ border: '1px solid #ccc', padding: '12px', background: '#fafafa' }}>Fianchi (cm)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5, 6].map((row) => (
                            <tr key={row}>
                                <td style={{ border: '1px solid #ccc', padding: '25px 10px' }}></td>
                                <td style={{ border: '1px solid #ccc', padding: '25px 10px' }}></td>
                                <td style={{ border: '1px solid #ccc', padding: '25px 10px' }}></td>
                                <td style={{ border: '1px solid #ccc', padding: '25px 10px' }}></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ flex: 1 }}></div> {/* Spinge giù il pedice */}
            <div style={{ borderTop: '2px solid #000', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0px' }}>
                    <div style={{ width: '65%', fontSize: '6.5pt', color: '#666', lineHeight: 1.4, textAlign: 'justify' }}>
                        <strong>DISCLAIMER LEGALE:</strong>
                        <br />
                        <span contentEditable suppressContentEditableWarning style={{ outline: 'none' }}>
                            {fullDisclaimer}
                        </span>
                    </div>
                    <div style={{ width: '30%', textAlign: 'center' }}>
                        <div style={{ borderBottom: '1px solid #000', height: '40px', marginBottom: '5px' }}></div>
                        <div style={{ fontSize: '8pt', textTransform: 'uppercase', fontWeight: 600 }}>Timbro e Firma</div>
                        <div contentEditable suppressContentEditableWarning style={{ fontSize: '7pt', color: '#666', marginTop: '2px', outline: 'none' }}>
                            {prof.nome}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
