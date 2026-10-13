import React, { useRef, useEffect } from 'react';

// --- SHADERS PER LA SFERA (HubSphere) ---
const sphereVertex = `attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;
const sphereFragment = `
    precision highp float; uniform vec2 iResolution; uniform float iTime;
    mat2 m(float a){float c=cos(a), s=sin(a);return mat2(c,-s,s,c);}
    float map(vec3 p){ p.xz*= m(iTime*0.4); p.xy*= m(iTime*0.3); vec3 q = p*2.+iTime; return length(p+vec3(sin(iTime*0.7)))*log(length(p)+1.) + sin(q.x+sin(q.z+sin(q.y)))*0.5 - 1.; }
    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / min(iResolution.y, iResolution.x); uv *= 1.2;
        vec3 cl = vec3(0.); float d = 2.5;
        for(int i=0; i<=5; i++) {
            vec3 p3d = vec3(0,0,5.) + normalize(vec3(uv, -1.))*d;
            float rz = map(p3d); float f = clamp((rz - map(p3d+.1))*0.5, -.1, 1.);
            vec3 deepBase = vec3(0.9, 0.92, 0.95); 
            vec3 iridescence = vec3(0.8 + 0.2 * sin(f * 3.0 + iTime), 0.8 + 0.1 * cos(f * 2.0), 1.0); 
            vec3 pearl = vec3(1.0, 1.0, 1.0) * smoothstep(0.4, 1.0, f*f); 
            vec3 baseColor = deepBase + iridescence * f * 1.2 + pearl;
            cl = cl*baseColor + smoothstep(2.5, .0, rz)*.7*baseColor; d += min(rz, 1.);
        }
        float dist = length(uv); 
        float alpha = smoothstep(0.8, 0.5, dist) * 0.8; 
        gl_FragColor = vec4(cl, alpha);
    }
`;

// --- SHADERS PER LO SFONDO (HubBackground) ---
const bgVertex = `attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;
const bgFragment = `
    precision highp float; uniform vec2 iResolution; uniform float iTime; 
    void main() { 
        vec2 uv = gl_FragCoord.xy / iResolution.xy; 
        float t = iTime * 0.15; 
        float wave = sin(uv.x * 2.5 + t) * cos(uv.y * 2.0 - t * 0.8) + sin(uv.x*uv.y*4.0); 
        vec3 colBase = vec3(0.96, 0.97, 0.98); 
        vec3 colShadow = vec3(0.90, 0.92, 0.94); 
        vec3 finalCol = mix(colBase, colShadow, smoothstep(-1.0, 1.0, wave)); 
        gl_FragColor = vec4(finalCol, 1.0); 
    }
`;

// --- MOTORE DI RENDERING GENERICO (Ottimizzato) ---
const WebGLRenderer = ({ vertex, fragment, size, className, isBackground = false }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        // Alpha: true serve per la trasparenza della sfera. Per lo sfondo non serve (risparmia risorse se false)
        const gl = canvas.getContext('webgl', { alpha: !isBackground, antialias: false });

        if (!gl) return;

        // Compilazione Shader
        const createShader = (gl, type, source) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, source);
            gl.compileShader(s);
            // Controllo errori (opzionale in prod, ma utile)
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.warn(gl.getShaderInfoLog(s));
                gl.deleteShader(s);
                return null;
            }
            return s;
        };

        const vs = createShader(gl, gl.VERTEX_SHADER, vertex);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fragment);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);

        // Geometria (un quadrato che copre il canvas)
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const timeLoc = gl.getUniformLocation(program, 'iTime');
        const resLoc = gl.getUniformLocation(program, 'iResolution');

        let animationId;
        const startTime = Date.now();

        // Funzione di Loop
        const render = () => {
            // OTTIMIZZAZIONE BATTERIA:
            // Riduciamo la risoluzione su schermi Retina per evitare calcoli inutili su sfondi sfocati
            const pixelRatio = isBackground ? 1 : window.devicePixelRatio || 1;

            // Gestione dimensioni dinamica
            let displayWidth, displayHeight;

            if (isBackground) {
                displayWidth = window.innerWidth;
                displayHeight = window.innerHeight;
            } else {
                displayWidth = Math.floor(size * pixelRatio);
                displayHeight = Math.floor(size * pixelRatio);
            }

            if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                canvas.width = displayWidth;
                canvas.height = displayHeight;
                gl.viewport(0, 0, displayWidth, displayHeight);
            }

            gl.uniform1f(timeLoc, (Date.now() - startTime) * 0.001);
            gl.uniform2f(resLoc, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationId = requestAnimationFrame(render);
        };

        render();

        // PULIZIA (CLEANUP): Fondamentale per fermare la GPU quando cambi pagina
        return () => {
            cancelAnimationFrame(animationId);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
        };
    }, [vertex, fragment, size, isBackground]);

    return <canvas ref={canvasRef} className={className} style={size ? { width: size, height: size } : {}} />;
};

// --- COMPONENTI ESPORTATI ---

export const ShaderCanvas = ({ size, className }) => {
    return <WebGLRenderer vertex={sphereVertex} fragment={sphereFragment} size={size} className={className} />;
};

export const HubBackground = () => {
    return <WebGLRenderer vertex={bgVertex} fragment={bgFragment} className="bg-shader-canvas fixed inset-0 w-full h-full -z-10" isBackground={true} />;
};

export const HubSphere = ({ size }) => {
    return <ShaderCanvas size={size} className="rounded-full shadow-2xl" />;
};
