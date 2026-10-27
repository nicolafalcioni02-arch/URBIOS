import React from 'react';
import { ShaderCanvas } from '../../../../components/visuals/ShaderCanvas';
import { Label } from '../../ui/kit';

const TEAM = [
    { name: 'Nicola Falcioni', title: 'Dott.', role: 'Chief Executive Officer' },
    { name: 'Ilaria Berardi', title: 'Dott.ssa', role: 'Chief Communications Officer' },
    { name: 'Nicole Bellanova', title: 'Dott.ssa', role: 'Chief Scientific Officer' },
    { name: 'Lorenzo Frattini', title: 'Dott.', role: 'Science Team' },
    { name: 'Riccardo Giardini', title: 'Dott.', role: 'Science Team' },
];
// ramo d'alloro (lato sinistro); il destro e' lo stesso specchiato
const Laurel = ({ flip }) => {
    const leaves = Array.from({ length: 9 }, (_, i) => {
        const t = i / 8;
        const y = 8 + t * 84;
        const x = 36 - Math.sin(t * Math.PI * 0.9) * 22 + t * 4;
        const a = -24 - t * 34;
        return { x, y, a, s: 1 - t * 0.28 };
    });
    return (
        <svg viewBox="0 0 60 100" width="46" height="76" aria-hidden="true" style={{ transform: flip ? 'scaleX(-1)' : undefined, flex: 'none' }}>
            <path d="M40 94 C 10 72 8 34 30 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".75" />
            {leaves.map((l, i) => (
                <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.a}) scale(${l.s})`}>
                    <ellipse cx="-7" cy="0" rx="8" ry="3.2" fill="currentColor" opacity=".85" />
                    <ellipse cx="7" cy="-2" rx="7" ry="2.8" fill="currentColor" opacity=".6" transform="rotate(70)" />
                </g>
            ))}
        </svg>
    );
};
const initials = (n) => n.split(' ').map((w) => w[0]).join('');

export const InfoTab = () => {
    return (
        <div className="fade-enter max-w-xl mx-auto py-6 md:py-10 text-center">
            <div className="mx-auto rounded-full overflow-hidden" style={{ width: 112, height: 112, boxShadow: '0 14px 34px rgba(18,19,23,.14)' }}>
                <ShaderCanvas size={112} />
            </div>
            <h1 className="mt-6 text-[22px] font-semibold tracking-[0.42em] text-[color:var(--ink)] pl-[0.42em]">URBIOS</h1>
            <p className="mt-2 text-[15px] text-[color:var(--muted)]">La piattaforma per nutrizionisti che vogliono crescere</p>

            {/* riconoscimento */}
            <div className="panel mt-8 !py-6 text-center">
                <div className="flex items-center justify-center gap-2" style={{ color: 'var(--muted)' }}>
                    <Laurel />
                    <div className="min-w-0 text-center">
                        <p className="text-[11px] font-semibold tracking-[0.3em] text-[color:var(--muted)]">VINCITORE</p>
                        <p className="mt-1 text-[22px] font-semibold leading-tight text-[color:var(--ink)]">
                            Impresa in Aula
                        </p>
                    </div>
                    <Laurel flip />
                </div>
                <p className="mt-2 text-[14px] font-semibold text-[color:var(--ink)]">Miglior progetto</p>
                <p className="text-[12.5px] text-[color:var(--muted)]">Università degli Studi di Urbino «Carlo Bo»</p>
            </div>

            {/* team */}
            <Label className="mt-9 text-left">Il team</Label>
            <div className="m-group !mx-0 text-left">
                {TEAM.map((p) => (
                    <div key={p.name} className="m-row !cursor-default" >
                        <span className="m-avatar">{initials(p.name)}</span>
                        <span className="m-row-body">
                            <span className="m-row-text">
                                <span className="m-row-title">
                                    {p.title} {p.name}
                                </span>
                                <span className="m-row-sub">{p.role}</span>
                            </span>
                        </span>
                    </div>
                ))}
            </div>

            {/* manifesto */}
            <Label className="mt-9 text-left">Il nostro manifesto</Label>
            <div className="text-left space-y-3 text-[14px] leading-relaxed text-[color:var(--ink)]">
                <p className="display text-[22px]">
                    Libertà. Cultura.
                </p>
                <p>
                    URBIOS nasce da un’esigenza reale, vissuta in prima persona. Siamo studenti e, prima ancora, futuri professionisti. Durante il nostro percorso accademico ci siamo scontrati più volte con una difficoltà concreta, frustrante e diffusa: <b>la mancanza di strumenti accessibili, affidabili e immediatamente utilizzabili nella pratica quotidiana.</b>
                </p>
                <p>Troppo spesso la ricerca, lo studio e l’attività clinica non vengono rallentati dalla complessità biologica dei problemi, ma da barriere artificiali: l’assenza di mezzi adeguati, interfacce ostili e, soprattutto, software blindati da licenze proibitive ed ecosistemi chiusi.</p>

                <p className="text-[16px] font-semibold leading-snug pt-2">Il diritto alla conoscenza: la cultura non può essere un lusso</p>
                <p>Studiare, formarsi e fare scienza non dovrebbe essere un privilegio di chi ha più risorse: l'università nasce per ridurre le disuguaglianze, non per amplificarle. Nessuno studente o giovane ricercatore dovrebbe vedere frenato il proprio talento da un abbonamento o da un paywall.</p>
                <p>La conoscenza non è una merce, è un bene comune: recintarla non protegge il lavoro, blocca il progresso. La cultura deve circolare libera e aperta a chiunque abbia la passione di mettersi in gioco.</p>

                <p className="text-[16px] font-semibold leading-snug pt-2">Un vuoto da colmare, non un mercato da conquistare</p>
                <p>URBIOS non nasce con un obiettivo commerciale e non è stato progettato per generare profitto. Non ci sono costi nascosti, abbonamenti ricorrenti, licenze proprietarie o versioni “premium” con funzioni bloccate.</p>
                <p>Allo stesso tempo, la nostra non è una crociata contro le realtà private: non vogliamo sostituirci ai software attualmente sul mercato, perché crediamo con convinzione che il buon lavoro debba sempre essere riconosciuto e remunerato.</p>
                <p>URBIOS nasce per colmare un vuoto etico e pratico: offrire un’ancora di lancio e uno strumento solido a chi, in una fase iniziale, durante gli anni di studio o in condizioni di risorse limitate, non può permettersi soluzioni a pagamento. La nostra ricompensa non è economica, ma culturale: la consapevolezza che uno strumento concepito tra i banchi universitari possa sostenere il percorso formativo e lavorativo di un collega, abbattendo ogni ostacolo economico all'apprendimento.</p>
            </div>

            {/* identita' del nome */}
            <Label className="mt-9 text-left">L'identità del nome</Label>
            <div className="text-left space-y-3 text-[14px] leading-relaxed text-[color:var(--ink)]">
                <p>URBIOS non è un nome scelto per caso, ma l’esatta sintesi della sua identità e della sua missione.</p>
                <ul className="space-y-2">
                    <li>
                        <b>URB:</b> Nasce a Urbino, culla del Rinascimento, dell'Umanesimo e del pensiero critico, tra i laboratori e i corridoi dell'Università.
                    </li>
                    <li>
                        <b>BIOS:</b> Nel cuore del nome risiede la biologia, lo studio della vita stessa in tutte le sue sfumature.
                    </li>
                    <li>
                        <b>OS:</b> Non una scelta estetica, ma una chiara definizione tecnica e funzionale: un vero e proprio ambiente operativo (Operating System), strutturato per lavorare con rigore e precisione.
                    </li>
                </ul>
                <p>Ma c'è un segreto finale, un sigillo invisibile impresso nella parola stessa. Osserva l'inizio e la fine, la prima e l'ultima lettera che lo aprono e lo chiudono:</p>
                <p className="text-center text-[30px] leading-none font-semibold tracking-[0.18em]">
                    <span>U</span>
                    <span className="text-[color:var(--muted)] text-[22px]">RBIO</span>
                    <span>S</span>
                </p>
                <p className="text-center text-[17px] font-semibold">US. Noi.</p>
                <p>Non è una coincidenza. URBIOS non è «mio» né «tuo»: è un’entità plurale e corale. È il <b>Noi</b> degli studenti che hanno rifiutato di arrendersi ai limiti imposti dai costi; è il <b>Noi</b> dei docenti che credono nella formazione libera; è il <b>Noi</b> dei professionisti che domani utilizzeranno questo strumento per fare la differenza sul territorio.</p>
                <p>È l'abbraccio di una comunità accademica e scientifica che sceglie di non lasciare indietro nessuno e di camminare insieme. È uno strumento che, per definizione, appartiene a chiunque decida di farlo proprio, di difenderlo, di migliorarlo e di farlo vivere.</p>
                <p className="font-semibold">Perché ciò che è patrimonio di tutti non potrà mai essere tolto a nessuno.</p>
            </div>

            {/* ringraziamento */}
            <Label className="mt-9 text-left">Con il sostegno di</Label>
            <p className="text-left text-[14px] leading-relaxed text-[color:var(--ink)]">
                Tutto il team di <b>Impresa in Aula</b>, a cui va la nostra più profonda gratitudine, dell'Università degli Studi di Urbino «Carlo Bo».
            </p>

            <p className="mt-10 text-[12px] text-[color:var(--muted)] leading-relaxed">
                Versione 1 · © 2026 URBIOS Software · Tutti i diritti riservati.
            </p>
            <p className="mt-3 text-[11px] text-[color:var(--muted)] max-w-md mx-auto leading-relaxed">
                Figure degli esercizi: <em>free-exercise-db</em> (github.com/yuhonas/free-exercise-db), dataset di pubblico dominio (Unlicense).
            </p>
        </div>
    );
};
