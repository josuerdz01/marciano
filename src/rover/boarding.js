// 1 = standing beside the rover; 0 = seated, canopy closed.
export function stepBoarding(progress,wantsMotion,seconds,reducedMotion=false){
 if(reducedMotion)return wantsMotion?0:1;
 const step=Math.max(0,seconds)/(wantsMotion?4.4:4);
 return wantsMotion?Math.max(0,progress-step):Math.min(1,progress+step);
}
export const mayDrive=progress=>progress<=1e-6;
export function pilotPhase(progress,wantsMotion){return wantsMotion?(mayDrive(progress)?'seated':'boarding'):(progress>=1?'outside':'exiting')}

export function ladderDeployment(progress){const t=Math.max(0,Math.min(1,(progress-.02)/.14));return t*t*t*(t*(t*6-15)+10)}
