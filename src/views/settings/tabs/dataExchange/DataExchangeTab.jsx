import React, { useState } from 'react';
import { ExportSection } from './ExportSection';
import { ImportSection } from './ImportSection';
import { Page, Segmented } from '../../ui/kit';
import { stripExample } from '../../../../storage/example/example'; // il paziente di esempio non si esporta

// Impostazioni → "Importa ed esporta"
export const DataExchangeTab = ({ db, onUpdateDb }) => {
    const [part, setPart] = useState('export');
    return (
        <Page title="Importa ed esporta" intro="Porta i dati dove ti servono (Excel, Word, ricerca) o unisci dati da altri file. Tutto resta sul tuo dispositivo.">
            <div className="mb-5">
                <Segmented
                    options={[
                        ['export', 'Esporta'],
                        ['import', 'Importa'],
                    ]}
                    value={part}
                    onChange={setPart}
                />
            </div>
            {part === 'export' ? <ExportSection db={stripExample(db)} /> : <ImportSection db={db} onUpdateDb={onUpdateDb} />}
        </Page>
    );
};
