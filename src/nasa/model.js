// Ported from the user supplied proyecto NASA. Procedural demonstration, not measured Mars data.
const R_MARS = 3396190.0;
const G_MARS = 3.71;

export const FAMILIES = [
    { key: "Lowland",    es: "Tierras bajas",        color: "#7cb342", cost: 1.0, code: "lHl" },
    { key: "Volcanic",   es: "Volcánico",            color: "#e64a19", cost: 1.3, code: "lHv" },
    { key: "Transition", es: "Transición",           color: "#c0ca33", cost: 1.3, code: "lHt" },
    { key: "Highland",   es: "Tierras altas",        color: "#b08968", cost: 1.5, code: "mNh" },
    { key: "Basin",      es: "Cuencas y macizos",    color: "#26a69a", cost: 1.6, code: "HNb" },
    { key: "Widespread", es: "Depósitos extendidos", color: "#9575cd", cost: 1.7, code: "Aa"  },
    { key: "Polar",      es: "Polar",                color: "#b3e5fc", cost: 2.5, code: "Ap"  }
];

export const STRUCT_STYLE = {
    "scarp":           { color: "#e53935", dash: [],     lw: 2.0, es: "Escarpes",           hard: true,  cost: 99 },
    "caldera rim":     { color: "#8e0000", dash: [],     lw: 1.6, es: "Bordes de caldera",  hard: true,  cost: 99 },
    "graben axis":     { color: "#ec407a", dash: [6, 3], lw: 1.8, es: "Grabens / fosas",    hard: true,  cost: 99 },
    "rille":           { color: "#ffd600", dash: [5, 2], lw: 1.8, es: "Surcos lineales",    hard: true,  cost: 99 },
    "wrinkle ridge":   { color: "#43a047", dash: [5, 2], lw: 1.5, es: "Crestas arrugadas",  hard: false, cost: 2.5 },
    "crater rim":      { color: "#f5f5f5", dash: [],     lw: 1.2, es: "Bordes de cráter",   hard: false, cost: 2.0 },
    "outflow channel": { color: "#ff9800", dash: [2, 2], lw: 1.8, es: "Canales de desagüe", hard: false, cost: 2.0 }
};

export const SLOPE_CLASSES = [
    { max: 1.5, color: "#4caf50", txt: "< 1.5° casi plano" },
    { max: 3.5, color: "#fdd835", txt: "1.5° – 3.5° suave" },
    { max: 6.5, color: "#fb8c00", txt: "3.5° – 6.5° moderada" },
    { max: 999, color: "#d32f2f", txt: "> 6.5° fuerte" }
];

export const GLOBAL_RAD_ZONES = [
    { lon: -134.0, lat: 18.6,  radDeg: 18, peakMsvKm: 4.8, name: "Anomalía Olympus (Alta Cota)" },
    { lon: -108.0, lat: 4.0,   radDeg: 22, peakMsvKm: 4.2, name: "Cinturón Radiactivo Tharsis" },
    { lon: 77.5,   lat: 18.4,  radDeg: 14, peakMsvKm: 3.4, name: "Foco Solar Jezero Norte" },
    { lon: 137.4,  lat: -4.6,  radDeg: 15, peakMsvKm: 3.6, name: "Foco Cósmico Gale / Aeolis" },
    { lon: 175.4,  lat: -14.5, radDeg: 16, peakMsvKm: 3.8, name: "Anomalía Gusev Sur" },
    { lon: -49.9,  lat: 22.3,  radDeg: 15, peakMsvKm: 3.1, name: "Foco Chryse Planitia" },
    { lon: 25.0,   lat: -35.0, radDeg: 20, peakMsvKm: 4.4, name: "Tierras Altas Noachis (Sin Campo)" },
    { lon: -70.0,  lat: -12.0, radDeg: 16, peakMsvKm: 3.5, name: "Borde Superior Marineris" }
];

export const LANDING_SITES = [
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

export function sampleMarsContinuous(lon, lat) {
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
let GW = 1440, GH = 720, DEG = 0.25;
let globalDem;
let globalSlope;
let globalHs;
let globalUnit;
let globalRad;
let globalHard;
let globalSoft;
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



export function heightCmap(t) {
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

export function radCmap(t) {
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


export const nasaLayers=[{id:'height',name:'Altura + relieve',color:'#7cb342'},{id:'hillshade',name:'Relieve sombreado',color:'#989898'},{id:'geology',name:'Geología',color:'#b08968'},{id:'slope',name:'Pendiente regional',color:'#fdd835'},{id:'radiation',name:'Mapa de radiación',color:'#d946ef'}];
export function buildNasaGlobal(width=1440){GW=width;GH=width/2;DEG=360/width;globalLines.length=0;const n=GW*GH;globalDem=new Float32Array(n);globalSlope=new Float32Array(n);globalHs=new Float32Array(n);globalUnit=new Uint8Array(n);globalRad=new Float32Array(n);globalHard=new Uint8Array(n);globalSoft=new Float32Array(n).fill(1);buildGlobal2DData();const count=GW*GH;return{width:GW,height:GH,dem:globalDem.subarray(0,count),slope:globalSlope.subarray(0,count),hs:globalHs.subarray(0,count),unit:globalUnit.subarray(0,count),rad:globalRad.subarray(0,count),lines:globalLines}}
const heightPalette=Float32Array.from({length:4096*3},(_,i)=>heightCmap(Math.floor(i/3)/4095)[i%3]);
const radiationPalette=Float32Array.from({length:4096*3},(_,i)=>radCmap(Math.floor(i/3)/4095)[i%3]);
const familyColors=FAMILIES.map(f=>hexToRgb(f.color)),slopeColors=SLOPE_CLASSES.map(c=>hexToRgb(c.color));
export function nasaPixels(fields,layer){const pixels=new Uint8ClampedArray(fields.width*fields.height*4);for(let i=0;i<fields.dem.length;i++){let R,G,B,shade;
 if(layer==='height'){const k=Math.round(Math.max(0,Math.min(1,(fields.dem[i]+7000)/21000))*4095)*3;R=heightPalette[k];G=heightPalette[k+1];B=heightPalette[k+2];shade=.75}
 else if(layer==='hillshade'){R=G=B=(.12+.88*fields.hs[i])*255;shade=0}
 else if(layer==='geology'){[R,G,B]=familyColors[fields.unit[i]];shade=.35}
 else if(layer==='slope'){const sl=fields.slope[i];[R,G,B]=slopeColors[sl<=1.5?0:sl<=3.5?1:sl<=6.5?2:3];shade=.30}
 else{const k=Math.round(Math.max(0,Math.min(1,(fields.rad[i]-.4)/4.5))*4095)*3;R=radiationPalette[k];G=radiationPalette[k+1];B=radiationPalette[k+2];shade=.45}
 const f=shade?Math.max(.25,Math.min(1.28,1-shade+shade*fields.hs[i]/.7071)):1,o=i*4;pixels[o]=R*f;pixels[o+1]=G*f;pixels[o+2]=B*f;pixels[o+3]=255}return pixels}
export function buildNasaLocal(map){const width=258,height=258,step=map.span/256,west=map.west-step,north=map.north+step,dem=new Float32Array(width*height),unit=new Uint8Array(width*height),rad=new Float32Array(width*height),slope=new Float32Array(width*height),hs=new Float32Array(width*height);const hotspots=[{u:.44,v:.36,r:.13,peak:3.6},{u:.58,v:.66,r:.15,peak:4.2},{u:.76,v:.48,r:.11,peak:3.1}];
 for(let r=0;r<height;r++)for(let c=0;c<width;c++){const lon=west+(c+.5)*step,lat=north-(r+.5)*step,u=(lon-map.west)/map.span,v=(map.north-lat)/map.span,nx=u-.5,ny=v-.5,sample=sampleMarsContinuous(lon,lat),i=r*width+c;dem[i]=sample.dem-650*Math.exp(-((nx+.15)**2+(ny-.12)**2)/.018)+720*Math.exp(-((nx*.8+ny*.6)**2)/.006);unit[i]=sample.fam;rad[i]=sample.radMsvKm;for(const h of hotspots){const d=Math.hypot(u-h.u,v-h.v);if(d<h.r*1.8)rad[i]+=h.peak*Math.exp(-d*d/(h.r*h.r*.55))}}
 const dx=step*Math.PI/180*R_MARS*Math.cos(map.site.lat*Math.PI/180),dy=step*Math.PI/180*R_MARS,az=315*Math.PI/180,alt=Math.PI/4;for(let r=0;r<height;r++)for(let c=0;c<width;c++){const i=r*width+c,gx=(dem[r*width+Math.min(width-1,c+1)]-dem[r*width+Math.max(0,c-1)])/(2*dx),gy=-(dem[Math.min(height-1,r+1)*width+c]-dem[Math.max(0,r-1)*width+c])/(2*dy),sl=Math.atan(Math.hypot(gx,gy)),aspect=Math.atan2(-gx,-gy);slope[i]=sl*180/Math.PI;hs[i]=Math.max(0,Math.min(1,Math.cos(sl)*Math.sin(alt)+Math.sin(sl)*Math.cos(alt)*Math.cos(az-aspect)))}
 return{width,height,west,north,stepLon:step,stepLat:step,radius:R_MARS,dem,unit,rad,slope,hs,hotspots};}
