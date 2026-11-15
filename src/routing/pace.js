import {remainingAssessment} from './cockpit.js';
import {assessMission} from './mission.js';
// Pace changes timing, not the terrain path. Preserve travelled time, route identity,
// original return base and the chosen speed; extend only the available time window.
export function paceChange(route,settings,spent,startMeters){
 const assessment=remainingAssessment(route,settings,spent,startMeters,assessMission);
 if(assessment.withinBudget)return{settings,feasible:true,changes:''};
 const required=Math.ceil(assessment.totalMinutes/(1-settings.reserve/100)/10)*10;
 if(required>720)return{settings,feasible:false,changes:''};
 return{settings:{...settings,budget:required},feasible:true,changes:`Tiempo ${settings.budget} → ${required} min para conservar la velocidad elegida`};
}
