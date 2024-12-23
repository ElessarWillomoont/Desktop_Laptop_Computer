// utils.js
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

export function addPulsingBalls(
    scene,
    target,
    radius1 = 0.1,
    radius2 = 0.5,
    ballCount = 5,
    expansionTime = 5
) {
    return new PulsingBalls(scene, target, radius1, radius2, ballCount, expansionTime);
}

export function removePulsingBalls(pulsingBallsInstance) {
    if (pulsingBallsInstance) {
        pulsingBallsInstance.remove();
        return null;
    }
    return pulsingBallsInstance;
}

export function printObjectTree(object, depth = 0) {
    console.log(`${' '.repeat(depth * 2)}${object.name || object.type}`);
    object.children.forEach((child) => printObjectTree(child, depth + 1));
}

export function getClosestIntersect(raycaster, objects) {
    const intersects = raycaster.intersectObjects(objects, true); // Recursive check
    if (intersects.length > 0) {
        return intersects[0]; // Return closest intersect
    }
    return null;
}