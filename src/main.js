// Updated main.js

// Import necessary modules
import * as THREE from 'three';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { findObjectByName, applyMaterialToMeshes, printObjectTree } from './utils.js';
import { stainlessSteelMaterial, sandblastedAluminumMaterial } from './materials.js';
import {
  setupRotationInteraction,
  setupMovementInteraction,
  setupMeshToggleInteraction,
  addHoverTooltip,
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

// Global state variables
const upperCaseOpened = { value: false }; // State for upper case interaction
const keyboardFaceOpened = { value: false }; // State for keyboard movement interaction
const buttonFaceOpened = { value: false };
const FrontCoverOpened = { value: false };
const BehindCoverOpened = { value: false };
const PowercaseOpened = { value: false };
const PSUOpened = { value: false };

const loader = new GLTFLoader();
let upperCaseFrontMesh;
let keyboardFaceMesh;
let LowerCase_buttonMesh;
let FrontCoverMesh;
let BehindCoverMesh;
let rotateAxis;
let PowercaseUpperMesh;
let PSUMesh;
let ATXMesh;
let EATXMesh;
let FanMesh;
let WatterMesh;
let UpperMainMash;
let GCMash;
let ScreenMesh;
let KeyBoradMesh;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Model loading status
let modelLoaded = false;

// Interaction setup function
function initializeInteractions() {
  if (modelLoaded) {
    const interactableObjects = [
      upperCaseFrontMesh,
      keyboardFaceMesh,
      LowerCase_buttonMesh,
      FrontCoverMesh,
      BehindCoverMesh,
      PowercaseUpperMesh,
      PSUMesh,
      ATXMesh,
      EATXMesh,
      FanMesh,
      WatterMesh,
      UpperMainMash,
      GCMash,
      ScreenMesh,
      KeyBoradMesh,
    ].filter(Boolean);

    setupRotationInteraction(scene, camera, raycaster, mouse, upperCaseFrontMesh, rotateAxis, upperCaseOpened);
    setupMovementInteraction(scene, camera, raycaster, mouse, keyboardFaceMesh, { x: 0, y: 50, z: 0 }, keyboardFaceOpened);
    setupMovementInteraction(scene, camera, raycaster, mouse, LowerCase_buttonMesh, { x: 0, y: -50, z: 0 }, buttonFaceOpened);
    setupMovementInteraction(scene, camera, raycaster, mouse, FrontCoverMesh, { x: 0, y: 0, z: 50 }, FrontCoverOpened);
    setupMovementInteraction(scene, camera, raycaster, mouse, BehindCoverMesh, { x: 0, y: 0, z: -50 }, BehindCoverOpened);
    setupMovementInteraction(scene, camera, raycaster, mouse, PowercaseUpperMesh, { x: 0, y: 50, z: 0 }, PowercaseOpened);
    setupMovementInteraction(scene, camera, raycaster, mouse, PSUMesh, { x: 0, y: 25, z: 0 }, PSUOpened);
    addHoverTooltip(scene, camera, raycaster, mouse, UpperMainMash, "3mm thick aluminum alloy with numerous heat dissipation holes, maximizing heat dissipation and lightweight design while maintaining strength.\n");
    addHoverTooltip(scene, camera, raycaster, mouse, GCMash, "External GPU connected via high-speed PCI and high-power extension cables (designed with up to four 8-pin interfaces). The design prioritizes maximum GPU compatibility with negligible latency and performance loss (cables not shown in the diagram). \nNo restrictions on length or width, no need to consider cooling issues, compatible with even the highest-end gaming and professional GPUs (model shown: EVGA RTX 3090).\n");
    addHoverTooltip(scene, camera, raycaster, mouse, ATXMesh, "The internal space is sufficient to accommodate high-end EATX motherboards (currently shown with an ASUS ROG ATX motherboard, which can be switched to EATX by clicking).\n");
    addHoverTooltip(scene, camera, raycaster, mouse, FanMesh, "The chassis supports downdraft coolers up to 7.5cm in height and also accommodates liquid cooling (clicking the cooler can switch to a water block). Radiators need to be external or custom-built for internal installation when using an ATX motherboard. Internal radiators are not supported with EATX motherboards due to space limitations. Future plans include designing quick-release fittings for liquid cooling tubes on the back panel for easier connection and disconnection.\n");
    addHoverTooltip(scene, camera, raycaster, mouse, KeyBoradMesh, "Supports a full-size laptop keyboard paired with a large touchpad (module requires specific designation or customization).\n");
    addHoverTooltip(scene, camera, raycaster, mouse, ScreenMesh, "Supports an 18-inch laptop screen with dedicated space reserved for an essential internet webcam.\n");
    addHoverTooltip(scene, camera, raycaster, mouse, PSUMesh, "External power box supports ATX-L specification PSU length, ensuring compatibility with the highest wattage PSUs to support top-tier GPUs and graphics cards. Future plans include specially designed circuit boards and connectors to enable connection to the main chassis via a single cable, reducing wiring complexity.\n");
  }
}

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
    LowerCase_buttonMesh = findObjectByName(model, 'LowerCase_button');
    FrontCoverMesh = findObjectByName(model, 'LowerCase_front');
    BehindCoverMesh = findObjectByName(model, 'LowerCase_behind');
    PowercaseUpperMesh = findObjectByName(model, 'PowerCase_upper');
    PSUMesh = findObjectByName(model, 'ATX_Power_Supply_v1');
    rotateAxis = findObjectByName(model, 'RotateAxis');
    ATXMesh = findObjectByName(model, 'ATX_MB');
    EATXMesh = findObjectByName(model, 'EATX_MB');
    FanMesh = findObjectByName(model, 'CPU_FAN');
    WatterMesh = findObjectByName(model, 'Water_cooler_inner');
    UpperMainMash = findObjectByName(model, 'Upper_case_upper_or_back');
    GCMash = findObjectByName(model, 'GraphicCard');
    ScreenMesh = findObjectByName(model, 'Screen');
    KeyBoradMesh = findObjectByName(model, 'LaptopKeyBoard');
    if (!rotateAxis) {
      console.error('RotateAxis not found in the model.');
    }

    // Mark model as loaded and initialize interactions
    modelLoaded = true;
    initializeInteractions();

    // Example usage of setupMeshToggleInteraction
    if (ATXMesh && EATXMesh) {
      setupMeshToggleInteraction(scene, camera, raycaster, mouse, ATXMesh, EATXMesh);
    }
    if (FanMesh && WatterMesh) {
      setupMeshToggleInteraction(scene, camera, raycaster, mouse, FanMesh, WatterMesh);
    }

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
