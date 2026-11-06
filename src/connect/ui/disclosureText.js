// Informativa tecnica che si deve leggere per attivare la modalità Online. Va tenuta ALLINEATA al codice (src/connect, docs/sicurezza):
// se cambia qualcosa di ciò che descrive, si cambia il testo E la versione (chi l'aveva accettata la deve rileggere).
export const DISCLOSURE_VERSION = '2026-11-v1';

export const DISCLOSURE = [
    { h: 'A cosa serve', p: [
        'La modalità Online permette di inviare diete e schede di allenamento all\'app del paziente (e in futuro di usare più dispositivi). Di base URBIOS è completamente offline: nessun dato esce dal computer. Attivando questa modalità qualcosa esce, e qui sotto trovi esattamente cosa, come e con quali limiti.',
    ] },
    { h: 'Chi è coinvolto (e chi no)', p: [
        'Tre parti: il tuo URBIOS, l\'app del paziente (una pagina web statica, pubblicata su GitHub Pages, che gira solo sul telefono del paziente) e un servizio di scambio pubblico e gratuito (broker MQTT oppure una cassetta postale HTTP).',
        'Noi non gestiamo nessun server e non esiste nessuna azienda nostra in mezzo: il servizio di scambio è di terzi, lo scegli tu scrivendone l\'indirizzo. Non abbiamo accesso ai tuoi dati, non possiamo vederli, recuperarli o cancellarli. È una conseguenza diretta della scelta di essere un software gratuito.',
        'Il tuo computer e il telefono del paziente si collegano solo IN USCITA verso il servizio di scambio; nessuno si collega al tuo computer dall\'esterno.',
    ] },
    { h: 'Identità: nessun nome, solo codici', p: [
        'Il nome del paziente non viene mai inserito nell\'app del paziente né nei messaggi. Ogni persona e ogni dispositivo è un codice anonimo casuale (per esempio d1.… per un dispositivo, p1.… per un paziente).',
        'Ogni dispositivo genera le proprie chiavi sul proprio hardware: una coppia di firma doppia (Ed25519 e ML-DSA-65: un messaggio vale solo se entrambe le firme sono valide) e una coppia per lo scambio di chiavi ibrido X-Wing (ML-KEM-768 + X25519), pensato per resistere anche a futuri computer quantistici. Le chiavi private non lasciano mai il dispositivo.',
    ] },
    { h: 'Collegamento di un paziente (QR)', p: [
        'Quando premi «Collega un paziente» compare un QR di breve durata, monouso. Contiene: un identificativo del collegamento, la scadenza, il codice anonimo del paziente e il tuo, l\'impronta (hash) del tuo record dispositivo, un segreto di collegamento casuale e l\'indirizzo del servizio di scambio. Non contiene chiavi private, né nomi, né dati clinici.',
        'Il paziente lo inquadra. I due dispositivi si scambiano i rispettivi record (con le chiavi pubbliche) passando dal servizio di scambio, su argomenti derivati dal segreto del QR. Poi entrambi calcolano un codice di verifica di 12 cifre (derivato con HKDF-SHA256 dall\'intero scambio e dal segreto): deve essere identico sui due schermi e va confermato da entrambe le parti. Se qualcuno si fosse infilato nello scambio, i codici non coinciderebbero.',
        'Il QR scade, vale una sola volta e ha un numero massimo di tentativi. Chi ne ottiene una foto prima della scansione non basta per collegarsi di nascosto, perché il codice di verifica deve essere confermato da te davanti al paziente: non confermare mai se i codici non coincidono o se non sei tu ad avere iniziato il collegamento.',
    ] },
    { h: 'Come viaggia ogni messaggio', p: [
        'Ogni messaggio è cifrato con AES-256-GCM (chiave usata una volta sola, nonce casuale a 96 bit). Le chiavi si rinnovano di continuo con un meccanismo a «cricchetto» (ratchet): a ogni cambio di direzione si esegue un nuovo scambio X-Wing, così un\'eventuale chiave rubata non apre i messaggi passati (segretezza in avanti) e smette di valere per quelli futuri appena la conversazione prosegue (recupero dopo compromissione).',
        'Il messaggio finale («busta») contiene: dati dello scambio di chiave, un\'intestazione CIFRATA (mittente, destinatario, identificativo, contatore, data), il contenuto cifrato e la doppia firma. Il contenuto è arrotondato a blocchi di 4096 byte per nascondere la lunghezza esatta.',
        'In ricezione i controlli seguono un ordine fisso, dai più economici ai più costosi: scambio di chiave, intestazione, destinatario, mittente e revoca, doppia firma, freschezza (data), anti-replay, decifratura, forma del contenuto. Un messaggio che fallisce un passo viene scartato.',
    ] },
    { h: 'Che cosa vede il servizio di scambio', p: [
        'Vede: il tuo indirizzo IP e quello del paziente, gli orari dei collegamenti, la dimensione approssimata dei messaggi e degli argomenti anonimi (derivati con HMAC-SHA256 e cambiati ogni ora) su cui passano.',
        'NON vede: il contenuto, i nomi, i codici dei dispositivi (l\'intestazione è cifrata), né può collegare tra loro due messaggi della stessa coppia.',
        'Può invece: perdere messaggi, ritardarli, duplicarli, cambiarne l\'ordine, rifiutarli o smettere di funzionare. Non può leggerli, modificarli né falsificarne uno senza che venga scartato. Se un messaggio si perde, la dieta resta «in uscita» nel programma (manca la conferma di ricezione) e va rimandata: la consegna NON è garantita.',
        'Con un broker MQTT pubblico chiunque conosca un argomento può scrivervi sopra; l\'argomento è casuale e segreto e ogni messaggio estraneo viene scartato perché non valido, ma potrebbe occupare spazio. I broker pubblici hanno limiti di dimensione (qui 96 KB per messaggio, 80 KB per documento) e possono cambiare o chiudere senza preavviso.',
    ] },
    { h: 'Che cosa viene inviato', p: [
        'Dieta: alimenti, grammi, calorie, pasti per giorno e obiettivo giornaliero. Scheda: esercizi, serie, carichi, recuperi e note. Non vengono mai inviati: anagrafica, peso e misure, diagnosi, referti, note cliniche, nome del paziente.',
        'Il titolo e le note li scrivi tu: prima di ogni invio il programma cerca nome, cognome e soprannome del paziente e blocca l\'invio se li trova. È solo una rete di sicurezza: un testo può identificare una persona in altri modi (per esempio «la signora del terzo piano»). Cosa scrivi lì resta una tua responsabilità.',
        'Un dato dell\'alimentazione o dell\'allenamento riferito a una persona può essere un dato sulla salute: anche se anonimo per il servizio di scambio, per il paziente resta un dato personale.',
    ] },
    { h: 'Sul tuo computer e sul telefono del paziente', p: [
        'Per attivare la modalità serve un archivio cifrato: le chiavi di connessione sono a loro volta cifrate con una chiave derivata da quella dell\'archivio, con un contatore anti-ripristino che segnala se lo stato viene riportato indietro (in quel caso i collegamenti vanno rifatti). Ogni evento importante finisce in un registro con catena di impronte che rende evidenti le modifiche; non rileva però il taglio delle ultime righe.',
        'L\'app del paziente chiede una passphrase di almeno 12 caratteri (PBKDF2 con 600.000 iterazioni e AES-GCM), si blocca dopo 5 minuti senza azioni e chiede il consenso al trattamento. Non esiste recupero della passphrase: se il paziente la perde, i dati locali sono persi e vanno rinviati da te. L\'app non funziona offline e non è stata provata su tutti i browser e telefoni.',
        'La pagina dell\'app paziente applica una politica di sicurezza dei contenuti (CSP) dichiarata nella pagina, ma GitHub Pages non permette di impostare tutte le protezioni (per esempio contro l\'incorniciamento in altre pagine).',
    ] },
    { h: 'Ritiro e scollegamento', p: [
        '«Ritira» fa sparire un documento dalla vista del paziente (resta nella sua cronologia locale). «Scollega» invia al paziente un messaggio firmato di chiusura; se il servizio non risponde, il collegamento si chiude comunque dalla tua parte e il paziente resta collegato finché non lo elimina lui. Il paziente tiene i piani già ricevuti.',
        'Lo scollegamento non revoca crittograficamente le chiavi: semplicemente smetti di usarle. Un dispositivo del paziente compromesso e già collegato resta in grado di leggere ciò che gli hai già mandato.',
    ] },
    { h: 'Limiti e rischi che devi conoscere', p: [
        'La parte di cricchetto è codice scritto da noi, ispirato a uno schema noto ma NON revisionato da esperti esterni. Le librerie crittografiche (famiglia «noble») sono usate con versione fissata, ma anche per l\'insieme non esiste una verifica indipendente. Non è stato fatto un test di sicurezza esterno né un\'analisi con fuzzing completa.',
        'Il computer o il telefono compromessi (virus, persone con accesso a un dispositivo sbloccato, screenshot, backup non protetti) aggirano qualunque cifratura. Il paziente può copiare, fotografare o inoltrare quanto riceve.',
        'Il servizio di scambio vede i metadati (IP, orari, dimensioni). Non è anonimato di rete: chi sorveglia la rete può sapere che due persone si scambiano messaggi.',
        'L\'informativa e i consensi mostrati al paziente non sono stati rivisti da un consulente legale. Come professionista sei tu il titolare del trattamento: valutazione d\'impatto (DPIA), informativa, registro dei trattamenti, tempi di conservazione e rapporti con il paziente sono a tuo carico.',
        'Alcune parti sono state provate solo con simulazioni (per esempio broker finti) o solo da Node, non in ogni browser: potrebbero esserci errori non ancora trovati.',
    ] },
    { h: 'Responsabilità: leggi con attenzione', p: [
        'Abbiamo creato questa possibilità per aiutare chi è meno esperto, ma il meccanismo, i limiti e i rischi di questa modalità vanno capiti. Attivandola ti assumi totalmente la responsabilità dell\'uso, delle scelte e delle conseguenze.',
        'Non c\'è alcun riscontro, assistenza, garanzia o responsabilità da parte nostra: quanto è scritto qui è un consiglio, non una promessa. Il software è completamente gratuito e per questo non abbiamo server né aziende esterne alle spalle.',
        'Sei libero di non usare questo codice: la modalità Online è facoltativa e URBIOS funziona benissimo anche completamente offline.',
        'Questa spiegazione non sostituisce un parere professionale: prima di usarla con pazienti reali serve l\'opinione di una persona esperta (sicurezza informatica e protezione dei dati), che verifichi la tua situazione concreta.',
    ] },
];
