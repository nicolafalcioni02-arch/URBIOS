import React from 'react';

// Una pagina del quaderno di laboratorio, A4 a tutta pagina (si mette in un Sheet "bare" del Centro stampa).
// Quadretti da 5 mm; il testo sta una riga per quadretto. Pari: numero a destra, dispari: a sinistra (come un quaderno aperto).
export const notebookCss = `
.nb { position: absolute; inset: 0; font-family: 'Inter', system-ui, sans-serif; color: #1b1b1f; }
.nb * { box-sizing: border-box; }
.nb-num { position: absolute; top: 9mm; width: 9mm; height: 5.5mm; background: #1b1b1f; color: #fff; font: 700 9pt/5.5mm 'Inter', sans-serif; text-align: center; }
.nb-num.l { left: 12.5mm; } .nb-num.r { right: 12.5mm; }
.nb-lbl { font: 600 6.5pt/1 'Inter', sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #3d4047; }
.nb-field { position: absolute; display: flex; align-items: flex-end; gap: 2mm; height: 5mm; border-bottom: .25mm solid #1b1b1f; padding-bottom: .6mm; font-size: 9.5pt; line-height: 1; white-space: nowrap; }
.nb-field > span:last-child { flex: 1; overflow: hidden; text-overflow: clip; }
.nb-grid { position: absolute; left: 12.5mm; top: 29mm; width: 185mm; height: 230mm; border: .3mm solid #5d6068; overflow: hidden; padding-top: 5mm;
  background-image: linear-gradient(#a9adb5 .22mm, transparent .22mm), linear-gradient(90deg, #a9adb5 .22mm, transparent .22mm); background-size: 5mm 5mm; background-position: -.09mm -.09mm; }
.nb-ln { height: 5mm; padding: 0 2.5mm; font-size: 9.5pt; line-height: 5mm; white-space: pre; overflow: hidden; }
.nb-ln.h { font-weight: 700; font-size: 8pt; letter-spacing: .08em; }
.nb-ref { position: absolute; font: 500 6.5pt/1 'Inter', sans-serif; color: #3d4047; background: #fff; padding: .6mm 1.6mm; z-index: 1; }
.nb-ref.f { left: 0; top: 0; border-right: .25mm solid #5d6068; border-bottom: .25mm solid #5d6068; }
.nb-ref.t { right: 0; bottom: 0; border-left: .25mm solid #5d6068; border-top: .25mm solid #5d6068; }
.nb-foot { position: absolute; left: 12.5mm; top: 259mm; width: 185mm; height: 24mm; display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: 12mm 12mm; border: .3mm solid #5d6068; border-top: 0; }
.nb-cell { border-top: .25mm solid #8a8d94; border-left: .25mm solid #8a8d94; padding: 1mm 1.6mm; font-size: 9pt; overflow: hidden; }
.nb-cell:first-child, .nb-cell.fl { border-left: 0; }
.nb-cell .nb-lbl { display: block; font-size: 5.5pt; margin-bottom: 1.2mm; }
.nb-cell.prop { display: flex; align-items: flex-end; font-weight: 700; font-size: 6.5pt; letter-spacing: .06em; text-transform: uppercase; }
`;

const Field = ({ label, value, style }) => (
    <div className="nb-field" style={style}>
        <span className="nb-lbl">{label}</span>
        <span>{value}</span>
    </div>
);

export const NotebookPage = ({ page: p }) => {
    const left = p.num % 2 === 1;
    return (
        <div className="nb">
            <style>{notebookCss}</style>
            <div className={`nb-num ${left ? 'l' : 'r'}`}>{p.num}</div>
            <Field label="Titolo" value={p.title} style={{ left: left ? '26mm' : '12.5mm', top: '17.5mm', width: '88mm' }} />
            <Field label="N. progetto" value={p.project} style={{ left: left ? '128mm' : '116mm', top: '12.5mm', width: '69mm' }} />
            <Field label="N. quaderno" value={p.book} style={{ left: left ? '128mm' : '116mm', top: '19.5mm', width: '69mm' }} />
            <div className="nb-grid">
                <span className="nb-ref f">Dalla pagina {p.from ?? '____'}</span>
                {p.lines.map((ln, i) => <div key={i} className={`nb-ln ${ln.k === 'h' ? 'h' : ''}`}>{ln.k === 'gap' ? '' : ln.t}</div>)}
                <span className="nb-ref t">Alla pagina {p.to ?? '____'}</span>
            </div>
            <div className="nb-foot">
                <div className="nb-cell" style={{ gridColumn: '1 / 9' }}><span className="nb-lbl">Firma</span>{p.signer}</div>
                <div className="nb-cell" style={{ gridColumn: '9 / 13' }}><span className="nb-lbl">Data</span>{p.date}</div>
                <div className="nb-cell fl" style={{ gridColumn: '1 / 6' }}><span className="nb-lbl">Visto e compreso da</span>{p.checker}</div>
                <div className="nb-cell" style={{ gridColumn: '6 / 9' }}><span className="nb-lbl">Data</span>{p.checkDate}</div>
                <div className="nb-cell prop" style={{ gridColumn: '9 / 13' }}>Informazioni riservate</div>
            </div>
        </div>
    );
};
