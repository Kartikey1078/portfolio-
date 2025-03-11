import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Wave = () => {
  const pointsRef = useRef();
  const time = useRef(0);

  const pointsGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(45, 30, 150, 150);
    const positions = geometry.attributes.position.array;
    const colors = new Float32Array(positions.length);

    for (let i = 0; i < positions.length / 3; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const normalizedX = (x + 10) / 20;
      const normalizedY = (y + 10) / 20;
      
      // Enhance colors in the center
      const intensity = Math.exp(-4 * Math.pow(normalizedX - 0.5, 2)) * Math.exp(-4 * Math.pow(normalizedY - 0.5, 2));
      const r = (Math.sin(normalizedX * Math.PI) * 0.8 + 0.2) * intensity;
      const g = (Math.cos(normalizedX * Math.PI * 0.5) * 0.7 + 0.3) * intensity;
      const b = (Math.sin((1 - normalizedX) * Math.PI) * 0.9 + 0.1) * intensity;

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      onBeforeCompile: (shader) => {
        shader.uniforms.uTime = { value: 0 };
        shader.vertexShader = `
          uniform float uTime;
          ${shader.vertexShader}
        `.replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
            float waveStrength = 1.0 - abs(position.x) / 10.0;
            float wave = sin(position.y * 5.0 + uTime + position.x * 3.0) * 0.75 * waveStrength;
            transformed.z += wave;
          `
        );
        pointsRef.current.material.userData.shader = shader;
      },
    });
  }, []);

  useFrame(() => {
    time.current += 0.025;
    if (pointsRef.current.material.userData.shader) {
      pointsRef.current.material.userData.shader.uniforms.uTime.value = time.current;
      pointsRef.current.material.userData.shader.uniformsNeedUpdate = true;
    }
  });

  return <points geometry={pointsGeometry} material={material} ref={pointsRef} />;
};

function App() {
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: 'url(https://source.unsplash.com/random/1920x1080/?galaxy,nebula,colors) center/cover no-repeat',
      overflow: 'hidden'
    }}>
      <Canvas camera={{ position: [0, 0, 15] }} style={{ width: '100%', height: '100%' }}>
        <Wave />
      </Canvas>
    </div>
  );
}

export default App;