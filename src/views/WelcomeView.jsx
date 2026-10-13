import React, { useState, useEffect } from 'react';
import { ShaderCanvas } from '../components/visuals/ShaderCanvas';

export const WelcomeView = ({ data, onComplete }) => {
    const nome = data?.utente?.nome || 'Dottore';
    const cognome = data?.utente?.cognome || '';
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 800);
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[var(--paper)] overflow-hidden ${isExiting ? 'fade-exit-active' : ''}`}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 blur-2xl scale-[1.2] welcome-reveal">
                <ShaderCanvas size={600} className="rounded-full" />
            </div>
            <div className="relative z-10 text-center flex flex-col items-center welcome-reveal space-y-8">
                <div className="border-b border-gray-200 pb-2 mb-2">
                    <span className="text-xs font-bold tracking-[0.4em] uppercase text-gray-400">U R B I O S</span>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-gray-500 font-medium tracking-wide">Bentornato</p>
                    <h1 className="text-6xl md:text-5xl  font-bold text-gray-900 leading-none">
                        {nome} {cognome}
                    </h1>
                </div>
            </div>
        </div>
    );
};
