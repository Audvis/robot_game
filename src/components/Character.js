import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Suspense, useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Model() {
  const group = useRef();
  const modelRef = useRef();
  const { scene, animations } = useGLTF('/models/robot/robot_videojuego_v1.glb');
  const { actions, names } = useAnimations(animations, group);
  const [position, setPosition] = useState({ x: 0, z: 0 });
  const [keys, setKeys] = useState({ w: false, s: false, a: false, d: false });
  const moveSpeed = 0.1;

  useEffect(() => {
    console.log('Available animations:', names); // Debug animations
    if (actions['idle']) {
      actions['idle'].reset().play();
    }
    if (actions['walk']) {
      actions['walk'].setEffectiveTimeScale(1);
      actions['walk'].setLoop(THREE.LoopRepeat);
      actions['walk'].clampWhenFinished = true;
    }
  }, [actions, names]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 's', 'a', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 's', 'a', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const isMoving = Object.values(keys).some(key => key);
    
    // Handle movement first
    if (keys.w) setPosition(prev => ({ ...prev, z: prev.z - moveSpeed }));
    if (keys.s) setPosition(prev => ({ ...prev, z: prev.z + moveSpeed }));
    if (keys.a) setPosition(prev => ({ ...prev, x: prev.x - moveSpeed }));
    if (keys.d) setPosition(prev => ({ ...prev, x: prev.x + moveSpeed }));

    // Handle animations
    if (isMoving) {
      actions['walk']?.play();
      actions['idle']?.stop();
    } else {
      actions['walk']?.stop();
      actions['idle']?.play();
    }
  });

  return (
    <group ref={group}>
      <primitive 
        ref={modelRef}
        object={scene} 
        position={[position.x, 0, position.z]} // Changed y position from 1 to 0
        scale={[2, 2, 2]}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  );
}

function Character() {
  return (
    <Suspense fallback={
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    }>
      <Model />
    </Suspense>
  );
}

export default Character;

// Update the preload call at the bottom of the file
useGLTF.preload('/models/robot/robot_videojuego_v1.glb');