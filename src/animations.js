import { gsap } from 'gsap';
import { addPulsingBalls, removePulsingBalls } from './utils.js';

export let isAnimating = false;

// Function to lock animation
export function lockAnimation() {
  isAnimating = true;
}

// Function to unlock animation
export function unlockAnimation() {
  isAnimating = false;
}

// Function to open the case
export function openCase(rotateAxis) {
  gsap.to(rotateAxis.rotation, {
    x: -Math.PI / 1.8,
    duration: 1,
    ease: 'power2.inOut',
  });
}

// Function to close the case
export function closeCase(rotateAxis) {
  gsap.to(rotateAxis.rotation, {
    x: 0,
    duration: 1,
    ease: 'power2.inOut',
  });
}

// Setup interaction for opening/closing the upper case
export function setupUpperCaseInteraction(scene, camera, raycaster, mouse, upperCaseFrontMesh, rotateAxis, isCaseOpen) {
  if (!rotateAxis) {
    console.error('RotateAxis not found.');
    return;
  }

  const originalMaterial = upperCaseFrontMesh.material;
  let closedPulsingBalls = addPulsingBalls(scene, upperCaseFrontMesh);
  let openPulsingBalls;

  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(upperCaseFrontMesh);

    if (intersects.length > 0) {
      upperCaseFrontMesh.material.color.set(0xffffff);
      document.body.style.cursor = 'pointer';
    } else {
      upperCaseFrontMesh.material.color.copy(originalMaterial.color);
      document.body.style.cursor = 'default';
    }
  });

  window.addEventListener('click', () => {
    if (isAnimating) return;
    lockAnimation();

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(upperCaseFrontMesh);

    if (intersects.length > 0) {
      if (isCaseOpen) {
        closeCase(rotateAxis);
        openPulsingBalls = removePulsingBalls(openPulsingBalls);
        gsap.delayedCall(1, () => {
          closedPulsingBalls = addPulsingBalls(scene, upperCaseFrontMesh);
          unlockAnimation();
        });
      } else {
        openCase(rotateAxis);
        closedPulsingBalls = removePulsingBalls(closedPulsingBalls);
        gsap.delayedCall(1, () => {
          openPulsingBalls = addPulsingBalls(scene, upperCaseFrontMesh);
          unlockAnimation();
        });
      }

      isCaseOpen = !isCaseOpen;
    } else {
      unlockAnimation();
    }
  });
}

// Setup interaction for keyboard movement
export function setupKeyboardInteraction(scene, camera, raycaster, mouse, keyboardFaceMesh, isKeyboardUp) {
  let keyboardPulsingBall = addPulsingBalls(scene, keyboardFaceMesh);

  window.addEventListener('click', (event) => {
    if (isAnimating) return;
    lockAnimation();

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(keyboardFaceMesh);

    if (intersects.length > 0) {
      removePulsingBalls(keyboardPulsingBall);
      const direction = isKeyboardUp ? { x: 0, y: -1, z: 0 } : { x: 0, y: 1, z: 0 };

      // Move the keyboard with animation
      gsap.to(keyboardFaceMesh.position, {
        x: keyboardFaceMesh.position.x + direction.x * 50,
        y: keyboardFaceMesh.position.y + direction.y * 50,
        z: keyboardFaceMesh.position.z + direction.z * 50,
        duration: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          // Add pulsing balls after the animation completes
          keyboardPulsingBall = addPulsingBalls(scene, keyboardFaceMesh);
          unlockAnimation(); // Unlock animation state
        },
      });

      isKeyboardUp = !isKeyboardUp;
    } else {
      unlockAnimation(); // Unlock if no intersection
    }
  });
}