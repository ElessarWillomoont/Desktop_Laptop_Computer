// Import necessary modules]
import { gsap } from 'gsap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { findObjectByName, applyMaterialToMeshes, printObjectTree } from './utils.js';
import { stainlessSteelMaterial, sandblastedAluminumMaterial } from './materials.js';
import {
  setupRotationInteraction,
  setupMovementInteraction,
} from './animations.js';

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
scene.add(directionalLight);
scene.add(directionalLight.target);

// GLTF Loader
const loader = new GLTFLoader();
let upperCaseFrontMesh;
let keyboardFaceMesh;
let rotateAxis;
let isCaseOpen = false;
let isKeyboardUp = false;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Load the model and set up interactions
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

    upperCaseFrontMesh = findObjectByName(model, 'Upper_case_front_or_upper');
    keyboardFaceMesh = findObjectByName(model, 'KeyboardFace');
    rotateAxis = findObjectByName(model, 'RotateAxis');

    if (!rotateAxis) {
      console.error('RotateAxis not found in the model.');
    }

    // Setup interactions
    setupRotationInteraction(scene, camera, raycaster, mouse, upperCaseFrontMesh, rotateAxis, isCaseOpen);
    setupMovementInteraction(scene, camera, raycaster, mouse, keyboardFaceMesh, { x: 0, y: 50, z: 0 }, isKeyboardUp);

    document.dispatchEvent(new Event('modelLoaded'));
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

function stopCameraRotation() {
  if (rotationTween) rotationTween.pause();
}

// Reset Camera Rotation Timer
let timeoutId;
function resetTimer() {
  clearTimeout(timeoutId);
  stopCameraRotation();
  timeoutId = setTimeout(() => {
    startCameraRotation();
  }, 20000);
}

// Listen to user activity to reset the rotation timer
['mousemove', 'keydown', 'click', 'touchstart'].forEach((eventType) => {
  window.addEventListener(eventType, resetTimer);
});

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;

// Start Camera Rotation Initially
startCameraRotation();

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
