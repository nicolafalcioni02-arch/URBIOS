import React, { useState } from 'react';

export const Card = ({ children, title, icon, colorTheme = 'gray', className = '' }) => {
    const themes = {
        red: { cardBg: 'bg-red-50', bg: 'bg-white', icon: 'text-red-500', border: 'border-red-100' },
        blue: { cardBg: 'bg-blue-50', bg: 'bg-white', icon: 'text-blue-600', border: 'border-blue-100' },
        green: { cardBg: 'bg-emerald-50', bg: 'bg-white', icon: 'text-emerald-600', border: 'border-emerald-100' },
        orange: { cardBg: 'bg-orange-50', bg: 'bg-white', icon: 'text-orange-500', border: 'border-orange-100' },
        gray: { cardBg: 'bg-white', bg: 'bg-gray-50', icon: 'text-black-600', border: 'border-gray-100' },
    };

    const activeTheme = themes[colorTheme] || themes.gray;

    return (
        <div className={`${activeTheme.cardBg} p-6 rounded-2xl shadow-sm border ${activeTheme.border} ${className}`}>
            {title && (
                <div className="flex items-center gap-2 mb-6 border-b border-black-100/50 pb-4">
                    {icon && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTheme.bg} ${activeTheme.icon}`}>
                            <i className={`ph ${icon} text-lg`}></i>
                        </div>
                    )}
                    <h4 className="font-bold text-xs uppercase tracking-widest text-black-500">{title}</h4>
                </div>
            )}
            {children}
        </div>
    );
};

export const CardCompattabile = ({ children, title, icon, colorTheme = 'gray', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    const themes = {
        red: { cardBg: 'bg-red-50', bg: 'bg-white', icon: 'text-red-500', border: 'border-red-100' },
        blue: { cardBg: 'bg-blue-50', bg: 'bg-white', icon: 'text-blue-600', border: 'border-blue-100' },
        green: { cardBg: 'bg-emerald-50', bg: 'bg-white', icon: 'text-emerald-600', border: 'border-emerald-100' },
        orange: { cardBg: 'bg-orange-50', bg: 'bg-white', icon: 'text-orange-500', border: 'border-orange-100' },
        purple: { cardBg: 'bg-purple-50', bg: 'bg-white', icon: 'text-purple-600', border: 'border-purple-100' },
        pink: { cardBg: 'bg-pink-50', bg: 'bg-white', icon: 'text-pink-400', border: 'border-pink-100' },
        gray: { cardBg: 'bg-white', bg: 'bg-gray-50', icon: 'text-gray-600', border: 'border-gray-100' },
        yellow: { cardBg: 'bg-yellow-200', bg: 'bg-white', icon: 'text-yellow-600', border: 'border-yellow-400' },
    };

    const activeTheme = themes[colorTheme] || themes.gray;

    return (
        <div className={`${activeTheme.cardBg} p-6 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border ${activeTheme.border} ${className} h-fit`}>
            {title && (
                <div
                    className={`flex items-center justify-between cursor-pointer select-none ${isOpen ? 'mb-6 border-b border-gray-100 pb-4' : 'mb-0 border-none'}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-2">
                        {icon && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTheme.bg} ${activeTheme.icon}`}>
                                <i className={`ph ${icon} text-lg`}></i>
                            </div>
                        )}
                        <h4 className="font-bold text-xs uppercase tracking-widest text-black-500">{title}</h4>
                    </div>
                    <i className={`ph ph-caret-down text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}></i>
                </div>
            )}
            {isOpen && <div className="animate-fade-in-down">{children}</div>}
        </div>
    );
};

export const CollapsibleSection = ({ title, children, defaultOpen = false, isOpen, onToggle }) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isExpanded = isOpen !== undefined ? isOpen : internalOpen;

    const handleToggle = () => {
        if (onToggle) onToggle();
        else setInternalOpen(!internalOpen);
    };

    return (
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm mb-6 overflow-hidden">
            <button onClick={handleToggle} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                <span className=" font-bold text-lg text-gray-800">{title}</span>
                <i className={`ph ph-caret-down text-xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}></i>
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100 p-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                {children}
            </div>
        </div>
    );
};
