// Versione "fedele": parte dall'algoritmo generale (gel-enhance.js) ma lo mescola alla foto reale
// con una quota ricavata da un criterio di fedeltà, non regolata a mano:
//   la correzione cresce finché la correlazione col segnale originale resta >= 0,97.
// Base = sola stiratura globale dei toni (nero al fondo, bianco alle luci, gamma lieve), uguale per ogni pixel.
import { enhance } from './gel-enhance.js';
const pct=(arr,q)=>{const s=Float32Array.from(arr).sort();return s[Math.min(s.length-1,Math.floor(q*s.length))]};
const corr=(a,b)=>{let n=0,sa=0,sb=0,saa=0,sbb=0,sab=0;for(let i=0;i<a.length;i+=5){n++;sa+=a[i];sb+=b[i];saa+=a[i]*a[i];sbb+=b[i]*b[i];sab+=a[i]*b[i]}const ma=sa/n,mb=sb/n;return (sab/n-ma*mb)/Math.sqrt(Math.max(1e-9,(saa/n-ma*ma)*(sbb/n-mb*mb)))};
export const enhanceFaithful=(gray,W,H,minCorr=0.97)=>{
  const N=W*H;const {out,info}=enhance(gray,W,H);
  // base: stiratura globale in polarità "bande chiare"
  const lo=pct(gray,.005),hi=pct(gray,.999);const rng=Math.max(8,hi-lo);
  const Y=new Float32Array(N);for(let i=0;i<N;i++)Y[i]=Math.min(255,Math.max(0,(gray[i]-lo)*255/rng));
  const P=info.inverted?Y.map(v=>255-v):Y;
  const h2=new Float64Array(256);for(let i=0;i<N;i++)h2[P[i]|0]++;let mode=0;for(let v=1;v<256;v++)if(h2[v]>h2[mode])mode=v;
  const white=pct(P,.995);const base=new Float32Array(N);
  for(let i=0;i<N;i++){const t=Math.min(1,Math.max(0,(P[i]-mode)/Math.max(8,white-mode)));base[i]=255*Math.pow(t,.8)}
  const E=info.inverted?out.map(v=>255-v):out; // out è già nella polarità dell'originale: riportiamolo a "bande chiare"
  const mix=a=>{const r=new Float32Array(N);for(let i=0;i<N;i++)r[i]=base[i]*(1-a)+E[i]*a;return r};
  let aLo=0,aHi=1,al=1;
  if(corr(mix(1),P)>=minCorr)al=1;else{for(let k=0;k<7;k++){const m=(aLo+aHi)/2;if(corr(mix(m),P)>=minCorr)aLo=m;else aHi=m}al=aLo}
  info.alpha=al;info.corr=corr(mix(al),P);
  let R=mix(al);if(info.inverted)R=R.map(v=>255-v);
  return {out:R,info};
};
