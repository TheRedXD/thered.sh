<script setup>
import Navbar from "../components/Navbar.vue";

import * as THREE from "three";
import { onMounted, onUnmounted } from "vue";

const scene = new THREE.Scene();
const assumedHeight = window.innerHeight;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / assumedHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

// Create geometries
const geometry = new THREE.PlaneGeometry(1000, 500, 128, 128);

let setTimeout = window.setTimeout;

// Create fluid shader material
const material = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, assumedHeight) }
    },
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;

        // Noise functions
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);

            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
            vec2 uv = vUv;

            // Create fluid motion
            float t = time * 0.2;
            vec2 movement1 = vec2(t * 0.3, t * 0.2);
            vec2 movement2 = vec2(t * -0.1, t * 0.4);

            float n1 = noise(uv * 3.0 + movement1);
            float n2 = noise(uv * 5.0 + movement2);
            float n3 = noise(uv * 7.0 - movement1);

            vec3 color1 = vec3(0.2, 0.3, 0.2);
            vec3 color2 = vec3(0.2, 0.1, 0.3);
            vec3 color3 = vec3(0.15, 0.1, 0.5);
            vec3 color4 = vec3(0.15, 0.15, 0.35);

            // Mix colors based on noise
            vec3 color = mix(color1, color2, n1);
            color = mix(color, color3, n2);
            color = mix(color, color4, n3);

            // Add more depth and glow
            float depth = (n1 * n2 * n3) * 1.5;
            color += depth * 0.2;

            // Edge vignette (reduced darkness)
            vec2 center = uv - 0.5;
            float vignette = 1.0 - length(center) * 1.2;
            color *= vignette;

            // Bubble effect
            float bubbles = pow(n2, 8.0) * 0.7;
            color += vec3(bubbles) * 0.2;

            gl_FragColor = vec4(color, 1.0);
        }
    `
});

const liquidPlane = new THREE.Mesh(geometry, material);

const triangleGeometry = new THREE.BufferGeometry();
const trianglePositions = [];
const numTriangleGroups = 50;
const gap = 10; // Small gap between connected triangles

for (let i = 0; i < numTriangleGroups; i++) {
    // Generate base triangle
    const x1 = (Math.random() - 0.5) * 300;
    const y1 = (Math.random() - 0.5) * 300;
    const edgeLength = Math.random() * 30 + 20; // Random edge length between 20-50
    const angle = Math.random() * Math.PI * 2; // Random rotation

    // Calculate first triangle vertices
    const x2 = x1 + edgeLength * Math.cos(angle);
    const y2 = y1 + edgeLength * Math.sin(angle);
    const x3 = x1 + edgeLength * Math.cos(angle + Math.PI/3);
    const y3 = y1 + edgeLength * Math.sin(angle + Math.PI/3);

    // Add first triangle
    trianglePositions.push(x1, y1, 0);
    trianglePositions.push(x2, y2, 0);
    trianglePositions.push(x3, y3, 0);
    trianglePositions.push(x1, y1, 0);
    trianglePositions.push(x2, y2, 0);
    trianglePositions.push(x3, y3, 0);

    // Randomly decide whether to add a second connected triangle
    if (Math.random() > 0.5) {
        // Create second triangle sharing an edge with small gap
        const gapVector = {
            x: (x2 - x1) * gap / edgeLength,
            y: (y2 - y1) * gap / edgeLength
        };

        const newX1 = x1 + gapVector.x;
        const newY1 = y1 + gapVector.y;
        const newX2 = x2 + gapVector.x;
        const newY2 = y2 + gapVector.y;
        const newX3 = newX1 + edgeLength * Math.cos(angle - Math.PI/3);
        const newY3 = newY1 + edgeLength * Math.sin(angle - Math.PI/3);

        trianglePositions.push(newX1 || 0, newY1 || 0, 0);
        trianglePositions.push(newX2 || 0, newY2 || 0, 0);
        trianglePositions.push(newX3 || 0, newY3 || 0, 0);
        trianglePositions.push(newX1 || 0, newY1 || 0, 0);
        trianglePositions.push(newX2 || 0, newY2 || 0, 0);
        trianglePositions.push(newX3 || 0, newY3 || 0, 0);
    }
}

triangleGeometry.attributes.position = new THREE.BufferAttribute(new Float32Array(trianglePositions), 3);

const triangleMaterial = new THREE.MeshBasicMaterial({
    color: 0x888888,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.01
});

const triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);

// Create wireframe outline
const wireframeGeometry = new THREE.WireframeGeometry(triangleGeometry);
const wireframeMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2
});
const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
triangleMesh.add(wireframe);
onMounted(() => {
    const container = document.querySelector(".hero");
    renderer.setSize(window.innerWidth, assumedHeight);
    container.appendChild(renderer.domElement);

    // Add quotes array
    const quotes = [
        "let TheRed = new Developer();",
        "\"Don't make me into a bomb\".toBomb();",
        "// THIS IS NOT TERRIBLE DESIGN! THIS IS INNOVATIVE!  ",
        "function TheRed() {\n    console.log(\"Is this explosive?\");\n}",
        "eval('console.log(\"hehehehe i am evil\")');",
        "Go is good!",
        "Rust ain't always that good",
        "I rewrote this in Vue!",
        "Epic website",
        "Matthew Overhill is a translation from Lithuanian to English!",
        "Fun fact: this visualization uses three.js",
        "Iosevka is a good font",
        "$ pip install pip",
        "# rm -fr # Removing the french language pack",
        "go func(){}()",
        "#[derive(Debug)]",
        "<img src=\"x\" onerror=\"alert('XSS vulnerability moment')\"/>",
        "I ate all of the pickles. My sincere apologies.",
        "This text appeared on TIME",
        "I see... You useOHES",
    ];

    // Create floating text elements
    const placedPositions = [];
    const minDistance = 200; // Minimum distance between quotes

    function getOs() {
        return navigator.userAgent.includes('Windows') ? ' Windows!' : (navigator.userAgent.includes('Linux') ? ' Linux!' : (navigator.userAgent.includes('Mac') ? ' Mac!' : '... what is that OS mate'));
    }

    quotes.forEach((quote, index) => {
        const text = document.createElement('div');
        text.textContent = quote.replaceAll("TIME", new Date().toLocaleString()).replaceAll("OHES", getOs());
        text.style.position = 'absolute';
        text.style.color = 'white';
        text.style.opacity = '0.4';
        text.style.fontSize = '1.1rem';
        text.style.whiteSpace = 'nowrap';

        // Generate deterministic but well-distributed seed from text content
        const stringToBytes = str => {
            const arr = new Uint8Array(str.length);
            for(let i = 0; i < str.length; i++) {
                arr[i] = str.charCodeAt(i);
            }
            return arr;
        };

        // Jenkins one-at-a-time hash for better distribution
        const hash = str => {
            const bytes = stringToBytes(str);
            let hash = 0;
            for(let i = 0; i < bytes.length; i++) {
                hash += bytes[i];
                hash += hash << 10;
                hash ^= hash >>> 6;
            }
            hash += hash << 3;
            hash ^= hash >>> 11;
            hash += hash << 15;
            return hash >>> 0;
        };

        let position;
        let attempts = 0;
        const maxAttempts = 50;
        const avoidCenterRadius = 300;

        do {
            const seed = hash(quote + attempts.toString());
            const goldenRatio = 1.61803398875;
            const angle = (seed * goldenRatio) % (2 * Math.PI);

            const radiusBase = (seed * 2654435769) % Math.pow(2, 32) / Math.pow(2, 32);
            const radius = avoidCenterRadius + (radiusBase * 0.2 * Math.min(container.offsetWidth, container.offsetHeight));

            const centerX = container.offsetWidth / 2;
            const centerY = container.offsetHeight / 2;

            position = {
                x: centerX + radius * Math.cos(angle) - 200,
                y: centerY + radius * Math.sin(angle)
            };

            attempts++;
        } while (
            attempts < maxAttempts &&
            placedPositions.some(pos =>
                Math.sqrt(
                    Math.pow(pos.x - position.x, 2) +
                    Math.pow(pos.y - position.y, 2)
                ) < minDistance
            )
        );

        text.style.left = position.x + 'px';
        text.style.top = position.y + 'px';
        placedPositions.push(position);

        container.appendChild(text);
    });

    scene.add(liquidPlane);
    scene.add(triangleMesh);
    camera.position.z = 75;

    liquidPlane.rotation.z = 0.3;

    let time = 0;

    let disableIntensiveRendering = false;

    let averageTimes = []; ''

    function animate() {
        const startTime = performance.now();

        requestAnimationFrame(animate);
        if (!disableIntensiveRendering) {
            // Compute bounding sphere for triangleMesh
            const positions_bingus = wireframe.geometry.attributes.position;
            const center = new THREE.Vector3();
            let maxRadiusSq = 0;

            // Find center by averaging all vertices
            for (let i = 0; i < positions_bingus.count; i++) {
                center.x += positions_bingus.array[i * 3];
                center.y += positions_bingus.array[i * 3 + 1];
                center.z += positions_bingus.array[i * 3 + 2];
            }
            center.divideScalar(positions_bingus.count);

            // Find radius by getting max distance from center
            for (let i = 0; i < positions_bingus.count; i++) {
                const x = positions_bingus.array[i * 3] - center.x;
                const y = positions_bingus.array[i * 3 + 1] - center.y;
                const z = positions_bingus.array[i * 3 + 2] - center.z;
                maxRadiusSq = Math.max(maxRadiusSq, x * x + y * y + z * z);
            }

            wireframe.geometry.boundingSphere = new THREE.Sphere(center, Math.sqrt(maxRadiusSq));

            time += 0.001;
            material.uniforms.time.value = time;

            triangleMesh.rotation.z += 0.001;
            const positions = triangleGeometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += Math.sin(Date.now() * 0.0001 + i) * 0.01;
                positions[i + 1] += Math.cos(Date.now() * 0.0001 + i) * 0.01;
            }
            triangleGeometry.attributes.position.needsUpdate = true;
            wireframe.geometry.attributes.position.array = positions;
            wireframe.geometry.attributes.position.needsUpdate = true;
        }

        // Update quote positions
        const quotes = document.querySelectorAll('.hero > div:not(.hero)');
        quotes.forEach((quote, index) => {
            // Get initial positions from style
            const initialX = parseFloat(quote.dataset.initialX || quote.style.left);
            const initialY = parseFloat(quote.dataset.initialY || quote.style.top);

            // Store initial positions if not already stored
            if (!quote.dataset.initialX) {
                quote.dataset.initialX = initialX;
                quote.dataset.initialY = initialY;
            }

            // Create circular motion
            const radius = 100;
            const speed = 7;
            const offset = (index * Math.PI * 2) / quotes.length;

            const newX = initialX + Math.cos(time * speed + offset) * radius;
            const newY = initialY + Math.sin(time * speed + offset) * radius;

            quote.style.left = newX + 'px';
            quote.style.top = newY + 'px';
        });

        renderer.render(scene, camera);

        const endTime = performance.now();
        const frameDuration = endTime - startTime;
        averageTimes.push(frameDuration);
        if (averageTimes.length > 30) {
            averageTimes.shift();
        }
        const avgFrameTime = averageTimes.reduce((a, b) => a + b, 0) / averageTimes.length;
        const pageLoadTime = performance.now();
        if (avgFrameTime > 100 && performance.now() - pageLoadTime > 10000) {
            disableIntensiveRendering = true;
            console.log('Intensive rendering disabled');
        }
    }
    animate();

    const resizeHandler = () => {
        const container = document.querySelector(".hero");
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        material.uniforms.resolution.value.set(width, height);
    };

    window.addEventListener('resize', resizeHandler);
    // Initial resize
    resizeHandler();
});

onUnmounted(() => {
    renderer.setAnimationLoop(null);

    geometry.dispose();
    material.dispose();
    triangleGeometry.dispose();
    triangleMaterial.dispose();
    wireframeGeometry.dispose();
    wireframeMaterial.dispose();

    renderer.domElement.remove();
    renderer.dispose();

    scene.remove(liquidPlane);
    scene.remove(triangleMesh);
    scene.clear();

    // Remove quote elements
    const container = document.querySelector(".hero");
    if (container) {
        container.querySelectorAll('div').forEach(el => el.remove());
    }
});

function notif(text) {
    const notifElement = document.createElement('div');
    notifElement.textContent = text;
    document.querySelector('.notification-drawer').appendChild(notifElement);
    setTimeout(() => {
        notifElement.style.opacity = '0';
        notifElement.style.transform = 'translateX(100%)';
        setTimeout(() => notifElement.remove(), 300);
    }, 5000);
}

async function sendFeedback(e) {
    if (!e.target.value) return;
    try {
        let resp = await fetch('https://feedback.thered.sh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({message: e.target.value})
        });
        if (!resp.ok) throw new Error("it failed lol so I need to get to the catch case");
        e.target.value = '';
        e.target.placeholder = 'Feedback sent!';
        notif("Feedback sent successfully!");
        setTimeout(() => e.target.placeholder = 'Send me feedback!', 2000);
    } catch (err) {
        e.target.placeholder = 'Failed to send feedback';
        notif("Failed to send feedback.");
        setTimeout(() => e.target.placeholder = 'Send me feedback!', 2000);
    }
}
</script>

<template>
    <Navbar />
    <div class="notification-drawer"></div>
    <div class="header">
        <div class="hero"></div>
        <div class="text">
            <h1 class="title">TheRed.SH</h1>
            <p class="subtitle">Hello there! I'm Matthew. You can call me Red.<br>I've been a DevOps Engineer for over a decade. My main hobbies are producing music and video editing. I'm Lithuanian.</p>
        </div>
    </div>
    <div class="button-down" @click="$event.target.closest('.button-down').nextElementSibling.scrollIntoView({behavior: 'smooth'})">
        <i class="fa-solid fa-circle-arrow-down"></i>
    </div>
    <div class="main-content">
        <div class="section">
            <br>
            <br>
            <h1><i style="color: #8ccc8c;" class="fa-solid fa-check"></i></h1>
            <h3>I like some things.</h3>
            <h1>These are just a few.</h1>
            <br><br>
            <div class="entries">
                <div class="entry">
                    <a href="https://zed.dev/" target="_blank">
                        <img loading="lazy" src="/images/zed.avif"/>
                        <div class="entry-text">
                            <h1>Zed Editor</h1>
                            <p>Zed is a next-generation code editor designed for
                            high-performance collaboration with humans and AI.</p>
                        </div>
                    </a>
                </div>
                    <div class="entry">
                        <a href="https://c3-lang.org/" target="_blank">
                            <img loading="lazy" src="/images/c32.avif"/>
                            <div class="entry-text">
                                <h1>C3</h1>
                                <p>C3 is a programming language that builds on the syntax and semantics of the C language.</p>
                            </div>
                        </a>
                    </div>
                <div class="entry">
                    <a href="https://vite.dev/" target="_blank">
                        <img loading="lazy" src="/images/vite.avif"/>
                        <div class="entry-text">
                            <h1>Vite</h1>
                            <p>Vite is a blazing fast frontend build tool powering the next generation of web applications.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://bsky.app/" target="_blank">
                        <img loading="lazy" src="/images/bluesky.avif"/>
                        <div class="entry-text">
                            <h1>Bluesky</h1>
                            <p>Bluesky is a microblogging social media service.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://astro.build/" target="_blank">
                        <img loading="lazy" src="/images/astro.avif"/>
                        <div class="entry-text">
                            <h1>Astro</h1>
                            <p>Astro is a JavaScript web framework optimized for building fast, content-driven websites.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://pumpkinmc.org/" target="_blank">
                        <img loading="lazy" src="/images/pumpkin.avif"/>
                        <div class="entry-text">
                            <h1>Pumpkin</h1>
                            <p>Pumpkin is a Minecraft server built entirely in Rust,
                            offering a fast, efficient, and customizable experience.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://godotengine.org/" target="_blank">
                        <img loading="lazy" src="/images/godot.avif"/>
                        <div class="entry-text">
                            <h1>Godot</h1>
                            <p>Godot is a free, open‑source game engine,
                            where you can create 2D and 3D games, VR experiences, and more.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://bevyengine.org/" target="_blank">
                        <img loading="lazy" src="/images/bevy.avif"/>
                        <div class="entry-text">
                            <h1>Bevy</h1>
                            <p>A refreshingly simple data-driven game engine built in Rust. Free and Open Source Forever!</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://egui.rs/" target="_blank">
                        <img loading="lazy" src="/images/egui.avif"/>
                        <div class="entry-text">
                            <h1>egui</h1>
                            <p>egui is an immediate mode GUI library written in Rust.
                            egui runs both on the web and natively!</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://archive.org/" target="_blank">
                        <img loading="lazy" src="/images/archive.avif"/>
                        <div class="entry-text">
                            <h1>Archive.org</h1>
                            <p>Internet Archive is a non-profit library of millions
                            of free texts, movies, software, music, websites, and more.</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
        <br><br>
        <div class="section">
            <h1><i style="color: #ff5c5c;" class="fa-solid fa-xmark"></i></h1>
            <h3>I dislike some things.</h3>
            <h1>There are many more.</h1>
            <br>
            <div class="entries">
                <div class="entry-dislike">
                    <h3>NZXT</h3>
                    <p>Actively scams people.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Windows Recall</h3>
                    <p>Is a massive security risk and completely unnecessary.</p>
                </div>
                <div class="entry-dislike">
                    <h3>PayPal Honey</h3>
                    <p>Steals affiliate links for itself.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Apple</h3>
                    <p>Complete disregard for right to repair.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Tencent</h3>
                    <p>Quite possibly one of the worst companies in the world.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Shell</h3>
                    <p>Absolute disregard for the environment. Abuses corruption.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Patreon</h3>
                    <p>Not the worst thing, but wildly too expensive. Ko-fi is better.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Monsanto</h3>
                    <p>This company is a crime to humanity. I can't even list all the wrongdoings.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Nestlé</h3>
                    <p>Literally evil. There's nothing more I can say.</p>
                </div>
                <div class="entry-dislike">
                    <h3>CCP</h3>
                    <p>Extreme censorship and desire to control everyone.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Amway</h3>
                    <p>Terrible business model, quite literally a pyramid scheme.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Comcast</h3>
                    <p>Quite probably the worst ISP in the US. Overpriced, slow and unreliable.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Blizzard</h3>
                    <p>Terrible working conditions, poor treatment of employees, bad management.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Electronic Arts</h3>
                    <p>Fills games with microtransactions, forces players into spending money.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Disney</h3>
                    <p>Forces people to sign waivers without reasonable notice, among many other things.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Russian government</h3>
                    <p>Do I need to say more? War in Ukraine. Many, many people are dying.</p>
                </div>
                <div class="entry-dislike">
                    <h3>US Politics</h3>
                    <p>It's a mess. It really is, it's to the point that it doesn't make sense anymore.</p>
                </div>
                <div class="entry-dislike">
                    <h3>UK E2E ban</h3>
                    <p>Banning E2E encryption? How do you even enforce this violation of the right to privacy?</p>
                </div>
                <div class="entry-dislike">
                    <h3>Fossil fuels</h3>
                    <p>Basically the biggest contributor to climate change. China, I'm looking at you.</p>
                </div>
                <div class="entry-dislike">
                    <h3>Google</h3>
                    <p>Violates your privacy, but they do fund a lot of useful tech, so I'm slightly split here.</p>
                </div>
                <br>
            </div>
            <h1>...</h1>
        </div>
        <hr>
        <div class="section">
            <h3>Well, those were my opinions, of course.</h3>
            <h1>You may ask, what have I done?</h1>
            <p>Fair question. Here are a few of my projects, or ones that I work on.</p>
            <br>
            <div class="entries">
                <div class="entry">
                    <a href="https://github.com/TheRedXD/Volt" target="_blank">
                        <!-- <img loading="lazy" src="/images/zed.avif"/> -->
                        <div class="placeholder" width="320px" height="180px" style="background-color:#373845;width:320px;height:180px;"></div>
                        <div class="entry-text">
                            <h1>Volt</h1>
                            <p>Volt is a DAW (Digital Audio Workstation), built in Rust using eframe and egui.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://github.com/TheRedXD/Metalcord" target="_blank">
                        <!-- <img loading="lazy" src="/images/zed.avif"/> -->
                        <div class="placeholder" width="320px" height="180px" style="background-color:#373845;width:320px;height:180px;"></div>
                        <div class="entry-text">
                            <h1>Metalcord</h1>
                            <p>Metalcord is a custom Discord client, built in Rust from scratch. Uses eframe and egui.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://eq.thered.sh" target="_blank">
                        <!-- <img loading="lazy" src="/images/zed.avif"/> -->
                        <div class="placeholder" width="320px" height="180px" style="background-color:#373845;width:320px;height:180px;"></div>
                        <div class="entry-text">
                            <h1>Equinox</h1>
                            <p>Equinox is a public Minecraft server, which hosts an SMP running a 1:500 scale map of the Earth. Uses fabric under the hood.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://github.com/TheBlueBurger/BurgerPanel" target="_blank">
                        <!-- <img loading="lazy" src="/images/zed.avif"/> -->
                        <div class="placeholder" width="320px" height="180px" style="background-color:#373845;width:320px;height:180px;"></div>
                        <div class="entry-text">
                            <h1>BurgerPanel</h1>
                            <p>Not my project, but I work on it. It's a simple web-based panel for managing Minecraft servers.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://github.com/TheRedXD/BagelEngine" target="_blank">
                        <!-- <img loading="lazy" src="/images/zed.avif"/> -->
                        <div class="placeholder" width="320px" height="180px" style="background-color:#373845;width:320px;height:180px;"></div>
                        <div class="entry-text">
                            <h1>BagelEngine</h1>
                            <p>Minecraft server-side mod for fabric-based creative anarchy servers.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://github.com/TheRedXD/redinit" target="_blank">
                        <!-- <img loading="lazy" src="/images/zed.avif"/> -->
                        <div class="placeholder" width="320px" height="180px" style="background-color:#373845;width:320px;height:180px;"></div>
                        <div class="entry-text">
                            <h1>redinit</h1>
                            <p>Project initialization CLI script to initialize literally anything. Still very WIP!</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://github.com/TheRedXD/GamingChair" target="_blank">
                        <!-- <img loading="lazy" src="/images/zed.avif"/> -->
                        <div class="placeholder" width="320px" height="180px" style="background-color:#373845;width:320px;height:180px;"></div>
                        <div class="entry-text">
                            <h1>Gaming Chair</h1>
                            <p>A modding framework within a modding framework for Minecraft. Originally started as a cheat utility mod.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://github.com/TheRedXD/ytdl-web" target="_blank">
                        <!-- <img loading="lazy" src="/images/zed.avif"/> -->
                        <div class="placeholder" width="320px" height="180px" style="background-color:#373845;width:320px;height:180px;"></div>
                        <div class="entry-text">
                            <h1>ytdl-web</h1>
                            <p>A nice, free, open-source web application for downloading YouTube videos. Uses ytdl-core under the hood.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://github.com/TheRedXD/CoffeeVM" target="_blank">
                        <!-- <img loading="lazy" src="/images/zed.avif"/> -->
                        <div class="placeholder" width="320px" height="180px" style="background-color:#373845;width:320px;height:180px;"></div>
                        <div class="entry-text">
                            <h1>CoffeeVM</h1>
                            <p>Basically a docker wrapper designed for easy container deployment and management through a web interface, or API.</p>
                        </div>
                    </a>
                </div>
                <div class="entry">
                    <a href="https://github.com/TheRedXD/RainbowBridge" target="_blank">
                        <!-- <img loading="lazy" src="/images/zed.avif"/> -->
                        <div class="placeholder" width="320px" height="180px" style="background-color:#373845;width:320px;height:180px;"></div>
                        <div class="entry-text">
                            <h1>RainbowBridge</h1>
                            <p>MatterBridge alternative, allowing to easily bridge messages from anything, to anything (and not just messages!).</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
        <hr>
        <div class="section">
            <h3>Programming languages I know decently well.</h3>
            <h1>Some of them are awesome, some of them I actively despise.</h1>
            <div class="lang-entry">
                <img loading="lazy" src="/javascript.avif" style="--hbc: #F8E23A;padding:6px;border-radius:8px;"/>
                <h1>JS/TS</h1>
            </div>
            <div class="lang-entry">
                <img loading="lazy" src="/c.avif" style="width: 64px;padding: 0px 3px;--hbc: #6774C9"/>
                <h1>C</h1>
            </div>
            <div class="lang-entry">
                <img loading="lazy" src="/cpp.avif" style="--hbc: #6EA3D5"/>
                <h1>C++</h1>
            </div>
            <div class="lang-entry">
                <img loading="lazy" src="/rust.avif" style="filter: grayscale(100%) brightness(20);--hbc: #ffffff"/>
                <h1>Rust</h1>
            </div>
            <div class="lang-entry">
                <img loading="lazy" src="/go.avif" style="--hbc: #11AFDA"/>
                <h1>Go</h1>
            </div>
            <div class="lang-entry">
                <img loading="lazy" src="/lua.avif" style="--hbc: #3135aC"/>
                <h1>Lua</h1>
            </div>
            <div class="lang-entry">
                <img loading="lazy" src="/java.avif" style="--hbc: #ff5c5c"/>
                <h1>Java</h1>
            </div>
            <div class="lang-entry">
                <img loading="lazy" src="/python.avif" style="--hbc: #447BAF"/>
                <h1>Python</h1>
            </div>
            <div class="lang-entry">
                <img loading="lazy" src="/bash.avif"/>
                <h1>Bash</h1>
            </div>
            <div class="lang-entry">
                <img loading="lazy" src="/html.avif" style="--hbc: #FF633A"/>
                <h1>HTML</h1>
            </div>
            <div class="lang-entry">
                <img loading="lazy" src="/css.avif" style="--hbc: #1181C3"/>
                <h1>CSS</h1>
            </div>
            <div class="lang-entry">
                <img loading="lazy" src="/c3.avif" style="--hbc: #10D7F6"/>
                <h1>C3</h1>
            </div>
        </div>
        <hr>
        <div class="section">
            <h3>Like my work?</h3>
            <a href="https://buymeacoffee.com/itsthered" class="abmac" target="_blank"><div class="buymeacoffee"><i class="fa-solid fa-coffee"></i>Buy me a coffee!</div></a>
            <br>
            <p class="pbmac">👋 Hey, it helps me out a ton! Don't forget that I also need some way to keep myself awake during those intense night coding sessions o-o</p>
        </div>
        <hr>
        <div class="section">
            <h3>Have an idea, want to send some feedback or just want to say hi?</h3>
            <h1>You can do that below.</h1>
            <hr class="fancy">
            <input type="text" :placeholder="'Send me feedback!'"
                @focus="$event.target.nextElementSibling.classList.remove('feedback-hint-hidden')"
                @blur="$event.target.nextElementSibling.classList.add('feedback-hint-hidden')"
                @keyup.enter="sendFeedback($event)"></input>
            <div class="feedback-hint feedback-hint-hidden">You can send anything here!</div>
            <hr class="fancy">
        </div>
        <br>
        <h1 style="text-align: center;font-size: 2.5em;">That's about it!</h1>
        <p style="text-align: center;">Feel free to check out other pages on here!</p>
        <br>
        <hr>
    </div>
    <div class="footer">
        <div class="footer-content">
            <div class="footer-logo">
                <img src="/logo.gif" alt="Logo" height="64px">
            </div>
            <p class="footer-mid-text">Hello there, visitor! Fun fact: this entire website is <a href="https://github.com/TheRedXD/thered.sh" target="_blank"><i class="fa-solid fa-external-link"></i> open-source</a>!</p>
            <div class="footer-text">
                <p>Made with <3 by TheRed.SH</p>
                <p>Powered by Vite and Vue.</p>
                <p>Hosted on Hetzner!</p>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.notification-drawer {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 300px;
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 9999;
    display: flex;
    flex-direction: column-reverse;
    gap: 10px;
    padding: 10px;
    pointer-events: none;

    & > * {
        pointer-events: all;
        background: rgba(30, 30, 50, 0.8);
        border: 1px solid rgba(140, 140, 255, 0.2);
        backdrop-filter: blur(10px);
        padding: 15px;
        border-radius: 8px;
        color: #fff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: notification-slide 0.3s ease-out;
        transition: all 0.3s ease;

        &:hover {
            transform: translateX(-5px);
            border-color: rgba(140, 140, 255, 0.4);
        }
    }
}

@keyframes notification-slide {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.feedback-hint {
    text-align: left;
    background: #1d1d34;
    background-image: repeating-linear-gradient(45deg, rgba(140, 140, 255, 0.03) 25%, transparent 25%, transparent 75%, rgba(140, 140, 255, 0.03) 75%, rgba(140, 140, 255, 0.03)),
                    repeating-linear-gradient(45deg, rgba(140, 140, 255, 0.03) 25%, transparent 25%, transparent 75%, rgba(140, 140, 255, 0.03) 75%, rgba(140, 140, 255, 0.03));
    background-position: 0 0, 10px 10px;
    background-size: 20px 20px;
    border: 1px solid rgba(140, 140, 255, 0.2);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.7);
    position: absolute;
    width: fit-content;
    margin: 10px auto;
    opacity: 1;
    left: 50%;
    transform: translateY(0) translateX(-50%);
    transition: all 0.3s ease;

    &::before {
        content: '';
        position: absolute;
        top: -6px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        clip-path: polygon(0 0, 0% 100%, 100% 0);
        width: 10px;
        height: 10px;
        background: rgba(140, 140, 255, 0.1);
        border-left: 1px solid rgba(140, 140, 255, 0.2);
        border-top: 1px solid rgba(140, 140, 255, 0.2);
        border-radius: 2px;
    }

    &.feedback-hint-hidden {
        opacity: 0;
        transform: translateY(10px) translateX(-50%);
    }
}

.pbmac {
    max-width: 600px;
}
.buymeacoffee {
    display: block;
    margin-top: 10px;
    i {
        margin-right: 8px;
        transition: all .1s ease-in-out;
    }
    padding: 8px 12px;
    background-color: #FE643B40;
    font-size: 1.2em;
    color: #FE643B;
    border: 1px solid #FE643B;
    width: fit-content;
    border-radius: 8px;
    transition: all .1s ease-in-out;
}

a {
    color: #ddddff;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
        color: #8c8cff;
        text-decoration: underline;
    }
}

.abmac {
    display: block;
    width: fit-content;
    text-decoration: none;
    &:hover {
        text-decoration: none;
        transform: scale(1.05);
        * {
            color: white;
            border-color: white;
        }
        .buymeacoffee {
            background-color: #ffffff40;
        }
    }
}

.footer-mid-text {
    display: inline-block;
    max-width: 400px;
    margin: 0;
}

.lang-entry {
    display: inline-block;
    padding: 20px;
    text-align: center;
    transition: all 0.3s ease;
    margin: 10px;

    img {
        width: 64px;
        height: 64px;
        border-radius: 10px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        mix-blend-mode: screen;
        --hbc: rgba(140, 140, 255, 0.5);
    }

    h1 {
        margin-top: 10px;
        font-size: 1.2rem;
        color: #ddddff;
    }

    &:hover {
        transform: translateY(-5px);

        img {
            border-color: var(--hbc);
            box-shadow: 0 6px 12px rgba(140, 140, 255, 0.2);
        }
    }
}

hr.fancy {
    border: none;
    width: 10%;
    border-top: 2px solid rgba(255, 255, 255, 0.02);
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

input[type="text"] {
    width: 80%;
    padding: 15px 20px;
    font-size: 1.1rem;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    background: rgba(200, 180, 255, 0.02);
    font-family: "Iosevka Aile Regular";
    color: #fff;
    outline: none;
    transition: all 0.3s ease;
    max-width: 600px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
}

input[type="text"]:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
}

input[type="text"]:focus {
    border-color: rgba(140, 140, 255, 0.5);
    background: rgba(160, 150, 255, 0.1);
    box-shadow: 0 0 15px rgba(140, 140, 255, 0.2);
}

input[type="text"]::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.footer {
    background: linear-gradient(to bottom, #885cff00, #885cff10);
    color: #ddddff;
    padding: 40px;
    text-align: center;
}

.footer-content {
    display: flex;
    justify-content: center;
    align-items: center;
}

.footer-logo {
    margin-right: 20px;
    img {
        border-radius: 50%;
    }
}

.footer-text {
    text-align: center;
}

.button-down {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2rem;
    cursor: pointer;
    opacity: 0.2;
    transition: all 0.3s ease;
    color: #ddddff;
}

.button-down:hover {
    opacity: 1;
    transform: translateX(-50%) translateY(-5px);
}

.header {
    height: 100vh;
}

.section {
    text-align: center;
}

.entry-dislike {
    background-color: #22223060;
    border: 1px solid #ffffff30;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
    max-width: 320px;
    display: block;
    margin: 3px;
    width: 320px;
    height: 120px;
}

.entry {
    display: block;
    max-width: 320px;
    width: fit-content;
    height: fit-content;
    margin: 0px 3px;
    text-align: left;
    position: relative;
    overflow: hidden;
    transition: all .2s ease-in-out;

    img, .placeholder {
        width: 100%;
        border-radius: 5px;
        height: auto;
        position: relative;
        z-index: 1;
        border: 2px solid #ffffff30;
        mask-image: linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.2));
        -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.2));
        user-select: none;
        transition: all .2s ease-in-out;
        box-shadow: 0px 0px 10px rgba(0,0,0,0.2);
    }

    .entry-text {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        padding: 20px;
        color: white;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
    }

    &:hover {
        cursor: pointer;
        img, .placeholder {
            border-color: #8c8cff;
            transition: all .1s ease-in-out;
        }
        transform: scale(1.01);
        transition: all .1s ease-in-out;
    }
}

.entries {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: fit-content;
    margin: 0 auto;
    align-items: center;
}

hr {
    border: none;
    margin: 20px auto;
    max-width: 800px;
    width: 80%;
    height: 2px;
    border-radius: 5px;
    background-color: #ddddff20;
}

.hero {
    display: block;
    width: 100%;
    height: 100vh;
    mix-blend-mode: screen;
    filter: contrast(120%) brightness(110%) saturate(100%);
    position: absolute;
    top: 0;
    left: 0;
    z-index: -2;
    overflow-x: hidden;
    overflow-y: hidden;
}
.hero::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%);
    z-index: 0;
    overflow-x: hidden;
}

.title {
    display: block;
    margin: 0;
    padding: 0;
    font-size: 6rem;
    font-weight: 200;
    text-align: center;
    width: 100%;
    line-height: 1.4;
    overflow-x: hidden;
    overflow-y: hidden;
    background: linear-gradient(90deg, #ffffff, #8887ff, #aaaaff, #ffffff);
    font-family: "Quantico", sans-serif;
    background-size: 300% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientMove 8s ease infinite;
    mix-blend-mode: screen;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.1);
    position: relative;

    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.02); opacity: 0.6; }
    }
}

.subtitle {
    display: block;
    margin: 0;
    padding: 0;
    font-size: 1.5rem;
    font-weight: 200;
    text-align: center;
    width: 100%;
    max-width: 1000px;
    overflow-x: hidden;
    overflow-y: hidden;
}

.text {
    margin: 0;
    padding: 0;
    font-size: 2rem;
    font-weight: 200;
    text-align: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow-x: hidden;
    overflow-y: hidden;
    position: absolute;
    padding: 20px;
}

@keyframes gradientMove {
    0% { background-position: 0% 50% }
    50% { background-position: 100% 50% }
    100% { background-position: 0% 50% }
}

@media (max-width: 768px) {
    .title {
        font-size: 3rem;
    }
    .subtitle {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .title {
        font-size: 2rem;
    }
    .subtitle {
        font-size: 0.9rem;
        max-width: 90%;
    }
}
</style>
