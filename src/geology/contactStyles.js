export function contactStyle(type=''){
 const s=type.toLowerCase();
 if(s.includes('buried'))return{key:'buried',label:'Enterrado',dash:[2,6],color:'#aebcb0',pattern:4,alpha:.5};
 if(s.includes('inferred'))return{key:'inferred',label:'Inferido',dash:[8,4,2,4],color:'#e0cba4',pattern:3,alpha:.8};
 if(s.includes('approx'))return{key:'approx',label:'Aproximado',dash:[7,5],color:'#cfdbba',pattern:2,alpha:.75};
 if(s.includes('gradational'))return{key:'gradational',label:'Gradual',dash:[2,4],color:'#b6cfc5',pattern:4,alpha:.65};
 if(s==='certain')return{key:'certain',label:'Definido en la fuente',dash:[],color:'#d6e6c6',pattern:1,alpha:.9};
 return{key:'unknown',label:'Sin certeza especificada',dash:[3,5],color:'#b9bdb9',pattern:4,alpha:.5};
}
