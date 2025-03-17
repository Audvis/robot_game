import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export function Controls() {
  const { controls } = useThree();

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          controls.forward = true;
          break;
        case 's':
          controls.backward = true;
          break;
        case 'a':
          controls.left = true;
          break;
        case 'd':
          controls.right = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          controls.forward = false;
          break;
        case 's':
          controls.backward = false;
          break;
        case 'a':
          controls.left = false;
          break;
        case 'd':
          controls.right = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controls]);

  return null;
}