import {
  AmbientLight,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { IFCLoader } from "web-ifc-three/IFCLoader";

//Creates the Three.js scene
const scene = new Scene();

//Object to store the size of the viewport
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Creates the camera (point of view of the user)
const aspect = size.width / size.height;
const camera = new PerspectiveCamera(75, aspect);
camera.position.z = 15;
camera.position.y = 13;
camera.position.x = 8;

//Creates the lights of the scene
const lightColor = 0xffffff;

const ambientLight = new AmbientLight(lightColor, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(lightColor, 1);
directionalLight.position.set(0, 10, 0);
directionalLight.target.position.set(-5, 0, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);

//Sets up the renderer, fetching the canvas of the HTML
const threeCanvas = document.getElementById("three-canvas");
const renderer = new WebGLRenderer({
  canvas: threeCanvas,
  alpha: true,
});

renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//Creates grids and axes in the scene
const grid = new GridHelper(50, 30);
scene.add(grid);

const axes = new AxesHelper();
axes.material.depthTest = false;
axes.renderOrder = 1;
scene.add(axes);

//Creates the orbit controls (to navigate the scene)
const controls = new OrbitControls(camera, threeCanvas);
controls.enableDamping = true;
controls.target.set(-2, 0, 0);

//Animation loop
const animate = () => {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

//Adjust the viewport to the size of the browser
window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
});

// Sets up the IFC loading
const ifcLoader = new IFCLoader();
const input = document.getElementById("file-input");
input.addEventListener(
  "change",
  (changed) => {
    const file = changed.target.files[0];
    var ifcURL = URL.createObjectURL(file);
    ifcLoader.ifcManager.setWasmPath("../wasm/");
    ifcLoader.load(ifcURL, (ifcModel) => {
      scene.add(ifcModel);
      const { boxSize, boxCenter } = getCenterOfModel(ifcModel);

      const maxBoxSize = Math.max(boxSize, 5);
      const minBoxSize = Math.min(boxSize, 5);

      camera.position.copy(boxCenter);
      camera.position.x += maxBoxSize / 2.0; // Adjust as needed
      camera.position.y += maxBoxSize / 5.0; // Adjust as needed
      camera.position.z += maxBoxSize / 2.0; // Adjust as needed
      camera.near = minBoxSize / 100.0; // Adjust as needed
      camera.far = maxBoxSize * 100.0; // Adjust as needed
      camera.updateProjectionMatrix();

      controls.target.copy(boxCenter);
      controls.maxDistance = maxBoxSize * 5;
      controls.minDistance = minBoxSize / 5;
      controls.update();
    });
  },
  false
);

//Focus on Model
const getCenterOfModel = (model) => {
  console.log("getCenterOfModel");
  const box = new THREE.Box3().setFromObject(model);
  const boxSize = box.getSize(new THREE.Vector3()).length();
  const boxCenter = box.getCenter(new THREE.Vector3());

  return { boxSize, boxCenter };
};
