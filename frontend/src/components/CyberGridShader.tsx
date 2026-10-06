import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CyberGridShaderProps {
  className?: string;
  intensity?: number;
}

export const CyberGridShader: React.FC<CyberGridShaderProps> = ({
  className = '',
  intensity = 1.0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Custom GLSL Terrain Grid Shader
    const vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Undulating procedural wave equation
        float wave1 = sin(pos.x * 0.15 + uTime * 0.8) * cos(pos.y * 0.15 + uTime * 0.6) * 2.5;
        float wave2 = sin(pos.x * 0.35 - uTime * 0.4 + pos.y * 0.25) * 1.2;
        
        // Mouse influence
        float distToMouse = length(pos.xy - uMouse * 25.0);
        float mouseRipple = sin(distToMouse * 0.5 - uTime * 2.0) * exp(-distToMouse * 0.08) * 2.0;

        pos.z += wave1 + wave2 + mouseRipple;
        vElevation = pos.z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        // Grid wireframe computation
        vec2 grid = abs(fract(vUv * 35.0 - 0.5) - 0.5) / fwidth(vUv * 35.0);
        float line = min(grid.x, grid.y);
        float c = 1.0 - min(line, 1.0);

        // Gradient based on elevation: titanium slate to laser emerald
        vec3 deepColor = vec3(0.02, 0.05, 0.08);
        vec3 midColor = vec3(0.0, 0.55, 0.45);
        vec3 glowColor = vec3(0.0, 0.96, 0.6);

        float normElevation = smoothstep(-2.5, 3.5, vElevation);
        vec3 finalColor = mix(deepColor, midColor, normElevation);
        finalColor += glowColor * c * 0.9 * uIntensity;

        // Distance fog falloff
        float depth = gl_FragCoord.z / gl_FragCoord.w;
        float fog = smoothstep(15.0, 55.0, depth);
        finalColor = mix(finalColor, vec3(0.015, 0.024, 0.035), fog);

        float alpha = (c * 0.8 + normElevation * 0.3) * (1.0 - fog) * uIntensity;
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: intensity }
    };

    const geometry = new THREE.PlaneGeometry(80, 80, 80, 80);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      wireframe: false,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2.3;
    scene.add(mesh);

    // 3. Floating Particle Constellation Nodes
    const particleCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = Math.random() * 20;
      positions[i + 2] = (Math.random() - 0.5) * 60;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00f59b,
      size: 0.8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 4. Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      uniforms.uMouse.value.set(x, y);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 5. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation render loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;
      uniforms.uTime.value = elapsed;
      particles.rotation.y = elapsed * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [intensity]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden pointer-events-none ${className}`}
    />
  );
};
