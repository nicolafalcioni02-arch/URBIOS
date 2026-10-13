import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', icon, className = '' }) => {
    const base =
        'px-5 sm:px-10 py-3 rounded-full font-medium transition-all duration-300 flex-row flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap';
    const styles = {
        primary: 'bg-black text-white hover:bg-gray-800',
        secondary: 'bg-white text-black border border-gray-200 hover:border-black',
        danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100',
    };

    return (
        <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
            {icon && <i className={`ph ${icon} text-lg`}></i>}
            {children}
        </button>
    );
};
