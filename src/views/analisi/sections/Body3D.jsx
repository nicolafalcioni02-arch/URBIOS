import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildHumanGeometry } from './humanBody';
import { CIRC_SITES, PLI_SITES } from './measureSites';

const TWO_PI = Math.PI * 2;
const GRAY = '#9ca3af';
const ACTIVE = '#111827';

// Modello: { sesso, altezza, peso, fm, collo, torace, vita, fianchi, braccio, coscia, polpaccio (cm), pl: { pl_tricipite: mm, ... } }
const label = (text, color, big, k = 1) => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 112;
    const x = c.getContext('2d');
    x.fillStyle = big ? '#111827' : 'rgba(255,255,255,0.96)';
    x.beginPath();
    x.roundRect(4, 6, 504, 100, 50);
    x.fill();
    x.strokeStyle = color;
    x.lineWidth = 7;
    x.stroke();
    x.fillStyle = big ? '#ffffff' : '#111827';
    x.font = 'bold 54px sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(text, 256, 58, 450); // maxWidth: i nomi lunghi si stringono invece di uscire dall'etichetta
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true, sizeAttenuation: false }));
    sp.scale.set(0.115 * k, 0.0252 * k, 1); // frazione dell'altezza della vista: leggibile a qualsiasi zoom
    sp.renderOrder = 10;
    return sp;
};

const waistColor = (m) => {
    const whtr = m.vita > 0 && m.altezza > 0 ? m.vita / m.altezza : 0;
    return !whtr ? '#0ea5e9' : whtr < 0.5 ? '#10b981' : whtr < 0.6 ? '#f59e0b' : '#ef4444';
};
const RING_COLORS = { collo: '#8b5cf6', torace: '#0ea5e9', fianchi: '#14b8a6', braccio: '#6366f1', coscia: '#f97316', polpaccio: '#ec4899' };
const RING_SIDE = { collo: 1, torace: 1, vita: 1, fianchi: -1, braccio: -1, coscia: -1, polpaccio: -1 };
const short = (l) => l.replace(/ \(.*\)/, '');

function buildBody(m, opts, geoRes) {
    const { showRings, showPliche, interactive, activeId, aspect = 0.6, labelScale = 1 } = opts;
    const H = (m.altezza || 175) / 100;
    const F = m.sesso === 'F';
    const fmMax = F ? 40 : 32;
    const t = Math.max(0, Math.min(1, (m.fm || 0) / fmMax));
    const skin = new THREE.Color('#e9c4a6').lerp(new THREE.Color('#dd7b66'), m.fm ? t * 0.6 : 0);
    const overlay = showRings || showPliche;
    const mat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.62, metalness: 0, transparent: overlay, opacity: overlay ? 0.9 : 1 });
    const g = new THREE.Group();
    const { geo, sites } = geoRes;
    const bodyMesh = new THREE.Mesh(geo, mat);
    g.add(bodyMesh);
    const pick = [];
    const layer = new THREE.Group();
    g.add(layer);

    const shown = (val) => interactive || val > 0;

    // etichette: in due colonne ai lati del corpo, distanziate tra loro, con una linea fino al punto
    const labels = [];
    const addLabel = (text, color, big, anchor, side) => labels.push({ text, color, big, anchor, side: side || (anchor.x < 0 ? -1 : 1) });

    // ---- anelli delle circonferenze ----
    const addRing = (def, cm, pts, lx, ly, lz) => {
        const filled = cm > 0;
        const active = activeId === def.id;
        const color = active ? ACTIVE : filled ? (def.id === 'vita' ? waistColor(m) : RING_COLORS[def.id]) : GRAY;
        const curve = new THREE.CatmullRomCurve3(pts, true);
        const rad = H * (active ? 0.0065 : filled ? 0.0036 : 0.0028);
        const faded = !filled && !active;
        layer.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 96, rad, 8, true), new THREE.MeshBasicMaterial({ color, transparent: faded, opacity: faded ? 0.75 : 1 })));
        if (interactive) {
            const hit = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, H * 0.022, 6, true), new THREE.MeshBasicMaterial({ visible: false }));
            hit.userData.id = def.id;
            layer.add(hit);
            pick.push(hit);
        }
        if (filled || active || interactive) {
            addLabel(filled ? `${short(def.label)} ${Math.round(cm)} cm` : short(def.label), color, active, new THREE.Vector3(lx, ly, lz), RING_SIDE[def.id]);
        }
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
                const rad = (cm > 0 ? cm : 30) / 100 / TWO_PI;
                const pts = [];
                for (let i = 0; i < 48; i++) {
                    const a = (i / 48) * TWO_PI;
                    pts.push(c.clone().addScaledVector(u, Math.cos(a) * rad * 1.12).addScaledVector(v, Math.sin(a) * rad * 1.12));
                }
                addRing(def, cm, pts, c.x, c.y, c.z);
                return;
            }
            const s = sites[def.id];
            if (!s) return;
            const pts = [];
            for (let i = 0; i < 72; i++) {
                const a = (i / 72) * TWO_PI;
                pts.push(new THREE.Vector3(s.cx + Math.cos(a) * s.a * 1.025, s.y, s.cz + Math.sin(a) * s.b * 1.025));
            }
            addRing(def, cm, pts, RING_SIDE[def.id] < 0 ? s.cx - s.a : s.cx + s.a, s.y, s.cz);
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
            // raggio dall'esterno verso il corpo: il punto colpito è sulla pelle
            const origin = target.clone().addScaledVector(dir, p.type === 'leg' && dir.x > 0 ? 0.12 : 0.8);
            ray.set(origin, dir.clone().negate());
            const hit = ray.intersectObject(bodyMesh, false)[0];
            if (!hit) return;
            const active = activeId === def.id;
            const color = active ? ACTIVE : mm > 0 ? '#f59e0b' : GRAY;
            const r = mm > 0 ? H * (0.007 + 0.0034 * Math.sqrt(mm)) : H * 0.011;
            const faded = mm === 0 && !active;
            const sph = new THREE.Mesh(new THREE.SphereGeometry(active ? r * 1.25 : r, 20, 16), new THREE.MeshStandardMaterial({ color, roughness: 0.4, transparent: faded, opacity: faded ? 0.8 : 1 }));
            sph.position.copy(hit.point).addScaledVector(dir, r * 0.5);
            layer.add(sph);
            if (interactive) {
                const hitMesh = new THREE.Mesh(new THREE.SphereGeometry(Math.max(r, H * 0.022), 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
                hitMesh.position.copy(sph.position);
                hitMesh.userData.id = def.id;
                layer.add(hitMesh);
                pick.push(hitMesh);
            }
            if (mm > 0 || active) addLabel(mm > 0 ? `${def.label} ${mm} mm` : def.label, color, active, sph.position.clone());
        });
    }

    // disposizione: colonne a x fisso, ordinate per altezza e distanziate
    const gap = 0.085 * labelScale;
    // le colonne stanno dentro la vista: semilarghezza visibile a distanza normale meno metà etichetta
    const colX = Math.max(0.3, Math.min(0.62, 0.2867 * 4.1 * aspect - 0.16 * labelScale));
    // bilancia i due lati: se uno ne ha molte più dell'altro sposta quelle più vicine al centro
    const left = labels.filter((l) => l.side < 0);
    const right = labels.filter((l) => l.side > 0);
    const moveSome = (from, to, toSide) => {
        while (from.length - to.length > 1) {
            from.sort((a, b) => Math.abs(b.anchor.x) - Math.abs(a.anchor.x));
            const l = from.pop();
            l.side = toSide;
            to.push(l);
        }
    };
    moveSome(left, right, 1);
    moveSome(right, left, -1);
    [-1, 1].forEach((side) => {
        const items = labels.filter((l) => l.side === side).sort((a, b) => a.anchor.y - b.anchor.y);
        const ys = items.map((l) => l.anchor.y);
        for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + gap);
        const top = H * 1.02;
        if (ys.length && ys[ys.length - 1] > top) {
            ys[ys.length - 1] = top;
            for (let i = ys.length - 2; i >= 0; i--) ys[i] = Math.min(ys[i], ys[i + 1] - gap);
        }
        items.forEach((l, i) => {
            const sp = label(l.text, l.color, l.big, labelScale);
            sp.position.set(side * colX, ys[i], 0.1);
            layer.add(sp);
            const line = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([l.anchor, new THREE.Vector3(side * (colX - 0.1 * labelScale), ys[i], 0.1)]),
                new THREE.LineBasicMaterial({ color: l.color, depthTest: false, transparent: true, opacity: 0.55 })
            );
            line.renderOrder = 9;
            layer.add(line);
        });
    });
    g.userData = { pick };
    return g;
}

// Immagine fissa del modello (per il report): rendering fuori schermo, dal lato `az` (0 davanti, PI dietro).
export const snapshotBody = (model, opts = {}, az = 0, w = 520, h = 800) => {
    const H = (model.altezza || 175) / 100;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(2);
    renderer.setSize(w, h);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 50);
    const dist = 4.3;
    camera.position.set(Math.sin(az) * dist, H * 0.5 + 0.5, Math.cos(az) * dist);
    camera.lookAt(0, H * 0.5, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb0b8c8, 1.2));
    const d1 = new THREE.DirectionalLight(0xffffff, 1.3);
    d1.position.set(2, 3, 4);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xffffff, 0.8);
    d2.position.set(-2, 2, -4);
    scene.add(d2);
    const geoRes = buildHumanGeometry(model);
    scene.add(buildBody(model, { showRings: false, showPliche: false, interactive: false, activeId: null, aspect: w / h, labelScale: 1.3, ...opts }, geoRes));
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/png');
    scene.traverse((o) => {
        o.geometry?.dispose?.();
        o.material?.dispose?.();
    });
    renderer.dispose();
    return url;
};

export const Body3D = ({ model, showRings = true, showPliche = false, interactive = false, activeId = null, onPick }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef({});
    const onPickRef = useRef(onPick);
    onPickRef.current = onPick;

    // setup scena (una sola volta)
    useEffect(() => {
        const el = mountRef.current;
        const w = el.clientWidth || 300;
        const h = el.clientHeight || 400;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 50);
        camera.position.set(0, 1, 4.1);
        scene.add(new THREE.HemisphereLight(0xffffff, 0xb0b8c8, 1.1));
        const dir = new THREE.DirectionalLight(0xffffff, 1.4);
        dir.position.set(2, 3, 4);
        scene.add(dir);
        const back = new THREE.DirectionalLight(0xffffff, 0.7);
        back.position.set(-2, 2, -4);
        scene.add(back);

        const floor = new THREE.Mesh(new THREE.CircleGeometry(0.5, 48), new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.12 }));
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.minDistance = 1.2;
        controls.maxDistance = 7;
        controls.autoRotate = !interactive;
        controls.autoRotateSpeed = 1.2;
        controls.target.set(0, 0.9, 0);
        controls.update();

        const st = { scene, camera, controls, renderer, azTarget: null, down: null };
        sceneRef.current = st;

        // clic su anelli/pliche (distinto dal trascinamento per ruotare)
        const ndc = new THREE.Vector2();
        const rc = new THREE.Raycaster();
        const pickAt = (e) => {
            const body = st.body;
            if (!body || !body.userData.pick.length) return null;
            const r = renderer.domElement.getBoundingClientRect();
            ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
            rc.setFromCamera(ndc, camera);
            const hit = rc.intersectObjects(body.userData.pick, false)[0];
            return hit ? hit.object.userData.id : null;
        };
        const onDown = (e) => {
            controls.autoRotate = false;
            st.azTarget = null;
            st.down = { x: e.clientX, y: e.clientY };
        };
        const onUp = (e) => {
            if (!st.down) return;
            const moved = Math.hypot(e.clientX - st.down.x, e.clientY - st.down.y);
            st.down = null;
            if (moved > 5) return;
            const id = pickAt(e);
            if (id && onPickRef.current) onPickRef.current(id);
        };
        const onMoveHover = (e) => {
            if (!interactive) return;
            renderer.domElement.style.cursor = pickAt(e) ? 'pointer' : 'grab';
        };
        renderer.domElement.addEventListener('pointerdown', onDown);
        renderer.domElement.addEventListener('pointerup', onUp);
        renderer.domElement.addEventListener('pointermove', onMoveHover);

        let raf;
        const clock = new THREE.Clock();
        const loop = () => {
            raf = requestAnimationFrame(loop);
            if (st.body && !interactive) st.body.scale.y = 1 + 0.004 * Math.sin(clock.getElapsedTime() * 1.6); // respiro
            if (st.azTarget !== null) {
                // la camera si gira verso il punto scelto
                const off = camera.position.clone().sub(controls.target);
                const cur = Math.atan2(off.x, off.z);
                let diff = st.azTarget - cur;
                diff = Math.atan2(Math.sin(diff), Math.cos(diff));
                if (Math.abs(diff) < 0.01) st.azTarget = null;
                else {
                    const na = cur + diff * 0.12;
                    const rad = Math.hypot(off.x, off.z);
                    camera.position.set(controls.target.x + Math.sin(na) * rad, camera.position.y, controls.target.z + Math.cos(na) * rad);
                }
            }
            controls.update();
            renderer.render(scene, camera);
        };
        loop();

        const ro = new ResizeObserver(() => {
            const nw = el.clientWidth;
            const nh = el.clientHeight;
            if (!nw || !nh) return;
            renderer.setSize(nw, nh);
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
        });
        ro.observe(el);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            renderer.domElement.removeEventListener('pointerdown', onDown);
            renderer.domElement.removeEventListener('pointerup', onUp);
            renderer.domElement.removeEventListener('pointermove', onMoveHover);
            controls.dispose();
            scene.traverse((o) => {
                o.geometry?.dispose?.();
                o.material?.dispose?.();
            });
            renderer.dispose();
            el.removeChild(renderer.domElement);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // la forma del corpo cambia solo con le misure; anelli e pliche si ricostruiscono anche con selezione e livelli
    const geoKey = JSON.stringify({ ...model, pl: undefined });
    const overlayKey = JSON.stringify(model.pl || {}) + geoKey + showRings + showPliche + interactive + activeId;
    useEffect(() => {
        const st = sceneRef.current;
        if (!st.scene) return;
        if (st.geoKey !== geoKey) {
            if (st.geoRes) st.geoRes.geo.dispose();
            st.geoRes = buildHumanGeometry(model);
            st.geoKey = geoKey;
            const H = (model.altezza || 175) / 100;
            st.controls.target.set(0, H * 0.5, 0);
            st.controls.update();
        }
        if (st.body) {
            st.scene.remove(st.body);
            st.body.traverse((o) => {
                if (o.geometry && o.geometry !== st.geoRes.geo) o.geometry.dispose();
            });
        }
        const body = buildBody(model, { showRings, showPliche, interactive, activeId, aspect: st.camera.aspect }, st.geoRes);
        st.scene.add(body);
        st.body = body;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [overlayKey]);

    // quando si sceglie un punto la camera si gira per mostrarlo
    useEffect(() => {
        const st = sceneRef.current;
        if (!st.scene || !activeId) return;
        const def = [...CIRC_SITES, ...PLI_SITES].find((s) => s.id === activeId);
        if (def) {
            st.controls.autoRotate = false;
            st.azTarget = def.az;
        }
    }, [activeId]);

    return <div ref={mountRef} className="w-full h-full min-h-[320px] cursor-grab active:cursor-grabbing" />;
};
