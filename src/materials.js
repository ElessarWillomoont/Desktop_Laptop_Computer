import * as THREE from 'three';

export const stainlessSteelMaterial = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa,
  metalness: 0.9,
  roughness: 0.2,
});

export const sandblastedAluminumMaterial = new THREE.MeshStandardMaterial({
  color: 0xd4d4d4,
  metalness: 0.8,
  roughness: 0.6,
});
