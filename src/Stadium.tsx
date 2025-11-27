import { usePlane } from "@react-three/cannon";
import { useGLTF } from "@react-three/drei";

export function Stadium() {
  
  const { scene } = useGLTF("/stadium.glb");
  const [stadiumRef, stadiumAPI] = usePlane(() => ({
    //onCollide: () => console.log(true),
    position: [0, 0, 0],
    rotation: [-Math.PI / 2, 0, 0],
  }));

  return (
    <>
      <mesh ref={stadiumRef}>
      </mesh>
      <mesh>
        <primitive object={scene} />
      </mesh>
    </>
  );
}