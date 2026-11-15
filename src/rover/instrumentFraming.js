// Keep the rover above the tapered panel; never move the geographic target.
export function instrumentOffset(current,boundsBottom,panelTop,height){return Math.max(0,Math.min(height*.25,current+boundsBottom-panelTop+14))}
