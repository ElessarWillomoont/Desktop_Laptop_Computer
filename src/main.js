import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

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

// Materials
const stainlessSteelMaterial = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa,
  metalness: 0.9,
  roughness: 0.2,
});

const sandblastedAluminumMaterial = new THREE.MeshStandardMaterial({
  color: 0xd4d4d4,
  metalness: 0.8,
  roughness: 0.6,
});

// GLTF Loader
const loader = new GLTFLoader();
let upperCaseFrontMesh;
let mainCrackCenter = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Helper Functions
function findObjectByName(parent, name) {
  let result = null;
  parent.traverse((child) => {
    if (child.name === name) result = child;
  });
  return result;
}

function applyMaterialToMeshes(parent, rules) {
  parent.traverse((child) => {
    if (child.isMesh) {
      for (const rule of rules) {
        if (rule.names.includes(child.name)) {
          child.material = rule.material;
        }
      }
    }
  });
}

function addPulsingBalls(target, r1, r2, ballCount, expansionTime) {
  const pulsingGroup = new THREE.Group();
  scene.add(pulsingGroup);

  const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  const ballGeometry = new THREE.SphereGeometry(1, 32, 32);

  for (let i = 0; i < ballCount; i++) {
    const ball = new THREE.Mesh(ballGeometry, ballMaterial.clone());
    pulsingGroup.add(ball);

    const delay = (i / ballCount) * expansionTime;

    gsap.fromTo(
      ball.scale,
      { x: r1, y: r1, z: r1 },
      { x: r2, y: r2, z: r2, duration: expansionTime, repeat: -1, delay, ease: 'linear' }
    );
    gsap.fromTo(
      ball.material,
      { opacity: 0 },
      { opacity: 1, duration: expansionTime / 2, yoyo: true, repeat: -1, delay, ease: 'power1.inOut' }
    );
  }

  const boundingBox = new THREE.Box3().setFromObject(target);
  pulsingGroup.position.copy(boundingBox.getCenter(new THREE.Vector3()));
}

// Load Model
loader.load(
  `${window.location.pathname.replace(/\/$/, '')}/Resource/laptop_Desktop_Computer.glb`,
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

      addPulsingBalls(upperCaseFrontMesh, 0.1, 0.5, 5, 1.5);

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
          openCase(rotateAxis);
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
  },
  (xhr) => console.log(`Model ${(xhr.loaded / xhr.total) * 100}% loaded`),
  (error) => console.error('Error loading model:', error)
);

// Camera Rotation
let rotationTween;
function startCameraRotation() {
  rotationTween = gsap.to(cameraPivot.rotation, { y: Math.PI * 2, duration: 10, repeat: -1, ease: 'linear' });
}

// Open Case
function openCase(rotateAxis) {
  gsap.to(rotateAxis.rotation, { x: -Math.PI / 1.8, duration: 1, ease: 'power2.inOut' });
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
