import { useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { Raycaster, Plane, Vector3, Vector2 } from "three";

export const MouseTracker = ({ onMouseMove }:{onMouseMove:(arg:Vector3) => void}) => {
  const { camera, size } = useThree();
  const raycaster = useRef(new Raycaster());
  const plane = useRef(new Plane(new Vector3(0, 0, 1), 0)); // z=0 plane

  useEffect(() => {
    const handleMouseMove = (event:MouseEvent) => {
      // Convert mouse position to normalized device coordinates (-1 to +1)
      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;

      // Update raycaster
      raycaster.current.setFromCamera(new Vector2(x, y), camera);

      // Find intersection with z=0 plane
      const intersectPoint = new Vector3();
      raycaster.current.ray.intersectPlane(plane.current, intersectPoint);

      if (intersectPoint) {
        onMouseMove(intersectPoint);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera, size, onMouseMove]);

  return null;
};