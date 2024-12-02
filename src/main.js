import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

// Create the scene
const scene = new THREE.Scene();

// Create the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 5, 10); // Set initial camera position
const cameraPivot = new THREE.Group(); // A pivot to rotate the camera
scene.add(cameraPivot);
cameraPivot.add(camera); // Attach camera to the pivot

// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xb0e0e6, 1); // Set the background color to light blue
document.body.appendChild(renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Soft ambient light
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.target.position.set(0, 0, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);

// Configure directional light shadows
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -25;
directionalLight.shadow.camera.right = 25;
directionalLight.shadow.camera.top = 25;
directionalLight.shadow.camera.bottom = -25;
directionalLight.shadow.mapSize.width = 1024;
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
let mainCrackCenter = new THREE.Vector3(); // To store MainCrack's center
let rotationTween; // Store the rotation animation reference
let timeoutId; // Timer for detecting user inactivity

// Dynamic path for GitHub Pages
const basePath = window.location.pathname.replace(/\/$/, ''); // Ensure no trailing slash
const modelPath = `${basePath}/Resource/laptop_Desktop_Computer.glb`;

loader.load(
  modelPath, // Path to the model
  function (gltf) {
    const model = gltf.scene;
    scene.add(model);

    // Apply materials to specific meshes
    applyMaterialToMeshes(model, [
      {
        names: ['Main_Crack', 'Upper_case_main_crack', 'PowerCase_maincrack'],
        material: stainlessSteelMaterial,
      },
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

    // Find MainCrack's center in XY plane
    const mainCrack = findObjectByName(model, 'Main_Crack');
    if (mainCrack) {
      const box = new THREE.Box3().setFromObject(mainCrack);
      box.getCenter(mainCrackCenter);

      // Set Z to 0 for XY plane projection
      mainCrackCenter.z = 0;

      // Adjust cameraPivot's position to MainCrack's XY center
      cameraPivot.position.copy(mainCrackCenter);

      // Start the camera rotation animation
      startCameraRotation();
    } else {
      console.error('Main_Crack not found in the model.');
    }

    // Print the scene's hierarchy
    printSceneStructure(model);
  },
  function (xhr) {
    console.log(`Model ${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  function (error) {
    console.error('An error occurred while loading the model:', error);
  }
);

// Add OrbitControls for user interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.enableZoom = true;

// Function to start camera rotation
function startCameraRotation() {
  rotationTween = gsap.to(cameraPivot.rotation, {
    y: Math.PI * 2,
    duration: 10, // One full rotation every 10 seconds
    repeat: -1, // Infinite loop
    ease: 'linear',
  });
}

// Function to stop camera rotation
function stopCameraRotation() {
  if (rotationTween) rotationTween.pause();
}

// Reset inactivity timer
function resetTimer() {
  clearTimeout(timeoutId);
  stopCameraRotation(); // Stop rotation on user interaction
  timeoutId = setTimeout(() => {
    startCameraRotation(); // Restart rotation after 20 seconds of inactivity
  }, 20000); // 20 seconds inactivity timeout
}

// Detect user interaction
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

// Adjust the viewport size on window resize
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

// Function: Find an object by name in the scene
function findObjectByName(parent, name) {
  let result = null;
  parent.traverse((child) => {
    if (child.name === name) {
      result = child;
    }
  });
  return result;
}

// Function: Apply materials to specific meshes
function applyMaterialToMeshes(parent, rules) {
  parent.traverse((child) => {
    if (child.isMesh) {
      for (const rule of rules) {
        if (rule.names.includes(child.name)) {
          child.material = rule.material;
          console.log(`Applied material to: ${child.name}`);
        }
      }
    }
  });
}
