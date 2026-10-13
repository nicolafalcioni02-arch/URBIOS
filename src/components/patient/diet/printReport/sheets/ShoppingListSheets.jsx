import React from 'react';

export const ShoppingListSheets = ({ a4Style, shoppingListChunks }) => {
    return shoppingListChunks.map((chunk, chunkIndex) => (
        <div className="a4-sheet" style={a4Style} key={`shop-${chunkIndex}`}>
            <h2
                style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '24pt',
                    borderBottom: '2px solid #000',
                    paddingBottom: '10px',
                    marginBottom: '30px',
                }}
            >
                Lista della Spesa {shoppingListChunks.length > 1 ? `(Parte ${chunkIndex + 1})` : ''}
            </h2>
            <div style={{ columnCount: 2, columnGap: '50px', fontSize: '11pt' }}>
                {chunk.map(([name, weight], i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc', padding: '10px 0' }}>
                        <span style={{ fontWeight: 600 }}>{name}</span>
                        <span>{weight.toFixed(0)} g</span>
                    </div>
                ))}
            </div>
        </div>
    ));
};
