import * as THREE from 'three';
import { gsap } from 'gsap';

export class PulsingBalls {
  constructor(scene, target, r1, r2, ballCount, expansionTime) {
    this.scene = scene;
    this.target = target;
    this.r1 = r1;
    this.r2 = r2;
    this.ballCount = ballCount;
    this.expansionTime = expansionTime;
    this.group = new THREE.Group();
    this.balls = [];
    this.init();
  }

  init() {
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    const ballGeometry = new THREE.SphereGeometry(1, 32, 32);

    for (let i = 0; i < this.ballCount; i++) {
      const ball = new THREE.Mesh(ballGeometry, ballMaterial.clone());
      this.group.add(ball);
      this.balls.push(ball);

      const delay = (i / this.ballCount) * this.expansionTime;

      gsap.fromTo(
        ball.scale,
        { x: this.r1, y: this.r1, z: this.r1 },
        { x: this.r2, y: this.r2, z: this.r2, duration: this.expansionTime, repeat: -1, delay, ease: 'linear' }
      );

      gsap.fromTo(
        ball.material,
        { opacity: 0 },
        { opacity: 1, duration: this.expansionTime / 2, yoyo: true, repeat: -1, delay, ease: 'power1.inOut' }
      );
    }

    const boundingBox = new THREE.Box3().setFromObject(this.target);
    this.group.position.copy(boundingBox.getCenter(new THREE.Vector3()));

    this.scene.add(this.group);
  }

  remove() {
    this.scene.remove(this.group);
    this.balls = [];
  }
}
