import * as THREE from "./three.module.js";
import { PointerLockControls } from "./PointerLockControls.js";

function floorFactory() {
  const vertex = new THREE.Vector3();
  const color = new THREE.Color();
  const floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100);
  // 1 sets the flor vertically 2 makes it horizontal
  floorGeometry.rotateX(-Math.PI / 2);

  // vertex displacement

  const position = floorGeometry.attributes.position;

  for (var i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i);

    vertex.x += Math.random() * 40 - 10;
    vertex.y += Math.random() * 2;
    vertex.z += Math.random() * 20 - 10;

    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  const newFloorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

  const newPosition = newFloorGeometry.attributes.position;
  const colors = [];

  for (var i = 0, l = newPosition.count; i < l; i++) {
    color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    colors.push(color.r, color.g, color.b);
  }

  newFloorGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );

  var floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

  return new THREE.Mesh(newFloorGeometry, floorMaterial);
}

function createControls() {
  var blocker = document.getElementById("blocker");
  var instructions = document.getElementById("instructions");

  instructions.addEventListener(
    "click",
    function () {
      controls.lock();
    },
    false
  );

  controls.addEventListener("lock", function () {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });

  controls.addEventListener("unlock", function () {
    blocker.style.display = "block";
    instructions.style.display = "";
  });
}

function setup() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 10;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  const controls = new PointerLockControls(camera, document.body);
  const 
  scene.add(controls.getObject());

  const raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );

  const floor = floorFactory();
  scene.add(floor);

  window.addEventListener(
    "resize",
    () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );
  return { raycaster, controls, renderer, scene, camera };
}
function animate({ raycaster, controls, renderer, scene, camera }) {
  const velocity = new THREE.Vector3();
  var direction = new THREE.Vector3();
  requestAnimationFrame(() =>
    animate({ raycaster, controls, renderer, scene, camera })
  );

  console.log(controls.isLocked);
  raycaster.ray.origin.copy(controls.getObject().position);
  raycaster.ray.origin.y -= 10;


  direction.normalize(); // this ensures consistent movements in all directions



  renderer.render(scene, camera);
}
const { raycaster, controls, renderer, scene, camera } = setup();
animate({ raycaster, controls, renderer, scene, camera });
