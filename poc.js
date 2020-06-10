import * as THREE from "three";

import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

let camera, scene, renderer, controls;
export { scene };

let objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

export const initKlub = () => {
  init();
  animate();
};

export const initRemote = () => {
  const remoteWebcam = planeFactory("remoteVideo", { x: -100 });
  scene.add(remoteWebcam);
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function planeFactory(src, position = { x: 100 }) {
  const video = document.getElementById(src);
  video.play();
  const texture = new THREE.VideoTexture(video);

  var geometry = new THREE.PlaneGeometry(640, 360, 16);
  geometry.scale(0.1, 0.1, 0.1);

  var material = new THREE.MeshBasicMaterial({
    map: texture
  });
  var plane = new THREE.Mesh(geometry, material);
  // position webcam infron of camera
  plane.position.x = position.x;
  plane.position.y = 50;
  plane.position.z = -150;
  plane.material.side = THREE.DoubleSide;
  return plane;
}

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

function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 10;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

  var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  function initControls() {
    controls = new PointerLockControls(camera, document.body);

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

    scene.add(controls.getObject());

    var onKeyDown = function (event) {
      switch (event.keyCode) {
        case 38: // up
        case 87: // w
          moveForward = true;
          break;

        case 37: // left
        case 65: // a
          moveLeft = true;
          break;

        case 40: // down
        case 83: // s
          moveBackward = true;
          break;

        case 39: // right
        case 68: // d
          moveRight = true;
          break;

        case 32: // space
          if (canJump === true) velocity.y += 350;
          canJump = false;
          break;
      }
    };

    var onKeyUp = function (event) {
      switch (event.keyCode) {
        case 38: // up
        case 87: // w
          moveForward = false;
          break;

        case 37: // left
        case 65: // a
          moveLeft = false;
          break;

        case 40: // down
        case 83: // s
          moveBackward = false;
          break;

        case 39: // right
        case 68: // d
          moveRight = false;
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);

    raycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      10
    );
  }

  // this function is not self contained also check the animate function
  // to understand how controls work
  initControls();

  // floor
  const floor = floorFactory();
  scene.add(floor);

  // this creates a plane with a webcam texture on it

  const localWebcam = planeFactory("localVideo", { x: -30 });
  scene.add(localWebcam);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const root = document.getElementById("root");
  root.appendChild(renderer.domElement);

  //

  window.addEventListener("resize", onWindowResize, false);
}

function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    var intersections = raycaster.intersectObjects(objects);

    var onObject = intersections.length > 0;

    var time = performance.now();
    var delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
    }

    prevTime = time;
  }

  renderer.render(scene, camera);
}
