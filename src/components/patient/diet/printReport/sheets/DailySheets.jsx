import React from 'react';
import { chunkMealsByHeight } from '../logic/printLayout';

export const DailySheets = ({ a4Style, dietDays }) => {
    return dietDays.map((day) => {
        // Tagliamo i pasti basati sullo spazio stimato con margini A4 2cm
        const mealChunks = chunkMealsByHeight(day.meals);

        return (
            <React.Fragment key={day.id}>
                {mealChunks.map((chunk, chunkIndex) => (
                    <div className="a4-sheet" style={a4Style} key={`${day.id}-part-${chunkIndex}`}>
                        <div
                            style={{
                                fontSize: '18pt',
                                fontWeight: 800,
                                fontFamily: "'Playfair Display', serif",
                                textTransform: 'uppercase',
                                borderBottom: '2px solid #000',
                                paddingBottom: '10px',
                                marginBottom: '20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                            }}
                        >
                            <span>
                                {day.title} {mealChunks.length > 1 ? `(Parte ${chunkIndex + 1})` : ''}
                            </span>
                            <span style={{ fontSize: '10pt', fontFamily: "'Inter', sans-serif", color: '#666', fontWeight: 500, letterSpacing: '1px' }}>
                                Piano Alimentare
                            </span>
                        </div>

                        {chunk.map((meal) => (
                            <div key={meal.id} style={{ marginBottom: '25px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                <div style={{ background: '#f4f4f5', borderLeft: '4px solid #000', padding: '8px 12px', fontSize: '11pt', fontWeight: 700 }}>
                                    <span style={{ textTransform: 'uppercase' }}>{meal.title}</span>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '10.5pt' }}>
                                        <tbody>
                                            {meal.items.map((item) => {
                                                const r = (Number(item.weight) || 0) / 100;
                                                const iKcal = item.kcal * r || 0;
                                                const iC = item.c * r || 0;
                                                const iP = item.p * r || 0;
                                                const iF = item.f * r || 0;
                                                return (
                                                    <React.Fragment key={item.id}>
                                                        <tr style={{ borderBottom: '1px solid #eaeaea' }}>
                                                            <td style={{ padding: '8px 6px' }}>
                                                                <div style={{ fontWeight: 700 }}>{item.name}</div>
                                                                <div style={{ fontSize: '7.5pt', color: '#888', marginTop: '3px', fontWeight: 500 }}>
                                                                    {iKcal.toFixed(0)} kcal | C: {iC.toFixed(1)}g | P: {iP.toFixed(1)}g | F: {iF.toFixed(1)}g
                                                                </div>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding: '8px 6px',
                                                                    textAlign: 'right',
                                                                    width: '80px',
                                                                    fontWeight: 800,
                                                                    verticalAlign: 'top',
                                                                }}
                                                            >
                                                                {item.weight} g
                                                            </td>
                                                        </tr>
                                                        {(item.subs || []).map((sub) => {
                                                            const sr = (Number(sub.weight) || 0) / 100;
                                                            const sKcal = sub.kcal * sr || 0;
                                                            const sC = sub.c * sr || 0;
                                                            const sP = sub.p * sr || 0;
                                                            const sF = sub.f * sr || 0;
                                                            return (
                                                                <tr key={sub.id} style={{ borderBottom: '1px solid #eaeaea', color: '#666' }}>
                                                                    <td style={{ padding: '6px 6px 6px 24px' }}>
                                                                        <div style={{ fontStyle: 'italic' }}>
                                                                            <span
                                                                                style={{ fontSize: '8pt', fontWeight: 800, marginRight: '8px', color: '#000' }}
                                                                            >
                                                                                OPPURE:
                                                                            </span>
                                                                            {sub.name}
                                                                        </div>
                                                                        <div style={{ fontSize: '7pt', color: '#aaa', marginTop: '2px', fontStyle: 'normal' }}>
                                                                            {sKcal.toFixed(0)} kcal | C: {sC.toFixed(1)}g | P: {sP.toFixed(1)}g | F:{' '}
                                                                            {sF.toFixed(1)}g
                                                                        </div>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding: '6px 6px',
                                                                            textAlign: 'right',
                                                                            fontWeight: 600,
                                                                            verticalAlign: 'top',
                                                                        }}
                                                                    >
                                                                        {sub.weight} g
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {/* Diario Alimentare del giorno */}
                <div className="a4-sheet" style={a4Style}>
                    <h2
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '20pt',
                            borderBottom: '2px solid #000',
                            paddingBottom: '10px',
                            marginBottom: '15px',
                        }}
                    >
                        Diario Alimentare - {day.title}
                    </h2>
                    <div style={{ fontSize: '10pt', color: '#666', marginBottom: '30px' }}>
                        Usa queste righe per annotare tutto ciò che hai mangiato o bevuto.
                    </div>
                    {day.meals.map((m) => (
                        <div key={m.id} style={{ marginBottom: '25px' }}>
                            <div style={{ fontSize: '11pt', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>{m.title}</div>
                            <div style={{ borderBottom: '1px solid #ccc', height: '25px' }}></div>
                            <div style={{ borderBottom: '1px solid #ccc', height: '25px' }}></div>
                        </div>
                    ))}
                </div>
            </React.Fragment>
        );
    });
};
