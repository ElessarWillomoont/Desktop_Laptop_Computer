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

// Function to handle rotation-based animations
export function setupRotationInteraction(scene, camera, raycaster, mouse, model, rotateAxis, upperCaseOpened) {
  if (!rotateAxis) {
    console.error('RotateAxis not found.');
    return;
  }

  let closedPulsingBalls = addPulsingBalls(scene, model);
  let openPulsingBalls;

  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(model);

    if (intersects.length > 0) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  });

  window.addEventListener('click', () => {
    if (isAnimating) return;
    lockAnimation();

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(model);

    if (intersects.length > 0) {
      if (upperCaseOpened.value) {
        gsap.to(rotateAxis.rotation, {
          x: 0,
          duration: 1,
          ease: 'power2.inOut',
          onComplete: () => {
            openPulsingBalls = removePulsingBalls(openPulsingBalls);
            closedPulsingBalls = addPulsingBalls(scene, model);
            unlockAnimation();
          },
        });
      } else {
        gsap.to(rotateAxis.rotation, {
          x: -Math.PI / 1.8,
          duration: 1,
          ease: 'power2.inOut',
          onComplete: () => {
            closedPulsingBalls = removePulsingBalls(closedPulsingBalls);
            openPulsingBalls = addPulsingBalls(scene, model);
            unlockAnimation();
          },
        });
      }
      upperCaseOpened.value = !upperCaseOpened.value;
    } else {
      unlockAnimation();
    }
  });
}

// Function to handle linear movement animations
export function setupMovementInteraction(scene, camera, raycaster, mouse, model, direction, keyboardFaceOpened) {
  let pulsingBall = addPulsingBalls(scene, model); // 初始添加小球

  function handleMovement() {
    const moveDirection = keyboardFaceOpened.value
      ? { x: -direction.x, y: -direction.y, z: -direction.z }
      : direction;

    gsap.to(model.position, {
      x: model.position.x + moveDirection.x,
      y: model.position.y + moveDirection.y,
      z: model.position.z + moveDirection.z,
      duration: 1,
      ease: 'power2.inOut',
      onStart: () => {
        // 开始动画时移除小球
        pulsingBall = removePulsingBalls(pulsingBall);
      },
      onComplete: () => {
        // 动画完成后重新添加小球
        pulsingBall = addPulsingBalls(scene, model);
        unlockAnimation();
      },
    });

    // 切换状态
    keyboardFaceOpened.value = !keyboardFaceOpened.value;
  }

  const onClick = (event) => {
    if (isAnimating) return;
    lockAnimation();

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(model);

    if (intersects.length > 0) {
      handleMovement();
    } else {
      unlockAnimation();
    }
  };

  // 确保不会重复绑定事件
  window.removeEventListener('click', onClick);
  window.addEventListener('click', onClick);
}


