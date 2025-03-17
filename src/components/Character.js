import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';

function Model() {
  const gltf = useGLTF('/models/robot/robot_videojuego_v1.glb');
  
  return (
    <primitive 
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

// Clean up the loaded model when component unmounts
useGLTF.preload('/models/robot/robot_videojuego_v1.gltf');