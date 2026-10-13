import React from 'react';

export const CoverSheet = ({ a4Style, patient, prof, today }) => {
    return (
        <div className="a4-sheet" style={a4Style}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '20px', borderBottom: '2px solid #000' }}>
                <div style={{ width: '60%' }}>
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '26pt',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.5px',
                            lineHeight: 1,
                            outline: 'none',
                        }}
                    >
                        {prof.nome}
                    </div>
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        style={{ fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '5px', color: '#666', outline: 'none' }}
                    >
                        {prof.titolo_professionale}
                    </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '9pt', color: '#444', lineHeight: 1.6 }}>
                    <div contentEditable suppressContentEditableWarning style={{ outline: 'none' }}>
                        {prof.indirizzo_studio} - {prof.citta_studio}
                    </div>
                    <div contentEditable suppressContentEditableWarning style={{ outline: 'none' }}>
                        Albo n. {prof.numero_albo} | P.IVA {prof.p_iva}
                    </div>
                    {today && (
                        <div>
                            Data emissione: <strong>{today}</strong>
                        </div>
                    )}
                </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ fontSize: '12pt', textTransform: 'uppercase', letterSpacing: '3px', color: '#888', marginBottom: '10px' }}>
                    Programma Personalizzato
                </div>
                <h1
                    contentEditable
                    suppressContentEditableWarning
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '46pt',
                        margin: '0 0 60px 0',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: '#111',
                        outline: 'none',
                    }}
                >
                    Piano
                    <br />
                    Nutrizionale
                </h1>
                <div
                    contentEditable
                    suppressContentEditableWarning
                    style={{
                        fontSize: '12pt',
                        fontStyle: 'italic',
                        color: '#555',
                        maxWidth: '70%',
                        lineHeight: 1.6,
                        margin: '0 auto 80px auto',
                        outline: 'none',
                    }}
                >
                    "La cura del corpo inizia con la consapevolezza. Questo percorso è stato studiato su misura per accompagnarti verso il tuo obiettivo di
                    salute e benessere."
                </div>
                <div style={{ padding: '30px 40px', border: '1px solid #ddd', borderRadius: '12px', background: '#fafafa', width: '70%' }}>
                    <div style={{ fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', marginBottom: '10px' }}>
                        Preparato in esclusiva per
                    </div>
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        style={{ fontSize: '26pt', fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#000', outline: 'none' }}
                    >
                        {patient?.nome} {patient?.cognome}
                    </div>
                </div>
            </div>
        </div>
    );
};
