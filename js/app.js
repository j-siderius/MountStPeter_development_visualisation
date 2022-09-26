import * as THREE from './three.module.js'
import {
    OrbitControls
} from './OrbitControls.js';
import {
    GLTFLoader
} from './GLTFLoader.js';

let screenDivision = (66 / 100);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xBEDDF1);

const camera = new THREE.PerspectiveCamera(75, (window.innerWidth * screenDivision) / window.innerHeight, 0.1, 10000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#scene'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * screenDivision, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.receiveShadow = true;

camera.position.set(0, 1000, 1500);
camera.lookAt(0, 0, 0);

// scene lighting
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xFCE570, 6);
pointLight.position.set(0, 2000, 5000);
pointLight.castShadow = true;
pointLight.shadow.camera.far = 10000; // default
pointLight.shadow.bias = -0.010;
scene.add(pointLight);

// orbiting controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.autoRotate = true;

// find page elements
let coordinateDiv = document.querySelector('#coordinates');
let loadingDiv = document.querySelector('#loading_container');
let angleDiv = document.querySelector('#angles');
let sectionDiv = document.querySelector('#section');
let loadingDots = document.querySelector('#loadingDots');
let dotInterval = setInterval(loadingDotsCount, 750);
let mapInfoDiv = document.querySelector('#mapInfo');

const gltfLoader = new GLTFLoader();

let kuyper, ahn1, ahn2, ahn3, ahn4 = new THREE.Object3D();
let kuyperMesh, ahn1Mesh, ahn2Mesh, ahn3Mesh, ahn4Mesh = new THREE.Mesh();
let kuyperMaterial, ahn1Material, ahn2Material, ahn3Material, ahn4Material = new THREE.Material();

// loading all models
Promise.all([
    gltfLoader.loadAsync('meshes/kuyper_1870_2.gltf'),
    gltfLoader.loadAsync('meshes/ahn1_2005.gltf'),
    gltfLoader.loadAsync('meshes/ahn2_2012.gltf'),
    gltfLoader.loadAsync('meshes/ahn3_2018.gltf'),
    gltfLoader.loadAsync('meshes/ahn4_2020.gltf')
]).then(models => {
    // models
    kuyper = models[0].scene;
    ahn1 = models[1].scene;
    ahn2 = models[2].scene;
    ahn3 = models[3].scene;
    ahn4 = models[4].scene;

    // meshes
    kuyperMesh = kuyper.children[0].children[0];
    ahn1Mesh = ahn1.children[0].children[0];
    ahn2Mesh = ahn2.children[0].children[0];
    ahn3Mesh = ahn3.children[0].children[0];
    ahn4Mesh = ahn4.children[0].children[0];

    kuyperMesh.castShadow = true;
    kuyperMesh.receiveShadow = true;
    ahn1Mesh.castShadow = true;
    ahn1Mesh.receiveShadow = true;
    ahn2Mesh.castShadow = true;
    ahn2Mesh.receiveShadow = true;
    ahn3Mesh.castShadow = true;
    ahn3Mesh.receiveShadow = true;
    ahn4Mesh.castShadow = true;
    ahn4Mesh.receiveShadow = true;

    // materials
    kuyperMaterial = kuyper.children[0].children[0].material;
    ahn1Material = ahn1.children[0].children[0].material;
    ahn2Material = ahn2.children[0].children[0].material;
    ahn3Material = ahn3.children[0].children[0].material;
    ahn4Material = ahn4.children[0].children[0].material;

    kuyperMaterial.transparent = true;
    kuyperMaterial.opacity = 1.0;
    kuyperMaterial.metalness = 1.0;
    kuyperMaterial.roughness = 0.9;
    ahn1Material.transparent = true;
    ahn1Material.opacity = 1.0;
    ahn1Material.metalness = 1.0;
    ahn1Material.roughness = 0.9;
    ahn2Material.transparent = true;
    ahn2Material.opacity = 1.0;
    ahn2Material.metalness = 1.0;
    ahn2Material.roughness = 0.9;
    ahn3Material.transparent = true;
    ahn3Material.opacity = 1.0;
    ahn3Material.metalness = 1.0;
    ahn3Material.roughness = 0.9;
    ahn4Material.transparent = true;
    ahn4Material.opacity = 1.0;
    ahn4Material.metalness = 1.0;
    ahn4Material.roughness = 0.9;

    // debug models
    // console.log(kuyper);

    scene.add(kuyper, ahn1, ahn2, ahn3, ahn4);
    kuyper.visible = false;
    ahn1.visible = false;
    ahn2.visible = false;
    ahn3.visible = false;
    ahn4.visible = false;

    // inform user loading is done
    loadingDiv.style.display = "none";
    clearInterval(dotInterval);

    // start all main functions
    animate();

    orbit = true;
    orbitTarget.set(250, 0, 1250);
    orbitDistance = 500;
    orbitHeight = 500;

    kuyper.visible = false;
    ahn1.visible = false;
    ahn2.visible = false;
    ahn3.visible = false;
    ahn4.visible = true;

    mapInfoDiv.innerHTML = "Height data: AHN4 <b>(2021)</b>, Image data: Google 2020";
});

// image texture
const tunnelTexture = new THREE.TextureLoader().load('media/plattegrond_st_pieter.png');
let tunnelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(907, 470),
    new THREE.MeshBasicMaterial({ map: tunnelTexture, transparent: true })
);
tunnelMesh.position.set(225, 135, -500);
tunnelMesh.rotation.set(THREE.MathUtils.degToRad(-90), 0, THREE.MathUtils.degToRad(90));
scene.add(tunnelMesh);
tunnelMesh.scale.set(2, 2, 2);
tunnelMesh.visible = false;

// loading dots
let dots = 3;

function loadingDotsCount() {
    if (dots <= 4) {
        loadingDots.innerHTML += ".";
        dots++;
    } else {
        loadingDots.innerHTML = "";
        dots = 0;
    }
}

// window resize event
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth * screenDivision, window.innerHeight);
    camera.aspect = (window.innerWidth * screenDivision) / window.innerHeight;
    camera.updateProjectionMatrix();

    maxScrollOffset = document.documentElement.scrollHeight - document.documentElement.clientHeight;
});

// keyboard capture (only for debugging)
window.addEventListener('keydown', (event) => {
    if (event.key == 'r' || event.key == 'R') {
        orbit = !orbit;
    }
});

// scroll capture
let maxScrollOffset = document.documentElement.scrollHeight - document.documentElement.clientHeight;

window.addEventListener('scroll', () => {
    let windowOffset = window.pageYOffset;
    let scrollPercentage = Math.round((windowOffset / maxScrollOffset) * 100);

    if (debugText) sectionDiv.innerHTML = windowOffset + "/" + maxScrollOffset + " | " + scrollPercentage + "%";

    if (scrollPercentage < 8) {
        // orbit around mount St Peter (ahn4)
        orbit = true;
        orbitTarget.set(250, 0, 1250);
        orbitDistance = 500;
        orbitHeight = 500;

        kuyper.visible = false;
        ahn1.visible = false;
        ahn2.visible = false;
        ahn3.visible = false;
        ahn4.visible = true;
        tunnelMesh.visible = false;

        mapInfoDiv.innerHTML = "Height data: AHN4 <b>(2021)</b>, Image data: Google 2020";

    } else if (scrollPercentage >= 8 && scrollPercentage < 20) {
        // orbit around kuypers model (kuyper)
        orbit = true;
        orbitTarget.set(0, 0, 0);
        orbitDistance = 1250;
        orbitHeight = 750;

        kuyper.visible = true;
        ahn1.visible = false;
        ahn2.visible = false;
        ahn3.visible = false;
        ahn4.visible = false;
        tunnelMesh.visible = false;

        mapInfoDiv.innerHTML = "Height data: J Kuyper <b>(ca. 1870)</b>, Texture: artist' impression";

    } else if (scrollPercentage >= 20 && scrollPercentage < 32) {
        // top-down view + overlay tunnel map (kuyper)
        orbit = false;
        camera.position.set(150, 1500, -500);
        camera.lookAt(150, 0, -500);

        kuyper.visible = true;
        ahn1.visible = false;
        ahn2.visible = false;
        ahn3.visible = false;
        ahn4.visible = false;
        tunnelMesh.visible = true;

        mapInfoDiv.innerHTML = "Height data: J Kuyper <b>(ca. 1870)</b>, Texture: artist' impression, Map data: Ir. DC van Schaïk";

    } else if (scrollPercentage >= 32 && scrollPercentage < 44) {
        // zoom to ENCI building (ahn1)
        orbit = false;
        camera.position.set(1000, 500, 500);
        camera.lookAt(450, 0, 450);

        kuyper.visible = false;
        ahn1.visible = true;
        ahn2.visible = false;
        ahn3.visible = false;
        ahn4.visible = false;
        tunnelMesh.visible = false;

        mapInfoDiv.innerHTML = "Height data: AHN1 <b>(1997-1998)</b>, Image data: Google 2005";

    } else if (scrollPercentage >= 44 && scrollPercentage < 57) {
        // orbit around ENCI quarry (ahn2)
        orbit = true;
        orbitTarget.set(-250, 0, 300);
        orbitDistance = 750;
        orbitHeight = 750;

        kuyper.visible = false;
        ahn1.visible = false;
        ahn2.visible = true;
        ahn3.visible = false;
        ahn4.visible = false;
        tunnelMesh.visible = false;

        mapInfoDiv.innerHTML = "Height data: AHN2 <b>(2012)</b>, Image data: Google 2012";

    } else if (scrollPercentage >= 57 && scrollPercentage < 69) {
        // top-down view of excavation (ahn3)
        orbit = false;
        camera.position.set(1000, 1000, 500);
        camera.lookAt(100, 0, 300);

        kuyper.visible = false;
        ahn1.visible = false;
        ahn2.visible = false;
        ahn3.visible = true;
        ahn4.visible = false;
        tunnelMesh.visible = false;

        mapInfoDiv.innerHTML = "Height data: AHN3 <b>(2018)</b>, Image data: Google 2018";

    } else if (scrollPercentage >= 69 && scrollPercentage < 81) {
        // orbit around nature along ENCI quarry (ahn4)
        orbit = true;
        orbitTarget.set(-150, 0, -150);
        orbitDistance = 500;
        orbitHeight = 500;

        kuyper.visible = false;
        ahn1.visible = false;
        ahn2.visible = false;
        ahn3.visible = false;
        ahn4.visible = true;
        tunnelMesh.visible = false;

        mapInfoDiv.innerHTML = "Height data: AHN4 <b>(2021)</b>, Image data: Google 2020";

    } else if (scrollPercentage >= 81) {
        // orbit around mount St Peter (ahn4) && end
        orbit = true;
        orbitTarget.set(250, 0, 1250);
        orbitDistance = 500;
        orbitHeight = 500;

        kuyper.visible = false;
        ahn1.visible = false;
        ahn2.visible = false;
        ahn3.visible = false;
        ahn4.visible = true;
        tunnelMesh.visible = false;

        mapInfoDiv.innerHTML = "Height data: AHN4 <b>(2021)</b>, Image data: Google 2020";
    }
});

function orbitFeature(angle, target, distance, height) {
    let radAngle = THREE.MathUtils.degToRad(angle % 360);

    let xCoord = target.x + distance * Math.sin(radAngle);
    let yCoord = height;
    let zCoord = target.z + distance * Math.cos(radAngle);

    camera.position.set(xCoord, yCoord, zCoord);
    camera.lookAt(target);
}

let angle = 180;
let orbit = true;
let orbitTarget = new THREE.Vector3(0, 0, 0);
let orbitDistance = 1500;
let orbitHeight = 1000;

let debugText = false;

// main animation loop
function animate() {
    requestAnimationFrame(animate);

    // orbiting controls (built-in)
    // if (orbit) controls.update();

    if (orbit) {
        angle += 0.125;
        // angle++;
        orbitFeature(angle, orbitTarget, orbitDistance, orbitHeight);
    }

    if (debugText) {
        coordinateDiv.innerHTML = "Camera: X" + Math.round(camera.position.x) + " | Y" + Math.round(camera.position.y) + " | Z" + Math.round(camera.position.z);
        angleDiv.innerHTML = "Rotation: X" + Math.round(THREE.MathUtils.radToDeg(camera.rotation.x)) + " | Y" + Math.round(THREE.MathUtils.radToDeg(camera.rotation.y)) + " | Z" + Math.round(THREE.MathUtils.radToDeg(camera.rotation.z));
    }

    renderer.render(scene, camera);
}