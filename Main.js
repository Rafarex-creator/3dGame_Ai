const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 5);
scene.add(sun);

// Player data
const player = {
  height: 1.7,
  velocityY: 0,
  onGround: false,
};

camera.position.set(0, player.height, 5);

// Controls
const keys = {};
addEventListener("keydown", e => keys[e.code] = true);
addEventListener("keyup", e => keys[e.code] = false);

// Mouse look
let yaw = 0, pitch = 0;
document.body.onclick = () => document.body.requestPointerLock();

addEventListener("mousemove", e => {
  if (document.pointerLockElement === document.body) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
  }
});

// Load models
const loader = new THREE.GLTFLoader();

let gun;
loader.load("gun.glb", gltf => {
  gun = gltf.scene;
  gun.scale.set(0.5, 0.5, 0.5);
  gun.position.set(0.3, -0.3, -0.6);
  camera.add(gun);
});

loader.load("player.glb", gltf => {
  const body = gltf.scene;
  body.scale.set(1, 1, 1);
  body.position.set(0, -player.height, 0);
  camera.add(body);
});

loader.load("map.glb", gltf => scene.add(gltf.scene));

// Shooting
const raycaster = new THREE.Raycaster();
addEventListener("mousedown", () => {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  if (hits.length > 0) {
    console.log("Hit:", hits[0].object.name);
  }
});

// Resize
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Game loop
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.08;
  const gravity = 0.01;

  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

  if (keys["KeyW"]) camera.position.add(forward.multiplyScalar(speed));
  if (keys["KeyS"]) camera.position.add(forward.multiplyScalar(-speed));
  if (keys["KeyA"]) camera.position.add(right.multiplyScalar(-speed));
  if (keys["KeyD"]) camera.position.add(right.multiplyScalar(speed));

  if (keys["Space"] && player.onGround) {
    player.velocityY = 0.18;
    player.onGround = false;
  }

  player.velocityY -= gravity;
  camera.position.y += player.velocityY;

  if (camera.position.y < player.height) {
    camera.position.y = player.height;
    player.velocityY = 0;
    player.onGround = true;
  }

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  renderer.render(scene, camera);
}

animate();
