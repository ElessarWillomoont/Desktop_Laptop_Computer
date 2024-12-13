// Updated animations.js

import { gsap } from 'gsap';
import { addPulsingBalls, removePulsingBalls, getClosestIntersect } from './utils.js';
import * as THREE from 'three';

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
        const closestIntersect = getClosestIntersect(raycaster, [model]);

        if (closestIntersect) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    });

    window.addEventListener('click', () => {
        if (isAnimating) return;
        lockAnimation();

        raycaster.setFromCamera(mouse, camera);
        const closestIntersect = getClosestIntersect(raycaster, [model]);

        if (closestIntersect) {
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
    let pulsingBall = addPulsingBalls(scene, model); // Initial pulsing ball

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
                pulsingBall = removePulsingBalls(pulsingBall);
            },
            onComplete: () => {
                pulsingBall = addPulsingBalls(scene, model);
                unlockAnimation();
            },
        });

        keyboardFaceOpened.value = !keyboardFaceOpened.value;
    }

    const onClick = (event) => {
        if (isAnimating) return;
        lockAnimation();

        raycaster.setFromCamera(mouse, camera);
        const closestIntersect = getClosestIntersect(raycaster, [model]);

        if (closestIntersect) {
            handleMovement();
        } else {
            unlockAnimation();
        }
    };

    window.removeEventListener('click', onClick);
    window.addEventListener('click', onClick);
}

// Function to toggle between meshes
export function setupMeshToggleInteraction(scene, camera, raycaster, mouse, mesh1, mesh2) {
    // Ensure initial visibility
    mesh1.visible = true;
    mesh2.visible = false;

    const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const hoverMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });

    const originalMaterials = new Map();
    mesh1.traverse((child) => {
        if (child.isMesh) originalMaterials.set(child, child.material);
    });
    mesh2.traverse((child) => {
        if (child.isMesh) originalMaterials.set(child, child.material);
    });

    const mesh1Children = [];
    const mesh2Children = [];
    mesh1.traverse((child) => mesh1Children.push(child));
    mesh2.traverse((child) => mesh2Children.push(child));

    let highlightedObject = null;

    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const closestIntersect = getClosestIntersect(raycaster, [...mesh1Children, ...mesh2Children]);

        if (closestIntersect) {
            const hoveredMesh = closestIntersect.object;

            if (highlightedObject !== hoveredMesh) {
                if (highlightedObject) {
                    highlightedObject.material = originalMaterials.get(highlightedObject);
                }

                highlightedObject = hoveredMesh;
                highlightedObject.material = hoverMaterial;
            }
        } else {
            if (highlightedObject) {
                highlightedObject.material = originalMaterials.get(highlightedObject);
                highlightedObject = null;
            }
        }
    });

    window.addEventListener('click', (event) => {
        raycaster.setFromCamera(mouse, camera);
        const closestIntersect = getClosestIntersect(raycaster, [...mesh1Children, ...mesh2Children]);

        if (closestIntersect) {
            const clickedMesh = closestIntersect.object;

            if (mesh1Children.includes(clickedMesh)) {
                mesh1.visible = false;
                mesh2.visible = true;
            } else if (mesh2Children.includes(clickedMesh)) {
                mesh1.visible = true;
                mesh2.visible = false;
            }
        }
    });
}

// Function to add a hover tooltip
export function addHoverTooltip(scene, camera, raycaster, mouse, mesh, text) {
    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '10px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.display = 'none';
    tooltip.style.fontSize = '16px';
    tooltip.style.width = '25%';
    tooltip.style.height = '25%';
    tooltip.style.zIndex = '1000';
    tooltip.style.overflowY = 'auto';
    tooltip.innerHTML = `<div style="position: relative; width: 100%; height: 100%;">
      <div style="position: absolute; top: 5px; right: 10px; cursor: pointer;">&times;</div>
      <div>${text.replace(/\n/g, '<br>')}</div>
    </div>`;
    document.body.appendChild(tooltip);

    const closeButton = tooltip.querySelector('div div');
    closeButton.addEventListener('click', () => {
        tooltip.style.display = 'none';
    });

    const countdownCanvas = document.createElement('canvas');
    countdownCanvas.width = 50;
    countdownCanvas.height = 50;
    countdownCanvas.style.position = 'absolute';
    countdownCanvas.style.zIndex = '999';
    countdownCanvas.style.pointerEvents = 'none';
    document.body.appendChild(countdownCanvas);
    const ctx = countdownCanvas.getContext('2d');

    let hoverTimer = null;
    let hoverStart = null;
    let isCounting = false;

    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const closestIntersect = getClosestIntersect(raycaster, [mesh]);

        if (closestIntersect && tooltip.style.display === 'none') {
            countdownCanvas.style.left = `${event.clientX - 25}px`;
            countdownCanvas.style.top = `${event.clientY - 25}px`;

            if (!isCounting) {
                isCounting = true;
                hoverStart = performance.now();

                hoverTimer = setInterval(() => {
                    const elapsed = performance.now() - hoverStart;
                    const progress = Math.min(elapsed / 3000, 1);

                    ctx.clearRect(0, 0, 50, 50);
                    ctx.beginPath();
                    ctx.arc(25, 25, 20, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2, false);
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.stroke();

                    if (progress === 1) {
                        clearInterval(hoverTimer);
                        tooltip.style.display = 'block';
                        tooltip.style.left = `${event.clientX + 10}px`;
                        tooltip.style.top = `${event.clientY + 10}px`;
                        ctx.clearRect(0, 0, 50, 50);
                        isCounting = false;
                    }
                }, 16);
            }
        } else {
            if (hoverTimer && tooltip.style.display === 'none') {
                clearInterval(hoverTimer);
                ctx.clearRect(0, 0, 50, 50);
                isCounting = false;
            }
        }
    });
}
