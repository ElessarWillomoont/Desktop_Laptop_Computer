import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // 导入 OrbitControls
import { gsap } from 'gsap'; // 导入 GSAP 动画库

// 创建场景
const scene = new THREE.Scene();

// 创建相机（视角稍微抬高）
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 5, 10); // 相机位置稍高并向后
camera.lookAt(0, 0, 0); // 将相机对准场景中心

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // 柔和的环境光
scene.add(ambientLight);

// 添加柔和的聚光灯（模拟瀑布白光效果）
const spotlight = new THREE.SpotLight(0xffffff, 1);
spotlight.position.set(0, 10, 5); // 从上方照亮场景
spotlight.angle = Math.PI / 6; // 聚光灯角度
spotlight.penumbra = 0.5; // 光线柔和效果
spotlight.castShadow = true;
scene.add(spotlight);

// 添加辅助光源可视化（可选）
const lightHelper = new THREE.SpotLightHelper(spotlight);
scene.add(lightHelper);

// 定义材质
const stainlessSteelMaterial = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa, // 灰色
  metalness: 0.9, // 高金属感
  roughness: 0.2, // 平滑的表面
});

const sandblastedAluminumMaterial = new THREE.MeshStandardMaterial({
  color: 0xd4d4d4, // 铝合金色
  metalness: 0.8, // 中等金属感
  roughness: 0.6, // 喷砂效果（粗糙表面）
});

// 加载 glb 模型
const loader = new GLTFLoader();
loader.load(
  '/Resource/laptop_Desktop_Computer.glb', // 模型路径
  function (gltf) {
    const model = gltf.scene;
    scene.add(model);

    // 应用材质
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

    // 计算几何中心并启动旋转台效果
    const center = new THREE.Vector3();
    const box = new THREE.Box3().setFromObject(model);
    box.getCenter(center); // 获取模型的几何中心

    console.log('Center of rotation:', center);

    addRotatingEffect(model, center);
  },
  function (xhr) {
    console.log(`Model ${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  function (error) {
    console.error('An error occurred while loading the model:', error);
  }
);

// 添加 OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 开启阻尼效果（惯性）
controls.dampingFactor = 0.05; // 阻尼系数
controls.enablePan = false; // 禁用平移
controls.enableZoom = true; // 启用缩放

// 渲染循环
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // 更新 OrbitControls
  renderer.render(scene, camera);
}
animate();

// 响应窗口大小调整
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 函数：递归打印场景结构
function printSceneStructure(object, depth = 0) {
  const prefix = ' '.repeat(depth * 2); // 根据深度生成缩进
  console.log(`${prefix}- ${object.type}: ${object.name || '(no name)'}`);

  // 遍历子对象
  object.children.forEach((child) => {
    printSceneStructure(child, depth + 1);
  });
}

// 函数：为指定 Mesh 应用材质
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

// 函数：为模型添加旋转台效果
function addRotatingEffect(object, center) {
  // 将模型的旋转中心移动到几何中心
  const pivot = new THREE.Group();
  scene.add(pivot);
  pivot.add(object);
  object.position.sub(center); // 将物体从几何中心移动到原点

  // 使用 GSAP 创建缓慢旋转效果
  gsap.to(pivot.rotation, {
    y: Math.PI * 2,
    duration: 10, // 每 10 秒完成一次旋转
    repeat: -1, // 无限循环
    ease: 'linear', // 线性旋转
  });
}
