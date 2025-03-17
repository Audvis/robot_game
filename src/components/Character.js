import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Suspense, useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';


function Model() {
  const gltf = useGLTF('/models/robot/robot_videojuego_v1.glb');
  const modelRef = useRef();
  const moveSpeed = 0.1;
  const rotationSpeed = 0.05;
  const [keys, setKeys] = useState({
    w: false,
    s: false,
    a: false,
    d: false
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    };

    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!modelRef.current) return;

    if (keys.w) modelRef.current.position.z -= moveSpeed;
    if (keys.s) modelRef.current.position.z += moveSpeed;
    if (keys.a) {
      modelRef.current.position.x -= moveSpeed;
      modelRef.current.rotation.y += rotationSpeed;
    }
    if (keys.d) {
      modelRef.current.position.x += moveSpeed;
      modelRef.current.rotation.y -= rotationSpeed;
    }
  });
  
  return (
    <primitive 
      ref={modelRef}
      object={gltf.scene} 
      position={[0, 0, 0]} 
      scale={1}
    />
  );
}

function Character() {
  return (
    <Suspense fallback={null}>
      <Model />
    </Suspense>
  );
}

export default Character;

useGLTF.preload('/models/robot/robot_videojuego_v1.glb');