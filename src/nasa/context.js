// Keep global context during the flight, then reveal the regional 3D silhouette.
export function regionalContextOpacity(distance){const t=Math.max(0,Math.min(1,(distance-20)/40));return t*t*(3-2*t)}
