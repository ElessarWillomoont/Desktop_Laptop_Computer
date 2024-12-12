import { gsap } from 'gsap';

export function openCase(rotateAxis, scene, target, setPulsingBall) {
  gsap.to(rotateAxis.rotation, { x: -Math.PI / 1.8, duration: 1, ease: 'power2.inOut', onComplete: () => {
    // Create a new PulsingBall for the opened state
    setPulsingBall(scene, target);
  }});
}

export function closeCase(rotateAxis, scene, target, setPulsingBall) {
  gsap.to(rotateAxis.rotation, { x: 0, duration: 1, ease: 'power2.inOut', onComplete: () => {
    // Create a new PulsingBall for the closed state
    setPulsingBall(scene, target);
  }});
}
