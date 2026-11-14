// Historical landing positions, not present rover locations or certified future sites.
// East-positive planetocentric coordinates; source precision is retained per record.
const ode='https://ode.rsl.wustl.edu/mars/pagehelp/Content/Missions_Instruments/Landing_Sites.htm';
export const landingSites=[
 {id:'landing-perseverance',name:'Perseverance',lat:18.4446,lon:77.4509,landingDate:'2021-02-18',region:'Jezero',source:'https://doi.org/10.1126/sciadv.abo4856'},
 {id:'landing-curiosity',name:'Curiosity',lat:-4.5895,lon:137.4417,landingDate:'2012-08-06',region:'Gale · Bradbury Landing',source:'https://ntrs.nasa.gov/api/citations/20130010129/downloads/20130010129.pdf'},
 {id:'landing-insight',name:'InSight',lat:4.502,lon:135.623,landingDate:'2018-11-26',region:'Elysium Planitia',source:'https://doi.org/10.1038/s41467-020-14679-1'},
 {id:'landing-spirit',name:'Spirit',lat:-14.5692,lon:175.4729,landingDate:'2004-01-04',region:'Gusev',source:ode},
 {id:'landing-opportunity',name:'Opportunity',lat:-1.9462,lon:-5.5266,landingDate:'2004-01-25',region:'Meridiani Planum',source:ode},
 {id:'landing-phoenix',name:'Phoenix',lat:68.22,lon:-125.75,landingDate:'2008-05-25',region:'Vastitas Borealis',source:ode},
 {id:'landing-pathfinder',name:'Pathfinder',lat:19.13,lon:-33.22,landingDate:'1997-07-04',region:'Ares Vallis',source:'https://mars.nasa.gov/internal_resources/815/'},
 {id:'landing-viking-1',name:'Viking 1',lat:22.27,lon:-47.95,landingDate:'1976-07-20',region:'Chryse Planitia',source:'https://science.nasa.gov/mission/viking/'},
 {id:'landing-viking-2',name:'Viking 2',lat:47.64,lon:134.29,landingDate:'1976-09-03',region:'Utopia Planitia',source:'https://science.nasa.gov/mission/viking/'},
 {id:'landing-zhurong',name:'Zhurong',lat:25.066,lon:109.925,landingDate:'2021-05-15',region:'Utopia Planitia',source:'https://doi.org/10.1038/s41550-021-01519-5'}
].map(p=>({...p,kind:'landing',category:'Sitio de aterrizaje',positionType:'Aterrizaje histórico',network:'Coordenadas de la publicación fuente'}));
