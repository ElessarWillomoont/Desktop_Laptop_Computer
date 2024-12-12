// Import necessary modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { findObjectByName, applyMaterialToMeshes, addPulsingBalls, removePulsingBalls, printObjectTree } from './utils.js';
import { stainlessSteelMaterial, sandblastedAluminumMaterial } from './materials.js';
import { openCase, closeCase } from './animations.js';

// Scene and Camera Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 5, 10);

const cameraPivot = new THREE.Group();
scene.add(cameraPivot);
cameraPivot.add(camera);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xb0e0e6, 1);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.target.position.set(0, 0, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -25;
directionalLight.shadow.camera.right = 25;
directionalLight.shadow.camera.top = 25;
directionalLight.shadow.camera.bottom = -25;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);
scene.add(directionalLight.target);

// GLTF Loader
const loader = new GLTFLoader();
let upperCaseFrontMesh;
let mainCrackCenter = new THREE.Vector3();
let openPulsingBalls; // For the open state
let closedPulsingBalls; // For the closed state
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isCaseOpen = false;

loader.load(
  `/Resource/laptop_Desktop_Computer.glb`,
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    applyMaterialToMeshes(model, [
      { names: ['Main_Crack', 'Upper_case_main_crack', 'PowerCase_maincrack'], material: stainlessSteelMaterial },
      {
        names: [
          'LowerCase_KeyBoardFace',
          'LowerCase_behind',
          'LowerCase_button',
          'LowerCase_front',
          'LowerCase_left',
          'LowerCase_right',
          'Upper_case_screen_face',
          'Upper_case_back_or_button',
          'PowerCase_button',
          'PowerCase_left',
          'PowerCase_right',
        ],
        material: sandblastedAluminumMaterial,
      },
    ]);

    const rotateAxis = findObjectByName(model, 'RotateAxis');
    upperCaseFrontMesh = findObjectByName(model, 'Upper_case_front_or_upper');

    if (rotateAxis && upperCaseFrontMesh) {
      const originalMaterial = upperCaseFrontMesh.material;

      // Initialize PulsingBalls for the closed state
      closedPulsingBalls = addPulsingBalls(scene, upperCaseFrontMesh, 0.1, 0.5, 5, 1.5);

      window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(upperCaseFrontMesh);

        if (intersects.length > 0) {
          upperCaseFrontMesh.material = new THREE.MeshStandardMaterial({
            ...originalMaterial,
            color: 0xffffff,
          });
          document.body.style.cursor = 'pointer';
        } else {
          upperCaseFrontMesh.material = originalMaterial;
          document.body.style.cursor = 'default';
        }
      });

      window.addEventListener('click', () => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(upperCaseFrontMesh);

        if (intersects.length > 0) {
          if (isCaseOpen) {
            closeCase(rotateAxis);

            // Remove open PulsingBalls and create closed PulsingBalls after animation
            openPulsingBalls = removePulsingBalls(openPulsingBalls);
            gsap.to({}, {
              duration: 1,
              onComplete: () => {
                closedPulsingBalls = addPulsingBalls(scene, upperCaseFrontMesh, 0.1, 0.5, 5, 1.5);
              },
            });
          } else {
            openCase(rotateAxis);

            // Remove closed PulsingBalls and create open PulsingBalls after animation
            closedPulsingBalls = removePulsingBalls(closedPulsingBalls);
            gsap.to({}, {
              duration: 1,
              onComplete: () => {
                openPulsingBalls = addPulsingBalls(scene, upperCaseFrontMesh, 0.2, 0.6, 5, 1.5);
              },
            });
          }

          isCaseOpen = !isCaseOpen; // Toggle state
        }
      });
    }

    const mainCrack = findObjectByName(model, 'Main_Crack');
    if (mainCrack) {
      const box = new THREE.Box3().setFromObject(mainCrack);
      box.getCenter(mainCrackCenter);
      mainCrackCenter.z = 0;

      cameraPivot.position.copy(mainCrackCenter);
      startCameraRotation();
    } else {
      console.error('Main_Crack not found in the model.');
    }

    // Print the object tree of the loaded scene
    console.log('Object tree of the scene:');
    printObjectTree(scene);
  },
  (xhr) => console.log(`Model ${(xhr.loaded / xhr.total) * 100}% loaded`),
  (error) => console.error('Error loading model:', error)
);

// Camera Rotation
let rotationTween;
function startCameraRotation() {
  rotationTween = gsap.to(cameraPivot.rotation, { y: Math.PI * 2, duration: 10, repeat: -1, ease: 'linear' });
}

// Function to move a mesh in a specific direction by a given distance over a set time
function moveMesh(direction, distance, mesh, time) {
  const targetPosition = {
    x: mesh.position.x + direction.x * distance,
    y: mesh.position.y + direction.y * distance,
    z: mesh.position.z + direction.z * distance,
  };

  gsap.to(mesh.position, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration: time,
    ease: 'power2.inOut',
  });
}

// Inactivity Timer
let timeoutId;
function resetTimer() {
  clearTimeout(timeoutId);
  if (rotationTween) rotationTween.pause();
  timeoutId = setTimeout(() => {
    startCameraRotation();
  }, 20000);
}
['mousemove', 'keydown', 'click', 'touchstart'].forEach((eventType) => {
  window.addEventListener(eventType, resetTimer);
});

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
