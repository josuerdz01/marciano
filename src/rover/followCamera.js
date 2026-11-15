// Finite, eased dolly: preserve an already closer view and never jump on resume.
export function journeyCameraDistance(start,seconds){
 const t=Math.max(0,Math.min(1,seconds/2.2)),ease=t*t*t*(t*(t*6-15)+10);
 return start+(Math.min(start,5.5)-start)*ease;
}

// Reference framing: 24 degrees above the terrain, preserving compass bearing.
export function journeyCameraElevation(start,seconds){const t=Math.max(0,Math.min(1,seconds/2.2)),ease=t*t*t*(t*(t*6-15)+10);return start+(24*Math.PI/180-start)*ease}
