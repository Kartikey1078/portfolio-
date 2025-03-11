import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Wave = () => {
  const pointsRef = useRef();
  const time = useRef(0);

  const pointsGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(45, 30, 150, 150); // Full-screen height and width
    const positions = geometry.attributes.position.array;
    const colors = new Float32Array(positions.length);

    for (let i = 0; i < positions.length / 3; i++) {
      const x = positions[i * 3];
      const normalizedX = (x + 10) / 20;
      const r = Math.sin(normalizedX * Math.PI);
      const g = Math.cos(normalizedX * Math.PI * 0.5);
      const b = Math.sin((1 - normalizedX) * Math.PI);

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      onBeforeCompile: (shader) => {
        shader.uniforms.uTime = { value: 0 };
        shader.vertexShader = `
          uniform float uTime;
          ${shader.vertexShader}
        `.replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
            float waveStrength = 1.0 - abs(position.x) / 10.0; // Reduce effect at edges
            float wave = sin(position.y * 4.0 + uTime + position.x * 3.0) * 0.5 * waveStrength;
            transformed.z += wave;
          `
        );
        pointsRef.current.material.userData.shader = shader;
      },
    });
  }, []);

  useFrame(() => {
    time.current += 0.05;
    if (pointsRef.current.material.userData.shader) {
      pointsRef.current.material.userData.shader.uniforms.uTime.value = time.current;
      pointsRef.current.material.userData.shader.uniformsNeedUpdate = true;
    }
  });

  return <points geometry={pointsGeometry} material={material} ref={pointsRef} />;
};

function App() {
  return (
    <Canvas camera={{ position: [0, 0, 15] }} style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
      <Wave />
    </Canvas>
  );
}

export default App;