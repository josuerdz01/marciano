export function parseMissionNumber(draft,min,max){if(String(draft).trim()==='')return null;const n=Number(draft);return Number.isFinite(n)&&n>=min&&n<=max?n:null}
