export const descriptorSource='https://planetarynames.wr.usgs.gov/DescriptorTerms';
const tharsis='https://science.nasa.gov/photojournal/maps-of-mars-global-topography/',elysium='https://science.nasa.gov/resource/elysium/';
// Mons and Tholus describe morphology, not a proven volcanic origin.
const volcanoSources=Object.fromEntries([['Olympus Mons',tharsis],['Arsia Mons',tharsis],['Pavonis Mons',tharsis],['Ascraeus Mons',tharsis],['Alba Mons',tharsis],['Elysium Mons',elysium],['Hecates Tholus',elysium],['Albor Tholus',elysium]]);
export const placeCategories=[
 {id:'volcano',label:'Volcanes',singular:'Volcán',icon:'Volcano'},
 {id:'crater',label:'Cráteres',singular:'Cráter',icon:'CircleDot'},
 {id:'mountain',label:'Montañas y colinas',singular:'Montaña o colina',icon:'Mountain'},
 {id:'valley',label:'Valles y canales',singular:'Valle o canal',icon:'Route'},
 {id:'canyon',label:'Cañones',singular:'Cañón',icon:'Split'},
 {id:'plain',label:'Planicies y mesetas',singular:'Planicie o meseta',icon:'Layers'},
 {id:'dune',label:'Dunas',singular:'Campo de dunas',icon:'Waves'},
 {id:'scarp',label:'Escarpes y crestas',singular:'Escarpe o cresta',icon:'Layers2'},
 {id:'depression',label:'Depresiones',singular:'Depresión',icon:'CircleDashed'},
 {id:'chaos',label:'Terrenos fracturados',singular:'Terreno fracturado',icon:'Network'},
 {id:'region',label:'Regiones y otras formas',singular:'Región u otra forma',icon:'Map'}
];
const groups={Cráter:'crater',Catena:'crater',Mons:'mountain',Montes:'mountain',Tholus:'mountain',Collis:'mountain','Sistema de cañones':'canyon',Planicie:'plain',Vallis:'valley',Serpens:'valley',Chasma:'canyon',Planum:'plain',Planitia:'plain',Mensa:'plain',Vastitas:'plain',Palus:'plain',Unda:'dune',Rupes:'scarp',Scopulus:'scarp',Dorsum:'scarp',Patera:'depression',Cavus:'depression',Fossa:'chaos',Sulcus:'chaos',Chaos:'chaos',Labyrinthus:'chaos'};
const types=Object.fromEntries(placeCategories.map(c=>[c.id,{...c,source:descriptorSource}])),volcanoes=Object.fromEntries(Object.entries(volcanoSources).map(([name,source])=>[name,{...types.volcano,source}]));
export function placeType(place){return volcanoes[place.name]||(place.featureId===6288?{...types.canyon,source:tharsis}:types[groups[place.category]||'region'])}
export function matchesCategory(place,category){return !category||category==='all'||placeType(place).id===category}
