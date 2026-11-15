export const sameSite=(a,b)=>Boolean(a&&b&&a.lon===b.lon&&a.lat===b.lat&&(a.detail||null)===(b.detail||null));
export function shouldCompleteEntry(intent,{pathname,site,map,status,flightReady,intro}){return Boolean(intent&&intent.from===pathname&&pathname==='/'&&!intro&&sameSite(intent.site,site)&&sameSite(map?.site,site)&&status==='ready'&&flightReady)}
export function canAutoEnter({surface,landing,flying,armed,distance}){return !surface&&!landing&&!flying&&armed&&distance<3.45}

// Enter regional 3D only after a deliberate zoom reaches the local map scale.
export function canEnterRegion({surface,topDown,flying,armed,visibleSpan,regionSpan}){return Boolean(surface&&topDown&&!flying&&armed&&Number.isFinite(visibleSpan)&&regionSpan>0&&visibleSpan<=regionSpan*2)}
