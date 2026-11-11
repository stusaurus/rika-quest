// SVG positions use the game's coordinate system (viewBox 0 0 980 620).
// The discrete distance marks are gameplay labels, not physical measurements.
export const PROBE_STOPS = Object.freeze([
 {id:'left', x:390},
 {id:'innerLeft', x:440},
 {id:'center', x:491},
 {id:'innerRight', x:540},
 {id:'right', x:591}
]);
export const GATE_RAIL = Object.freeze({near:700,far:470,minDistance:1,maxDistance:5});
export function clamp(value,min,max){
 if(!Number.isFinite(value))throw new TypeError('Finite value required');
 return Math.max(min,Math.min(max,value));
}
export function probeFromX(x){
 if(!Number.isFinite(x))throw new TypeError('Finite position required');
 return PROBE_STOPS.reduce((best,next)=>Math.abs(next.x-x)<Math.abs(best.x-x)?next:best,PROBE_STOPS[0]).id;
}
export function distanceFromX(x){
 const travel=(clamp(x,GATE_RAIL.far,GATE_RAIL.near)-GATE_RAIL.far)/(GATE_RAIL.near-GATE_RAIL.far);
 return clamp(Math.round(GATE_RAIL.maxDistance-travel*4),1,5);
}
export function xFromDistance(d){
 if(!Number.isInteger(d)||d<1||d>5)throw new RangeError('Distance is 1 through 5');
 return GATE_RAIL.far+(5-d)*(GATE_RAIL.near-GATE_RAIL.far)/4;
}
export function svgXFromClient(svg,clientX,clientY){
 const point=svg.createSVGPoint();point.x=clientX;point.y=clientY;
 const matrix=svg.getScreenCTM();
 if(!matrix)throw new Error('SVG has no screen transform');
 return point.matrixTransform(matrix.inverse()).x;
}
