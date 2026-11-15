export const sameSite=(a,b)=>Boolean(a&&b&&a.lon===b.lon&&a.lat===b.lat&&(a.detail||null)===(b.detail||null));
export function shouldCompleteEntry(intent,{pathname,site,map,status,flightReady,intro}){return Boolean(intent&&intent.from===pathname&&pathname==='/'&&!intro&&sameSite(intent.site,site)&&sameSite(map?.site,site)&&status==='ready'&&flightReady)}
export function canAutoEnter({surface,landing,flying,armed,distance}){return !surface&&!landing&&!flying&&armed&&distance<3.45}
