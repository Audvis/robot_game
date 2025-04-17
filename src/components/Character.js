// Importaciones de librerías y hooks necesarios para el modelo 3D y animaciones
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Suspense, useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Definición de paredes del laberinto (debe coincidir con Maze.js)
const mazeWalls = [
  { position: [0, 0.5, -10], scale: [20, 1, 1] },
  { position: [0, 0.5, 10], scale: [20, 1, 1] },
  { position: [-10, 0.5, 0], scale: [1, 1, 20] },
  { position: [10, 0.5, 0], scale: [1, 1, 20] },
  { position: [-5, 0.5, -5], scale: [10, 1, 1] },
  { position: [5, 0.5, 5], scale: [10, 1, 1] },
  { position: [0, 0.5, 0], scale: [1, 1, 10] },
  { position: [-5, 0.5, 5], scale: [1, 1, 10] },
  { position: [5, 0.5, -5], scale: [1, 1, 10] },
];

// Función para verificar colisión entre el personaje y las paredes
function isColliding(newPos) {
  const charSize = 0.9; // tamaño aproximado del personaje
  for (const wall of mazeWalls) {
    const [wx, wy, wz] = wall.position;
    const [sx, sy, sz] = wall.scale;
    if (
      newPos.x + charSize / 2 > wx - sx / 2 &&
      newPos.x - charSize / 2 < wx + sx / 2 &&
      newPos.z + charSize / 2 > wz - sz / 2 &&
      newPos.z - charSize / 2 < wz + sz / 2 &&
      newPos.y < wy + 1 && newPos.y > wy - 1 // solo colisión horizontal
    ) {
      return true;
    }
  }
  return false;
}

// Función para manejar el movimiento horizontal
function handleHorizontalMovement(keys, isJumping, setPosition, setRotation, moveSpeed, position) {
  if (!isJumping) {
    let newPos = { ...position };
    let moved = false;
    if (keys.w) {
      newPos = { ...newPos, z: newPos.z - moveSpeed };
      setRotation(Math.PI);
      moved = true;
    }
    if (keys.s) {
      newPos = { ...newPos, z: newPos.z + moveSpeed };
      setRotation(0);
      moved = true;
    }
    if (keys.a) {
      newPos = { ...newPos, x: newPos.x - moveSpeed };
      setRotation(-Math.PI / 2);
      moved = true;
    }
    if (keys.d) {
      newPos = { ...newPos, x: newPos.x + moveSpeed };
      setRotation(Math.PI / 2);
      moved = true;
    }
    if (moved && !isColliding(newPos)) {
      setPosition(newPos);
    }
  }
}

// Función para manejar la solicitud de salto y animación
function handleJumpRequest({
  keys, isJumping, jumpRequested, position, groundY, setJumpRequested, actions, setVelocityY, setIsJumping, setJumpTimeoutId, jumpSpeed, jumpDelay
}) {
  if (keys.space && !isJumping && !jumpRequested && position.y <= groundY + 0.001) {
    setJumpRequested(true);
    if (actions['jump']) {
      actions['jump'].reset().play();
      actions['walk']?.stop();
      actions['idle']?.stop();
    }
    const timeoutId = setTimeout(() => {
      setVelocityY(jumpSpeed);
      setIsJumping(true);
      setJumpRequested(false);
    }, jumpDelay);
    setJumpTimeoutId(timeoutId);
  }
}

// Función para manejar la física del salto
function handleJumpPhysics({
  isJumping, position, groundY, setVelocityY, setPosition, velocityY, actions, setIsJumping
}) {
  if (isJumping || position.y > groundY) {
    setVelocityY(vy => vy - 0.012); // gravity
    setPosition(prev => {
      const newY = prev.y + velocityY;
      if (newY <= groundY) {
        setVelocityY(0);
        setIsJumping(false); // Permite volver a saltar y moverse
        if (actions['jump']) {
          actions['jump'].stop();
        }
        return { ...prev, y: groundY };
      }
      return { ...prev, y: newY };
    });
  }
}

// Función para controlar las animaciones según el estado
function handleAnimations({ isJumping, jumpRequested, isMoving, actions }) {
  if (isJumping || jumpRequested) {
    // La animación jump ya se maneja en el salto
  } else if (isMoving) {
    actions['walk']?.play();
    actions['idle']?.stop();
  } else {
    actions['walk']?.stop();
    actions['idle']?.play();
  }
}

function Model() {
  // Referencias para manipular el grupo y el modelo 3D
  const group = useRef();
  const modelRef = useRef();

  // Carga el modelo GLTF y sus animaciones
  const { scene, animations } = useGLTF('/models/robot/robot_videojuego_v1.glb');
  // Obtiene las acciones de animación y sus nombres
  const { actions, names } = useAnimations(animations, group);

  // Estado para la posición del personaje (incluye eje Y para salto)
  // Cambiado para que el personaje inicie en un lugar sin muro (esquina suroeste)
  const [position, setPosition] = useState({ x: -8, y: 0, z: 8 });
  // Estado para la velocidad vertical (salto)
  const [velocityY, setVelocityY] = useState(0);
  // Estado para saber si está saltando
  const [isJumping, setIsJumping] = useState(false);
  // Estado para las teclas presionadas (WASD y espacio)
  const [keys, setKeys] = useState({ w: false, s: false, a: false, d: false, space: false });
  // Estado para controlar si se ha solicitado un salto (esperando el retardo)
  const [jumpRequested, setJumpRequested] = useState(false);
  // Estado para guardar el ID del timeout del salto
  const [jumpTimeoutId, setJumpTimeoutId] = useState(null);

  // Constantes de movimiento y física
  const moveSpeed = 0.1;      // Velocidad de movimiento horizontal
  const jumpSpeed = 0.22;     // Velocidad inicial del salto
  const gravity = 0.012;      // Gravedad que afecta el salto
  const groundY = 0;          // Altura del suelo
  const jumpDelay = 500;      // Retardo antes de saltar (en ms)

  // Configura las animaciones al cargar el modelo
  useEffect(() => {
    // Muestra en consola las animaciones disponibles
    console.log('Available animations:', names);
    // Activa animaciones por defecto si existen
    if (actions['idle']) {
      actions['idle'].reset().play();
    }
    if (actions['stay']) {
      actions['stay'].reset().play();
    }
    if (actions['walk']) {
      actions['walk'].setEffectiveTimeScale(2); // Hace la animación de caminar más rápida
      actions['walk'].setLoop(THREE.LoopRepeat);
      actions['walk'].clampWhenFinished = true;
    }
    if (actions['jump']) {
      actions['jump'].setLoop(THREE.LoopOnce); // El salto solo se reproduce una vez
      actions['jump'].clampWhenFinished = true;
    }
  }, [actions, names]);

  // Maneja los eventos de teclado para actualizar el estado de teclas presionadas
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 's', 'a', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: true }));
      }
      if (key === ' ') {
        setKeys(prev => ({ ...prev, space: true }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 's', 'a', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: false }));
      }
      if (key === ' ') {
        setKeys(prev => ({ ...prev, space: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Limpia los listeners al desmontar
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Estado para la rotación del personaje
  const [rotation, setRotation] = useState(Math.PI);

  // Lógica principal que se ejecuta en cada frame de renderizado
  useFrame(() => {
    const isMoving = Object.values(keys).some((key, idx) => idx < 4 && key);

    handleHorizontalMovement(keys, isJumping, setPosition, setRotation, moveSpeed, position);
    handleJumpRequest({
      keys, isJumping, jumpRequested, position, groundY, setJumpRequested, actions, setVelocityY, setIsJumping, setJumpTimeoutId, jumpSpeed, jumpDelay
    });
    handleJumpPhysics({
      isJumping, position, groundY, setVelocityY, setPosition, velocityY, actions, setIsJumping
    });
    handleAnimations({ isJumping, jumpRequested, isMoving, actions });
  });

  // Limpia el timeout del salto si el componente se desmonta
  useEffect(() => {
    return () => {
      if (jumpTimeoutId) clearTimeout(jumpTimeoutId);
    };
  }, [jumpTimeoutId]);

  // Renderiza el modelo 3D en la posición y rotación calculadas
  return (
    <group ref={group}>
      <primitive 
        ref={modelRef}
        object={scene} 
        position={[position.x, position.y, position.z]}
        scale={[2, 2, 2]}
        rotation={[0, rotation, 0]}
      />
    </group>
  );
}

// Componente principal que muestra el personaje y un fallback mientras carga
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

// Precarga el modelo para mejorar el rendimiento
useGLTF.preload('/models/robot/robot_videojuego_v1.glb');