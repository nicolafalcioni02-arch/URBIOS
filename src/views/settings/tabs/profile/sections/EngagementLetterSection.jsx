import React from 'react';
import { Group, Btn } from '../../../ui/kit';
import { InputGroup, TextAreaGroup } from '../../../../../components/ui/InputGroup';
import { TEMPLATE_INCARICO, TEMPLATE_PRIVACY } from '../templates';

// Testo lungo con il tasto "Usa il testo standard" accanto all'etichetta
const LongText = ({ label, name, value, template, updateUser }) => (
    <div>
        <div className="flex items-end justify-between gap-3 mb-1.5">
            <span className="fld-label !mb-0">{label}</span>
            <Btn
                variant="secondary"
                size="sm"
                icon="template"
                onClick={() => (!value || confirm('Sostituire il testo attuale con quello standard?')) && updateUser(name, template)}
            >
                Usa il testo standard
            </Btn>
        </div>
        <TextAreaGroup rows={10} value={value} name={name} onChange={updateUser} />
    </div>
);

export const EngagementLetterSection = ({ localUser, updateUser }) => (
    <>
        <Group title="Lettera di incarico" icon="document" hint="Il compenso va al punto 7, il luogo accanto alla firma.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <InputGroup label="Compenso (punto 7)" placeholder="Es. euro 100,00 (cento/00)" value={localUser.lettera_compenso} name="lettera_compenso" onChange={updateUser} />
                <InputGroup label="Luogo della firma" placeholder="Es. Roma" value={localUser.lettera_luogo} name="lettera_luogo" onChange={updateUser} />
            </div>
            <LongText label="Testo della lettera (punti 1–8)" name="testo_incarico" value={localUser.testo_incarico} template={TEMPLATE_INCARICO} updateUser={updateUser} />
        </Group>

        <Group title="Informativa privacy (GDPR)" icon="lock">
            <div className="grid grid-cols-1 gap-4 mb-5">
                <InputGroup
                    label="Titolare del trattamento (nome e indirizzo dello studio)"
                    placeholder="Es. Dott. Mario Rossi, con studio in Via Roma 1, Milano"
                    value={localUser.privacy_titolare}
                    name="privacy_titolare"
                    onChange={updateUser}
                />
                <div>
                    <InputGroup
                        label="Consulente fiscale (punto 4)"
                        placeholder="Es. Studio Commerciale Dott. Bianchi (Responsabile Esterno)"
                        value={localUser.privacy_consulente}
                        name="privacy_consulente"
                        onChange={updateUser}
                    />
                    <p className="st-hint">Entra nella frase «…comunicati al professionista esterno [nome] che cura la contabilità…».</p>
                </div>
            </div>
            <LongText label="Testo dell'informativa" name="testo_privacy" value={localUser.testo_privacy} template={TEMPLATE_PRIVACY} updateUser={updateUser} />
        </Group>
    </>
);
