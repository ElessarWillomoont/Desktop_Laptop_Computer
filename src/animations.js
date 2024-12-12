import { gsap } from 'gsap';

export function openCase(rotateAxis) {
  gsap.to(rotateAxis.rotation, { x: -Math.PI / 1.8, duration: 1, ease: 'power2.inOut' });
}

export function closeCase(rotateAxis) {
  gsap.to(rotateAxis.rotation, { x: 0, duration: 1, ease: 'power2.inOut' });
}
