import { useState } from 'react';
import { defaultFoodDB } from '../data/defaultFoodDB';

// Database alimenti: aggiunta, modifica, import/export JSON
export const useFoodDatabase = ({ foodDB, newFood, setFoodDB, setNewFood }) => {
    // Aggiunge un nuovo alimento al database locale
    const addFoodToDB = () => {
        if (newFood.name && newFood.category) {
            setFoodDB([
                {
                    name: newFood.name,
                    category: newFood.category,
                    kcal: Number(newFood.kcal) || 0,
                    p: Number(newFood.p) || 0,
                    c: Number(newFood.c) || 0,
                    f: Number(newFood.f) || 0,
                },
                ...foodDB,
            ]);

            // Pulisce il form dopo l'inserimento
            setNewFood({ name: '', category: '', kcal: '', p: '', c: '', f: '' });
        } else {
            alert("Inserisci almeno Nome e Categoria dell'alimento.");
        }
    };

    // Aggiorna un campo specifico di un alimento esistente nel database
    const updateDbFood = (index, field, value) => {
        const newDb = [...foodDB];
        newDb[index][field] = field === 'name' || field === 'category' ? value : Number(value);
        setFoodDB(newDb);
    };

    const [isChangeVisitOpen, setIsChangeVisitOpen] = useState(false);

    // Elimina un alimento dal database (con richiesta di conferma)
    const deleteFoodDB = (index) => {
        if (window.confirm('Sei sicuro di voler eliminare questo alimento dal database?')) {
            const newDb = [...foodDB];
            newDb.splice(index, 1);
            setFoodDB(newDb);
        }
    };

    // Esporta l'intero database come file JSON per backup o condivisione
    const exportJSON = () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(foodDB, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = 'nutri_db_backup.json';
        a.click();
    };

    // Importa un file JSON per sovrascrivere o ripristinare il database
    const importJSON = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                setFoodDB(JSON.parse(ev.target.result));
                alert('Database importato con successo!');
            } catch (err) {
                alert('Errore: Il file non è un JSON valido.');
            }
        };
        reader.readAsText(file);
    };

    // Ripristina il database ai 5 alimenti di default iniziali
    const resetDatabase = () => {
        if (window.confirm('Attenzione: Vuoi ripristinare il database ai valori di default? Perderai tutti gli alimenti personalizzati.')) {
            setFoodDB([...defaultFoodDB]);
        }
    };

    return { isChangeVisitOpen, setIsChangeVisitOpen, deleteFoodDB, exportJSON, importJSON };
};
