import React from 'react';
import { Button } from '../../../components/ui/Button';

export const FormulasTab = ({ db, handleAddFormula, handleDeleteFormula, newFormula, setNewFormula, setShowAddFormula, showAddFormula, tab }) => {
    return (
        tab === 'formule' && (
            <div className="fade-enter">
                {/* MODIFICA QUI: Aggiunto 'pr-14' per staccare il bottone dalla X di chiusura */}
                <div className="flex justify-between items-center mb-6 pr-14">
                    <div>
                        <h3 className="text-2xl font-bold mb-1">Database Formule</h3>
                        <p className="text-gray-500 text-sm">Gestisci le equazioni di riferimento.</p>
                    </div>
                    <button
                        onClick={() => setShowAddFormula(!showAddFormula)}
                        className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm"
                    >
                        <i className={`ph ${showAddFormula ? 'ph-minus' : 'ph-plus'}`}></i> {showAddFormula ? 'Annulla' : 'Aggiungi'}
                    </button>
                </div>

                {/* FORM AGGIUNTA */}
                {showAddFormula && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 fade-enter shadow-inner">
                        <h4 className="text-sm font-bold mb-4 text-black">Nuova Equazione</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400">Titolo Formula</label>
                                <input
                                    type="text"
                                    placeholder="Es. Formula di Katch-McArdle"
                                    value={newFormula.titolo}
                                    onChange={(e) => setNewFormula({ ...newFormula, titolo: e.target.value })}
                                    className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:border-black outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400">Categoria</label>
                                <select
                                    value={newFormula.categoria}
                                    onChange={(e) => setNewFormula({ ...newFormula, categoria: e.target.value })}
                                    className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:border-black outline-none"
                                >
                                    <option>Densità Corporea</option>
                                    <option>BIVA</option>
                                    <option>Metabolismo</option>
                                    <option>Formule Pliche</option>
                                    <option>Generale</option>
                                    <option>Conversione %FM</option>
                                </select>
                            </div>
                            <div className="col-span-full space-y-1">
                                <label className="text-xs font-bold text-gray-400">Equazione (Testo)</label>
                                <input
                                    type="text"
                                    placeholder="Es. BMR = 370 + (21.6 * LBM)"
                                    value={newFormula.equazione}
                                    onChange={(e) => setNewFormula({ ...newFormula, equazione: e.target.value })}
                                    className="w-full bg-white border border-gray-200 rounded p-2 text-sm font-mono focus:border-black outline-none text-blue-600"
                                />
                            </div>
                            <div className="col-span-full space-y-1">
                                <label className="text-xs font-bold text-gray-400">Note / Descrizione</label>
                                <input
                                    type="text"
                                    placeholder="Note aggiuntive..."
                                    value={newFormula.note}
                                    onChange={(e) => setNewFormula({ ...newFormula, note: e.target.value })}
                                    className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:border-black outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleAddFormula} icon="ph-check">
                                Salva nel Database
                            </Button>
                        </div>
                    </div>
                )}
                {/* --- AI PROMPT HELPER (Nuovo Blocco) --- */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <i className="ph-fill ph-robot text-xl"></i>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-blue-900 text-sm">Generatore Formule AI</h4>
                            <p className="text-xs text-blue-700 mb-3 mt-1">
                                Copia questo testo e incollalo su ChatGPT o Gemini. Poi chiedi la formula che ti serve (es: "Scrivimi la formula di
                                Harris-Benedict"). L'AI ti darà il codice esatto da incollare come equazione.
                            </p>

                            <div
                                className="relative group cursor-pointer"
                                onClick={() => {
                                    navigator.clipboard.writeText(`Genera una formula JavaScript basata su queste specifiche tecniche:

### REGOLE DI SINTASSI:
1. Variabili: usa l'oggetto "data" (es. data.peso).
2. Matematica: usa l'oggetto "util" (es. util.pow, util.sqrt, util.log10). NON usare "Math.".
3. Output: restituisci SOLO la stringa dell'espressione (es. data.a + data.b).
4. Condizioni: per differenze M/F usa l'operatore ternario (data.sesso === 'M' ? uomo : donna).
5. Funzioni: per logiche complesse usa (function(){ ... })().

### VARIABILI DISPONIBILI (data.nome_variabile):
- BASE: peso, altezza, eta, sesso ('M' o 'F')
- PLICHE: pl_pettorale, pl_tricipite, pl_bicipite, pl_sottoscap, pl_ascellare, pl_addome, pl_sovrailiaca, pl_sovraspinale, pl_coscia, pl_polpaccio, pl_guancia, pl_mento, pl_lombare, pl_soprapatellare
- CIRCONFERENZE FISSE: cm_collo, cm_torace, cm_vita_min, cm_fianchi_max
- CIRCONFERENZE BILATERALI: circ_braccio_sx, circ_braccio_dx, circ_avambr_sx, circ_avambr_dx, circ_polso_sx, circ_polso_dx, circ_coscia_sx, circ_coscia_dx, circ_polpaccio_sx, circ_polpaccio_dx, circ_caviglia_sx, circ_caviglia_dx
- DIAMETRI: dm_omero, dm_femore, dm_polso, dm_biacrom, dm_biiliaco, dm_torace_trasv
- LUNGHEZZE: len_seduto, len_span, len_braccio, len_avambr, len_coscia, len_gamba
- BIVA: biva_rz, biva_xc
- PARAMETRI VITALI: pa_max, pa_min, hr, spo2
- METABOLISMO GLUCIDICO: bg_glicemia, bg_insulina, bg_hba1c
- LIPIDI: bl_col_tot, bl_hdl, bl_ldl, bl_trig, bl_apob
- TIROIDE: bt_tsh, bt_ft3, bt_ft4, bt_t3, bt_t4, bt_anti_tpo, bt_anti_tg
- RENALE/URINE: br_crea, br_egfr, br_urea, br_urico, br_microalb, br_ph_urine, br_peso_spec
- EPATICO: br_ast, br_alt, br_gamma_gt, br_bilirubina_totale, br_fosfatasi_alcalina
- ELETTROLITI: br_sodio, br_potassio, br_magnesio, br_calcio, br_cloro, br_fosforo
- INFIAMMAZIONE/FERRO: br_pcr, br_ves, br_omocisteina, br_sideremia_ferro, br_ferritina, br_transferrina, br_sat_transferrina
- ORMONI: br_testosterone_tot, br_estradiolo_e2, br_progesterone, br_prolattina, br_lh_luteinizzante, br_fsh_follicolo

GENERA LA FORMULA PER: [INSERIRE NOME FORMULA QUI]`);
                                    alert('Prompt copiato negli appunti!');
                                }}
                            >
                                <textarea
                                    readOnly
                                    className="w-full h-24 text-[10px] font-mono bg-white border border-blue-200 rounded p-2 text-gray-500 cursor-pointer focus:outline-none resize-none"
                                    value={`Genera una formula JavaScript basata su queste specifiche tecniche:`}
                                ></textarea>
                                <div className="absolute inset-0 flex items-center justify-center bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                    <span className="bg-white shadow-sm px-3 py-1 rounded text-xs font-bold text-blue-900">Clicca per Copiare il Prompt</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* LISTA FORMULE */}
                <div className="grid grid-cols-1 gap-4">
                    {db.formule && db.formule.length > 0 ? (
                        db.formule.map((f) => (
                            <div key={f.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow group relative">
                                <button
                                    onClick={() => handleDeleteFormula(f.id)}
                                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                                    title="Elimina Formula"
                                >
                                    <i className="ph-fill ph-trash text-lg"></i>
                                </button>

                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-bold ">
                                        {f.categoria}
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-900">{f.titolo}</h4>

                                <div className="mt-3 bg-blue-50/50 border border-blue-100 rounded-lg p-3 font-mono text-xs text-blue-800">{f.equazione}</div>

                                {f.note && <p className="text-xs text-gray-400 mt-2 ">{f.note}</p>}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                            Nessuna formula presente. Aggiungine una!
                        </div>
                    )}
                </div>
            </div>
        )
    );
};
