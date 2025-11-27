import { useSphere } from "@react-three/cannon";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Camera, Quaternion, Vector3 } from "three";
import { pitchStart } from "./Scene";
import { Edges, PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

export const Ball = forwardRef((props, ref) => {
  //console.log(ballPosition)

  const handleBallGroundedRef = useRef(() => {});

  const [ballRef, ballAPI] = useSphere(() => ({ mass: 0.1, args: [0.05], position: [pitchStart.x, pitchStart.y, pitchStart.z], onCollide: () => handleBallGroundedRef.current()}));
  const [ballHit, setIsBallHit] = useState(false);

  const currentBallPosition = useRef([0, 0, 0]);
  const currentBallVelocity = useRef([0, 0, 0]);

  const [ballGrounded, setBallGrounded] = useState(false);

  useEffect(() => {
    const unsubscribe = ballAPI.position.subscribe((p) => {
      currentBallPosition.current = p;
    });
    return () => unsubscribe();
  }, [ballAPI]);

  useEffect(() => {
    const unsubscribe = ballAPI.velocity.subscribe((p) => {
      currentBallVelocity.current = p;
    });
    return () => unsubscribe();
  }, [ballAPI]);

  useImperativeHandle(ref, () => ({
    setVelocity: (velo: Vector3) => {
      ballAPI.angularVelocity.set(0, 0, 0);
      ballAPI.velocity.set(velo.x, velo.y, velo.z);
    },
    applyForce: (force: Vector3, location: Vector3) => {
      ballAPI.applyForce([force.x, force.y, force.z], [location.x, location.y, location.z]);
    },
    setPosition: (pos: Vector3) => {
      ballAPI.velocity.set(0, 0, 0);
      ballAPI.angularVelocity.set(0, 0, 0);

      ballAPI.sleep();
      ballAPI.position.set(pos.x, pos.y, pos.z);

      requestAnimationFrame(() => {
        ballAPI.wakeUp();
      });
    },
    setBallHit: (hit: boolean) => {
      setIsBallHit(hit);
    },
    getBallPosition: () => {
      return currentBallPosition.current;
    },
    getBallVelocity: () => {
      return currentBallVelocity.current;
    },
    getBallGrounded: () => {
      return ballGrounded;
    },
    setBallGrounded: (value: boolean) => {
      setBallGrounded(value);
    },
    setBallGroundedFeedback: (func: () => {}) => {
      handleBallGroundedRef.current = func;
    }
  }));

  return (
    <><mesh ref={ballRef}>
      <sphereGeometry args={[ballHit ? 0.1 : 0.05]} />
      <meshStandardMaterial />
    </mesh></>
  );
});

export const Indicator = forwardRef((props, ref) => {
  //console.log(ballPosition)

  const [pos, setPos] = useState(new Vector3(0, 1, 0));
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    setPosition: (pos: Vector3) => {
      setPos(pos);
    },
    setIsVisible: (visible: boolean) => {
      setVisible(visible);
    },
  }));

  return (
    <mesh position={pos} visible={visible} ref={ref} >
      <circleGeometry args={[0.025]} />
      <meshStandardMaterial color={'red'} />
    </mesh>
  );
});

export const Shadow = forwardRef((props, ref) => {
  //console.log(ballPosition)

  const [pos, setPos] = useState(new Vector3(0, 0.05, 0));
  const [visible, setVisible] = useState(false);
  const [size, setSize] = useState(0.5);

  useImperativeHandle(ref, () => ({
    setPosition: (pos: Vector3) => {
      setPos(pos);
    },
    setIsVisible: (visible: boolean) => {
      setVisible(visible);
    },
    setSize: (size: number) => {
      setSize(size);
    }
  }));

  return (
    <mesh position={pos} rotation={[-Math.PI / 2, 0, 0]} visible={visible} ref={ref} >
      <circleGeometry args={[size]} />
      <meshStandardMaterial color={'black'} transparent={true} opacity={0.5} />
    </mesh>
  );
});

export const Prediction = forwardRef((props, ref) => {
  //console.log(ballPosition)

  const [pos, setPos] = useState(new Vector3(0, 1, 0));
  const [visible, setVisible] = useState(true);
  const [size, setSize] = useState(0.0);

  const [offsets, setOffsets] = useState([0, 0]);

  useImperativeHandle(ref, () => ({
    setPosition: (pos: Vector3) => {
      setPos(pos);
    },
    setIsVisible: (visible: boolean) => {
      setVisible(visible);
    },
    setSize: (size: number) => {
      setSize(size);
    }
  }));

  return (
    <><mesh position={new Vector3(pos.x + Math.sin(new Date().getTime() / 250) / 10 * 0, pos.y + Math.cos(new Date().getTime() / 250) / 10 * 0, pos.z)} visible={visible} ref={ref}>
      <circleGeometry args={[size / 5]} />
      <meshStandardMaterial color={'blue'} />
    </mesh><mesh position={new Vector3(pos.x + Math.sin(new Date().getTime() / 250) / 10 * 0, pos.y + Math.cos(new Date().getTime() / 250) / 10 * 0, pos.z)} visible={visible} ref={ref}>
        <circleGeometry args={[0.05]} />
        <meshBasicMaterial transparent opacity={0} />
        {/* Edges component draws the hard edges/silhouette */}
        <Edges lineWidth={2} color="white" threshold={100} />
      </mesh></>
  );
});