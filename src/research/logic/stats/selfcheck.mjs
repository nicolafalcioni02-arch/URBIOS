// Controllo del motore statistico contro valori di riferimento calcolati con R (Rscript è installato su questo Mac).
// Uso:  node src/research/logic/stats/selfcheck.mjs      (esce con codice 1 se qualcosa non torna)
// Aggiungi un caso ogni volta che aggiungi o modifichi un test.
import { describe } from './descriptive.js';
import { anovaOneWay, chiSquare, fisherExact, kruskalWallis, mannWhitney, pearson, shapiroWilk, spearman, tTestIndependent, tTestPaired, wilcoxonSigned } from './tests.js';
import { linearRegression } from './regression.js';

const a = [5.1, 4.9, 6.2, 5.8, 6.0, 5.5, 5.3, 6.1, 5.7, 5.9];
const b = [6.5, 6.1, 7.0, 6.8, 6.2, 7.3, 6.9, 6.4, 7.1, 6.6];
const c = [5.0, 5.4, 5.2, 5.9, 5.6, 5.1, 5.8, 5.3, 5.5, 5.7];

let fail = 0;
const check = (label, got, want, tol = 1e-3) => {
    const ok = Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
    if (!ok) fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${got} (atteso ${want})`);
};

const d = describe(a);
check('media', d.mean, 5.65);
check('ds', d.sd, 0.43779752);
check('mediana', d.median, 5.75);

// shapiro.test(a)
const sw = shapiroWilk(a);
check('Shapiro W', sw.stat.value, 0.94678478);
check('Shapiro p', sw.p, 0.63064413, 5e-3);
check('Shapiro W (outlier)', shapiroWilk([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 40]).stat.value, 0.63554095);
check('Shapiro p (outlier)', shapiroWilk([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 40]).p, 0.00021580396, 2e-2);
check('Shapiro p (n=5)', shapiroWilk([1, 2, 4, 7, 8]).p, 0.54868072, 5e-3);

// t.test(a, b)
const tw = tTestIndependent(a, b);
check('Welch t', tw.stat.value, -5.573206);
check('Welch df', tw.df, 17.818843);
check('Welch p', tw.p, 2.8346418e-5, 1e-2);

// t.test(b, a, paired=TRUE)
const tp = tTestPaired(a, b);
check('paired t', tp.stat.value, 6.1141221); // differenza = dopo - prima
check('paired p', tp.p, 0.0001762016, 1e-2);

// wilcox.test(a, b, exact=FALSE)  (R riporta W = U del primo gruppo)
const mw = mannWhitney(a, b);
check('Mann-Whitney U', mw.stat.value, 2);
check('Mann-Whitney p', mw.p, 0.00032643445, 1e-2);

// wilcox.test(b, a, paired=TRUE, exact=FALSE)
const ws = wilcoxonSigned(a, b);
check('Wilcoxon V', ws.stat.value, 55);
check('Wilcoxon p', ws.p, 0.005921537, 1e-2);

// summary(aov(...)) con a, b, c
const av = anovaOneWay([{ name: 'a', values: a }, { name: 'b', values: b }, { name: 'c', values: c }]);
check('ANOVA F', av.stat.value, 30.225815);
check('ANOVA p', av.p, 1.2868979e-7, 1e-2);

// kruskal.test
const kw = kruskalWallis([{ name: 'a', values: a }, { name: 'b', values: b }, { name: 'c', values: c }]);
check('Kruskal H', kw.stat.value, 19.368665);
check('Kruskal p', kw.p, 6.2251214e-5, 1e-2);

// chisq.test(matrix(c(12,5,7,15),2), correct=FALSE)
const cs = chiSquare({ table: [[12, 7], [5, 15]], rows: ['x', 'y'], cols: ['u', 'v'] });
check('chi2', cs.stat.value, 5.7695961);
check('chi2 p', cs.p, 0.016305782, 1e-2);

// fisher.test(matrix(c(3,1,1,3),2))
check('Fisher p', fisherExact([[3, 1], [1, 3]]).p, 0.48571429);

// cor.test(a, b) ; method="spearman"
check('Pearson r', pearson(a, b).stat.value, 0.16997922);
check('Pearson p', pearson(a, b).p, 0.63872875, 1e-2);
check('Spearman rho', spearman(a, b).stat.value, 0.078787879);

// summary(lm(b ~ a))
const lr = linearRegression(b, { a });
check('regressione b', lr.coefs[1].b, 0.15362319);
check('regressione R2', lr.r2, 0.028892935);

console.log(fail ? `\n${fail} controlli falliti` : '\nTutto ok');
process.exit(fail ? 1 : 0);
