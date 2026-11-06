// Algoritmo generale per far emergere le bande di un gel/blot. Entrata: grigi (Float32, 0-255) di qualsiasi acquisizione. Nessun numero tarato su una foto:
// tutto è ricavato dalle statistiche dell'immagine. Pipeline:
//  0 esposizione  -> stiramento robusto (0,5° - 99,9° percentile)
//  1 polarità     -> bande chiare su fondo scuro o l'inverso (il fondo è la moda dell'istogramma)
//  2 orientamento -> tensore di struttura: se le corsie sono orizzontali si lavora trasposti
//  3 rumore       -> mediana delle differenze coi vicini
//  4 scala        -> spessore medio delle bande forti: da qui i raggi di tutti i filtri
//  5 puntini      -> apertura morfologica di scala proporzionale allo spessore, sostituzione graduale (soglie in unità di rumore)
//  6 alone        -> luce spanta dalle bande forti, sottratta nella misura massima che non porta nessun pixel sotto il fondo
//  7 toni         -> nero = fondo + 2σ, gamma scelta dal segnale (e limitata perché il rumore resti sotto il 10%), polarità ripristinata
const lineExt=(src,dst,w,h,r,vert,isMax)=>{const len=vert?h:w,lines=vert?w:h,q=new Int32Array(len+1);for(let l=0;l<lines;l++){const at=i=>vert?i*w+l:l*w+i;let hd=0,tl=0;for(let i=0;i<len+r;i++){if(i<len){const v=src[at(i)];while(tl>hd&&(isMax?src[at(q[tl-1])]<=v:src[at(q[tl-1])]>=v))tl--;q[tl++]=i}const c=i-r;if(c>=0){while(q[hd]<c-r)hd++;dst[at(c)]=src[at(q[hd])]}}}};
const ext=(a,w,h,r,mx)=>{const t=new Float32Array(a.length),u=new Float32Array(a.length);lineExt(a,t,w,h,r,false,mx);lineExt(t,u,w,h,r,true,mx);return u};
const opening=(a,w,h,r)=>ext(ext(a,w,h,r,false),w,h,r,true);
const blur=(a,w,h,rx,ry)=>{const pass=(src,len,lines,step,lstep,r)=>{r=Math.max(0,r);const o=new Float32Array(src.length);for(let l=0;l<lines;l++){const b=l*lstep;let sum=0;for(let i=-r;i<=r;i++)sum+=src[b+Math.min(len-1,Math.max(0,i))*step];for(let i=0;i<len;i++){o[b+i*step]=sum/(2*r+1);sum+=src[b+Math.min(len-1,i+r+1)*step]-src[b+Math.max(0,i-r)*step]}}return o};return pass(pass(a,w,h,1,w,rx),h,w,w,1,ry)};
const pct=(arr,q)=>{const s=Float32Array.from(arr).sort();return s[Math.min(s.length-1,Math.floor(q*s.length))]};
const sstep=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t)};
const transpose=(a,w,h)=>{const o=new Float32Array(a.length);for(let y=0;y<h;y++)for(let x=0;x<w;x++)o[x*h+y]=a[y*w+x];return o};

export const enhance=(gray,W0,H0)=>{
  const N=W0*H0;let Y=Float32Array.from(gray);const info={};
  // 0 esposizione
  const lo0=pct(Y,.005),hi0=pct(Y,.999);const rng=Math.max(8,hi0-lo0);for(let i=0;i<N;i++)Y[i]=Math.min(255,Math.max(0,(Y[i]-lo0)*255/rng));
  // 1 polarità: la moda è il fondo; se sta nella metà alta le bande sono scure
  const hist=new Float64Array(256);for(let i=0;i<N;i++)hist[Y[i]|0]++;let mode=0;for(let v=1;v<256;v++)if(hist[v]>hist[mode])mode=v;
  const inv=mode>127;info.inverted=inv;if(inv)for(let i=0;i<N;i++)Y[i]=255-Y[i];
  // 2 orientamento (le bande sono perpendicolari alle corsie: lungo le corsie variano molto, di traverso poco)
  const Ys=blur(Y,W0,H0,2,2);let jx=0,jy=0;for(let y=1;y<H0-1;y+=2)for(let x=1;x<W0-1;x+=2){const i=y*W0+x;const gx=Ys[i+1]-Ys[i-1],gy=Ys[i+W0]-Ys[i-W0];jx+=gx*gx;jy+=gy*gy}
  const tr=jx>jy*1.15;info.transposed=tr;let W=W0,H=H0;if(tr){Y=transpose(Y,W0,H0);W=H0;H=W0}
  // 3 fondo, luci, rumore (se il rumore è alto si leviga prima, con raggio proporzionale, e si rimisurano)
  const stats=()=>{const h2=new Float64Array(256);for(let i=0;i<N;i++)h2[Y[i]|0]++;const sh=new Float64Array(256);for(let v=0;v<256;v++){let a=0,n=0;for(let k=-2;k<=2;k++)if(v+k>=0&&v+k<256){a+=h2[v+k];n++}sh[v]=a/n}
    let BG=0;for(let v=1;v<200;v++)if(sh[v]>sh[BG])BG=v;const WHITE=pct(Y,.995);
    const nz=[];for(let y=2;y<H-2;y+=4)for(let x=2;x<W-2;x+=4){const i=y*W+x;nz.push(Math.abs(Y[i]-(Y[i-1]+Y[i+1]+Y[i-W]+Y[i+W])*.25))}
    return {BG,WHITE,SIGMA:Math.max(.5,pct(nz,.5)*1.3)}};
  let {BG,WHITE,SIGMA}=stats();info.sigmaRaw=SIGMA;
  if(SIGMA>2){const r=Math.min(4,Math.round(SIGMA/3));Y=blur(Y,W,H,r,r);({BG,WHITE,SIGMA}=stats())}
  // 4 scala: spessore medio delle zone sopra metà tra fondo e luci
  const T=BG+(WHITE-BG)*.5;let cnt=0;const colHas=new Uint8Array(W);for(let i=0;i<N;i++)if(Y[i]>T){cnt++;colHas[i%W]=1}let cols=0;for(let x=0;x<W;x++)cols+=colHas[x];
  const THICK=Math.min(H/8,Math.max(H/200,4,cnt/Math.max(1,cols)));info.thick=THICK;
  // 5 puntini
  const rs=Math.max(1,Math.round(THICK/7));const Yd=opening(Y,W,H,rs);const Y1=new Float32Array(N);
  for(let i=0;i<N;i++){const d=Y[i]-Yd[i];Y1[i]=Y[i]-d*sstep(2*SIGMA,6*SIGMA+4,d)}
  // 6 alone
  const S=new Float32Array(N);for(let i=0;i<N;i++)S[i]=Math.max(0,Y1[i]-T);
  let G=blur(S,W,H,Math.round(THICK*.6),Math.round(THICK*1.6));G=blur(G,W,H,Math.round(THICK*.4),Math.round(THICK*1.2));
  const rr=[];for(let i=0;i<N;i+=7)if(G[i]>3*SIGMA)rr.push(Math.max(0,Y1[i]-BG)/G[i]);
  const K=rr.length>50?Math.min(1.5,pct(rr,.02)):0;info.K=K;
  const Yc=new Float32Array(N);for(let i=0;i<N;i++)Yc[i]=Math.max(0,Y1[i]-G[i]*K);
  // 7 toni
  const LO=BG+2*SIGMA;const sig=[];for(let i=0;i<N;i+=13)if(Yc[i]>LO+6*SIGMA)sig.push((Yc[i]-LO)/(255-LO));
  const tm=sig.length?sig.reduce((a,b)=>a+b)/sig.length:.5;
  const gT=Math.log(.4)/Math.log(Math.max(.02,tm));const gN=Math.log(.1)/Math.log(Math.min(.5,6*SIGMA/(255-LO)));
  const GAMMA=Math.min(1,Math.max(.4,gT,gN));info.gamma=GAMMA;info.BG=BG;info.SIGMA=SIGMA;
  let R=new Float32Array(N);for(let i=0;i<N;i++){const t=Math.min(1,Math.max(0,(Yc[i]-LO)/(255-LO)));R[i]=255*Math.pow(t,GAMMA)}
  if(tr)R=transpose(R,W,H);if(inv)for(let i=0;i<N;i++)R[i]=255-R[i];
  return {out:R,info};
};
