import { useEffect } from 'react';
import { applyLook, lookOf } from './looks';

// Applica l'aspetto salvato nel db finché l'archivio è aperto; a archivio chiuso si torna al classico.
export const useLook = (db, open) => {
    const look = open ? lookOf(db) : null;
    useEffect(() => {
        applyLook(look);
    }, [look]);
};
