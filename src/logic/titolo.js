// Titolo del professionista nei documenti: «Dott.» o «Dott.ssa» in base al sesso biologico (db.utente.sesso: 'M' | 'F')
export const titoloProf = (prof) => (prof?.sesso === 'F' ? 'Dott.ssa' : 'Dott.');
