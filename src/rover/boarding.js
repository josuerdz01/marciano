// 1 = standing beside the rover; 0 = seated, canopy closed.
export function stepBoarding(progress,wantsMotion,seconds,reducedMotion=false){
 if(reducedMotion)return wantsMotion?0:1;
 const step=Math.max(0,seconds)/(wantsMotion?4.4:4);
 return wantsMotion?Math.max(0,progress-step):Math.min(1,progress+step);
}
export const mayDrive=progress=>progress<=1e-6;
export function pilotPhase(progress,wantsMotion){return wantsMotion?(mayDrive(progress)?'seated':'boarding'):(progress>=1?'outside':'exiting')}

export function ladderDeployment(progress){const t=Math.max(0,Math.min(1,(progress-.02)/.14));return t*t*t*(t*(t*6-15)+10)}

// The camera explicitly releases focus; a slow frame or interrupted flight
// cannot accidentally let the pilot greet/climb before the close view is ready.
export function stepDeparture(state,requested,progress,focused,seconds,reduced=false){
 const phase=state?.phase||'idle';
 if(!requested)return{phase:'idle',greeting:null,progress:stepBoarding(progress,false,seconds,reduced)};
 if(phase==='idle'||(phase==='focus'&&!focused))return{phase:'focus',greeting:null,progress};
 if(phase==='focus')return{phase:progress>.98&&!reduced?'greeting':'boarding',greeting:progress>.98&&!reduced?0:null,progress};
 if(phase==='greeting'){const greeting=Math.min(1.8,(state.greeting||0)+Math.max(0,seconds));return{phase:greeting>=1.8?'boarding':'greeting',greeting,progress}}
 const next=stepBoarding(progress,true,seconds,reduced);
 return{phase:mayDrive(next)?'ready':'boarding',greeting:state.greeting,progress:next};
}
