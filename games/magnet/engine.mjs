// Magnet Quest Stage 1 — original teaching model, not a physical force simulation.
export const POSITIONS = Object.freeze([
  {id:'left', label:'ひだりのはし', x:-2, response:5},
  {id:'innerLeft', label:'ひだりの内側', x:-1, response:3},
  {id:'center', label:'まんなか', x:0, response:1},
  {id:'innerRight', label:'みぎの内側', x:1, response:3},
  {id:'right', label:'みぎのはし', x:2, response:5}
]);
export function inspectBar(positionId) {
  const item = POSITIONS.find(p => p.id === positionId);
  if (!item) throw new Error('Unknown probe position: ' + positionId);
  return {positionId, label:item.label, response:item.response, intensity:item.response === 5 ? 'つよい' : item.response === 1 ? 'よわい' : 'ちゅうくらい'};
}
export function comparePoles(first, second) {
  if (!['N','S'].includes(first) || !['N','S'].includes(second)) throw new Error('Poles must be N or S');
  return first === second ? 'repel' : 'attract';
}
export function unknownPole(side) {
  if (side === 'left') return 'N';
  if (side === 'right') return 'S';
  throw new Error('Unknown side: ' + side);
}
export function referenceExperiment(side) {
  const pole = unknownPole(side);
  return {side, pole, reaction:comparePoles('N', pole)};
}
export function tryGate(selectedPole, distance) {
  if (!['N','S'].includes(selectedPole) || !Number.isFinite(Number(distance)) || Number(distance) < 1 || Number(distance) > 5) return 'invalid';
  if (Number(distance) > 3) return 'far';
  return comparePoles('N', selectedPole) === 'attract' ? 'open' : 'repel';
}
export const STAGE = Object.freeze({
  id:'magnet-stage-1',
  title:'ねむれる磁力の門',
  requiredProbes:['left','center','right'],
  // The numeric marks and distance threshold are game representations;
  // they do not claim measured magnetic-force values or a universal cutoff.
  disclaimer:'鉄片の反応の数と3cmの成功条件は、ゲーム内だけの表現です。実物の磁力は、磁石の種類や距離で変わります。'
});
