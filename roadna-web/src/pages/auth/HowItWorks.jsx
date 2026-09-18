import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Link } from "react-router-dom";

/**
 * HowItWorks.jsx
 * A visually stunning page using Three.js to explain the platform's journey.
 */

// ===================== STYLES =====================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .how-it-works-root {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    min-height: 100vh;
    background: #000;
    overflow-x: hidden;
    overflow-y: auto;
    font-family: 'Inter', Arial, Helvetica, sans-serif;
  }

  .how-it-works-root .main-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 64px;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    transition: background 0.4s ease, box-shadow 0.4s ease;
  }

  .how-it-works-root .main-nav.scrolled {
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
  }

  .how-it-works-root .nav-logo {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 4px;
    color: #00ccff;
    text-decoration: none;
    text-shadow: 0 0 20px rgba(0, 204, 255, 0.3);
    transition: text-shadow 0.3s ease;
  }

  .how-it-works-root .nav-logo:hover {
    text-shadow: 0 0 28px rgba(0, 204, 255, 0.55);
  }

  .how-it-works-root .nav-links {
    list-style: none;
    display: flex;
    gap: 32px;
    margin: 0;
    padding: 0;
  }

  .how-it-works-root .nav-links li a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.5px;
    position: relative;
    padding-bottom: 4px;
    transition: color 0.3s ease;
  }

  .how-it-works-root .nav-links li a::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: #00ccff;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .how-it-works-root .nav-links li a:hover {
    color: #fff;
  }

  .how-it-works-root .nav-links li a:hover::after {
    width: 100%;
  }

  .how-it-works-root .webgl {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    outline: none;
    z-index: 0;
    pointer-events: none;
  }

  .how-it-works-root .journey-section {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    padding: 100px 20px 120px;
    text-align: center;
    color: #fff;
  }

  .how-it-works-root .journey-section::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 20%, rgba(0,0,0,0.25), rgba(0,0,0,0.78));
    z-index: -1;
  }

  .how-it-works-root .brand-title {
    font-size: clamp(34px, 5vw, 64px);
    font-weight: 800;
    letter-spacing: 6px;
    margin-bottom: 12px;
    text-transform: uppercase;
    background: linear-gradient(90deg, #ff00cc, #00ccff, #7cff6b);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 18px rgba(0,204,255,0.25);
  }

  .how-it-works-root .journey-section h2 {
    font-size: clamp(22px, 3.2vw, 38px);
    margin-bottom: 10px;
    background: linear-gradient(90deg, #ffffff, #b8e9ff, #ffd6f3);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .how-it-works-root .subtitle {
    color: rgba(255, 255, 255, 0.75);
    margin-bottom: 10px;
  }

  .how-it-works-root .cards {
    margin-top: 60px;
    display: flex;
    justify-content: center;
    gap: 25px;
    flex-wrap: wrap;
  }

  .how-it-works-root .card {
    width: 260px;
    height: 260px;
    padding: 30px;
    border-radius: 20px;
    background: rgba(255,255,255,0.95);
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    opacity: 0;
    transform: translateY(60px);
    transition: transform 0.8s ease, opacity 0.8s ease;
    color: #000;
  }

  .how-it-works-root .card h3 {
    margin-bottom: 20px;
    padding: 10px;
    background-image: linear-gradient(to right, #0072ff, #00c6ff);
    color: #fff;
    border-radius: 25px;
  }

  .how-it-works-root .icon {
    font-size: 40px;
    margin-bottom: 15px;
  }

  .how-it-works-root .card.show {
    opacity: 1;
    transform: translateY(0);
  }

  .how-it-works-root .card:hover {
    transform: translateY(-8px);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    box-shadow: 0 18px 45px rgba(0,0,0,0.35);
  }
`;

// ===================== COMPONENT =====================
export default function HowItWorks() {
  const canvasRef = useRef(null);
  const navRef = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);

  // Nav scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      if (window.scrollY > 50) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Three.js galaxy
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scene
    const scene = new THREE.Scene();

    // Parameters
    const parameters = {
      count: 100000,
      size: 0.02,
      radius: 2.15,
      branches: 3,
      spin: 3,
      randomness: 0.5,
      randomnessPower: 4,
      insideColor: "#ff00cc",
      outsideColor: "#00ccff",
    };

    let geometry, material, points;

    const generateGalaxy = () => {
      if (points) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
      }

      geometry = new THREE.BufferGeometry();

      const positions = new Float32Array(parameters.count * 3);
      const colors = new Float32Array(parameters.count * 3);

      const colorInside = new THREE.Color(parameters.insideColor);
      const colorOutside = new THREE.Color(parameters.outsideColor);

      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle =
          ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

        const randomX =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;

        const randomY =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius *
          0.1;

        const randomZ =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      material = new THREE.PointsMaterial({
        size: parameters.size,
        vertexColors: true,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);

      points.scale.setScalar(0);
    };

    generateGalaxy();

    // Star Streaks
    let streakGeo, streakMat, streaks;

    const createStreaks = () => {
      streakGeo = new THREE.BufferGeometry();
      const count = 4000;
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 12;
        positions[i3 + 1] = (Math.random() - 0.5) * 8;
        positions[i3 + 2] = -Math.random() * 50;
      }

      streakGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      streakMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.03,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      });

      streaks = new THREE.Points(streakGeo, streakMat);
      scene.add(streaks);
    };

    createStreaks();

    // Sizes + Camera
    let sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    scene.add(camera);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enabled = false;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 1);

    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    };

    window.addEventListener("resize", handleResize);

    // Animation stages
    const STAGES = { BUILD: "BUILD", ZOOM: "ZOOM", UI: "UI" };
    let stage = STAGES.BUILD;
    let galaxyScale = 0;
    let zoomProgress = 0;
    let cardsShown = false;

    const zoom = {
      duration: 3.0,
      from: new THREE.Vector3(6, 2.2, 10),
      to: new THREE.Vector3(0.2, 0.1, 3.2),
    };

    camera.position.copy(zoom.from);
    camera.lookAt(0, 0, 0);

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    const clock = new THREE.Clock();
    let animId;

    const tick = () => {
      const dt = clock.getDelta();
      const elapsed = clock.elapsedTime;

      if (points) {
        points.rotation.y += 0.08 * dt;
        points.rotation.x += 0.02 * dt;
      }

      if (stage === STAGES.BUILD) {
        galaxyScale = Math.min(1, galaxyScale + dt * 0.35);
        if (points) points.scale.setScalar(galaxyScale);
        if (galaxyScale >= 1) {
          stage = STAGES.ZOOM;
          zoomProgress = 0;
        }
      }

      if (stage === STAGES.ZOOM) {
        zoomProgress = Math.min(1, zoomProgress + dt / zoom.duration);
        const t = easeInOutCubic(zoomProgress);

        camera.position.lerpVectors(zoom.from, zoom.to, t);
        camera.lookAt(0, 0, 0);

        camera.fov = THREE.MathUtils.lerp(72, 48, t);
        camera.updateProjectionMatrix();

        if (material) {
          material.size = THREE.MathUtils.lerp(parameters.size, parameters.size * 0.55, t);
          material.opacity = 0.85 + Math.sin(elapsed * 1.5) * 0.05;
        }

        if (streakMat) {
          streakMat.opacity = THREE.MathUtils.lerp(0.0, 0.75, t);
        }

        if (streaks) {
          const pos = streaks.geometry.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            let z = pos.getZ(i);
            z += (1.2 + t * 6.0) * dt * 10;
            if (z > 2) z = -50 - Math.random() * 20;
            pos.setZ(i, z);
          }
          pos.needsUpdate = true;
        }

        if (zoomProgress >= 1) {
          stage = STAGES.UI;
          if (streakMat) streakMat.opacity = 0.0;

          if (!cardsShown) {
            cardsShown = true;
            setTimeout(() => card1Ref.current?.classList.add("show"), 200);
            setTimeout(() => card2Ref.current?.classList.add("show"), 450);
            setTimeout(() => card3Ref.current?.classList.add("show"), 700);
          }

          camera.fov = 55;
          camera.updateProjectionMatrix();
          camera.position.set(zoom.to.x, zoom.to.y, zoom.to.z);
          camera.lookAt(0, 0, 0);
        }
      }

      if (stage === STAGES.UI) {
        camera.position.set(zoom.to.x, zoom.to.y, zoom.to.z);
        camera.lookAt(0, 0, 0);

        if (material) {
          material.opacity = 0.88 + Math.sin(elapsed * 1.2) * 0.04;
          material.size = parameters.size * 0.65;
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry?.dispose();
      material?.dispose();
      streakGeo?.dispose();
      streakMat?.dispose();
    };
  }, []);

  return (
    <div className="how-it-works-root">
      <style>{styles}</style>

      {/* Navigation */}
      <nav className="main-nav" ref={navRef}>
        <Link to="/" className="nav-logo">ROADNA</Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/explore">Explore</Link></li>
          <li><Link to="/chat">Messages</Link></li>
          <li><Link to="/contact">contact us</Link></li>
          <li><Link to="/about">about us</Link></li>
          <li className="home-login"><Link to="/login">Login</Link></li>
        </ul>
      </nav>

      {/* Journey Section */}
      <section className="journey-section" id="journey">
        <div className="brand-title">ROADNA</div>
        <h2>Start Your Journey in 3 Simple Steps ⚡</h2>
        <p className="subtitle">From creating your profile to embarking on your adventure</p>

        <div className="cards">
          <div className="card" id="card1" ref={card1Ref}>
            <div className="icon">👤</div>
            <h3>Create Profile</h3>
            <p>Tell us about your travel interests and style</p>
          </div>

          <div className="card" id="card2" ref={card2Ref}>
            <div className="icon">🤝</div>
            <h3>Match with Travelers</h3>
            <p>Find perfect travel companions based on shared interests</p>
          </div>

          <div className="card" id="card3" ref={card3Ref}>
            <div className="icon">🧭</div>
            <h3>Travel & Enjoy</h3>
            <p>Embark on your adventure and create unforgettable memories</p>
          </div>
        </div>
      </section>

      {/* Canvas */}
      <canvas className="webgl" ref={canvasRef}></canvas>
    </div>
  );
}
