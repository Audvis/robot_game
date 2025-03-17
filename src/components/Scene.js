import { OrbitControls } from '@react-three/drei';
import Character from './Character';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <gridHelper args={[10, 10]} />
      <OrbitControls />
      <Character />
    </>
  );
}

export default Scene;