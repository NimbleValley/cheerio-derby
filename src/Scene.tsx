import { Canvas, createRoot, useThree } from '@react-three/fiber';
import { Html, OrbitControls, PerspectiveCamera, useGLTF, useProgress } from "@react-three/drei";
import MainMenu from './MainMenu';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react';
import { type EventState, type GameType } from './types';
import { BackSide, Color, Plane, Raycaster, Vector2, Vector3 } from 'three';
import InputManager from './InputManager';
import { Debug, Physics, useBox, usePlane, useSphere } from '@react-three/cannon';
import { Ball, Indicator, Prediction, Shadow } from './Ball';
import { Stadium } from './Stadium';
import { MouseTracker } from './Mouse';
import { BallFollowCamera } from './BallFollowCamera';
import ScoreBug from './ScoreBug';
import FeedbackBug from './FeedbackBug';
import GameOver from './GameOver';

// In feet per second
const PITCH_GRAVITY = 2.7;
const HIT_GRAVITY = 10;
const DEBUG_PHYSICS = true;
export const SCALE = 114 / 375;

export const pitchStart: Vector3 = new Vector3(0, 1, -20);

const TOTAL_OUTS = 2;

function Main() {


  const [gameType, setGameType] = useState<GameType>('Single');
  const [menuOpen, setMenuOpen] = useState(true);

  const [eventState, setEventState] = useState<EventState>('Idle');
  const [swingLocked, setSwingLocked] = useState(false);

  const [outsRemaining, setOutsRemaining] = useState<number>(TOTAL_OUTS);
  const [points, setPoints] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState(0);

  const [enableGravity, setEnableGravity] = useState(false);

  const [isFoul, setIsFoul] = useState(false);

  const [currentDistance, setCurrentDistance] = useState(0);

  const ballPosRef = useRef([pitchStart.x, pitchStart.y, pitchStart.z]);

  //const mousePosition = useMousePosition();

  const [mouseWorldPosition, setMouseWorldPosition] = useState(new Vector3(0, 0, 0));
  const handleMouseMove = (position: Vector3) => {
    if (!swingLocked)
      setMouseWorldPosition(new Vector3(position.x, position.y, position.z));
  };

  useEffect(() => {
    setPredictionIndicatorPosition(mouseWorldPosition);
  }, [mouseWorldPosition]);

  const ballComponentRef = useRef<any>(null);
  const indicatorRef = useRef<any>(null);
  const predictionRef = useRef<any>(null);
  const ballFollowCameraRef = useRef<any>(null);
  const shadowRef = useRef<any>(null);

  const [pitchIndicated, setPitchIndicated] = useState(false);
  const pitchInProgressRef = useRef(false);
  const ballHasBounced = useRef(false);
  const updatedPoints = useRef(false);

  const setBallVelocity = (velocity: Vector3) => {
    if (ballComponentRef.current) {
      ballComponentRef.current.setVelocity(velocity);
    }
  };

  const setBallPosition = (position: Vector3) => {
    if (ballComponentRef.current) {
      ballComponentRef.current.setPosition(position);
    }
  };

  const setBallHit = (hit: boolean) => {
    if (ballComponentRef.current) {
      ballComponentRef.current.setBallHit(hit);
    }
  };

  const getBallPosition = (): [number, number, number] => {
    if (ballComponentRef.current) {
      //console.log(ballComponentRef.current.getBallPosition())
      return ballComponentRef.current.getBallPosition();
    }
    return [0, 0, 0];
  };

  const getBallVelocity = (): [number, number, number] => {
    if (ballComponentRef.current) {
      //console.log(ballComponentRef.current.getBallPosition())
      return ballComponentRef.current.getBallVelocity();
    }
    return [0, 0, 0];
  };

  const addBallForce = (force: Vector3, position: Vector3) => {
    console.log('Adding force');
    if (ballComponentRef.current) {
      ballComponentRef.current.applyForce(force, position);
    }
  };

  const getIsBallGrounded = () => {
    return ballComponentRef.current.getBallGrounded();
  }

  const setIsBallGrounded = (value: boolean) => {
    ballComponentRef.current.setBallGrounded(value);
  }

  const setBallIndicatorPosition = (position: Vector3) => {
    if (indicatorRef.current) {
      indicatorRef.current.setPosition(position);
    }
  };

  const setBallIndicatorVisible = (visible: boolean) => {
    if (indicatorRef.current) {
      indicatorRef.current.setIsVisible(visible);
    }
  };

  const setPredictionIndicatorPosition = (position: Vector3) => {
    if (predictionRef.current) {
      predictionRef.current.setPosition(position);
    }
  };

  const setPredictionIndicatorSize = (size: number) => {
    if (predictionRef.current) {
      predictionRef.current.setSize(size);
    }
  };

  const setPredictionIndicatorVisible = (visible: boolean) => {
    if (predictionRef.current) {
      predictionRef.current.setIsVisible(visible);
    }
  };

  const setShadowPosition = (position: Vector3) => {
    if (shadowRef.current) {
      shadowRef.current.setPosition(position);
    }
  };

  const setShadowSize = (size: number) => {
    if (shadowRef.current) {
      shadowRef.current.setSize(size);
    }
  };

  const setShadowVisible = (visible: boolean) => {
    if (shadowRef.current) {
      shadowRef.current.setIsVisible(visible);
    }
  };

  const startedGame = useRef(false);

  useEffect(() => {
    async function run() {
      if (!menuOpen && gameType == 'Single' && ballComponentRef && !startedGame.current) {
        startedGame.current = true;
        await initiateSinglePlayerGame();
      }
    }
    run();
  }, [menuOpen, ballComponentRef]);

  // useEffect(() => {
  //   const interval = setInterval(() => update(), 1000 / FPS);

  //   return () => clearInterval(interval);
  // }, [enableGravity, ballPosition, ballVelocity]);


  async function initiateSinglePlayerGame() {
    setOutsRemaining(TOTAL_OUTS);
    await sleep(1500);
    resetGame();
  }

  function resetGame() {
    setEnableGravity(false);
    ballHasBounced.current = false;
    updatedPoints.current = false;
    setOutsRemaining(TOTAL_OUTS);
    setPoints(0);
    setMaxDistance(0);
    setBallPosition(pitchStart);
    pitchInProgressRef.current = false;
    startPitchSequence();
  }

  async function startPitchSequence() {
    if (pitchInProgressRef.current || outsRemaining <= 0) return;
    pitchInProgressRef.current = true;
    setIsBallGrounded(false);

    setCurrentDistance(0);

    setSwingLocked(false);
    setPredictionIndicatorSize(0);
    setBallIndicatorVisible(false);

    setBallHit(false);
    setShadowVisible(false);

    console.log('Pitch initiated');
    setBallIndicatorVisible(false);
    setPitchIndicated(false);
    setEnableGravity(false);
    setEventState('Idle');
    setBallPosition(pitchStart);

    await sleep((Math.random() * 500) + 500);
    if (outsRemaining <= 0) {
      pitchInProgressRef.current = false;
      return;
    }

    setEventState('Pitching');
    setEnableGravity(true);
    setIsFoul(false);
    //setBallVelocity(new Vector3(0, 0, 11));
    // 13 max, 10 min

    const pitchSpeed = 100 + (Math.random() - 0.5) * 50;
    const speedFactor = 70 / pitchSpeed;

    ballHasBounced.current = false;
    updatedPoints.current = false;
    if (outsRemaining <= 0) {
      pitchInProgressRef.current = false;
      return;
    }
    addBallForce(new Vector3((Math.random() - 0.5) * 2, 12.0 + (Math.random() - 0.5) * 1.75 * speedFactor, pitchSpeed), pitchStart);
  }

  // Ball position events
  useEffect(() => {
    if (ballComponentRef.current) {
      const monitorPlateIndicator = () => {
        const pos = getBallPosition();
        const velo = getBallVelocity();

        /*
        if (pos[2] < -1) {
          //setPredictionIndicatorPosition(predictPitchPosition(pos, velo, PITCH_GRAVITY));
          //setPredictionIndicatorPosition(mouseWorldPosition);
          setPredictionIndicatorVisible(true);
        } else {
          setPredictionIndicatorVisible(false);
        }
          */
        updatePredictionIndicatorSize(pos, velo, PITCH_GRAVITY);

        if (pos[2] > -1) {
          console.log('Ball in zone at:', pos);
          setBallIndicatorVisible(true);
          setPitchIndicated(true);
          setBallIndicatorPosition(new Vector3(pos[0], pos[1], pos[2]));
        } else if (eventState === 'Pitching' && outsRemaining > 0) {
          requestAnimationFrame(monitorPlateIndicator);
        }
      };

      const monitorNewPitch = async () => {
        const pos = getBallPosition();
        if (pos[2] > 0.5) {
          setSwingLocked(true);
        }
        if (pos[2] > 5) {
          await sleep(1500);
          setSwingLocked(false);
          setPredictionIndicatorSize(0);
          setBallIndicatorVisible(false);
          await sleep(1500);
          pitchInProgressRef.current = false;
          if (outsRemaining > 0)
            startPitchSequence();
        } else if (pitchIndicated && outsRemaining > 0) {
          requestAnimationFrame(monitorNewPitch);
        }
      };

      const monitorBattedBall = async () => {
        const pos = getBallPosition();
        const distance = getDistance(pos);
        const velo = getBallVelocity();

        setShadowPosition(new Vector3(pos[0], 0.05, pos[2]));
        setShadowSize(pos[1] / 40 + 0.1);

        if (pos[2] < 0 && !updatedPoints.current && velo[2] < 0)
          setCurrentDistance(Math.round(distance / SCALE));

        if (distance > 375 * SCALE && distance < 379 * SCALE && pos[1] < 6.4 * SCALE) {
          setBallVelocity(new Vector3(pos[0] > 0 ? -Math.abs(velo[0] * 0.9) : Math.abs(velo[0] * 0.9), velo[1], Math.abs(velo[2] * 0.9)));
        }

        if (ballFollowCameraRef.current)
          ballFollowCameraRef.current.setPosition(new Vector3(pos[0], pos[1], pos[2]));

        if (outsRemaining > 0)
          requestAnimationFrame(monitorBattedBall);
      };

      if (eventState === 'Pitching' && outsRemaining > 0) {
        requestAnimationFrame(monitorPlateIndicator);
      }
      if (eventState === 'Swung' && outsRemaining > 0) {
        requestAnimationFrame(monitorBattedBall);
      }
      if (pitchIndicated && outsRemaining > 0) {
        requestAnimationFrame(monitorNewPitch);
      }
    }
  }, [pitchIndicated, eventState]);

  function getDistance(pos: [number, number, number]) {
    return Math.sqrt(Math.pow(pos[0], 2) + Math.pow(pos[2], 2));
  }

  function updatePredictionIndicatorSize(location: [number, number, number], velocity: [number, number, number], gravity: number) {
    const endZ = -1;
    const distanceLeftZ = Math.abs(endZ - location[2]);

    var time = Math.abs(distanceLeftZ / velocity[2]);
    if (time / 3 > 0.25) {
      time = 0.25 * 3;
    }

    setPredictionIndicatorSize(0.25 - time / 3);
  }

  function predictPitchPosition(location: [number, number, number], velocity: [number, number, number], gravity: number) {

    // Find position at z=0
    const endZ = -1;
    const distanceLeftZ = Math.abs(endZ - location[2]);

    const time = Math.abs(distanceLeftZ / velocity[2]);

    const endingY = location[1] + velocity[1] * time - (0.5 * gravity * Math.pow(time, 2));
    const endingX = location[0] + velocity[0] * time;

    setPredictionIndicatorSize(Math.pow(time * 0.25, 0.8));

    return new Vector3(endingX * 1.15, endingY * 1.02, 0);
  }

  function addExitVelocity() {
    // -5 to 0.5
    // difference of 5.5
    // normalize to -2.25, 2.25
    const ballPos = getBallPosition();

    const sprayRatio = (ballPos[2] + 1.75) / -2.25;
    const spray = sprayRatio * (65 / 180 * Math.PI);

    const ballVector = new Vector3(ballPos[0], ballPos[1], ballPos[2]);
    const offset = ballVector.sub(mouseWorldPosition);

    const maxExitVelo = 45;
    var exitVelo = maxExitVelo - ((Math.abs(offset.x * 1.5) + Math.abs(offset.y * 1.15)) / 2) * 45;
    if (exitVelo > 40)
      exitVelo = Math.pow(exitVelo / 40, 1.3) * 40;

    var launchAngleDegrees = 15;
    launchAngleDegrees += (offset.y * 75);
    if (Math.abs(spray * 180 / Math.PI) > 45) {
      setIsFoul(true);
    }
    console.log(exitVelo)
    const launchAngleRad = (launchAngleDegrees / 180 * Math.PI);

    return new Vector3(-exitVelo * Math.cos(launchAngleRad) * Math.sin(spray), exitVelo * Math.sin(launchAngleRad), -exitVelo * Math.cos(launchAngleRad) * Math.cos(spray));
  }

  // Swing callback
  useEffect(() => {
    if (eventState == 'Swung') {
      const ballPos = getBallPosition();
      if (ballPos[2] > -5) {
        ballHasBounced.current = false;
        setShadowVisible(true);
        setSwingLocked(true);
        setBallHit(true);
        setBallVelocity(addExitVelocity());
        setEventState('In Play');
      }
    }
  }, [eventState]);

  const handleBallGrounded = async () => {
    if (eventState != 'In Play' || ballHasBounced.current) return;

    ballHasBounced.current = true;
    console.warn('Collided!');

    if (!updatedPoints.current) {
      updatedPoints.current = true;
      const dist = getDistance(getBallPosition());
      if (dist > 380 * SCALE && !isFoul) {
        setPoints((prev) => prev + 1);
        if (dist / SCALE > maxDistance) {
          setMaxDistance(dist / SCALE);
        }
      } else {
        setOutsRemaining((prev) => prev - 1);
      }
    }

    await sleep(1500);
    pitchInProgressRef.current = false;
    startPitchSequence();
  }

  useEffect(() => {
    if (ballComponentRef.current && handleBallGrounded)
      ballComponentRef.current.setBallGroundedFeedback(handleBallGrounded);
  }, [handleBallGrounded, ballComponentRef]);

  useEffect(() => {
    if (outsRemaining <= 0)
      startedGame.current = false;
  }, [outsRemaining]);

  return (
    <>
      <Scene ballFollowCameraRef={ballFollowCameraRef} ballHit={eventState == 'In Play'} shadowRef={shadowRef} handleMouseMove={handleMouseMove} ballComponent={ballComponentRef} indicatorRef={indicatorRef} predictionRef={predictionRef} gravity={enableGravity ? eventState == 'In Play' ? -HIT_GRAVITY : -PITCH_GRAVITY : 0} />
      {
        menuOpen && <MainMenu setMenu={setMenuOpen} setGameType={setGameType} />
      }
      {
        !menuOpen && <ScoreBug score={points} outs={outsRemaining} maxDistance={maxDistance > 5 ? maxDistance : null} />
      }
      {
        currentDistance > 10 && <FeedbackBug currentDistance={currentDistance} />
      }
      {
        outsRemaining <= 0 && !menuOpen && <GameOver points={points} setMenu={setMenuOpen} />
      }
      <InputManager canSwing={!swingLocked} setSwung={setEventState} />
    </>
  );
}

function Scene({ gravity, ballComponent, indicatorRef, predictionRef, shadowRef, ballFollowCameraRef, handleMouseMove, ballHit }: { gravity: number, ballComponent: Ref<any>, ballFollowCameraRef: Ref<any>, indicatorRef: Ref<any>, predictionRef: Ref<any>, shadowRef: Ref<any>, handleMouseMove: (arg: Vector3) => void, ballHit: boolean }) {

  return (
    <div className='w-screen h-screen fixed l-0 t-0 overflow-hidden cursor-none'>
      <Canvas className='w-full h-full bg-sky-300' >
        {ballHit ?
          <BallFollowCamera ref={ballFollowCameraRef} /> :
          <PerspectiveCamera
            makeDefault={!ballHit}
            position={[0, 1.35, 2]}
            rotation={[-0.1, 0, 0]}
            fov={50}
          />
        }
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[20, 20, 20]}
          rotation={[1.2, 0.2, 3.5]}
          intensity={1.5}
        />
        <Physics iterations={20}
          tolerance={0.001}
          shouldInvalidate={false}
          defaultContactMaterial={{
            friction: 0.35,
            restitution: 0.2,
          }}
          gravity={[0, gravity, 0]}
          allowSleep={false}>
          {DEBUG_PHYSICS && <Debug color="red" scale={1.1}></Debug>}
          <Stadium />
          <Ball ref={ballComponent} />
        </Physics>
        <Indicator ref={indicatorRef} />
        <Prediction ref={predictionRef} />
        <MouseTracker onMouseMove={handleMouseMove} />
        <Shadow ref={shadowRef} />
      </Canvas>
    </div>
  )
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default Main;

function GradientSky({ topColor = '#87CEEB', bottomColor = '#FFF5E1', offset = 0.5, exponent = 0.6 }) {
  const meshRef = useRef();

  const uniforms = useMemo(
    () => ({
      topColor: { value: new Color(topColor) },
      bottomColor: { value: new Color(bottomColor) },
      offset: { value: offset },
      exponent: { value: exponent },
    }),
    [topColor, bottomColor, offset, exponent]
  );

  const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    
    void main() {
      float h = normalize(vWorldPosition + offset).y;
      gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
    }
  `;

  return (
    <mesh ref={meshRef} scale={[1, 1, 1]}>
      <sphereGeometry args={[500, 32, 15]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={BackSide}
      />
    </mesh>
  );
}