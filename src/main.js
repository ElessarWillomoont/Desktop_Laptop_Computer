import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

// Create the scene
const scene = new THREE.Scene();

// Create the camera (slightly elevated perspective)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 5, 10); // Set the camera's position
camera.lookAt(0, 0, 0); // Point the camera at the center of the scene

// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xb0e0e6, 1); // Set the background color to light blue
document.body.appendChild(renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Soft ambient light
scene.add(ambientLight);

// Add directional light (soft white light)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Intensity of 1
directionalLight.position.set(10, 20, 10); // Set light position
directionalLight.target.position.set(0, 0, 0); // Light points to the center of the scene
scene.add(directionalLight);
scene.add(directionalLight.target);

// Configure shadows for the directional light
directionalLight.castShadow = true; // Enable shadows
directionalLight.shadow.camera.near = 0.1; // Near clipping plane for shadows
directionalLight.shadow.camera.far = 50; // Far clipping plane for shadows
directionalLight.shadow.camera.left = -25; // Shadow area bounds
directionalLight.shadow.camera.right = 25;
directionalLight.shadow.camera.top = 25;
directionalLight.shadow.camera.bottom = -25;
directionalLight.shadow.mapSize.width = 1024; // Shadow resolution
directionalLight.shadow.mapSize.height = 1024;

// Define materials
const stainlessSteelMaterial = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa, // Gray
  metalness: 0.9, // High metallic feel
  roughness: 0.2, // Smooth surface
});

const sandblastedAluminumMaterial = new THREE.MeshStandardMaterial({
  color: 0xd4d4d4, // Aluminum color
  metalness: 0.8, // Medium metallic feel
  roughness: 0.6, // Sandblasted effect
});

// Load the GLB model
const loader = new GLTFLoader();
let rotationTween; // Store the rotation animation reference

loader.load(
  '/Resource/laptop_Desktop_Computer.glb', // Path to the model
  function (gltf) {
    const model = gltf.scene;
    scene.add(model);

    // Apply materials
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
          'Upper_case_front_or_upper',
          'Upper_case_left',
          'Upper_case_upper_or_back',
          'PowerCase_button',
          'PowerCase_left',
          'PowerCase_right',
          'PowerCase_upper',
        ],
        material: sandblastedAluminumMaterial,
      },
    ]);

    // Output parent-child relationship tree to the console
    printSceneStructure(model);
  },
  function (xhr) {
    // Log progress (commented out as per request)
    // console.log(`Model ${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  function (error) {
    console.error('An error occurred while loading the model:', error);
  }
);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable damping (inertia)
controls.dampingFactor = 0.05; // Damping factor
controls.enablePan = false; // Disable panning
controls.enableZoom = true; // Enable zooming

// Add a timer to control animations
let timeoutId;
function resetTimer() {
  clearTimeout(timeoutId);
  if (rotationTween) rotationTween.pause(); // Pause rotation
  timeoutId = setTimeout(() => {
    if (rotationTween) rotationTween.resume(); // Resume rotation
  }, 20000); // Resume rotation after 20 seconds of inactivity
}

// Detect user input
['mousemove', 'keydown', 'click', 'touchstart'].forEach((eventType) => {
  window.addEventListener(eventType, resetTimer);
});

// Rendering loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update OrbitControls
  renderer.render(scene, camera);
}
animate();

// Adjust viewport size on window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Function: Print the parent-child relationship tree of the scene
function printSceneStructure(object, depth = 0) {
  const prefix = ' '.repeat(depth * 2); // Indentation based on depth
  console.log(`${prefix}- ${object.type}: ${object.name || '(no name)'}`);

  // Recursively traverse and print child objects
  object.children.forEach((child) => {
    printSceneStructure(child, depth + 1);
  });
}

// Function: Apply materials to specific meshes
function applyMaterialToMeshes(parent, rules) {
  parent.traverse((child) => {
    if (child.isMesh) {
      for (const rule of rules) {
        if (rule.names.includes(child.name)) {
          child.material = rule.material;
          // Commented out logging as per request
          // console.log(`Applied material to: ${child.name}`);
        }
      }
    }
  });
}

// Function: Add a rotation effect to the model
function addRotatingEffect(object, center) {
  const pivot = new THREE.Group();
  scene.add(pivot);
  pivot.add(object);
  object.position.sub(center); // Move the object to the origin

  // Use GSAP to create a smooth rotation animation
  return gsap.to(pivot.rotation, {
    y: Math.PI * 2,
    duration: 10, // Complete one rotation every 10 seconds
    repeat: -1, // Infinite loop
    ease: 'linear', // Linear rotation
  });
}
