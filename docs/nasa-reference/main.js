import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ============================================================================
// 1. CONSTANTES DE Mapa_mars_ver1.qgs (SIM3292 + MOLA) Y ZONAS DE RADIACIÓN
// ============================================================================
const R_MARS = 3396190.0;
const G_MARS = 3.71;

const FAMILIES = [
    { key: "Lowland",    es: "Tierras bajas",        color: "#7cb342", cost: 1.0, code: "lHl" },
    { key: "Volcanic",   es: "Volcánico",            color: "#e64a19", cost: 1.3, code: "lHv" },
    { key: "Transition", es: "Transición",           color: "#c0ca33", cost: 1.3, code: "lHt" },
    { key: "Highland",   es: "Tierras altas",        color: "#b08968", cost: 1.5, code: "mNh" },
    { key: "Basin",      es: "Cuencas y macizos",    color: "#26a69a", cost: 1.6, code: "HNb" },
    { key: "Widespread", es: "Depósitos extendidos", color: "#9575cd", cost: 1.7, code: "Aa"  },
    { key: "Polar",      es: "Polar",                color: "#b3e5fc", cost: 2.5, code: "Ap"  }
];

const STRUCT_STYLE = {
    "scarp":           { color: "#e53935", dash: [],     lw: 2.0, es: "Escarpes",           hard: true,  cost: 99 },
    "caldera rim":     { color: "#8e0000", dash: [],     lw: 1.6, es: "Bordes de caldera",  hard: true,  cost: 99 },
    "graben axis":     { color: "#ec407a", dash: [6, 3], lw: 1.8, es: "Grabens / fosas",    hard: true,  cost: 99 },
    "rille":           { color: "#ffd600", dash: [5, 2], lw: 1.8, es: "Surcos lineales",    hard: true,  cost: 99 },
    "wrinkle ridge":   { color: "#43a047", dash: [5, 2], lw: 1.5, es: "Crestas arrugadas",  hard: false, cost: 2.5 },
    "crater rim":      { color: "#f5f5f5", dash: [],     lw: 1.2, es: "Bordes de cráter",   hard: false, cost: 2.0 },
    "outflow channel": { color: "#ff9800", dash: [2, 2], lw: 1.8, es: "Canales de desagüe", hard: false, cost: 2.0 }
};

const SLOPE_CLASSES = [
    { max: 1.5, color: "#4caf50", txt: "< 1.5° casi plano" },
    { max: 3.5, color: "#fdd835", txt: "1.5° – 3.5° suave" },
    { max: 6.5, color: "#fb8c00", txt: "3.5° – 6.5° moderada" },
    { max: 999, color: "#d32f2f", txt: "> 6.5° fuerte" }
];

const GLOBAL_RAD_ZONES = [
    { lon: -134.0, lat: 18.6,  radDeg: 18, peakMsvKm: 4.8, name: "Anomalía Olympus (Alta Cota)" },
    { lon: -108.0, lat: 4.0,   radDeg: 22, peakMsvKm: 4.2, name: "Cinturón Radiactivo Tharsis" },
    { lon: 77.5,   lat: 18.4,  radDeg: 14, peakMsvKm: 3.4, name: "Foco Solar Jezero Norte" },
    { lon: 137.4,  lat: -4.6,  radDeg: 15, peakMsvKm: 3.6, name: "Foco Cósmico Gale / Aeolis" },
    { lon: 175.4,  lat: -14.5, radDeg: 16, peakMsvKm: 3.8, name: "Anomalía Gusev Sur" },
    { lon: -49.9,  lat: 22.3,  radDeg: 15, peakMsvKm: 3.1, name: "Foco Chryse Planitia" },
    { lon: 25.0,   lat: -35.0, radDeg: 20, peakMsvKm: 4.4, name: "Tierras Altas Noachis (Sin Campo)" },
    { lon: -70.0,  lat: -12.0, radDeg: 16, peakMsvKm: 3.5, name: "Borde Superior Marineris" }
];

const LANDING_SITES = [
    { name: "Perseverance (Jezero)", lon: 77.5,   lat: 18.4  },
    { name: "Spirit (Gusev)",        lon: 175.4,  lat: -14.5 },
    { name: "Curiosity (Gale)",      lon: 137.4,  lat: -4.6  },
    { name: "Viking 1 (Chryse)",     lon: -49.97, lat: 22.3  },
    { name: "Pathfinder (Ares)",     lon: -33.2,  lat: 19.1  },
    { name: "Opportunity",           lon: -5.5,   lat: -1.9  }
];

function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function sampleMarsContinuous(lon, lat) {
    const blob = (lon0, lat0, r, h) => {
        const dx = (lon - lon0) * Math.cos(lat0 * Math.PI / 180);
        const dy = lat - lat0;
        return h * Math.exp(-((dx * dx + dy * dy) / (r * r)));
    };

    let dem = Math.sin(lon * 0.05) * Math.cos(lat * 0.05) * 1650
            + Math.sin((lon + 35) * 0.12) * Math.sin(lat * 0.11) * 820
            + Math.cos(lon * 0.25 - lat * 0.21) * 340
            - 2500 * Math.tanh(lat / 28.0);

    dem += blob(-134, 18, 9, 16000) + blob(-112, 1, 7, 8600) + blob(-100, 9, 7, 7600);
    dem += blob(70, -42, 11, -8400) + blob(-52, -52, 6, -4400);
    if (lon > -100 && lon < -40) {
        const cyn = (lat + 12 + 0.06 * (lon + 70)) / 2.0;
        dem -= 5000 * Math.exp(-(cyn * cyn));
    }

    const meso = Math.sin(lon * 1.4) * Math.cos(lat * 1.4) * 520
               + Math.sin(lon * 3.8 + lat * 2.9) * 240
               + Math.cos(lon * 7.5 - lat * 6.8) * 110;
    dem += meso;

    let fam = 3;
    if (Math.abs(lat) > 76) fam = 6;
    else if (dem < -3300) fam = 4;
    else if (dem > 3200) fam = 1;
    else if (lat > 8 && dem < -500) fam = 0;
    else if (Math.abs(lat - 6) < 8) fam = 2;
    else if (Math.sin(lon * 0.22 + lat * 0.19) > 0.72) fam = 5;

    let radMsvKm = 0.45 + Math.max(0, (dem + 4000) / 14000) * 0.85;
    for (const rz of GLOBAL_RAD_ZONES) {
        const dDeg = Math.hypot(lon - rz.lon, lat - rz.lat);
        if (dDeg < rz.radDeg * 1.8) {
            radMsvKm += rz.peakMsvKm * Math.exp(-((dDeg * dDeg) / (rz.radDeg * rz.radDeg * 0.6)));
        }
    }

    return { dem, fam, radMsvKm };
}

// ============================================================================
// 2. CONSTRUCCIÓN DE LA MALLA GLOBAL 2D
// ============================================================================
const GW = 720, GH = 360, DEG = 0.5;
const globalDem = new Float32Array(GW * GH);
const globalSlope = new Float32Array(GW * GH);
const globalHs = new Float32Array(GW * GH);
const globalUnit = new Uint8Array(GW * GH);
const globalRad = new Float32Array(GW * GH);
const globalHard = new Uint8Array(GW * GH);
const globalSoft = new Float32Array(GW * GH).fill(1.0);
const globalLines = [];

function buildGlobal2DData() {
    for (let r = 0; r < GH; r++) {
        const lat = 90 - (r + 0.5) * DEG;
        for (let c = 0; c < GW; c++) {
            const lon = -180 + (c + 0.5) * DEG;
            const idx = r * GW + c;
            const { dem, fam, radMsvKm } = sampleMarsContinuous(lon, lat);
            globalDem[idx] = dem;
            globalUnit[idx] = fam;
            globalRad[idx] = radMsvKm;
        }
    }

    const dy = R_MARS * (DEG * Math.PI / 180);
    const az = 315 * Math.PI / 180, alt = 45 * Math.PI / 180;
    for (let r = 0; r < GH; r++) {
        const lat = 90 - (r + 0.5) * DEG;
        const dx = Math.max(R_MARS * Math.cos(lat * Math.PI / 180) * (DEG * Math.PI / 180), 0.25 * dy);
        for (let c = 0; c < GW; c++) {
            const idx = r * GW + c;
            const r0 = Math.max(0, r - 1), r1 = Math.min(GH - 1, r + 1);
            const c0 = (c - 1 + GW) % GW, c1 = (c + 1) % GW;
            const gn = -(globalDem[r1 * GW + c] - globalDem[r0 * GW + c]) / (2 * dy);
            const ge = (globalDem[r * GW + c1] - globalDem[r * GW + c0]) / (2 * dx);
            const mag = Math.hypot(ge, gn);
            globalSlope[idx] = Math.atan(mag * 5.5) * (180 / Math.PI);

            const sl = Math.atan(8.0 * mag);
            const asp = Math.atan2(-ge, -gn);
            const hs = Math.cos(sl) * Math.sin(alt) + Math.sin(sl) * Math.cos(alt) * Math.cos(az - asp);
            globalHs[idx] = Math.max(0, Math.min(1, hs));
        }
    }

    const morphs = Object.keys(STRUCT_STYLE);
    let seed = 101;
    const rng = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

    for (let i = 0; i < 320; i++) {
        const morph = morphs[i % morphs.length];
        const rule = STRUCT_STYLE[morph];
        let x = -175 + rng() * 350, y = -80 + rng() * 160, ang = rng() * Math.PI * 2;
        const pts = [[x, y]];
        const nSteps = 5 + Math.floor(rng() * 12);
        for (let s = 0; s < nSteps; s++) {
            ang += (rng() - 0.5) * 0.5;
            x += 1.4 * Math.cos(ang);
            y += 1.4 * Math.sin(ang);
            if (Math.abs(x) < 179 && Math.abs(y) < 86) pts.push([x, y]);
        }
        if (pts.length > 2) {
            globalLines.push({ morph, pts });
            for (let k = 0; k < pts.length - 1; k++) {
                const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
                for (let t = 0; t <= 12; t++) {
                    const lx = x0 + (x1 - x0) * (t / 12), ly = y0 + (y1 - y0) * (t / 12);
                    const cc = Math.min(GW - 1, Math.max(0, Math.floor((lx + 180) / DEG)));
                    const rr = Math.min(GH - 1, Math.max(0, Math.floor((90 - ly) / DEG)));
                    const id = rr * GW + cc;
                    if (rule.hard) globalHard[id] = 1;
                    else globalSoft[id] = Math.max(globalSoft[id], rule.cost);
                }
            }
        }
    }
}
buildGlobal2DData();

// ============================================================================
// 3. VISOR 2D CON CAPA DE RADIACIÓN Y ZOOM AUTOMÁTICO A 3D
// ============================================================================
const canvas2D = document.getElementById('canvas-2d');
const ctx2D = canvas2D.getContext('2d');

let view2D = { lonMin: -180, lonMax: 180, latMin: -90, latMax: 90 };
let layer2D = 0;
let show2D = { struct: true, onlyHard: false, radZones: true, sites: true, grid: false };
let activeMode = '2d';
const AUTO_3D_SPAN_DEG = 28.0;

const layerCanvases2D = [];

function heightCmap(t) {
    const stops = [
        [0.00, [20, 32, 107]], [0.20, [47, 111, 189]], [0.40, [111, 195, 192]],
        [0.52, [139, 198, 106]], [0.66, [233, 228, 124]], [0.84, [201, 138, 71]], [1.00, [255, 255, 255]]
    ];
    for (let i = 0; i < stops.length - 1; i++) {
        if (t <= stops[i + 1][0]) {
            const f = (t - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
            return [
                stops[i][1][0] + f * (stops[i + 1][1][0] - stops[i][1][0]),
                stops[i][1][1] + f * (stops[i + 1][1][1] - stops[i][1][1]),
                stops[i][1][2] + f * (stops[i + 1][1][2] - stops[i][1][2])
            ];
        }
    }
    return [255, 255, 255];
}

function radCmap(t) {
    const stops = [
        [0.00, [34, 197, 94]],
        [0.30, [250, 204, 21]],
        [0.55, [249, 115, 22]],
        [0.80, [239, 68, 68]],
        [1.00, [217, 70, 239]]
    ];
    const cl = Math.max(0, Math.min(1, t));
    for (let i = 0; i < stops.length - 1; i++) {
        if (cl <= stops[i + 1][0]) {
            const f = (cl - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
            return [
                stops[i][1][0] + f * (stops[i + 1][1][0] - stops[i][1][0]),
                stops[i][1][1] + f * (stops[i + 1][1][1] - stops[i][1][1]),
                stops[i][1][2] + f * (stops[i + 1][1][2] - stops[i][1][2])
            ];
        }
    }
    return [217, 70, 239];
}

function prebuild2DLayers() {
    for (let l = 0; l < 5; l++) {
        const off = document.createElement('canvas');
        off.width = GW; off.height = GH;
        const octx = off.getContext('2d');
        const img = octx.createImageData(GW, GH);
        const d = img.data;

        for (let i = 0; i < GW * GH; i++) {
            const dem = globalDem[i], hs = globalHs[i];
            let rgb = [128, 128, 128], shade = 0.65;
            if (l === 0) {
                rgb = heightCmap(Math.max(0, Math.min(1, (dem + 7000) / 21000)));
                shade = 0.75;
            } else if (l === 1) {
                const g = Math.max(0, Math.min(255, (0.12 + 0.88 * hs) * 255));
                rgb = [g, g, g]; shade = 0;
            } else if (l === 2) {
                rgb = hexToRgb(FAMILIES[globalUnit[i]].color); shade = 0.35;
            } else if (l === 3) {
                const sl = globalSlope[i];
                const sc = SLOPE_CLASSES.find(c => sl <= c.max) || SLOPE_CLASSES[3];
                rgb = hexToRgb(sc.color); shade = 0.30;
            } else {
                const tRad = (globalRad[i] - 0.4) / 4.5;
                rgb = radCmap(tRad); shade = 0.45;
            }
            const f = shade > 0 ? Math.max(0.25, Math.min(1.28, 1 - shade + shade * (hs / 0.7071))) : 1.0;
            d[i * 4 + 0] = Math.min(255, rgb[0] * f);
            d[i * 4 + 1] = Math.min(255, rgb[1] * f);
            d[i * 4 + 2] = Math.min(255, rgb[2] * f);
            d[i * 4 + 3] = 255;
        }
        octx.putImageData(img, 0, 0);
        layerCanvases2D[l] = off;
    }
}
prebuild2DLayers();

function lonToPx(lon) { return ((lon - view2D.lonMin) / (view2D.lonMax - view2D.lonMin)) * canvas2D.width; }
function latToPy(lat) { return ((view2D.latMax - lat) / (view2D.latMax - view2D.latMin)) * canvas2D.height; }
function pxToLon(x) { return view2D.lonMin + (x / canvas2D.width) * (view2D.lonMax - view2D.lonMin); }
function pyToLat(y) { return view2D.latMax - (y / canvas2D.height) * (view2D.latMax - view2D.latMin); }

let shiftBoxRect = null;

function render2DMap() {
    if (activeMode !== '2d' || canvas2D.clientWidth === 0) return;
    if (canvas2D.width !== canvas2D.clientWidth || canvas2D.height !== canvas2D.clientHeight) {
        canvas2D.width = canvas2D.clientWidth;
        canvas2D.height = canvas2D.clientHeight;
    }
    const W = canvas2D.width, H = canvas2D.height;
    ctx2D.clearRect(0, 0, W, H);
    ctx2D.imageSmoothingEnabled = false;

    const sx = ((view2D.lonMin + 180) / 360) * GW;
    const sy = ((90 - view2D.latMax) / 180) * GH;
    const sw = ((view2D.lonMax - view2D.lonMin) / 360) * GW;
    const sh = ((view2D.latMax - view2D.latMin) / 180) * GH;
    ctx2D.drawImage(layerCanvases2D[layer2D], sx, sy, sw, sh, 0, 0, W, H);

    if (show2D.grid) {
        ctx2D.strokeStyle = "rgba(255,255,255,0.3)";
        ctx2D.lineWidth = 1;
        ctx2D.setLineDash([4, 4]);
        for (let lon = -180; lon <= 180; lon += 30) {
            const x = lonToPx(lon);
            ctx2D.beginPath(); ctx2D.moveTo(x, 0); ctx2D.lineTo(x, H); ctx2D.stroke();
        }
        for (let lat = -90; lat <= 90; lat += 30) {
            const y = latToPy(lat);
            ctx2D.beginPath(); ctx2D.moveTo(0, y); ctx2D.lineTo(W, y); ctx2D.stroke();
        }
        ctx2D.setLineDash([]);
    }

    if (show2D.struct) {
        for (const item of globalLines) {
            const st = STRUCT_STYLE[item.morph];
            if (show2D.onlyHard && !st.hard) continue;
            ctx2D.strokeStyle = st.color;
            ctx2D.lineWidth = st.lw;
            ctx2D.setLineDash(st.dash);
            ctx2D.beginPath();
            item.pts.forEach(([lon, lat], i) => {
                const px = lonToPx(lon), py = latToPy(lat);
                if (i === 0) ctx2D.moveTo(px, py); else ctx2D.lineTo(px, py);
            });
            ctx2D.stroke();
        }
        ctx2D.setLineDash([]);
    }

    if (show2D.radZones) {
        for (const rz of GLOBAL_RAD_ZONES) {
            const cx = lonToPx(rz.lon), cy = latToPy(rz.lat);
            const rx = Math.abs(lonToPx(rz.lon + rz.radDeg) - cx);
            if (cx + rx < 0 || cx - rx > W || cy + rx < 0 || cy - rx > H) continue;

            const grad = ctx2D.createRadialGradient(cx, cy, rx * 0.1, cx, cy, rx);
            grad.addColorStop(0, "rgba(217, 70, 239, 0.42)");
            grad.addColorStop(0.6, "rgba(239, 68, 68, 0.22)");
            grad.addColorStop(1, "rgba(239, 68, 68, 0.0)");

            ctx2D.fillStyle = grad;
            ctx2D.beginPath();
            ctx2D.arc(cx, cy, rx, 0, Math.PI * 2);
            ctx2D.fill();

            ctx2D.strokeStyle = "rgba(217, 70, 239, 0.75)";
            ctx2D.lineWidth = 1.4;
            ctx2D.setLineDash([5, 4]);
            ctx2D.beginPath();
            ctx2D.arc(cx, cy, rx * 0.65, 0, Math.PI * 2);
            ctx2D.stroke();
            ctx2D.setLineDash([]);
        }
    }

    if (show2D.sites) {
        ctx2D.font = "bold 11px Segoe UI, sans-serif";
        for (const s of LANDING_SITES) {
            const px = lonToPx(s.lon), py = latToPy(s.lat);
            if (px < 0 || px > W || py < 0 || py > H) continue;
            ctx2D.fillStyle = "#00e5ff";
            ctx2D.strokeStyle = "#000";
            ctx2D.lineWidth = 1;
            ctx2D.beginPath();
            ctx2D.moveTo(px, py - 6); ctx2D.lineTo(px - 5, py + 5); ctx2D.lineTo(px + 5, py + 5);
            ctx2D.closePath(); ctx2D.fill(); ctx2D.stroke();
            ctx2D.fillStyle = "#fff";
            ctx2D.fillText(s.name, px + 8, py + 3);
        }
    }

    if (shiftBoxRect) {
        const x0 = lonToPx(shiftBoxRect.lonMin), x1 = lonToPx(shiftBoxRect.lonMax);
        const y0 = latToPy(shiftBoxRect.latMax), y1 = latToPy(shiftBoxRect.latMin);
        ctx2D.fillStyle = "rgba(255, 152, 0, 0.22)";
        ctx2D.fillRect(x0, y0, x1 - x0, y1 - y0);
        ctx2D.strokeStyle = "#ff9800";
        ctx2D.lineWidth = 2;
        ctx2D.strokeRect(x0, y0, x1 - x0, y1 - y0);
    }

    const spanLon = view2D.lonMax - view2D.lonMin;
    const midLat = (view2D.latMin + view2D.latMax) / 2;
    const kmW = Math.round(spanLon * (Math.PI / 180) * R_MARS * Math.max(0.05, Math.cos(midLat * Math.PI / 180)) / 1000);
    document.getElementById('title-2d').innerText =
        `MARTE — vista: lon ${view2D.lonMin.toFixed(1)}° a ${view2D.lonMax.toFixed(1)}°, lat ${view2D.latMin.toFixed(1)}° a ${view2D.latMax.toFixed(1)}° (~${kmW.toLocaleString()} km de ancho)`;

    const pct = Math.max(0, Math.min(100, ((360 - spanLon) / (360 - AUTO_3D_SPAN_DEG)) * 100));
    document.getElementById('zoom-fill').style.width = `${pct}%`;
    document.getElementById('zoom-span-lbl').innerText = `${spanLon.toFixed(1)}°`;
}

function updateLegend2D() {
    const box = document.getElementById('legend-2d');
    let h = `<div style="background:rgba(217,70,239,0.1); border-left:2.5px solid #d946ef; padding:5px 7px; margin-bottom:6px;">
        <b>☢️ Dosimetría Espacial Marciana:</b><br>
        • Verde (&lt;1.0 mSv/km): Blindaje atmosférico alto<br>
        • Naranja (1.5–2.5 mSv/km): Exposición elevada<br>
        • Violeta/Rojo (&gt;3.0 mSv/km): Anomalía solar letal para astronautas
    </div>`;
    if (layer2D === 0) h += `<div>Altura (m) sobre datum MOLA con sombreado solar.</div>`;
    else if (layer2D === 1) h += `<div>Relieve sombreado (Sol 315° NO, 45°).</div>`;
    else if (layer2D === 2) {
        FAMILIES.forEach(f => {
            h += `<div class="leg-row"><span class="leg-box" style="background:${f.color}"></span><span>${f.es} (${f.code} · x${f.cost})</span></div>`;
        });
    } else if (layer2D === 3) {
        SLOPE_CLASSES.forEach(s => {
            h += `<div class="leg-row"><span class="leg-box" style="background:${s.color}"></span><span>${s.txt}</span></div>`;
        });
    }
    if (show2D.struct) {
        h += `<div style="color:#ef5350; font-weight:700; margin-top:6px;">PELIGRO · Bloqueo total:</div>`;
        Object.values(STRUCT_STYLE).filter(s => s.hard).forEach(s => {
            h += `<div class="leg-row"><span class="leg-line" style="border-top-color:${s.color}; border-top-style:${s.dash.length?'dashed':'solid'}"></span><span>${s.es}</span></div>`;
        });
    }
    box.innerHTML = h;
}
updateLegend2D();

function fitBounds(lo, hi, bmin, bmax) {
    const span = hi - lo;
    if (span >= bmax - bmin) return [bmin, bmax];
    if (lo < bmin) return [bmin, bmin + span];
    if (hi > bmax) return [bmax - span, bmax];
    return [lo, hi];
}

canvas2D.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas2D.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const lon = pxToLon(mx), lat = pyToLat(my);

    const f = e.deltaY < 0 ? 0.72 : 1 / 0.72;
    const newSpanLon = (view2D.lonMax - view2D.lonMin) * f;

    const nx0 = lon - (lon - view2D.lonMin) * f, nx1 = lon + (view2D.lonMax - lon) * f;
    const ny0 = lat - (lat - view2D.latMin) * f, ny1 = lat + (view2D.latMax - lat) * f;

    [view2D.lonMin, view2D.lonMax] = fitBounds(nx0, nx1, -180, 180);
    [view2D.latMin, view2D.latMax] = fitBounds(ny0, ny1, -88, 88);

    render2DMap();

    if (e.deltaY < 0 && newSpanLon <= AUTO_3D_SPAN_DEG && document.getElementById('chk-auto-3d').checked) {
        openRegionIn3D(view2D.lonMin, view2D.latMin, view2D.lonMax, view2D.latMax);
    }
}, { passive: false });

let pan2D = null, shiftStart = null;

canvas2D.addEventListener('mousedown', (e) => {
    const rect = canvas2D.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    if (e.shiftKey && e.button === 0) {
        shiftStart = { lon: pxToLon(mx), lat: pyToLat(my) };
    } else if (e.button === 0) {
        pan2D = { x: mx, y: my, v0: { ...view2D } };
    }
});

window.addEventListener('mousemove', (e) => {
    if (activeMode !== '2d') return;
    const rect = canvas2D.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;

    if (shiftStart) {
        const lon2 = pxToLon(mx), lat2 = pyToLat(my);
        shiftBoxRect = {
            lonMin: Math.max(-180, Math.min(shiftStart.lon, lon2)),
            lonMax: Math.min(180, Math.max(shiftStart.lon, lon2)),
            latMin: Math.max(-85, Math.min(shiftStart.lat, lat2)),
            latMax: Math.min(85, Math.max(shiftStart.lat, lat2))
        };
        render2DMap();
        return;
    }

    if (pan2D) {
        const dLon = ((mx - pan2D.x) / canvas2D.width) * (pan2D.v0.lonMax - pan2D.v0.lonMin);
        const dLat = ((my - pan2D.y) / canvas2D.height) * (pan2D.v0.latMax - pan2D.v0.latMin);
        [view2D.lonMin, view2D.lonMax] = fitBounds(pan2D.v0.lonMin - dLon, pan2D.v0.lonMax - dLon, -180, 180);
        [view2D.latMin, view2D.latMax] = fitBounds(pan2D.v0.latMin + dLat, pan2D.v0.latMax + dLat, -88, 88);
        render2DMap();
        return;
    }

    if (mx >= 0 && mx <= canvas2D.width && my >= 0 && my <= canvas2D.height) {
        const lon = pxToLon(mx), lat = pyToLat(my);
        const c = Math.min(GW - 1, Math.max(0, Math.floor((lon + 180) / DEG)));
        const r = Math.min(GH - 1, Math.max(0, Math.floor((90 - lat) / DEG)));
        const idx = r * GW + c;
        const fam = FAMILIES[globalUnit[idx]];
        document.getElementById('cursor-info').innerText =
            `lon ${lon.toFixed(2)}°  lat ${lat.toFixed(2)}°  altura ${globalDem[idx].toFixed(0)} m  pend. ${globalSlope[idx].toFixed(1)}°  rad. ${globalRad[idx].toFixed(2)} mSv/km  unidad ${fam.code} (${fam.es})`;
    }
});

window.addEventListener('mouseup', () => {
    pan2D = null;
    if (shiftStart && shiftBoxRect) {
        const box = { ...shiftBoxRect };
        shiftStart = null;
        shiftBoxRect = null;
        if (box.lonMax - box.lonMin >= 1.5 && box.latMax - box.latMin >= 1.5) {
            openRegionIn3D(box.lonMin, box.latMin, box.lonMax, box.latMax);
        } else {
            render2DMap();
        }
    }
});

document.querySelectorAll('input[name="l2d"]').forEach(r => {
    r.addEventListener('change', (e) => { layer2D = parseInt(e.target.value, 10); updateLegend2D(); render2DMap(); });
});
document.getElementById('chk-2d-struct').addEventListener('change', (e) => { show2D.struct = e.target.checked; updateLegend2D(); render2DMap(); });
document.getElementById('chk-2d-hard').addEventListener('change', (e) => { show2D.onlyHard = e.target.checked; updateLegend2D(); render2DMap(); });
document.getElementById('chk-2d-rad').addEventListener('change', (e) => { show2D.radZones = e.target.checked; render2DMap(); });
document.getElementById('chk-2d-sites').addEventListener('change', (e) => { show2D.sites = e.target.checked; render2DMap(); });
document.getElementById('chk-2d-grid').addEventListener('change', (e) => { show2D.grid = e.target.checked; render2DMap(); });

function resetToGlobal2D() {
    activeMode = '2d';
    document.getElementById('view-2d').style.display = 'flex';
    document.getElementById('view-3d-ui').style.display = 'none';
    document.getElementById('btn-go-2d').classList.add('active');
    if (view2D.lonMax - view2D.lonMin <= AUTO_3D_SPAN_DEG) {
        const cLon = (view2D.lonMin + view2D.lonMax) / 2;
        const cLat = (view2D.latMin + view2D.latMax) / 2;
        [view2D.lonMin, view2D.lonMax] = fitBounds(cLon - 32, cLon + 32, -180, 180);
        [view2D.latMin, view2D.latMax] = fitBounds(cLat - 18, cLat + 18, -88, 88);
    }
    render2DMap();
}

document.getElementById('btn-reset-zoom').addEventListener('click', () => {
    view2D = { lonMin: -180, lonMax: 180, latMin: -90, latMax: 90 };
    resetToGlobal2D();
});
document.getElementById('btn-go-2d').addEventListener('click', () => resetToGlobal2D());
document.getElementById('btn-return-2d').addEventListener('click', () => resetToGlobal2D());
document.getElementById('btn-sim-now').addEventListener('click', () => {
    openRegionIn3D(view2D.lonMin, view2D.latMin, view2D.lonMax, view2D.latMax);
});

// ============================================================================
// 4. ESCENA 3D + CONFIGURACIONES DE ENERGÍA, VELOCIDAD, TIEMPO Y RADIACIÓN
// ============================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090d0b);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 8000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.03;

scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const dirLight = new THREE.DirectionalLight(0xffe0bd, 2.0);
dirLight.position.set(-180, 320, -140);
scene.add(dirLight);

const group3D = new THREE.Group();
scene.add(group3D);

const N_GRID = 110;
let reg = {
    lonMin: 0, lonMax: 20, latMin: -10, latMax: 10,
    Wkm: 240, Hkm: 240, resM: 2180, realScaleKm: 1.0, name: "",
    dem: [], slope: [], hs: [], temp: [], rad: [],
    unitIdx: [], unitCost: [], structHard: [], structSoft: [],
    hardBase: [], blocked: [], cost: [],
    radHotspots: []
};

// Parámetros configurables del rover desde el dashboard inferior
let cfg = {
    slopeMax: 22.0,
    sensorKm: 18.0,
    hazardKm: 11.0,
    astroMaxMsv: 150.0,     // Límite de radiación soportado por un astronauta (mSv)
    baseEnergyKwhKm: 0.22,  // Consumo energético configurable del rover (kWh/km)
    roverSpeedKmh: 12.0,    // Velocidad física configurable del rover (km/h)
    wSlope: 3.0,
    wNear: 2.0,
    wRad: 1.4,
    mass: 900.0,
    mu: 0.2,
    eta: 0.5,
    frames: 320,
    exag: 1.2,
    layer3D: 0
};

let sim = {
    state: "idle",
    A: null, B: null, pos: null, poly: null,
    seg: 0, trail: [], walkedKm: 0, replans: 0,
    stepCells: 0.35, velMult: 1.0, paused: false,
    heading: 0.0,
    msg: "Clic izquierdo: elige el punto A",
    stats: null, naive: null,
    hazards: []
};

let terrainMesh = null, wireMesh = null;
let pathTubeMesh = null, naiveLineMesh = null, trailLineMesh = null;
let roverMesh = null, sensorRingMesh = null;
let pinAMesh = null, pinBMesh = null, astroLimitMesh = null;
let radZoneMeshes = [];

function openRegionIn3D(lon0, lat0, lon1, lat1) {
    activeMode = '3d';
    document.getElementById('view-2d').style.display = 'none';
    document.getElementById('view-3d-ui').style.display = 'block';
    document.getElementById('btn-go-2d').classList.remove('active');

    if (lon1 - lon0 > 65) {
        const cLon = (lon0 + lon1) / 2;
        lon0 = cLon - 14; lon1 = cLon + 14;
    }
    if (lat1 - lat0 > 45) {
        const cLat = (lat0 + lat1) / 2;
        lat0 = Math.max(-85, cLat - 10); lat1 = Math.min(85, cLat + 10);
    }

    reg.lonMin = lon0; reg.lonMax = lon1;
    reg.latMin = lat0; reg.latMax = lat1;

    const midLon = (lon0 + lon1) / 2, midLat = (lat0 + lat1) / 2;
    const wM = R_MARS * (Math.PI / 180) * (lon1 - lon0) * Math.max(0.15, Math.cos(midLat * Math.PI / 180));
    const hM = R_MARS * (Math.PI / 180) * (lat1 - lat0);

    const maxRealKm = Math.max(wM, hM) / 1000;
    reg.resM = Math.max(wM, hM) / N_GRID;
    reg.Wkm = 240 * (wM / Math.max(wM, hM));
    reg.Hkm = 240 * (hM / Math.max(wM, hM));
    reg.realScaleKm = maxRealKm / 240;

    reg.name = `Región ${midLon >= 0 ? '+' : ''}${midLon.toFixed(1)}°E ${midLat >= 0 ? '+' : ''}${midLat.toFixed(1)}°N (${(wM/1000).toFixed(0)}×${(hM/1000).toFixed(0)} km)`;
    document.getElementById('region-subtitle').innerText = reg.name;

    reg.dem = Array.from({ length: N_GRID }, () => new Float32Array(N_GRID));
    reg.slope = Array.from({ length: N_GRID }, () => new Float32Array(N_GRID));
    reg.hs = Array.from({ length: N_GRID }, () => new Float32Array(N_GRID));
    reg.temp = Array.from({ length: N_GRID }, () => new Float32Array(N_GRID));
    reg.rad = Array.from({ length: N_GRID }, () => new Float32Array(N_GRID));
    reg.unitIdx = Array.from({ length: N_GRID }, () => new Uint8Array(N_GRID));
    reg.unitCost = Array.from({ length: N_GRID }, () => new Float32Array(N_GRID));
    reg.structHard = Array.from({ length: N_GRID }, () => new Uint8Array(N_GRID));
    reg.structSoft = Array.from({ length: N_GRID }, () => new Float32Array(N_GRID).fill(1.0));
    reg.hardBase = Array.from({ length: N_GRID }, () => new Uint8Array(N_GRID));
    reg.blocked = Array.from({ length: N_GRID }, () => new Uint8Array(N_GRID));
    reg.cost = Array.from({ length: N_GRID }, () => new Float32Array(N_GRID));

    reg.radHotspots = [
        { r: Math.floor(N_GRID * 0.36), c: Math.floor(N_GRID * 0.44), radCells: 14, peakMsvKm: 3.6 },
        { r: Math.floor(N_GRID * 0.66), c: Math.floor(N_GRID * 0.58), radCells: 16, peakMsvKm: 4.2 },
        { r: Math.floor(N_GRID * 0.48), c: Math.floor(N_GRID * 0.76), radCells: 12, peakMsvKm: 3.1 }
    ];

    for (let r = 0; r < N_GRID; r++) {
        const lat = lat1 - (r / (N_GRID - 1)) * (lat1 - lat0);
        const gR = Math.min(GH - 1, Math.max(0, Math.floor((90 - lat) / DEG)));
        for (let c = 0; c < N_GRID; c++) {
            const lon = lon0 + (c / (N_GRID - 1)) * (lon1 - lon0);
            const gC = Math.min(GW - 1, Math.max(0, Math.floor((lon + 180) / DEG)));
            const gIdx = gR * GW + gC;

            const { dem, fam, radMsvKm } = sampleMarsContinuous(lon, lat);
            const nx = (c / N_GRID) - 0.5, ny = (r / N_GRID) - 0.5;
            const c1 = -650 * Math.exp(-(((nx + 0.15) * (nx + 0.15) + (ny - 0.12) * (ny - 0.12)) / 0.018));
            const ridge = 720 * Math.exp(-(((nx * 0.8 + ny * 0.6) * (nx * 0.8 + ny * 0.6)) / 0.006));

            const z = dem + c1 + ridge;
            reg.dem[r][c] = z;
            reg.unitIdx[r][c] = fam;
            reg.unitCost[r][c] = FAMILIES[fam].cost;
            reg.structHard[r][c] = globalHard[gIdx];
            reg.structSoft[r][c] = globalSoft[gIdx];
            reg.temp[r][c] = -14.0 - (z / 1000) * 3.8 - Math.abs(lat) * 0.4;

            let localRad = radMsvKm;
            for (const hs of reg.radHotspots) {
                const d = Math.hypot(r - hs.r, c - hs.c);
                if (d < hs.radCells * 1.8) {
                    localRad += hs.peakMsvKm * Math.exp(-((d * d) / (hs.radCells * hs.radCells * 0.55)));
                }
            }
            reg.rad[r][c] = localRad;
        }
    }

    const az = 315 * Math.PI / 180, alt = 45 * Math.PI / 180;
    for (let r = 0; r < N_GRID; r++) {
        for (let c = 0; c < N_GRID; c++) {
            const r0 = Math.max(0, r - 1), r1 = Math.min(N_GRID - 1, r + 1);
            const c0 = Math.max(0, c - 1), c1 = Math.min(N_GRID - 1, c + 1);
            const dzdx = (reg.dem[r][c1] - reg.dem[r][c0]) / (2 * reg.resM);
            const dzdn = -(reg.dem[r1][c] - reg.dem[r0][c]) / (2 * reg.resM);
            const mag = Math.hypot(dzdx, dzdn) * 16.0;
            const slRad = Math.atan(mag);
            const aspRad = Math.atan2(-dzdx, -dzdn);
            reg.slope[r][c] = slRad * (180 / Math.PI);
            const hs = Math.cos(slRad) * Math.sin(alt) + Math.sin(slRad) * Math.cos(alt) * Math.cos(az - aspRad);
            reg.hs[r][c] = Math.max(0, Math.min(1, hs));
        }
    }

    resetSim(false);
    build3DMesh();
    draw3DRadZoneRings();

    const center = new THREE.Vector3(reg.Wkm / 2, 8, reg.Hkm / 2);
    controls.target.copy(center);
    camera.position.set(center.x - reg.Wkm * 0.55, center.y + 145, center.z + reg.Hkm * 0.75);
    controls.update();
}

function draw3DRadZoneRings() {
    radZoneMeshes.forEach(m => group3D.remove(m));
    radZoneMeshes = [];

    for (const hs of reg.radHotspots) {
        const wCenter = rcToWorld(hs.r, hs.c);
        const rad3D = (hs.radCells / N_GRID) * Math.max(reg.Wkm, reg.Hkm);

        const ringGeo = new THREE.RingGeometry(rad3D * 0.88, rad3D, 48);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xd946ef, side: THREE.DoubleSide, transparent: true, opacity: 0.55
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(wCenter.x, wCenter.y + 1.2, wCenter.z);

        const domeGeo = new THREE.CylinderGeometry(rad3D * 0.9, rad3D * 0.9, 8, 32, 1, true);
        const domeMat = new THREE.MeshBasicMaterial({
            color: 0xd946ef, wireframe: true, transparent: true, opacity: 0.22
        });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.set(wCenter.x, wCenter.y + 4, wCenter.z);

        group3D.add(ring, dome);
        radZoneMeshes.push(ring, dome);
    }
}

function buildSimFields() {
    const H = N_GRID, W = N_GRID;
    const hardPts = [];

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const base = (reg.slope[r][c] > cfg.slopeMax) || (reg.structHard[r][c] === 1);
            reg.hardBase[r][c] = base ? 1 : 0;

            let isHard = base;
            if (!isHard) {
                for (const h of sim.hazards) {
                    if (h.found && Math.hypot(r - h.r, c - h.c) <= h.radCells) {
                        isHard = true;
                        break;
                    }
                }
            }
            if (isHard) hardPts.push([r, c]);
        }
    }

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            let minCells = 999;
            for (let k = 0; k < hardPts.length; k++) {
                const d = Math.hypot(r - hardPts[k][0], c - hardPts[k][1]);
                if (d < minCells) minCells = d;
                if (minCells === 0) break;
            }
            reg.blocked[r][c] = (minCells <= 0.8) ? 1 : 0;
            const near = Math.exp(-minCells / 3.0);
            const slRatio = reg.slope[r][c] / cfg.slopeMax;
            const radPenalty = 1 + cfg.wRad * Math.max(0, (reg.rad[r][c] - 0.8) / 3.5);

            reg.cost[r][c] = reg.unitCost[r][c] * reg.structSoft[r][c]
                             * (1 + cfg.wSlope * slRatio * slRatio)
                             * (1 + cfg.wNear * near)
                             * radPenalty;
        }
    }
}

function resetSim(keepHazards = false) {
    if (!keepHazards) {
        sim.hazards.forEach(h => group3D.remove(h.mesh));
        sim.hazards = [];
    } else {
        sim.hazards.forEach(h => {
            h.found = false;
            h.mesh.material.color.setHex(0xffffff);
            h.mesh.material.wireframe = true;
            h.mesh.material.opacity = 0.55;
        });
    }

    sim.state = "idle";
    sim.A = null; sim.B = null; sim.pos = null; sim.poly = null;
    sim.seg = 0; sim.trail = []; sim.walkedKm = 0; sim.replans = 0;
    sim.msg = "Clic izquierdo: elige el punto A";
    sim.stats = null; sim.naive = null;

    if (pathTubeMesh) { group3D.remove(pathTubeMesh); pathTubeMesh = null; }
    if (naiveLineMesh) { group3D.remove(naiveLineMesh); naiveLineMesh = null; }
    if (trailLineMesh) { group3D.remove(trailLineMesh); trailLineMesh = null; }
    if (roverMesh) roverMesh.visible = false;
    if (pinAMesh) pinAMesh.visible = false;
    if (pinBMesh) pinBMesh.visible = false;
    if (astroLimitMesh) astroLimitMesh.visible = false;

    document.getElementById('tag-a').style.display = 'none';
    document.getElementById('tag-b').style.display = 'none';
    document.getElementById('tag-astro').style.display = 'none';
    document.getElementById('d-dist').innerText = "0.0 / 0.0 km";
    document.getElementById('d-time').innerText = "0.0 / 0.0 h";
    document.getElementById('d-energy').innerText = "0.0 / 0.0 kWh";
    document.getElementById('d-rad-cum').innerText = "0.0 mSv";
    document.getElementById('d-astro-km').innerText = "-- km";
    document.getElementById('d-astro-bar-fill').style.width = "0%";
    document.getElementById('astro-limit-readout').innerText = "Selecciona A y B para calcular hasta dónde aguantaría un humano.";

    buildSimFields();
    updateHudText();
}

// ============================================================================
// 5. CONSTRUCCIÓN DE LA MALLA 3D Y MODELO DEL ROVER
// ============================================================================
function rcToWorld(r, c) {
    const x = (c / (N_GRID - 1)) * reg.Wkm;
    const z = (r / (N_GRID - 1)) * reg.Hkm;
    const y = (reg.dem[r]?.[c] || 0) * 0.008 * cfg.exag;
    return new THREE.Vector3(x, y, z);
}

function worldToRC(x, z) {
    const c = Math.round(THREE.MathUtils.clamp((x / reg.Wkm) * (N_GRID - 1), 0, N_GRID - 1));
    const r = Math.round(THREE.MathUtils.clamp((z / reg.Hkm) * (N_GRID - 1), 0, N_GRID - 1));
    return [r, c];
}

function build3DMesh() {
    if (terrainMesh) group3D.remove(terrainMesh);
    if (wireMesh) group3D.remove(wireMesh);

    const geo = new THREE.PlaneGeometry(reg.Wkm, reg.Hkm, N_GRID - 1, N_GRID - 1);
    geo.rotateX(-Math.PI / 2);
    geo.translate(reg.Wkm / 2, 0, reg.Hkm / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    let minZ = Infinity, maxZ = -Infinity;
    for (let r = 0; r < N_GRID; r++) {
        for (let c = 0; c < N_GRID; c++) {
            if (reg.dem[r][c] < minZ) minZ = reg.dem[r][c];
            if (reg.dem[r][c] > maxZ) maxZ = reg.dem[r][c];
        }
    }
    const spanZ = Math.max(1, maxZ - minZ);

    for (let i = 0; i < pos.count; i++) {
        const c = i % N_GRID;
        const r = Math.floor(i / N_GRID);
        const z = reg.dem[r][c];
        const hs = reg.hs[r][c];
        const blk = reg.blocked[r][c];
        const hard0 = reg.hardBase[r][c];

        pos.setY(i, z * 0.008 * cfg.exag);

        const gray = (0.18 + 0.78 * hs) * 255;
        let rgb = [gray, gray, gray];

        if (cfg.layer3D === 0) {
            const tc = Math.min(1, Math.max(0, (reg.cost[r][c] - 1.0) / 4.5));
            const cr = 255, cg = Math.round(235 * (1 - tc * 0.75)), cb = Math.round(70 * (1 - tc));
            rgb = [gray * 0.45 + cr * 0.55, gray * 0.45 + cg * 0.55, gray * 0.45 + cb * 0.55];
            if (reg.rad[r][c] > 2.2) {
                const tr = Math.min(1, (reg.rad[r][c] - 2.2) / 3.0);
                rgb = [rgb[0] * (1 - tr * 0.5) + 217 * tr * 0.5, rgb[1] * (1 - tr * 0.6), rgb[2] * (1 - tr * 0.5) + 239 * tr * 0.5];
            }
        } else if (cfg.layer3D === 1) {
            const tRad = (reg.rad[r][c] - 0.4) / 4.2;
            const rc = radCmap(tRad);
            rgb = [gray * 0.3 + rc[0] * 0.7, gray * 0.3 + rc[1] * 0.7, gray * 0.3 + rc[2] * 0.7];
        } else if (cfg.layer3D === 2) {
            const fc = hexToRgb(FAMILIES[reg.unitIdx[r][c]].color);
            rgb = [gray * 0.4 + fc[0] * 0.6, gray * 0.4 + fc[1] * 0.6, gray * 0.4 + fc[2] * 0.6];
        } else if (cfg.layer3D === 3) {
            const ts = Math.min(1, reg.slope[r][c] / (1.3 * cfg.slopeMax));
            rgb = [68 + 185 * ts, 85 + 145 * ts, 140 * (1 - ts)];
        } else if (cfg.layer3D === 4) {
            rgb = heightCmap((z - minZ) / spanZ);
        } else if (cfg.layer3D === 5) {
            const tt = Math.max(0, Math.min(1, (reg.temp[r][c] + 35) / 25));
            rgb = [45 + 210 * tt, 90 + 90 * (1 - Math.abs(tt - 0.5) * 2), 245 * (1 - tt)];
        }

        if (hard0) rgb = [110, 12, 12];
        else if (blk) rgb = [215, 25, 25];

        colors[i * 3 + 0] = rgb[0] / 255;
        colors[i * 3 + 1] = rgb[1] / 255;
        colors[i * 3 + 2] = rgb[2] / 255;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    terrainMesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        vertexColors: true, roughness: 0.86, metalness: 0.08, flatShading: true
    }));
    group3D.add(terrainMesh);

    wireMesh = new THREE.LineSegments(
        new THREE.WireframeGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0xdce7b8, transparent: true, opacity: 0.05 })
    );
    group3D.add(wireMesh);

    ensureRoverAndPinsExist();
}

function ensureRoverAndPinsExist() {
    if (!pinAMesh) {
        pinAMesh = new THREE.Mesh(
            new THREE.SphereGeometry(2.2, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x00e5ff })
        );
        pinAMesh.visible = false;
        group3D.add(pinAMesh);
    }
    if (!pinBMesh) {
        pinBMesh = new THREE.Mesh(
            new THREE.OctahedronGeometry(2.8, 0),
            new THREE.MeshBasicMaterial({ color: 0xffd600 })
        );
        pinBMesh.visible = false;
        group3D.add(pinBMesh);
    }
    if (!astroLimitMesh) {
        astroLimitMesh = new THREE.Group();
        const cone = new THREE.Mesh(
            new THREE.ConeGeometry(2.4, 6.5, 16),
            new THREE.MeshBasicMaterial({ color: 0xd946ef })
        );
        cone.position.y = 3.2;
        const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.35, 24, 12),
            new THREE.MeshBasicMaterial({ color: 0xd946ef, transparent: true, opacity: 0.55 })
        );
        beam.position.y = 12;
        astroLimitMesh.add(cone, beam);
        astroLimitMesh.visible = false;
        group3D.add(astroLimitMesh);
    }
    if (!roverMesh) {
        roverMesh = new THREE.Group();
        const modelHolder = new THREE.Group();
        roverMesh.add(modelHolder);

        const fallbackRover = new THREE.Group();
        const chasis = new THREE.Mesh(
            new THREE.BoxGeometry(4.2, 1.9, 5.8),
            new THREE.MeshStandardMaterial({ color: 0xff9800, metalness: 0.35, roughness: 0.4 })
        );
        chasis.position.y = 1.8;
        const deck = new THREE.Mesh(
            new THREE.BoxGeometry(4.8, 0.25, 4.4),
            new THREE.MeshStandardMaterial({ color: 0x263238 })
        );
        deck.position.y = 2.85;
        const mast = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.28, 2.6),
            new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
        );
        mast.position.set(0, 3.9, 1.5);
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 0.7, 0.9),
            new THREE.MeshStandardMaterial({ color: 0x00e5ff })
        );
        head.position.set(0, 5.2, 1.5);

        const wGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.8, 14);
        wGeo.rotateZ(Math.PI / 2);
        const wMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        for (const zOff of [-2.1, 0, 2.1]) {
            for (const xOff of [-2.4, 2.4]) {
                const w = new THREE.Mesh(wGeo, wMat);
                w.position.set(xOff, 0.95, zOff);
                fallbackRover.add(w);
            }
        }
        fallbackRover.add(chasis, deck, mast, head);
        modelHolder.add(fallbackRover);

        const loader = new GLTFLoader();
        const tryGLB = (paths, idx = 0) => {
            if (idx >= paths.length) return;
            loader.load(
                paths[idx],
                (gltf) => {
                    modelHolder.remove(fallbackRover);
                    const m = gltf.scene;
                    const box = new THREE.Box3().setFromObject(m);
                    const sz = box.getSize(new THREE.Vector3());
                    m.scale.setScalar(6.5 / Math.max(sz.x, sz.y, sz.z, 0.01));
                    m.position.y = 0.2;
                    modelHolder.add(m);
                },
                undefined,
                () => tryGLB(paths, idx + 1)
            );
        };
        tryGLB(['./curiosity-glb/curiosity.glb', './curiosity.glb']);

        sensorRingMesh = new THREE.Line(
            new THREE.BufferGeometry(),
            new THREE.LineDashedMaterial({ color: 0xffeb3b, dashSize: 2.0, gapSize: 1.5 })
        );
        updateSensorRingRadius();

        roverMesh.add(sensorRingMesh);
        roverMesh.visible = false;
        group3D.add(roverMesh);
    }
}

function updateSensorRingRadius() {
    if (!sensorRingMesh) return;
    const rad3D = cfg.sensorKm / (reg.realScaleKm || 1);
    const pts = [];
    for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * rad3D, 0.4, Math.sin(a) * rad3D));
    }
    sensorRingMesh.geometry.setFromPoints(pts);
    sensorRingMesh.computeLineDistances();
}

// ============================================================================
// 6. ALGORITMO A*, ENERGÍA, TIEMPO A->B Y SUPERVIVENCIA DEL ASTRONAUTA
// ============================================================================
function astar(startRC, goalRC) {
    const H = N_GRID, W = N_GRID, total = H * W;
    const gs = new Float64Array(total).fill(Infinity);
    const prev = new Int32Array(total).fill(-1);
    const closed = new Uint8Array(total);

    const s = startRC[0] * W + startRC[1], g = goalRC[0] * W + goalRC[1];
    gs[s] = 0.0;
    const heap = [[0, s]];
    const n8 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

    while (heap.length > 0) {
        heap.sort((a, b) => a[0] - b[0]);
        const [, u] = heap.shift();
        if (closed[u]) continue;
        closed[u] = 1;
        if (u === g) break;

        const ur = Math.floor(u / W), uc = u % W;
        for (const [dr, dc] of n8) {
            const vr = ur + dr, vc = uc + dc;
            if (vr < 0 || vr >= H || vc < 0 || vc >= W) continue;
            const v = vr * W + vc;
            if (reg.blocked[vr][vc] || closed[v]) continue;
            if (dr && dc && (reg.blocked[ur][vc] || reg.blocked[vr][uc])) continue;

            const dh = reg.resM * ((dr && dc) ? 1.41421356 : 1.0);
            const dz = reg.dem[vr][vc] - reg.dem[ur][uc];
            const d3 = Math.hypot(dh, dz);
            const ng = gs[u] + d3 * 0.5 * (reg.cost[ur][uc] + reg.cost[vr][vc]);
            if (ng < gs[v]) {
                gs[v] = ng;
                prev[v] = u;
                const h = reg.resM * Math.hypot(vr - goalRC[0], vc - goalRC[1]);
                heap.push([ng + h, v]);
            }
        }
    }
    if (gs[g] === Infinity) return null;
    const path = [];
    for (let u = g; u !== -1; u = prev[u]) path.push([Math.floor(u / W), u % W]);
    return path.reverse();
}

function lineSamples(a, b) {
    const n = Math.max(1, Math.round(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
    const rr = [], cc = [];
    for (let i = 0; i <= n; i++) {
        const t = i / n;
        rr.push(a[0] + (b[0] - a[0]) * t);
        cc.push(a[1] + (b[1] - a[1]) * t);
    }
    return [rr, cc];
}

function segCost(a, b) {
    const [rr, cc] = lineSamples(a, b);
    let sum = 0;
    for (let i = 0; i < rr.length - 1; i++) {
        const r0 = Math.round(rr[i]), c0 = Math.round(cc[i]);
        const r1 = Math.round(rr[i + 1]), c1 = Math.round(cc[i + 1]);
        const dh = Math.hypot(rr[i + 1] - rr[i], cc[i + 1] - cc[i]) * reg.resM;
        const dz = reg.dem[r1][c1] - reg.dem[r0][c0];
        sum += Math.hypot(dh, dz) * 0.5 * (reg.cost[r0][c0] + reg.cost[r1][c1]);
    }
    return sum;
}

function smoothPath(path, tol = 1.04) {
    if (!path || path.length < 3) return path;
    const cum = new Float64Array(path.length);
    for (let i = 1; i < path.length; i++) cum[i] = cum[i - 1] + segCost(path[i - 1], path[i]);

    const out = [path[0]];
    let i = 0;
    while (i < path.length - 1) {
        let j = path.length - 1;
        while (j > i + 1) {
            const [rr, cc] = lineSamples(path[i], path[j]);
            const free = rr.every((r, idx) => !reg.blocked[Math.round(r)][Math.round(cc[idx])]);
            if (free && segCost(path[i], path[j]) <= tol * (cum[j] - cum[i])) break;
            j--;
        }
        out.push(path[j]);
        i = j;
    }
    return out;
}

/**
 * Calcula estadísticas de la ruta integrando:
 * - Consumo energético configurable (cfg.baseEnergyKwhKm + trabajo mecánico en subidas)
 * - Velocidad física del rover (cfg.roverSpeedKmh) y Tiempo total de A a B (horas)
 * - Dosis de radiación acumulada y kilómetro exacto hasta donde aguantaría un astronauta
 */
function computePathStats(poly) {
    let km = 0, cost = 0, kwh = 0, maxSlope = 0, crossings = 0;
    let totalRadMsv = 0;
    let astroLimitKm = null;
    let astroLimitRC = null;
    let prevBlk = false;

    const speedKmh = Math.max(0.5, cfg.roverSpeedKmh);

    for (let s = 0; s < poly.length - 1; s++) {
        const [rr, cc] = lineSamples(poly[s], poly[s + 1]);
        for (let i = 0; i < rr.length - 1; i++) {
            const r0 = Math.round(rr[i]), c0 = Math.round(cc[i]);
            const r1 = Math.round(rr[i + 1]), c1 = Math.round(cc[i + 1]);
            const dh = Math.hypot(rr[i + 1] - rr[i], cc[i + 1] - cc[i]) * reg.resM;
            const dz = reg.dem[r1][c1] - reg.dem[r0][c0];
            const d3 = Math.hypot(dh, dz);
            const stepKm = d3 / 1000;
            const stepHours = stepKm / speedKmh;

            km += stepKm;
            cost += d3 * 0.5 * (reg.cost[r0][c0] + reg.cost[r1][c1]);

            // Consumo energético = tasa base configurable (kWh/km) + penalización física por pendiente positiva
            const th = Math.atan2(dz, Math.max(dh, 1e-9));
            const climbFactor = th > 0 ? (1.0 + Math.sin(th) * 4.5) : 0.85;
            kwh += stepKm * cfg.baseEnergyKwhKm * climbFactor;

            // Dosis de radiación = radiación espacial del terreno (mSv/km) + exposición temporal (0.18 mSv/hora)
            const terrainRad = stepKm * 0.5 * (reg.rad[r0][c0] + reg.rad[r1][c1]);
            const timeRad = stepHours * 0.18;
            totalRadMsv += (terrainRad + timeRad);

            if (astroLimitKm === null && totalRadMsv >= cfg.astroMaxMsv) {
                astroLimitKm = km;
                astroLimitRC = [r1, c1];
            }

            if (reg.slope[r1][c1] > maxSlope) maxSlope = reg.slope[r1][c1];
            const blk = Boolean(reg.hardBase[r1][c1]);
            if (blk && !prevBlk) crossings++;
            prevBlk = blk;
        }
    }

    const totalHours = km / speedKmh;
    const avgRadPerKm = km > 0 ? totalRadMsv / km : 1.0;
    const maxTheoreticalAstroKm = astroLimitKm !== null
        ? astroLimitKm
        : (cfg.astroMaxMsv / Math.max(0.05, avgRadPerKm));

    return {
        km, totalHours, cost, kwh, maxSlope, crossings,
        totalRadMsv, avgRadPerKm,
        astroLimitKm, astroLimitRC, maxTheoreticalAstroKm
    };
}

function planFrom(startRC, goalRC) {
    const raw = astar(startRC, goalRC);
    if (!raw) return null;
    return smoothPath(raw);
}

// ============================================================================
// 7. CLICS EN 3D (A -> B), OBSTÁCULOS DINÁMICOS Y REPLANIFICACIÓN
// ============================================================================
function handleLeftClick3D(r, c) {
    if (sim.state === "running" || sim.state === "done" || sim.state === "failed") {
        resetSim(true);
    }
    if (reg.blocked[r][c]) {
        sim.msg = "Ese punto está en zona peligrosa. Elige otro.";
        updateHudText();
        return;
    }
    if (sim.state === "idle") {
        sim.A = [r, c];
        sim.pos = [r, c];
        sim.trail = [[r, c]];
        sim.walkedKm = 0;
        sim.state = "goal";
        sim.msg = "Clic izquierdo: elige el punto B";

        const wA = rcToWorld(r, c);
        pinAMesh.position.copy(wA).add(new THREE.Vector3(0, 1.5, 0));
        pinAMesh.visible = true;
        roverMesh.position.copy(wA);
        roverMesh.visible = true;
        updateHudText();
        return;
    }
    if (r === sim.A[0] && c === sim.A[1]) return;

    sim.B = [r, c];
    const wB = rcToWorld(r, c);
    pinBMesh.position.copy(wB).add(new THREE.Vector3(0, 1.8, 0));
    pinBMesh.visible = true;

    const poly = planFrom(sim.A, sim.B);
    if (!poly) {
        sim.state = "failed";
        sim.msg = "SIN RUTA SEGURA entre A y B (clic para reintentar)";
        updateHudText();
        return;
    }

    sim.poly = poly;
    sim.seg = 0;
    sim.walkedKm = 0;
    sim.stats = computePathStats(poly);
    sim.naive = computePathStats([sim.A, sim.B]);
    const totalCells = (sim.stats.km * 1000) / reg.resM;
    sim.stepCells = Math.max(totalCells / cfg.frames, 0.25);
    sim.state = "running";
    sim.msg = "Navegando...";

    // Sincronizar el slider de Tiempo A->B en el dashboard
    const timeSlider = document.getElementById('rng-cfg-time');
    timeSlider.max = Math.max(50, Math.round(sim.stats.km * 1.2));
    timeSlider.value = Math.max(1, Math.round(sim.stats.totalHours));
    document.getElementById('lbl-cfg-time').innerText = `${sim.stats.totalHours.toFixed(1)} h`;

    updateAstronautRadiationReport();
    draw3DPathsAndTrail();
    updateHudText();
}

function updateAstronautRadiationReport() {
    if (!sim.stats) return;
    const st = sim.stats;
    document.getElementById('rad-route-total').innerText = `${st.totalRadMsv.toFixed(1)} mSv`;
    document.getElementById('d-astro-km').innerText = `${st.maxTheoreticalAstroKm.toFixed(1)} km`;

    const readoutEl = document.getElementById('astro-limit-readout');
    const detailEl = document.getElementById('astro-survival-detail');

    if (st.astroLimitKm !== null && st.astroLimitRC) {
        const pct = ((st.astroLimitKm / st.km) * 100).toFixed(0);
        const hrs = (st.astroLimitKm / Math.max(0.5, cfg.roverSpeedKmh)).toFixed(1);
        readoutEl.innerHTML = `<span style="color:#ff6b8b">⚠️ Un astronauta solo aguantaría hasta el <b>km ${st.astroLimitKm.toFixed(1)}</b> (${pct}% de la ruta)</span>`;
        detailEl.innerText = `Alcanzaría el límite de ${cfg.astroMaxMsv} mSv tras ${hrs} h de viaje (marcado en magenta en el mapa 3D). El rover continúa sin riesgo.`;

        const wLim = rcToWorld(st.astroLimitRC[0], st.astroLimitRC[1]);
        astroLimitMesh.position.copy(wLim);
        astroLimitMesh.visible = true;
    } else {
        const hrsMax = (st.maxTheoreticalAstroKm / Math.max(0.5, cfg.roverSpeedKmh)).toFixed(1);
        readoutEl.innerHTML = `<span style="color:#4ade80">✅ Aguanta toda la ruta (${st.km.toFixed(1)} km) y hasta un máx. de <b>${st.maxTheoreticalAstroKm.toFixed(1)} km</b></span>`;
        detailEl.innerText = `Dosis de misión (${st.totalRadMsv.toFixed(1)} mSv) debajo del límite de ${cfg.astroMaxMsv} mSv (aguante máximo estimado: ${hrsMax} h).`;
        astroLimitMesh.visible = false;
    }
}

function handleRightClick3D(r, c) {
    const radCells = (cfg.hazardKm * 1000) / reg.resM;
    if (sim.pos && Math.hypot(r - sim.pos[0], c - sim.pos[1]) < radCells + 2.0) {
        sim.msg = "Peligro demasiado cerca del chasis del rover. Colócalo un poco más adelante.";
        updateHudText();
        return;
    }

    const wPt = rcToWorld(r, c);
    const rad3D = (radCells / N_GRID) * Math.max(reg.Wkm, reg.Hkm);
    const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(rad3D, rad3D, 14, 28, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.6 })
    );
    cyl.position.set(wPt.x, wPt.y + 6, wPt.z);
    group3D.add(cyl);

    for (let rr = Math.max(0, Math.floor(r - radCells * 2)); rr < Math.min(N_GRID, Math.ceil(r + radCells * 2)); rr++) {
        for (let cc = Math.max(0, Math.floor(c - radCells * 2)); cc < Math.min(N_GRID, Math.ceil(c + radCells * 2)); cc++) {
            const d = Math.hypot(rr - r, cc - c);
            if (d < radCells * 2.0) {
                reg.rad[rr][cc] += 2.6 * Math.exp(-((d * d) / (radCells * radCells)));
            }
        }
    }

    sim.hazards.push({ r, c, radCells, found: false, mesh: cyl });
    sim.msg = "Peligro / Anomalía colocada (el rover la esquivará al detectarla)";
    if (cfg.layer3D === 1) build3DMesh();
    updateHudText();
}

function senseObstacles() {
    if (!sim.pos) return;
    const sensorCells = (cfg.sensorKm * 1000) / reg.resM;
    let newlyFound = false;

    for (const h of sim.hazards) {
        if (!h.found && (Math.hypot(sim.pos[0] - h.r, sim.pos[1] - h.c) - h.radCells <= sensorCells)) {
            h.found = true;
            newlyFound = true;
            h.mesh.material.color.setHex(0xef4444);
            h.mesh.material.wireframe = false;
            h.mesh.material.opacity = 0.38;
        }
    }
    if (!newlyFound) return;

    buildSimFields();
    build3DMesh();

    const rest = [[sim.pos[0], sim.pos[1]], ...sim.poly.slice(sim.seg + 1)];
    let hit = false;
    for (let i = 0; i < rest.length - 1; i++) {
        const [rr, cc] = lineSamples(rest[i], rest[i + 1]);
        if (rr.some((rVal, idx) => reg.blocked[Math.round(rVal)]?.[Math.round(cc[idx])])) {
            hit = true;
            break;
        }
    }

    if (!hit) {
        sim.msg = "¡Peligro detectado! La ruta actual sigue siendo segura.";
        updateHudText();
        return;
    }

    const startCurr = [Math.round(sim.pos[0]), Math.round(sim.pos[1])];
    const newPoly = planFrom(startCurr, sim.B);
    if (!newPoly) {
        sim.state = "failed";
        sim.msg = "SIN RUTA SEGURA tras detectar peligro";
        updateHudText();
        return;
    }

    // Replanificar conservando la distancia ya recorrida y uniendo la ruta nueva
    const fullPoly = [...sim.trail, ...newPoly.slice(1)];
    sim.poly = [[sim.pos[0], sim.pos[1]], ...newPoly.slice(1)];
    sim.seg = 0;
    sim.stats = computePathStats(fullPoly);
    sim.replans += 1;
    sim.msg = `¡Peligro detectado! Ruta replanificada en vivo (#${sim.replans})`;

    updateAstronautRadiationReport();
    draw3DPathsAndTrail();
    updateHudText();
}

function stepSimulation() {
    senseObstacles();
    if (sim.state !== "running" || sim.paused) return;

    // La velocidad en pantalla responde tanto al multiplicador (1x-5x) como a la velocidad física configurada
    const speedFactor = (cfg.roverSpeedKmh / 12.0) * sim.velMult;
    let remaining = sim.stepCells * speedFactor;

    while (remaining > 1e-9 && sim.seg < sim.poly.length - 1) {
        const tgt = sim.poly[sim.seg + 1];
        const dr = tgt[0] - sim.pos[0];
        const dc = tgt[1] - sim.pos[1];
        const dist = Math.hypot(dr, dc);
        if (dist > 1e-9) sim.heading = Math.atan2(dc, dr);

        if (dist <= remaining) {
            sim.walkedKm += (dist * reg.resM) / 1000;
            sim.pos = [tgt[0], tgt[1]];
            remaining -= dist;
            sim.seg += 1;
        } else {
            sim.walkedKm += (remaining * reg.resM) / 1000;
            sim.pos = [sim.pos[0] + (dr / dist) * remaining, sim.pos[1] + (dc / dist) * remaining];
            remaining = 0;
        }
    }

    sim.trail.push([sim.pos[0], sim.pos[1]]);
    if (sim.seg >= sim.poly.length - 1) {
        sim.state = "done";
        if (sim.stats) sim.walkedKm = sim.stats.km;
        sim.msg = "¡Destino alcanzado!";
        updateHudText();
    }

    draw3DPathsAndTrail();
}

function draw3DPathsAndTrail() {
    if (pathTubeMesh) { group3D.remove(pathTubeMesh); pathTubeMesh = null; }
    if (naiveLineMesh) { group3D.remove(naiveLineMesh); naiveLineMesh = null; }
    if (trailLineMesh) { group3D.remove(trailLineMesh); trailLineMesh = null; }

    if (sim.poly && sim.state !== "idle") {
        const remPts = (sim.state === "running")
            ? [[sim.pos[0], sim.pos[1]], ...sim.poly.slice(sim.seg + 1)]
            : sim.poly;

        if (remPts.length >= 2) {
            const worldPts = [];
            for (let i = 0; i < remPts.length - 1; i++) {
                const [rr, cc] = lineSamples(remPts[i], remPts[i + 1]);
                for (let k = 0; k < rr.length; k++) {
                    const v = rcToWorld(Math.round(rr[k]), Math.round(cc[k]));
                    v.y += 0.65;
                    worldPts.push(v);
                }
            }
            if (worldPts.length >= 2) {
                const curve = new THREE.CatmullRomCurve3(worldPts);
                pathTubeMesh = new THREE.Mesh(
                    new THREE.TubeGeometry(curve, Math.max(20, worldPts.length * 2), 0.75, 8, false),
                    new THREE.MeshBasicMaterial({ color: 0x00ff66 })
                );
                group3D.add(pathTubeMesh);
            }
        }

        if (sim.A && sim.B) {
            const wA = rcToWorld(sim.A[0], sim.A[1]).add(new THREE.Vector3(0, 1.4, 0));
            const wB = rcToWorld(sim.B[0], sim.B[1]).add(new THREE.Vector3(0, 1.4, 0));
            naiveLineMesh = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([wA, wB]),
                new THREE.LineDashedMaterial({ color: 0xff2222, dashSize: 2.5, gapSize: 1.8 })
            );
            naiveLineMesh.computeLineDistances();
            group3D.add(naiveLineMesh);
        }
    }

    if (sim.trail.length >= 2) {
        const tWorld = sim.trail.map(([r, c]) => {
            const v = rcToWorld(Math.round(r), Math.round(c));
            v.y += 0.85;
            return v;
        });
        trailLineMesh = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(tWorld),
            new THREE.LineBasicMaterial({ color: 0xffffff })
        );
        group3D.add(trailLineMesh);
    }
}

function updateHudText() {
    const lines = [`<b>Estado:</b> <span style="color:#dce7b8">${sim.msg}</span>`];
    if (sim.stats && sim.naive) {
        const st = sim.stats, nv = sim.naive;
        const lab = sim.replans === 0 ? "Ruta óptima " : "Ruta replan.";
        lines.push(`${lab}: <b>${st.km.toFixed(1)} km</b> | tiempo <b>${st.totalHours.toFixed(1)} h</b> | energía <b>${st.kwh.toFixed(1)} kWh</b> | rad: <b style="color:#d946ef">${st.totalRadMsv.toFixed(1)} mSv</b>`);
        lines.push(`Ruta recta  : ${nv.km.toFixed(1)} km | cruza <b style="color:#ef4444">${nv.crossings}</b> bloq. | rad: ${nv.totalRadMsv.toFixed(1)} mSv | pend.máx ${nv.maxSlope.toFixed(1)}°`);
        const det = sim.hazards.filter(h => h.found).length;
        lines.push(`Replanificaciones: <b style="color:#00e5ff">${sim.replans}</b> | peligros ocultos: ${sim.hazards.length} (detectados ${det})`);
    }
    document.getElementById('hud-text').innerHTML = lines.join("<br>");
}

// ============================================================================
// 8. RAYCASTING 3D Y CONTROLES DEL DASHBOARD CONFIGURABLE
// ============================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let downPt = { x: 0, y: 0 };

window.addEventListener('pointerdown', (e) => { downPt = { x: e.clientX, y: e.clientY }; });

window.addEventListener('pointermove', (e) => {
    if (activeMode !== '3d' || !terrainMesh) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(terrainMesh);
    if (hits.length > 0) {
        const pt = hits[0].point;
        const [r, c] = worldToRC(pt.x, pt.z);
        const fam = FAMILIES[reg.unitIdx[r][c]];
        document.getElementById('cursor-info').innerText =
            `Cursor 3D — Altitud: ${reg.dem[r][c].toFixed(0)} m | Pend: ${reg.slope[r][c].toFixed(1)}° | Radiación: ${reg.rad[r][c].toFixed(2)} mSv/km | Temp: ${reg.temp[r][c].toFixed(1)}°C | Unidad: ${fam.code} (${fam.es})`;
    }
});

window.addEventListener('pointerup', (e) => {
    if (activeMode !== '3d' || !terrainMesh || e.target !== renderer.domElement) return;
    if (Math.hypot(e.clientX - downPt.x, e.clientY - downPt.y) > 5) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(terrainMesh);
    if (!hits.length) return;

    const [r, c] = worldToRC(hits[0].point.x, hits[0].point.z);
    if (e.button === 0) handleLeftClick3D(r, c);
});

window.addEventListener('contextmenu', (e) => {
    if (activeMode !== '3d' || !terrainMesh || e.target !== renderer.domElement) return;
    e.preventDefault();
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(terrainMesh);
    if (!hits.length) return;

    const [r, c] = worldToRC(hits[0].point.x, hits[0].point.z);
    handleRightClick3D(r, c);
});

renderer.domElement.addEventListener('wheel', (e) => {
    if (activeMode !== '3d' || !document.getElementById('chk-auto-3d').checked) return;
    const distCam = camera.position.distanceTo(controls.target);
    if (e.deltaY > 0 && distCam > 540) {
        resetToGlobal2D();
    }
});

document.querySelectorAll('.l3d-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.l3d-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        cfg.layer3D = parseInt(btn.dataset.l3d, 10);
        build3DMesh();
    });
});

function recalculateActiveRouteStats() {
    if (!sim.poly) return;
    const fullPoly = sim.state === "running" ? [...sim.trail, ...sim.poly.slice(sim.seg + 1)] : sim.poly;
    sim.stats = computePathStats(fullPoly);
    if (sim.A && sim.B) sim.naive = computePathStats([sim.A, sim.B]);
    updateAstronautRadiationReport();
    updateHudText();
}

// 1. Configurar Consumo Energético del Rover (kWh/km) en el dashboard
document.getElementById('rng-cfg-kwh').addEventListener('input', (e) => {
    cfg.baseEnergyKwhKm = parseFloat(e.target.value);
    document.getElementById('lbl-cfg-kwh').innerText = `${cfg.baseEnergyKwhKm.toFixed(2)} kWh/km`;
    recalculateActiveRouteStats();
});

// 2. Configurar Velocidad Física del Rover (km/h) -> recalcula Tiempo de A a B
document.getElementById('rng-cfg-speed').addEventListener('input', (e) => {
    cfg.roverSpeedKmh = parseFloat(e.target.value);
    document.getElementById('lbl-cfg-speed').innerText = `${cfg.roverSpeedKmh.toFixed(1)} km/h`;
    recalculateActiveRouteStats();
    if (sim.stats) {
        document.getElementById('rng-cfg-time').value = Math.max(1, Math.round(sim.stats.totalHours));
        document.getElementById('lbl-cfg-time').innerText = `${sim.stats.totalHours.toFixed(1)} h`;
    }
});

// 3. Configurar Tiempo Objetivo de A a B (horas) -> recalcula la Velocidad necesaria del Rover
document.getElementById('rng-cfg-time').addEventListener('input', (e) => {
    const targetHours = Math.max(0.5, parseFloat(e.target.value));
    document.getElementById('lbl-cfg-time').innerText = `${targetHours.toFixed(1)} h`;
    if (sim.stats && sim.stats.km > 0) {
        cfg.roverSpeedKmh = THREE.MathUtils.clamp(sim.stats.km / targetHours, 0.5, 60.0);
        document.getElementById('rng-cfg-speed').value = cfg.roverSpeedKmh;
        document.getElementById('lbl-cfg-speed').innerText = `${cfg.roverSpeedKmh.toFixed(1)} km/h`;
        recalculateActiveRouteStats();
    }
});

// 4. Configurar Límite de Radiación del Astronauta (mSv)
document.getElementById('rng-astro-lim').addEventListener('input', (e) => {
    cfg.astroMaxMsv = parseFloat(e.target.value);
    document.getElementById('lbl-astro-lim').innerText = `${cfg.astroMaxMsv} mSv`;
    recalculateActiveRouteStats();
});

document.getElementById('rng-slmax').addEventListener('input', (e) => {
    cfg.slopeMax = parseFloat(e.target.value);
    document.getElementById('lbl-slmax').innerText = `${cfg.slopeMax}°`;
    buildSimFields();
    build3DMesh();
});

document.getElementById('rng-sens').addEventListener('input', (e) => {
    cfg.sensorKm = parseFloat(e.target.value);
    document.getElementById('lbl-sens').innerText = `${cfg.sensorKm} km`;
    updateSensorRingRadius();
});

document.getElementById('rng-exag').addEventListener('input', (e) => {
    cfg.exag = parseFloat(e.target.value);
    document.getElementById('lbl-exag').innerText = `${cfg.exag.toFixed(1)}x`;
    build3DMesh();
    draw3DPathsAndTrail();
});

document.getElementById('btn-reset-sim').addEventListener('click', () => {
    resetSim(false);
    build3DMesh();
});

document.getElementById('btn-v-up').addEventListener('click', () => {
    if (sim.velMult < 5.0) sim.velMult += 0.5;
    document.getElementById('d-vel').innerText = `${sim.velMult.toFixed(1)}x`;
});
document.getElementById('btn-v-down').addEventListener('click', () => {
    if (sim.velMult > 0.5) sim.velMult -= 0.5;
    document.getElementById('d-vel').innerText = `${sim.velMult.toFixed(1)}x`;
});
document.getElementById('btn-pause-sim').addEventListener('click', (e) => {
    sim.paused = !sim.paused;
    e.currentTarget.innerText = sim.paused ? "▶ Reanudar" : "⏸ Pausar";
});

window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'h') resetToGlobal2D();
    else if (k === 'm' && activeMode === '2d') openRegionIn3D(view2D.lonMin, view2D.latMin, view2D.lonMax, view2D.latMax);
    else if (k === 'l' && activeMode === '3d') {
        cfg.layer3D = (cfg.layer3D + 1) % 6;
        document.querySelectorAll('.l3d-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.l3d, 10) === cfg.layer3D));
        build3DMesh();
    } else if (k === 'r' && activeMode === '3d') {
        resetSim(false);
        build3DMesh();
    }
});

// ============================================================================
// 9. BUCLE DE ANIMACIÓN Y ACTUALIZACIÓN DEL DASHBOARD EN TIEMPO REAL
// ============================================================================
function projectTag(id, mesh) {
    const el = document.getElementById(id);
    if (!mesh || !mesh.visible) { el.style.display = 'none'; return; }
    const v = mesh.position.clone().project(camera);
    if (v.z > 1) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.style.left = `${(v.x * 0.5 + 0.5) * window.innerWidth}px`;
    el.style.top = `${(-(v.y * 0.5) + 0.5) * window.innerHeight}px`;
}

function animate() {
    requestAnimationFrame(animate);

    if (activeMode === '3d') {
        if (sim.state === "running") {
            stepSimulation();
        }

        if (sim.pos && roverMesh) {
            const r = Math.round(sim.pos[0]), c = Math.round(sim.pos[1]);
            const wPos = rcToWorld(r, c);
            roverMesh.position.lerp(wPos, 0.35);
            roverMesh.rotation.y = sim.heading;

            const fam = FAMILIES[reg.unitIdx[r]?.[c] || 0];
            const localRad = reg.rad[r]?.[c] || 0.65;
            const xKm = ((c / N_GRID) * reg.Wkm * (reg.realScaleKm || 1)).toFixed(1);
            const yKm = (((N_GRID - r) / N_GRID) * reg.Hkm * (reg.realScaleKm || 1)).toFixed(1);

            document.getElementById('s-pos').innerText = `${xKm} , ${yKm}`;
            document.getElementById('s-alt').innerText = `${(reg.dem[r]?.[c] || 0).toFixed(0)} m`;
            document.getElementById('s-slope').innerText = `${(reg.slope[r]?.[c] || 0).toFixed(1)}°`;
            document.getElementById('s-temp').innerText = `${(reg.temp[r]?.[c] || -15).toFixed(1)}°C`;
            document.getElementById('s-rad').innerText = `${localRad.toFixed(2)} mSv/km`;
            document.getElementById('s-geo').innerText = `${fam.code} (x${fam.cost})`;

            const totalKm = sim.stats ? sim.stats.km : 0;
            const walkedKm = Math.min(totalKm, sim.walkedKm);
            const progressRatio = totalKm > 0 ? (walkedKm / totalKm) : 0;

            const totalHours = sim.stats ? sim.stats.totalHours : 0;
            const elapsedHours = progressRatio * totalHours;

            const totalKwh = sim.stats ? sim.stats.kwh : 0;
            const usedKwh = progressRatio * totalKwh;

            const cumRad = sim.stats ? (progressRatio * sim.stats.totalRadMsv) : 0;

            // Actualizar las 6 cajas del Dashboard Inferior
            document.getElementById('d-dist').innerText = `${walkedKm.toFixed(1)} / ${totalKm.toFixed(1)} km`;
            document.getElementById('d-time').innerText = `${elapsedHours.toFixed(1)} / ${totalHours.toFixed(1)} h`;
            document.getElementById('d-energy').innerText = `${usedKwh.toFixed(1)} / ${totalKwh.toFixed(1)} kWh`;
            document.getElementById('d-rad-cum').innerText = `${cumRad.toFixed(1)} mSv`;

            // Barra de medición del límite de radiación del astronauta en el Dashboard
            const astroPct = Math.min(100, (cumRad / Math.max(1, cfg.astroMaxMsv)) * 100);
            document.getElementById('d-astro-bar-fill').style.width = `${astroPct}%`;

            // Medidor de Peligro de Radiación instantáneo
            const pctDanger = Math.min(100, Math.max(6, (localRad / 4.5) * 100));
            document.getElementById('rad-meter-fill').style.width = `${pctDanger}%`;
            document.getElementById('rad-meter-val').innerText = `${localRad.toFixed(2)} mSv/km`;

            const lvlEl = document.getElementById('rad-meter-level');
            if (localRad < 1.1) {
                lvlEl.innerText = "NIVEL: BAJO (SEGURO)";
                lvlEl.style.color = "#4ade80";
            } else if (localRad < 2.2) {
                lvlEl.innerText = "NIVEL: MODERADO (PRECAUCIÓN)";
                lvlEl.style.color = "#facc15";
            } else if (localRad < 3.2) {
                lvlEl.innerText = "NIVEL: ALTO (RIESGO EVA)";
                lvlEl.style.color = "#f97316";
            } else {
                lvlEl.innerText = "☢️ NIVEL: CRÍTICO / LETAL HUMANO";
                lvlEl.style.color = "#d946ef";
            }
        }

        projectTag('tag-a', pinAMesh);
        projectTag('tag-b', pinBMesh);
        projectTag('tag-astro', astroLimitMesh);
        controls.update();
        renderer.render(scene, camera);
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render2DMap();
});

setTimeout(() => render2DMap(), 50);
animate();