import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Camera, Quaternion, Vector3 } from "three";

export const BallFollowCamera = forwardRef((props, ref) => {

    const cameraRef = useRef<Camera>(null);
    const tempQuaternion = new Quaternion();

    const [currentBallPosition, setCurrentBallPosition] = useState(new Vector3());

    useFrame(() => {
        if (currentBallPosition && cameraRef.current) {
            const targetPos = currentBallPosition;

            // Calculate the position the camera should be at (behind and above the ball)
            const chasePos = targetPos.clone().add(new Vector3(0, 15, 25));

            // Calculate the target rotation (quaternion) needed to look at the ball's position
            // 1. Position the camera temporarily at the chase position
            cameraRef.current.position.copy(chasePos);
            // 2. Use lookAt to orient the camera towards the ball
            cameraRef.current.lookAt(targetPos);
            // 3. Store this resulting orientation as the target quaternion
            tempQuaternion.copy(cameraRef.current.quaternion);

            // Smoothly interpolate the camera's position towards the chase position
            //if (getDistance([currentBallPosition.x, currentBallPosition.y, currentBallPosition.z]) < 370 * SCALE)
            cameraRef.current.position.lerp(chasePos, 0.35);

            // Smoothly interpolate the camera's current quaternion towards the target quaternion
            cameraRef.current.quaternion.slerp(tempQuaternion, 0.35);
        }
    });

    useImperativeHandle(ref, () => ({
        setPosition: (pos: Vector3) => {
            setCurrentBallPosition(pos);
        }
    }));

    function getDistance(pos: [number, number, number]) {
        return Math.sqrt(Math.pow(pos[0], 2) + Math.pow(pos[2], 2));
    }

    return (
        <PerspectiveCamera
            position={new Vector3(2, 3, 3)}
            ref={cameraRef}
            fov={45}
            makeDefault={true} />
    )
});