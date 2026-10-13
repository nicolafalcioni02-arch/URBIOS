import React from 'react';

export const Card = ({ title, hint, children }) => (
    <div style={{ background: '#FBFAF8', border: '1px solid #EEE', borderRadius: 16, padding: 16, marginBottom: 14 }}>
        {title && (
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: '', color: '#121317', marginBottom: hint ? 2 : 10 }}>
                {title}
            </div>
        )}
        {hint && <div style={{ fontSize: 12, color: '#6E6D69', marginBottom: 10, lineHeight: 1.45 }}>{hint}</div>}
        {children}
    </div>
);

export const Field = ({ label, value, onChange, unit, placeholder, width = 120, type = 'text', list }) => (
    <label style={{ display: 'inline-block', marginRight: 10, marginBottom: 8 }}>
        <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#6E6D69', textTransform: '', marginBottom: 3 }}>{label}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <input
                type={type}
                list={list}
                value={value ?? ''}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                style={{ width, padding: '9px 10px', borderRadius: 10, border: '1px solid #E0E0E5', fontSize: 14, background: '#fff', outline: 'none' }}
            />
            {unit && <span style={{ fontSize: 12, color: '#6E6D69' }}>{unit}</span>}
        </span>
    </label>
);

export const Pick = ({ label, value, onChange, options, width = 220 }) => (
    <label style={{ display: 'inline-block', marginRight: 10, marginBottom: 8 }}>
        <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#6E6D69', textTransform: '', marginBottom: 3 }}>{label}</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width, padding: '9px 8px', borderRadius: 10, border: '1px solid #E0E0E5', fontSize: 13, background: '#fff' }}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    </label>
);

export const Result = ({ children, tone = 'blue' }) => (
    <div
        style={{
            background: tone === 'blue' ? '#EAF3FF' : tone === 'green' ? '#EAF8EE' : '#FFF4DD',
            color: '#121317',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 14,
            marginTop: 4,
            lineHeight: 1.5,
        }}
    >
        {children}
    </div>
);

export const Btn = ({ children, onClick, disabled, dark = true }) => (
    <button
        disabled={disabled}
        onClick={onClick}
        style={{
            background: dark ? '#121317' : '#fff',
            color: dark ? '#fff' : '#121317',
            border: dark ? 'none' : '1px solid #DDD',
            borderRadius: 10,
            padding: '9px 14px',
            fontSize: 13,
            fontWeight: 700,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            marginRight: 8,
        }}
    >
        {children}
    </button>
);

export const Table = ({ head, rows, small }) => (
    <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: small ? 12 : 13, width: '100%' }}>
            <thead>
                <tr>
                    {head.map((h, i) => (
                        <th
                            key={i}
                            style={{
                                textAlign: 'left',
                                padding: '6px 8px',
                                borderBottom: '2px solid #DDD',
                                fontSize: 11,
                                textTransform: '',
                                color: '#6E6D69',
                            }}
                        >
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((r, i) => (
                    <tr key={i}>
                        {r.map((c, j) => (
                            <td key={j} style={{ padding: '6px 8px', borderBottom: '1px solid #EEE' }}>
                                {c}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const n1 = (x, d = 1) => (Number.isFinite(x) ? String(Math.round(x * 10 ** d) / 10 ** d).replace('.', ',') : '-');
export const toNum = (v) => {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
};
