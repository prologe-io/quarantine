//import * as THREE from "./three.module.js";
const THREE = require("./three.module");

import { FirstPersonControls } from "./FirstPersonControls.js";
import { ImprovedNoise } from "./ImprovedNoise.js";
console.log(FirstPersonControls);

var container;

var camera, controls, scene, renderer, video;

var mesh, texture;

var worldWidth = 256,
  worldDepth = 256,
  worldHalfWidth = worldWidth / 2,
  worldHalfDepth = worldDepth / 2;

var clock = new THREE.Clock();

init();
animate();

function init() {
  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0xbfd1e5);

  video = document.getElementById("video");
  var videoTexture = new THREE.VideoTexture(video);

  var data = generateHeight(worldWidth, worldDepth);

  camera.position.y =
    data[worldHalfWidth + worldHalfDepth * worldWidth] * 10 + 500;

  var geometry = new THREE.PlaneBufferGeometry(
    7500,
    7500,
    worldWidth - 1,
    worldDepth - 1
  );
  geometry.rotateX(-Math.PI / 2);

  var videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
  var mesh2 = new THREE.Mesh(geometry, videoMaterial);
  mesh2.position.z = 200;
  mesh2.position.x = 140;
  mesh2.position.y = 400;
  mesh2.lookAt(camera.position);
  mesh2.scale.set(0.04, 0.04, 0.04);
  scene.add(mesh2);

  var vertices = geometry.attributes.position.array;

  for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    vertices[j + 1] = data[i] * 10;
  }

  texture = new THREE.CanvasTexture(
    generateTexture(data, worldWidth, worldDepth)
  );
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ map: texture })
  );
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  controls = new FirstPersonControls(camera, renderer.domElement);
  controls.movementSpeed = 1000;
  controls.lookSpeed = 0.1;

  //

  window.addEventListener("resize", onWindowResize, false);
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    var constraints = {
      video: { width: 1280, height: 720, facingMode: "user" }
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        // apply the stream to the video element used in the texture

        video.srcObject = stream;
        video.play();
      })
      .catch(function (error) {
        console.error("Unable to access the camera/webcam.", error);
      });
  } else {
    console.error("MediaDevices interface not available.");
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  controls.handleResize();
}

function generateHeight(width, height) {
  var size = width * height,
    data = new Uint8Array(size),
    perlin = new ImprovedNoise(),
    quality = 1,
    z = Math.random() * 100;

  for (var j = 0; j < 4; j++) {
    for (var i = 0; i < size; i++) {
      var x = i % width,
        y = ~~(i / width);
      data[i] += Math.abs(
        perlin.noise(x / quality, y / quality, z) * quality * 1.75
      );
    }

    quality *= 5;
  }

  return data;
}

function generateTexture(data, width, height) {
  var canvas, canvasScaled, context, image, imageData, vector3, sun, shade;

  vector3 = new THREE.Vector3(0, 0, 0);

  sun = new THREE.Vector3(1, 1, 1);
  sun.normalize();

  canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  context = canvas.getContext("2d");
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);

  image = context.getImageData(0, 0, canvas.width, canvas.height);
  imageData = image.data;

  for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    vector3.x = data[j - 2] - data[j + 2];
    vector3.y = 2;
    vector3.z = data[j - width * 2] - data[j + width * 2];
    vector3.normalize();

    shade = vector3.dot(sun);

    imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
    imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
    imageData[i + 2] = shade * 96 * (0.5 + data[j] * 0.007);
  }

  context.putImageData(image, 0, 0);

  // Scaled 4x

  canvasScaled = document.createElement("canvas");
  canvasScaled.width = width * 4;
  canvasScaled.height = height * 4;

  context = canvasScaled.getContext("2d");
  context.scale(4, 4);
  context.drawImage(canvas, 0, 0);

  image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
  imageData = image.data;

  for (var i = 0, l = imageData.length; i < l; i += 4) {
    var v = ~~(Math.random() * 5);

    imageData[i] += v;
    imageData[i + 1] += v;
    imageData[i + 2] += v;
  }

  context.putImageData(image, 0, 0);

  return canvasScaled;
}

//

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  controls.update(clock.getDelta());
  renderer.render(scene, camera);
}

function main() {
  // setup canvas
  const canvas = document.querySelector("#c");

  const renderer = new THREE.WebGLRenderer({ canvas });

  // setup camera

  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  // setup scene

  const scene = new THREE.Scene();

  // setup geometry for mesh

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  // setup material for mesh

  const material = new THREE.MeshBasicMaterial({ color: "green" });

  // compose mesh from geomtry and material','""','
  const cube = new THREE.Mesh(geometry, material);

  scene.add(cube);

  renderer.render(scene, camera);
  function render(time) {
    time *= 0.002;
    cube.rotation.x = time;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
main();
