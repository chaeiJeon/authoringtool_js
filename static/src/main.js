// Sets up the IFC loading
const ifcLoader = new IFCLoader();
let ifcModel;
const input = document.getElementById("file-input");
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
input.addEventListener(
  "change",
  (changed) => {
    const file = changed.target.files[0];
    var ifcURL = URL.createObjectURL(file);
    ifcLoader.ifcManager.setWasmPath("../wasm/");
    ifcLoader.load(ifcURL, (_ifcModel) => {
      scene.add(_ifcModel);
      ifcModel = _ifcModel;
      const { boxSize, boxCenter } = getCenterOfModel(_ifcModel);

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
const getCenterOfModel = (model) => {
  const box = new THREE.Box3();
  const vector = new THREE.Vector3();
  box.setFromObject(model);
  const boxSize = box.getSize(vector).length();
  const boxCenter = box.getCenter(vector);
  return { boxSize, boxCenter };
};
function onClick(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    console.log(intersects[0]);
    const materialIndex = intersect.face.materialIndex;
    const intersectedObject = intersect.object;

    // Check if intersectedObject.material is an array
    if (Array.isArray(intersectedObject.material)) {
      // Access the specific material using the materialIndex
      console.log(intersectedObject.material[materialIndex]);
      if (intersectedObject.material[materialIndex].color) {
        // intersectedObject.material[materialIndex].color.set(0xff0000); // Set color to red
      }
    } else if (intersectedObject.material && intersectedObject.material.color) {
      // If not an array, proceed as before
      //   intersectedObject.material.color.set(0xff0000); // Set color to red
    }
    renderer.render(scene, camera); // Update the scene
  }

  controls.update();
  renderer.render(scene, camera);
}
window.addEventListener("click", onClick, false);

const exportOBJ_button = document.querySelector("#exportOBJ-div");
console.log(exportOBJ_button);
exportOBJ_button.addEventListener("click", () => {
  console.log("download");
  //download obj format
  const objLoader = new THREE.OBJLoader();
  const objData = objLoader.parse(ifcModel);
  const objText = objData.stringify();
  console.log(objText);

  const blob = new Blob([objText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "converted.obj";
  link.click();

  const fs = require("fs");
  fs.writeFileSync("path/to/output/file.obj", objText);
});
