import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildHumanGeometry } from './humanBody';
import { CIRC_SITES, PLI_SITES } from './measureSites';

// Corpo 3D deformato dalle misure, con anelli (circonferenze) e sfere (pliche).
// Le etichette non sono nella scena: sono disegnate sopra (HTML a schermo, canvas 2D nelle immagini del report),
// in due colonne ai lati, senza sovrapporsi, con una linea fino al punto di misura.
// Modello: { sesso, altezza, peso, collo, torace, vita, fianchi, braccio, coscia, polpaccio (cm), pl: { pl_tricipite: mm, ... } }

const TWO_PI = Math.PI * 2;
const GRAY = '#a8a29e';
const ACTIVE = '#111827';
const FOV = 28;
const RING_COLORS = { collo: '#8b5cf6', torace: '#0ea5e9', fianchi: '#14b8a6', braccio: '#6366f1', coscia: '#f97316', polpaccio: '#ec4899' };
const PLI_COLOR = '#f59e0b';
// lato dell'etichetta guardando il paziente di fronte (-1 sinistra, 1 destra)
const RING_SIDE = { collo: 1, torace: -1, vita: 1, fianchi: -1, braccio: -1, coscia: 1, polpaccio: -1 };
const short = (l) => l.replace(/ \(.*\)/, '');

export const waistColor = (m) => {
    const whtr = m.vita > 0 && m.altezza > 0 ? m.vita / m.altezza : 0;
    return !whtr ? '#0ea5e9' : whtr < 0.5 ? '#10b981' : whtr < 0.6 ? '#f59e0b' : '#ef4444';
};

// ---------- scena ----------

const shadowTexture = (() => {
    let tex = null;
    return () => {
        if (tex) return tex;
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const x = c.getContext('2d');
        const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(30,25,20,0.42)');
        g.addColorStop(0.55, 'rgba(30,25,20,0.16)');
        g.addColorStop(1, 'rgba(30,25,20,0)');
        x.fillStyle = g;
        x.fillRect(0, 0, 128, 128);
        tex = new THREE.CanvasTexture(c);
        return tex;
    };
})();

const makeScene = () => {
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xfffaf3, 0x8f8a84, 1.25));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2.2, 3.2, 3.4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfe8ff, 0.55);
    fill.position.set(-3, 1.4, 1.6);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 1.1);
    rim.position.set(-1.5, 2.6, -3.6);
    scene.add(rim);
    const rim2 = new THREE.DirectionalLight(0xffffff, 0.6);
    rim2.position.set(2, 2, -3);
    scene.add(rim2);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.002;
    floor.scale.set(1.1, 0.55, 1);
    floor.renderOrder = -1;
    scene.add(floor);
    return { scene, floor };
};

const setupRenderer = (renderer) => {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
};

// inquadratura: tutto il corpo in altezza; in larghezza il corpo occupa `bodyFrac` della vista (il resto è per le etichette)
const frame = (camera, H, aspect, az, bodyFrac) => {
    const t = Math.tan(((FOV / 2) * Math.PI) / 180);
    const dh = (H * 1.1) / 2 / t;
    const dw = (H * 0.62) / bodyFrac / 2 / (t * aspect);
    const dist = Math.max(dh, dw) + H * 0.18;
    const y = H * 0.52;
    camera.fov = FOV;
    camera.aspect = aspect;
    camera.position.set(Math.sin(az) * dist, y + H * 0.04, Math.cos(az) * dist);
    camera.lookAt(0, y, 0);
    camera.updateProjectionMatrix();
    return { dist, y };
};

// corpo + anelli + pliche; restituisce anche i punti delle etichette
function buildBody(m, opts, geoRes) {
    const { showRings, showPliche, interactive, activeId } = opts;
    const H = (m.altezza || 175) / 100;
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#d9cec4'), roughness: 0.78, metalness: 0 });
    const g = new THREE.Group();
    const { geo, sites } = geoRes;
    const bodyMesh = new THREE.Mesh(geo, mat);
    g.add(bodyMesh);
    const pick = [];
    const anchors = [];
    const shown = (val) => interactive || val > 0;

    // ---- anelli delle circonferenze ----
    const addRing = (def, cm, pts, ring) => {
        const filled = cm > 0;
        const active = activeId === def.id;
        const color = active ? ACTIVE : filled ? (def.id === 'vita' ? waistColor(m) : RING_COLORS[def.id]) : GRAY;
        const curve = new THREE.CatmullRomCurve3(pts, true);
        const rad = H * (active ? 0.0052 : filled ? 0.0034 : 0.0024);
        g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 120, rad, 10, true), new THREE.MeshStandardMaterial({ color, roughness: 0.35, emissive: color, emissiveIntensity: 0.25, transparent: !filled && !active, opacity: !filled && !active ? 0.7 : 1 })));
        if (interactive) {
            const hit = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, H * 0.02, 6, true), new THREE.MeshBasicMaterial({ visible: false }));
            hit.userData.id = def.id;
            g.add(hit);
            pick.push(hit);
        }
        if (filled || active || interactive) anchors.push({ id: def.id, kind: 'ring', ring, side: RING_SIDE[def.id], name: short(def.label), value: filled ? `${(Math.round(cm * 10) / 10).toLocaleString('it-IT')} cm` : '', color, active, filled });
    };
    if (showRings) {
        CIRC_SITES.forEach((def) => {
            const cm = m[def.id];
            if (!shown(cm)) return;
            if (def.id === 'braccio') {
                if (!sites.arm) return;
                // braccio destro del soggetto (lato -x): anello perpendicolare all'asse del braccio
                const c = new THREE.Vector3(-sites.arm.c[0], sites.arm.c[1], sites.arm.c[2]);
                const axis = new THREE.Vector3(-sites.arm.dir[0], sites.arm.dir[1], 0).normalize();
                const u = new THREE.Vector3(0, 0, 1);
                const v = new THREE.Vector3().crossVectors(axis, u).normalize();
                const rad = ((cm > 0 ? cm : 30) / 100 / TWO_PI) * 1.1;
                const pts = [];
                for (let i = 0; i < 64; i++) {
                    const a = (i / 64) * TWO_PI;
                    pts.push(c.clone().addScaledVector(u, Math.cos(a) * rad).addScaledVector(v, Math.sin(a) * rad));
                }
                addRing(def, cm, pts, { center: c, u, v, rad });
                return;
            }
            const s = sites[def.id];
            if (!s) return;
            const pts = [];
            const a = s.a * 1.03;
            const b = s.b * 1.03;
            for (let i = 0; i < 96; i++) {
                const t = (i / 96) * TWO_PI;
                pts.push(new THREE.Vector3(s.cx + Math.cos(t) * a, s.y, s.cz + Math.sin(t) * b));
            }
            addRing(def, cm, pts, { center: new THREE.Vector3(s.cx, s.y, s.cz), a, b });
        });
    }

    // ---- pliche: sfere sulla pelle, più grandi quanto più è spessa la plica ----
    if (showPliche) {
        const ray = new THREE.Raycaster();
        const armR = sites.arm ? new THREE.Vector3(-sites.arm.c[0], sites.arm.c[1], sites.arm.c[2]) : null;
        bodyMesh.updateMatrixWorld();
        PLI_SITES.forEach((def) => {
            const mm = Number(m.pl?.[def.key]) || 0;
            if (!shown(mm)) return;
            const p = def.pos;
            const dir = new THREE.Vector3(...p.dir).normalize();
            let target = null;
            if (p.type === 'arm') target = armR && armR.clone();
            else {
                const e = sites.at(p.u, p.type === 'leg' ? 'L' : 'C');
                if (e) target = new THREE.Vector3(e.cx + (p.fx || 0) * e.a, e.y, e.cz + (p.fz || 0) * e.b);
            }
            if (!target) return;
            const origin = target.clone().addScaledVector(dir, p.type === 'leg' && dir.x > 0 ? 0.12 : 0.8);
            ray.set(origin, dir.clone().negate());
            const hit = ray.intersectObject(bodyMesh, false)[0];
            if (!hit) return;
            const active = activeId === def.id;
            const color = active ? ACTIVE : mm > 0 ? PLI_COLOR : GRAY;
            const r = mm > 0 ? H * (0.006 + 0.0026 * Math.sqrt(mm)) : H * 0.009;
            const sph = new THREE.Mesh(new THREE.SphereGeometry(active ? r * 1.25 : r, 24, 18), new THREE.MeshStandardMaterial({ color, roughness: 0.3, emissive: color, emissiveIntensity: 0.2 }));
            sph.position.copy(hit.point).addScaledVector(dir, r * 0.35);
            g.add(sph);
            if (interactive) {
                const hm = new THREE.Mesh(new THREE.SphereGeometry(Math.max(r, H * 0.022), 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
                hm.position.copy(sph.position);
                hm.userData.id = def.id;
                g.add(hm);
                pick.push(hm);
            }
            if (mm > 0 || active || interactive) anchors.push({ id: def.id, kind: 'pli', point: sph.position.clone(), normal: dir, name: def.label, value: mm > 0 ? `${(Math.round(mm * 10) / 10).toLocaleString('it-IT')} mm` : '', color, active, filled: mm > 0 });
        });
    }
    g.userData = { pick };
    return { group: g, anchors };
}

// ---------- etichette ----------

const _v = new THREE.Vector3();
const _r = new THREE.Vector3();
const _c = new THREE.Vector3();

// punto a schermo di ogni etichetta e da che lato va (W, H in pixel)
const projectAnchors = (anchors, camera, W, Hpx) => {
    camera.updateMatrixWorld();
    _r.setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize();
    camera.getWorldPosition(_c);
    const toScreen = (p) => {
        _v.copy(p).project(camera);
        return { x: (_v.x * 0.5 + 0.5) * W, y: (-_v.y * 0.5 + 0.5) * Hpx };
    };
    const mid = toScreen(new THREE.Vector3(0, 1, 0)).x;
    return anchors.map((a) => {
        let p;
        let side;
        let visible = true;
        if (a.kind === 'ring') {
            const r = a.ring;
            if (r.u) {
                // anello del braccio: il punto sul bordo verso l'esterno dello schermo
                side = toScreen(r.center).x < mid ? -1 : 1;
                const off = new THREE.Vector3().copy(_r).multiplyScalar(side * r.rad);
                p = r.center.clone().add(off);
            } else {
                side = a.side;
                const th = Math.atan2(r.b * _r.z * side, r.a * _r.x * side);
                p = new THREE.Vector3(r.center.x + r.a * Math.cos(th), r.center.y, r.center.z + r.b * Math.sin(th));
            }
        } else {
            p = a.point;
            const s = toScreen(p);
            side = s.x < mid ? -1 : 1;
            visible = _v.set(_c.x - p.x, 0, _c.z - p.z).normalize().dot(a.normal) > -0.15;
        }
        const s = toScreen(p);
        return { ...a, sx: s.x, sy: s.y, side, visible };
    });
};

// posizioni verticali senza sovrapposizioni, per colonna
export const layoutColumn = (items, Hpx, lh, gap, padTop, padBottom = padTop) => {
    const sorted = [...items].sort((a, b) => a.sy - b.sy);
    const ys = sorted.map((it) => it.sy - lh / 2);
    const step = lh + gap;
    for (let i = 0; i < ys.length; i++) ys[i] = Math.max(ys[i], i ? ys[i - 1] + step : padTop);
    const maxY = Hpx - padBottom - lh;
    for (let i = ys.length - 1; i >= 0; i--) ys[i] = Math.min(ys[i], i < ys.length - 1 ? ys[i + 1] - step : maxY);
    for (let i = 0; i < ys.length; i++) ys[i] = Math.max(ys[i], i ? ys[i - 1] + step : padTop);
    return sorted.map((it, i) => ({ ...it, ly: ys[i] }));
};

const placeLabels = (projected, W, Hpx, lh, gap, padTop, padBottom) => [
    ...layoutColumn(projected.filter((p) => p.side < 0), Hpx, lh, gap, padTop, padBottom),
    ...layoutColumn(projected.filter((p) => p.side > 0), Hpx, lh, gap, padTop, padBottom),
];

// ---------- immagini fisse per il report ----------

let snapRenderer = null;
const getSnapRenderer = () => {
    if (!snapRenderer) {
        snapRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        setupRenderer(snapRenderer);
    }
    return snapRenderer;
};

const roundRect = (x, l, t, w, h, r) => {
    x.beginPath();
    x.moveTo(l + r, t);
    x.arcTo(l + w, t, l + w, t + h, r);
    x.arcTo(l + w, t + h, l, t + h, r);
    x.arcTo(l, t + h, l, t, r);
    x.arcTo(l, t, l + w, t, r);
    x.closePath();
};

// Immagine del modello vista dal lato `az` (0 davanti, PI dietro), con le etichette disegnate in 2D. w, h in pixel CSS.
export const snapshotBody = (model, opts = {}, az = 0, w = 520, h = 760) => {
    const S = 2; // nitidezza in stampa
    const renderer = getSnapRenderer();
    renderer.setPixelRatio(S);
    renderer.setSize(w, h, false);
    const H = (model.altezza || 175) / 100;
    const { scene } = makeScene();
    const camera = new THREE.PerspectiveCamera(FOV, w / h, 0.05, 50);
    frame(camera, H, w / h, az, 0.5);
    const geoRes = buildHumanGeometry(model);
    const { group, anchors } = buildBody(model, { showRings: false, showPliche: false, interactive: false, activeId: null, ...opts }, geoRes);
    scene.add(group);
    renderer.render(scene, camera);

    const out = document.createElement('canvas');
    out.width = w * S;
    out.height = h * S;
    const x = out.getContext('2d');
    x.scale(S, S);
    x.drawImage(renderer.domElement, 0, 0, w, h);

    const lh = 26;
    const placed = placeLabels(projectAnchors(anchors, camera, w, h), w, h, lh, 8, 8, 8);
    x.textBaseline = 'middle';
    placed.forEach((a) => {
        x.font = '600 13px Inter, system-ui, sans-serif';
        const nameW = x.measureText(a.name).width;
        x.font = '700 13px Inter, system-ui, sans-serif';
        const valW = a.value ? x.measureText(a.value).width + 6 : 0;
        const lw = 24 + nameW + valW + 12;
        const lx = a.side < 0 ? 6 : w - 6 - lw;
        const edge = a.side < 0 ? lx + lw : lx;
        x.strokeStyle = a.color;
        x.globalAlpha = a.visible ? 0.75 : 0.3;
        x.lineWidth = 1.3;
        x.beginPath();
        x.moveTo(edge, a.ly + lh / 2);
        x.lineTo(a.sx, a.sy);
        x.stroke();
        x.globalAlpha = a.visible ? 1 : 0.35;
        x.fillStyle = a.color;
        x.beginPath();
        x.arc(a.sx, a.sy, 3, 0, TWO_PI);
        x.fill();
        x.globalAlpha = 1;
        x.shadowColor = 'rgba(0,0,0,0.12)';
        x.shadowBlur = 6;
        x.shadowOffsetY = 1;
        x.fillStyle = '#ffffff';
        roundRect(x, lx, a.ly, lw, lh, lh / 2);
        x.fill();
        x.shadowColor = 'transparent';
        x.strokeStyle = '#e7e5e4';
        x.lineWidth = 1;
        x.stroke();
        x.fillStyle = a.color;
        x.beginPath();
        x.arc(lx + 13, a.ly + lh / 2, 4.5, 0, TWO_PI);
        x.fill();
        x.font = '600 13px Inter, system-ui, sans-serif';
        x.fillStyle = '#57534e';
        x.fillText(a.name, lx + 24, a.ly + lh / 2 + 0.5);
        if (a.value) {
            x.font = '700 13px Inter, system-ui, sans-serif';
            x.fillStyle = '#1c1917';
            x.fillText(a.value, lx + 24 + nameW + 6, a.ly + lh / 2 + 0.5);
        }
    });

    scene.traverse((o) => {
        if (o.geometry && o.geometry !== geoRes.geo) o.geometry.dispose();
        if (o.material && o.material.map !== shadowTexture()) o.material.dispose?.();
    });
    geoRes.geo.dispose();
    return out.toDataURL('image/png');
};

// ---------- vista interattiva ----------

const VIEWS = [
    ['Fronte', 0],
    ['Lato', -Math.PI / 2],
    ['Retro', Math.PI],
];

export const Body3D = ({ model, showRings = true, showPliche = false, interactive = false, activeId = null, onPick, views = true }) => {
    const wrapRef = useRef(null);
    const mountRef = useRef(null);
    const svgRef = useRef(null);
    const labelRefs = useRef({});
    const st = useRef({});
    const onPickRef = useRef(onPick);
    onPickRef.current = onPick;
    const [anchors, setAnchors] = useState([]);
    const [view, setView] = useState(0);

    // setup scena (una sola volta)
    useEffect(() => {
        const el = mountRef.current;
        const w = el.clientWidth || 300;
        const h = el.clientHeight || 400;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        setupRenderer(renderer);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h);
        el.appendChild(renderer.domElement);
        renderer.domElement.style.display = 'block';

        const { scene } = makeScene();
        const camera = new THREE.PerspectiveCamera(FOV, w / h, 0.05, 50);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.12;
        controls.rotateSpeed = 0.7;
        controls.minPolarAngle = Math.PI * 0.32;
        controls.maxPolarAngle = Math.PI * 0.62;
        const s = st.current;
        Object.assign(s, { renderer, scene, camera, controls, dirty: true, azTarget: null, W: w, Hpx: h, anchors: [] });
        controls.addEventListener('change', () => (s.dirty = true));
        controls.addEventListener('start', () => s.onManual && s.onManual());

        const ndc = new THREE.Vector2();
        const rc = new THREE.Raycaster();
        const pickAt = (e) => {
            if (!s.body || !s.body.userData.pick.length) return null;
            const r = renderer.domElement.getBoundingClientRect();
            ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
            rc.setFromCamera(ndc, camera);
            const hit = rc.intersectObjects(s.body.userData.pick, false)[0];
            return hit ? hit.object.userData.id : null;
        };
        const onDown = (e) => {
            s.azTarget = null;
            s.down = { x: e.clientX, y: e.clientY };
        };
        const onUp = (e) => {
            if (!s.down) return;
            const moved = Math.hypot(e.clientX - s.down.x, e.clientY - s.down.y);
            s.down = null;
            if (moved > 5) return;
            const id = pickAt(e);
            if (id && onPickRef.current) onPickRef.current(id);
        };
        const onHover = (e) => {
            if (interactive) renderer.domElement.style.cursor = pickAt(e) ? 'pointer' : 'grab';
        };
        renderer.domElement.addEventListener('pointerdown', onDown);
        renderer.domElement.addEventListener('pointerup', onUp);
        renderer.domElement.addEventListener('pointermove', onHover);

        // etichette: seguono il corpo a ogni fotogramma disegnato
        const updateLabels = () => {
            const list = s.anchors;
            const svg = svgRef.current;
            if (!svg) return;
            const lh = 26;
            const placed = placeLabels(projectAnchors(list, camera, s.W, s.Hpx), s.W, s.Hpx, lh, 6, 10, views ? 50 : 10);
            let d = '';
            placed.forEach((a) => {
                const node = labelRefs.current[a.id];
                if (!node) return;
                const lw = node.offsetWidth;
                const lx = a.side < 0 ? 8 : s.W - 8 - lw;
                node.style.transform = `translate(${Math.round(lx)}px, ${Math.round(a.ly)}px)`;
                node.style.opacity = a.visible ? 1 : 0.35;
                const edge = a.side < 0 ? lx + lw : lx;
                d += `<path d="M${edge.toFixed(1)} ${(a.ly + lh / 2).toFixed(1)} L${a.sx.toFixed(1)} ${a.sy.toFixed(1)}" stroke="${a.color}" stroke-opacity="${a.visible ? 0.7 : 0.25}" stroke-width="1.2" fill="none"/>`;
                d += `<circle cx="${a.sx.toFixed(1)}" cy="${a.sy.toFixed(1)}" r="3" fill="${a.color}" fill-opacity="${a.visible ? 1 : 0.3}"/>`;
            });
            svg.innerHTML = d;
        };
        s.updateLabels = updateLabels;

        let raf;
        const loop = () => {
            raf = requestAnimationFrame(loop);
            if (s.azTarget !== null) {
                const off = camera.position.clone().sub(controls.target);
                const cur = Math.atan2(off.x, off.z);
                let diff = s.azTarget - cur;
                diff = Math.atan2(Math.sin(diff), Math.cos(diff));
                if (Math.abs(diff) < 0.005) s.azTarget = null;
                const na = cur + diff * 0.14;
                const rad = Math.hypot(off.x, off.z);
                camera.position.set(controls.target.x + Math.sin(na) * rad, camera.position.y, controls.target.z + Math.cos(na) * rad);
                s.dirty = true;
            }
            controls.update();
            if (!s.dirty) return;
            s.dirty = false;
            renderer.render(scene, camera);
            updateLabels();
        };
        loop();

        const ro = new ResizeObserver(() => {
            const nw = el.clientWidth;
            const nh = el.clientHeight;
            if (!nw || !nh) return;
            s.W = nw;
            s.Hpx = nh;
            renderer.setSize(nw, nh);
            s.refit && s.refit(true);
            s.dirty = true;
        });
        ro.observe(el);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            renderer.domElement.removeEventListener('pointerdown', onDown);
            renderer.domElement.removeEventListener('pointerup', onUp);
            renderer.domElement.removeEventListener('pointermove', onHover);
            controls.dispose();
            scene.traverse((o) => {
                o.geometry?.dispose?.();
                if (o.material && o.material.map !== shadowTexture()) o.material.dispose?.();
            });
            renderer.dispose();
            renderer.forceContextLoss();
            el.removeChild(renderer.domElement);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // la forma cambia solo con le misure; anelli e pliche si ricostruiscono anche con selezione e livelli
    const geoKey = JSON.stringify({ ...model, pl: undefined });
    const overlayKey = JSON.stringify(model.pl || {}) + geoKey + showRings + showPliche + interactive + activeId;
    useEffect(() => {
        const s = st.current;
        if (!s.scene) return;
        const H = (model.altezza || 175) / 100;
        if (s.geoKey !== geoKey) {
            if (s.geoRes) s.geoRes.geo.dispose();
            s.geoRes = buildHumanGeometry(model);
            s.geoKey = geoKey;
            // inquadratura (mantiene il lato da cui si sta guardando)
            s.refit = (keepAz) => {
                const off = s.camera.position.clone().sub(s.controls.target);
                const az = keepAz && off.lengthSq() > 0 ? Math.atan2(off.x, off.z) : 0;
                const { dist, y } = frame(s.camera, H, s.W / s.Hpx, az, 0.56);
                s.controls.target.set(0, y, 0);
                s.controls.minDistance = dist * 0.55;
                s.controls.maxDistance = dist * 1.35;
                s.controls.update();
            };
            s.refit(!!s.body);
        }
        if (s.body) {
            s.scene.remove(s.body);
            s.body.traverse((o) => {
                if (o.geometry && o.geometry !== s.geoRes.geo) o.geometry.dispose();
                o.material?.dispose?.();
            });
        }
        const { group, anchors: an } = buildBody(model, { showRings, showPliche, interactive, activeId }, s.geoRes);
        s.scene.add(group);
        s.body = group;
        s.anchors = an;
        setAnchors(an);
        s.dirty = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [overlayKey]);

    // le etichette nuove vanno misurate e messe al loro posto
    useEffect(() => {
        const s = st.current;
        if (s.updateLabels) s.updateLabels();
    }, [anchors]);

    // quando si sceglie un punto la camera si gira per mostrarlo
    useEffect(() => {
        const s = st.current;
        if (!s.scene || !activeId) return;
        const def = [...CIRC_SITES, ...PLI_SITES].find((x) => x.id === activeId);
        if (def) s.azTarget = def.az;
    }, [activeId]);

    st.current.onManual = () => setView(-1);
    const turn = (i) => {
        setView(i);
        st.current.azTarget = VIEWS[i][1];
    };

    return (
        <div ref={wrapRef} className="relative w-full h-full min-h-[320px] select-none" style={{ background: 'radial-gradient(ellipse at 50% 38%, #ffffff 0%, #f5f3f0 70%)' }}>
            <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
            <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            {anchors.map((a) => (
                <button
                    key={a.id}
                    ref={(el) => {
                        if (el) labelRefs.current[a.id] = el;
                        else delete labelRefs.current[a.id];
                    }}
                    type="button"
                    onClick={() => onPickRef.current && onPickRef.current(a.id)}
                    className={`absolute left-0 top-0 h-[26px] px-2.5 rounded-full flex items-center gap-1.5 text-[12px] whitespace-nowrap border shadow-sm transition-opacity ${a.active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white/95 text-stone-600 border-stone-200'} ${onPick ? 'cursor-pointer hover:border-gray-900' : 'pointer-events-none'}`}
                    style={{ transform: 'translate(-999px,-999px)' }}
                >
                    <span className="w-2 h-2 rounded-full flex-none" style={{ background: a.active ? '#fff' : a.color }} />
                    <span className="font-semibold">{a.name}</span>
                    {a.value && <b className={a.active ? 'text-white' : 'text-stone-900'}>{a.value}</b>}
                </button>
            ))}
            {views && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-0.5 p-0.5 rounded-full bg-white/90 border border-stone-200 shadow-sm backdrop-blur">
                    {VIEWS.map(([l], i) => (
                        <button key={l} type="button" onClick={() => turn(i)} className={`px-3 h-7 rounded-full text-[11px] font-bold transition-colors ${view === i ? 'bg-gray-900 text-white' : 'text-stone-500 hover:text-stone-900'}`}>
                            {l}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
