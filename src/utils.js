import { PulsingBalls } from './PulsingBalls.js';

export function findObjectByName(parent, name) {
    let result = null;
    parent.traverse((child) => {
      if (child.name === name) result = child;
    });
    return result;
  }
  
  export function applyMaterialToMeshes(parent, rules) {
    parent.traverse((child) => {
      if (child.isMesh) {
        for (const rule of rules) {
          if (rule.names.includes(child.name)) {
            child.material = rule.material;
          }
        }
      }
    });
  }
  
  export function addPulsingBalls(scene, target, radius1, radius2, ballCount, expansionTime) {
    return new PulsingBalls(scene, target, radius1, radius2, ballCount, expansionTime);
  }
  
  export function removePulsingBalls(pulsingBallsInstance) {
    if (pulsingBallsInstance) {
      pulsingBallsInstance.remove();
      return null;
    }
    return pulsingBallsInstance;
  }
  