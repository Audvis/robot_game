import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import './App.css';

function App() {
  return (
    <div className="App" style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [5, 5, 5], fov: 75 }}
        shadows
        gl={{ 
          antialias: true,
          preserveDrawingBuffer: true
        }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export default App;
