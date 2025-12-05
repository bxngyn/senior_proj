import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap";

// select the paragraph for date/time
const calendarDateEl = document.getElementById('calendar-date');

function updateCalendarDate() {
  const now = new Date();

  // Format the time
  const timeOptions = { hour: 'numeric', minute: 'numeric'};
  const timeStr = now.toLocaleTimeString(undefined, timeOptions);

  // Format the date
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString(undefined, dateOptions);

  // Set the content
  calendarDateEl.innerHTML = `It is ${timeStr} on ${dateStr}. <br><br> Doesn't time go by so fast?`;
}

// update immediately
updateCalendarDate();

// optional: update every second so time ticks
setInterval(updateCalendarDate, 1000);

const songForm = document.getElementById("song-form");
// const currentSongTitle = document.getElementById("current-song-title");

// // Initialize title
// currentSongTitle.textContent = "Currently listening to...";

songForm.addEventListener("change", (e) => {
  if (e.target.name === "song") {
    const songSrc = e.target.value;
    // const songName = e.target.nextSibling.textContent.trim();

    // update audio
    bgMusic.src = songSrc;
    bgMusic.play().catch(err => console.log("Audio play blocked:", err));

    // // update modal title
    // currentSongTitle.textContent = `Currently listening to: ${songName}`;
  }
});

// inside your main.js or script
const tabLinks = document.querySelectorAll(".computer_modal .tab-link");
const tabText = document.getElementById("computer-tab-text");

const tabContents = {
  about: "Hi, I'm Brandon! I'm currently a senior at Yale University pursuing a B.S. in Computer Science with an interest in full-stack software development. Outside of tech, I love music in all forms (listening to, playing, and composing)!",
  work: "Here is some of my work..."
};

// Start on About
tabText.textContent = tabContents.about;

tabLinks.forEach(link => {
  link.addEventListener("click", () => {
    // Remove active class from all links
    tabLinks.forEach(l => l.classList.remove("active"));
    // Add active to clicked link
    link.classList.add("active");

    // Change the content
    const tab = link.getAttribute("data-tab");
    tabText.textContent = tabContents[tab];
  });
});

const canvas = document.querySelector("#experience-canvas")
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const modals = {
  computer: document.querySelector(".modal.computer_modal"),
  ljr: document.querySelector(".modal.ljr_modal"),
  beachhouse: document.querySelector(".modal.beach_house_modal"),
  sunset: document.querySelector(".modal.sunset_modal"),
  headphones: document.querySelector(".modal.headphone_modal"),
  calendar: document.querySelector(".modal.calendar_modal")
};

const objectToModalMap = {
  "screen": modals.computer,
  "ljr": modals.ljr,
  "beach_house": modals.beachhouse,
  "sunset": modals.sunset,
  "headphones": modals.headphones,
  "calendar": modals.calendar
};


const loadingScreen = document.getElementById("loading-screen");
const loadingText = document.getElementById("loading-text");
const enterButton = document.getElementById("enter-button");


document.querySelectorAll(".modal-exit-button").forEach(button=>{
  button.addEventListener("click", (e) => {
    const modal = e.target.closest(".modal");
    hideModal(modal);
  });
});

const hideModal = (modal) => {
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: ()=>{
      modal.style.display = "none";
    }
  });
};

const showModal = (modal) => {
  modal.style.display = "block";
  gsap.fromTo(
    modal,
    { opacity: 0 },
    { opacity: 1, duration: 0.5 }
  );
};

let currentIntersects = [];
let currentHoveredObject = null;
const raycasterObjects = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// loaders
const textureLoader = new THREE.TextureLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const textureMap = {
  First: "/textures/TextureSetOne.webp",
  Second: "/textures/TextureSetTwo.webp",
  Third: "/textures/TextureSetThree.webp",
  Fourth: "/textures/TextureSetFour.webp",
  Fifth: "/textures/TextureSetFive.webp",
  Six: "/textures/TextureSetSix.webp",
};

const loadedTextures = {};

Object.entries(textureMap).forEach(([key, path]) => {
  const texture = textureLoader.load(path);
  texture.flipY = false;
  // texture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures[key] = texture;
});

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xffffff);
scene.background = new THREE.Color(0x2B2006);
// scene.background = textureLoader.load("/textures/bigbro.png");

// const ambient = new THREE.AmbientLight(0xffffff, 1.2);  
// scene.add(ambient);

// const directional = new THREE.DirectionalLight(0xffffff, 1.1);
// directional.position.set(10, 10, 10);
// scene.add(directional);

const camera = new THREE.PerspectiveCamera( 45, sizes.width / sizes.height, 0.1, 1000 );
const targetPosition = new THREE.Vector3(16.466, 12.015, 15.383);
camera.position.set(60, 55, 60);

// camera.position.set( 16.466313436582585, 12.01559489761902, 15.383367852330123 );

window.addEventListener("click", (event) => {
  if (currentIntersects.length > 0) {
    const objectName = currentIntersects[0].object.name;

    for (const [key, modal] of Object.entries(objectToModalMap)) {
      if (objectName.includes(key)) {
        showModal(modal);
        break;
      }
    }
  }
});

window.addEventListener("mousemove", (event)=>{
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

// loader.load("https://drive.google.com/uc?export=download&id=1bvqIDd5raKCNwvobjSjYMealgCj1MSRt", (glb) => {
loader.load("/models/490BAKE_wmats.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh && child.material) {
      // console.log(child.name);
      if (child.material.map) {
        if (child.material.color) {
          child.material.color.multiplyScalar(2);
        }
        // child.material.map.colorSpace = THREE.SRGBColorSpace;
        child.material.map.flipY = false;                 
        child.material.map.minFilter = THREE.LinearFilter;   
        // child.material.emissive = new THREE.Color(0xffffff);   // white glow
        // child.material.emissiveIntensity = 0.5;                // adjust brightness
      }
      if (child.name.includes("raycaster")) {
        raycasterObjects.push(child);

        child.userData.initialScale = new THREE.Vector3().copy(child.scale);
        child.userData.initialPosition = new THREE.Vector3().copy(child.position);
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
        child.userData.isAnimating = false;
      }
    }
  });

  glb.scene.rotation.y = Math.PI;

  scene.add(glb.scene);

  loadingText.textContent = "";
  gsap.to(enterButton, { opacity: 1, duration: 0.5 });
  enterButton.style.pointerEvents = "auto";
});

const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");

let musicOn = true; // starts on after Enter click

musicToggle.addEventListener("click", () => {
  if (!bgMusic) return;

  musicOn = !musicOn;
  bgMusic.muted = !musicOn;

  musicToggle.textContent = musicOn ? "music toggle (on)" : "music toggle (off)";
});

enterButton.addEventListener("click", () => {
  gsap.to("#loading-screen", {
    opacity: 0,
    duration: 0.6,
    onComplete: () => { 
      document.getElementById("loading-screen").style.display = "none";
    }
  });

  if (bgMusic) {
    bgMusic.volume = 0.65;
    bgMusic.play().catch(err => console.log("Audio play blocked:", err));
    musicOn = true;
    musicToggle.textContent = "music toggle (on)";
  }

  gsap.to(camera.position, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration: 3, // animation length in seconds
    ease: "power2.out",
    onUpdate: () => {
      controls.update(); // make sure OrbitControls follows
    }
  });
});


const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set( -0.29182966212449946, 2.1487034528194586, -0.970514859558168 );

controls.minDistance = 5;
controls.maxDistance = 45;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;

controls.update();

// event listeners
window.addEventListener("resize", ()=>{
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height,
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

function playHoverAnimation(object, isHovering) {
  gsap.killTweensOf(object.scale);
  // gsap.killTweensOf(object.rotation);
  // gsap.killTweensOf(object.position);

  if (isHovering) {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x * 1.5,
      y: object.userData.initialScale.y * 1.5,
      z: object.userData.initialScale.z * 1.5,
      duration: 0.5,
      // ease: "bounce.out(0.5)",
    });
    // gsap.to(object.rotation, {
    //   x: object.userData.initialScale.x * Math.PI / 8,
    //   duration: 0.5,
    //   ease: "bounce.out(1.8)",
    //   onComplete: ()=> {
    //     object.userData.isAnimating = false;
    //   }
    // });
  }
  else {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      // ease: "bounce.out(0.5)",
    });
    // gsap.to(object.rotation, {
    //   x: object.userData.initialScale.x,
    //   duration: 0.3,
    //   ease: "bounce.out(1.8)",
    //   onComplete: ()=> {
    //     object.userData.isAnimating = false;
    //   }
    // });
  }
}

function playDrawerAnimation(object, isHovering) {
  gsap.killTweensOf(object.position);

  if (isHovering) {
    gsap.to(object.position, {
      z: object.userData.initialPosition.z - 0.75, // drawer slides outward
      duration: 0.4,
      ease: "power2.out",
    });
  } else {
    gsap.to(object.position, {
      z: object.userData.initialPosition.z,
      duration: 0.3,
      ease: "power2.inOut",
    });
  }
}

const render = () => {
  controls.update();

  // console.log(camera.position);
  // console.log("00000000");
  // console.log(controls.target);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  // raycaster
  raycaster.setFromCamera( pointer, camera );
  currentIntersects = raycaster.intersectObjects(raycasterObjects, true);

  // for (let i = 0; i < currentIntersects.length; i++) {
  //   currentIntersects[i].object.material.color.set(0xff0000);
  // }

  if (currentIntersects.length > 0) {
    const currObject = currentIntersects[0].object;
  
    if (currObject !== currentHoveredObject) {
      
      // Reset old hovered object
      if (currentHoveredObject) {
        if (currentHoveredObject.name.includes("extend")) {
          playDrawerAnimation(currentHoveredObject, false);
        } else {
          playHoverAnimation(currentHoveredObject, false);
        }
      }
  
      // Apply NEW animation depending on type
      if (currObject.name.includes("extend")) {
        playDrawerAnimation(currObject, true);
      } else {
        playHoverAnimation(currObject, true);
      }
  
      currentHoveredObject = currObject;
    }
  
    document.body.style.cursor = "pointer";
  }
  else {
    // No hover → reset active animations
    if (currentHoveredObject) {
      if (currentHoveredObject.name.includes("extend")) {
        playDrawerAnimation(currentHoveredObject, false);
      } else {
        playHoverAnimation(currentHoveredObject, false);
      }
      currentHoveredObject = null;
    }
  
    document.body.style.cursor = "default";
  }

  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
}

render();