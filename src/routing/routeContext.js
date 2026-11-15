// A solved route belongs to one exact map + DEM + derived grid. Do not expose
// stale route metrics to any panel during the render before reset effects run.
export function scopedRoutes(routes,context,map,dem,grid){return grid&&context?.map===map&&context?.dem===dem&&context?.grid===grid?routes:[]}
