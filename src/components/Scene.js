import { OrbitControls } from '@react-three/drei';
import Character from './Character';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
      />
      <gridHelper args={[20, 20]} />
      <OrbitControls 
        minDistance={2}
        maxDistance={20}
        target={[0, 1, 0]}
      />
      <Character />
    </>
  );
}

export default Scene;