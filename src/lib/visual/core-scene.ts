import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type CoreMode = "build" | "break" | "secure";

export function createCoreScene(host: HTMLDivElement, onReady: () => void) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  camera.position.set(0, 0.4, 8.8);
  camera.lookAt(0, 0, 0);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(environment, 0.04);
  scene.environment = envTarget.texture;
  environment.dispose();
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xc0fff0, 4);
  key.position.set(3, 4, 4);
  const fill = new THREE.DirectionalLight(0x978bff, 3);
  fill.position.set(-4, -1, 2);
  scene.add(key, fill, new THREE.AmbientLight(0xffffff, 0.6));

  const assembly = new THREE.Group();
  scene.add(assembly);
  const core = new THREE.Group();
  core.rotation.set(0.35, -0.6, -0.17);
  assembly.add(core);
  const geometry = new RoundedBoxGeometry(0.56, 0.56, 0.56, 3, 0.065);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x163f3b,
    metalness: 0.82,
    roughness: 0.19,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    emissive: 0x173c36,
    emissiveIntensity: 0.22,
    envMapIntensity: 1.7,
  });
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x88e8d6,
    transparent: true,
    opacity: 0.19,
  });
  const edgeGeometry = new THREE.EdgesGeometry(
    new THREE.BoxGeometry(0.53, 0.53, 0.53),
  );
  const voxels: {
    mesh: THREE.Group;
    home: THREE.Vector3;
    direction: THREE.Vector3;
  }[] = [];
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        if (!x && !y && !z) continue;
        const cell = new THREE.Group();
        cell.add(
          new THREE.Mesh(geometry, material),
          new THREE.LineSegments(edgeGeometry, edgeMaterial),
        );
        const home = new THREE.Vector3(x * 0.62, y * 0.62, z * 0.62);
        cell.position.copy(home);
        core.add(cell);
        voxels.push({ mesh: cell, home, direction: home.clone().normalize() });
      }
  const innerGeometry = new THREE.IcosahedronGeometry(0.35, 1);
  const innerMaterial = new THREE.MeshBasicMaterial({ color: 0xc4fff0 });
  const inner = new THREE.Mesh(innerGeometry, innerMaterial);
  core.add(inner);
  const glowGeometry = new THREE.IcosahedronGeometry(0.42, 1);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x77ffe0,
    transparent: true,
    opacity: 0.12,
    wireframe: true,
  });
  core.add(new THREE.Mesh(glowGeometry, glowMaterial));

  const orbitGroup = new THREE.Group();
  orbitGroup.rotation.set(1.04, 0.15, -0.32);
  assembly.add(orbitGroup);
  const orbitGeometry = new THREE.TorusGeometry(2.08, 0.006, 5, 180);
  const orbitMaterial = new THREE.MeshBasicMaterial({
    color: 0x88d9c8,
    transparent: true,
    opacity: 0.38,
  });
  const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
  orbitGroup.add(orbit);
  const outerOrbit = new THREE.Mesh(
    new THREE.TorusGeometry(2.32, 0.003, 4, 160),
    new THREE.MeshBasicMaterial({
      color: 0xa8b4c8,
      transparent: true,
      opacity: 0.16,
    }),
  );
  outerOrbit.rotation.set(0.17, 0.22, 0);
  orbitGroup.add(outerOrbit);
  const satellites: THREE.Mesh[] = [];
  const satelliteGeometry = new THREE.SphereGeometry(0.033, 8, 8);
  const satelliteMaterial = new THREE.MeshBasicMaterial({ color: 0xb9ffef });
  for (let i = 0; i < 3; i++) {
    const dot = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
    orbitGroup.add(dot);
    satellites.push(dot);
  }

  const shieldGeometry = new THREE.IcosahedronGeometry(1.7, 1);
  const shieldMaterial = new THREE.MeshBasicMaterial({
    color: 0x8bcfff,
    wireframe: true,
    transparent: true,
    opacity: 0,
  });
  const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
  assembly.add(shield);
  const colors = {
    build: new THREE.Color("#193f38"),
    break: new THREE.Color("#393257"),
    secure: new THREE.Color("#183f59"),
  };
  const pointer = new THREE.Vector2();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let mode: CoreMode = "build";
  let paused = false;
  let visible = true;
  let disposed = false;
  let animation = 0;
  let time = 0;
  let last = 0;
  let explode = 0;
  let settling = 0;

  function render(now: number) {
    animation = 0;
    if (disposed || !visible || document.hidden) return;
    const delta = Math.min((now - last) / 1000 || 0.016, 0.06);
    if (now - last < 32 && last !== 0) {
      animation = requestAnimationFrame(render);
      return;
    }
    last = now;
    const moving = !reduced.matches && !paused;
    if (moving) time += delta;
    explode = THREE.MathUtils.lerp(
      explode,
      mode === "break" ? 0.72 : 0,
      reduced.matches ? 1 : 0.065,
    );
    material.color.lerp(colors[mode], reduced.matches ? 1 : 0.08);
    shieldMaterial.opacity = THREE.MathUtils.lerp(
      shieldMaterial.opacity,
      mode === "secure" ? 0.18 : 0,
      reduced.matches ? 1 : 0.06,
    );
    edgeMaterial.opacity = mode === "break" ? 0.28 : 0.19;
    core.rotation.y = -0.6 + time * 0.13 + pointer.x * 0.2;
    core.rotation.x = 0.35 + pointer.y * 0.13;
    core.rotation.z = -0.17 + Math.sin(time * 0.3) * 0.025;
    assembly.position.y = Math.sin(time * 0.65) * 0.085;
    voxels.forEach(({ mesh, home, direction }, i) => {
      mesh.position.copy(home).addScaledVector(direction, explode);
      mesh.rotation.set(
        explode * Math.sin(i) * 0.35,
        explode * Math.cos(i) * 0.25,
        0,
      );
    });
    inner.rotation.y = time * 0.2;
    shield.rotation.y = time * 0.07;
    satellites.forEach((dot, i) => {
      const angle = time * 0.2 + (i * Math.PI * 2) / 3;
      dot.position.set(Math.cos(angle) * 2.08, Math.sin(angle) * 2.08, 0);
    });
    renderer.render(scene, camera);
    settling = Math.max(0, settling - 1);
    if (moving || settling > 0) animation = requestAnimationFrame(render);
  }
  function wake(frames = 1) {
    settling = Math.max(settling, frames);
    if (!animation && visible && !document.hidden)
      animation = requestAnimationFrame(render);
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    wake();
  }
  function move(event: PointerEvent) {
    if (reduced.matches || event.pointerType === "touch") return;
    const rect = host.getBoundingClientRect();
    pointer.set(
      (event.clientX - rect.left) / rect.width - 0.5,
      (event.clientY - rect.top) / rect.height - 0.5,
    );
    wake();
  }
  function leave() {
    pointer.set(0, 0);
    wake();
  }
  function visibility() {
    if (!document.hidden) {
      last = 0;
      wake();
    }
  }
  function preference() {
    wake(1);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) {
      last = 0;
      wake();
    }
  });
  observer.observe(host);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", visibility);
  reduced.addEventListener("change", preference);
  resize();
  renderer.render(scene, camera);
  onReady();
  wake();
  return {
    setMode(value: CoreMode) {
      mode = value;
      wake(reduced.matches ? 1 : 100);
    },
    setPaused(value: boolean) {
      paused = value;
      wake(1);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(animation);
      resizeObserver.disconnect();
      observer.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", preference);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.LineSegments
        ) {
          geometries.add(object.geometry);
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((m) => materials.add(m));
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      envTarget.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
