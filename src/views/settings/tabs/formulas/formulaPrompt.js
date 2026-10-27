// Testo da incollare in un assistente AI per farsi scrivere una formula nel formato di URBIOS (variabili data.*, funzioni util.*)
export const FORMULA_PROMPT = `Genera una formula JavaScript basata su queste specifiche tecniche:

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

GENERA LA FORMULA PER: [INSERIRE NOME FORMULA QUI]`;
