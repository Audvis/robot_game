// Componente Maze: Renderiza un laberinto simple usando cajas como paredes
import React from 'react';

function Maze() {
  // Definición simple de paredes del laberinto (puedes modificar la estructura)
  const walls = [
    // Paredes exteriores
    { position: [0, 0.5, -10], scale: [20, 1, 1] }, // norte
    { position: [0, 0.5, 10], scale: [20, 1, 1] },  // sur
    { position: [-10, 0.5, 0], scale: [1, 1, 20] }, // oeste
    { position: [10, 0.5, 0], scale: [1, 1, 20] },  // este
    // Paredes internas (ejemplo de pasillos)
    { position: [-5, 0.5, -5], scale: [10, 1, 1] },
    { position: [5, 0.5, 5], scale: [10, 1, 1] },
    { position: [0, 0.5, 0], scale: [1, 1, 10] },
    { position: [-5, 0.5, 5], scale: [1, 1, 10] },
    { position: [5, 0.5, -5], scale: [1, 1, 10] },
  ];
  return (
    <group>
      {walls.map((wall, i) => (
        <mesh key={i} position={wall.position} castShadow receiveShadow>
          <boxGeometry args={wall.scale} />
          <meshStandardMaterial color="#444" />
        </mesh>
      ))}
    </group>
  );
}

export default Maze;
