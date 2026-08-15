"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { OrbitControls as OrbitControlsInstance } from "three-stdlib";
import { getPartDefinition, type ModelView, type PartId } from "@/features/exhibits/h100";
import { H100Model } from "./H100Model";

type SceneViewportProps = Readonly<{
  activePartId: PartId | null;
  view: ModelView;
  userHasInteracted: boolean;
  resetToken: number;
  onPreview: (partId: PartId) => void;
  onClearPreview: () => void;
  onActivate: (partId: PartId) => void;
  onSelect: (partId: PartId) => void;
  onInteract: () => void;
}>;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function CameraFraming({ resetToken }: Readonly<{ resetToken: number }>) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useLayoutEffect(() => {
    const aspect = size.width / size.height;
    const narrowViewportScale = Math.max(1, 1.2 / aspect);
    camera.position.set(9.2 * narrowViewportScale, 6.5 * narrowViewportScale, 9.6 * narrowViewportScale);
    camera.lookAt(0, 0.35, 0);
    camera.updateProjectionMatrix();
  }, [camera, resetToken, size.height, size.width]);

  return null;
}

export function SceneViewport(props: SceneViewportProps) {
  const controlsRef = useRef<OrbitControlsInstance | null>(null);
  const reducedMotion = useReducedMotion();
  const activePart = props.activePartId ? getPartDefinition(props.activePartId) : null;

  useEffect(() => {
    if (props.resetToken === 0) return;
    controlsRef.current?.reset();
  }, [props.resetToken]);

  return (
    <div className="canvas-wrap">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [9.2, 6.5, 9.6], fov: 32, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
        shadows
        fallback={<div className="scene-fallback">INTERACTIVE H100 MODEL · USE THE COMPONENT INDEX FOR GLOSSARY LINKS</div>}
      >
        <color attach="background" args={["#0d180a"]} />
        <fog attach="fog" args={["#0d180a", 24, 42]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 10, 8]} intensity={2.8} color="#f4fff3" castShadow />
        <directionalLight position={[-6, 5, -4]} intensity={1.6} color="#dce6dc" />
        <pointLight position={[0, 2, 7]} intensity={4} distance={15} color="#7fee64" />

        <CameraFraming resetToken={props.resetToken} />

        <H100Model
          activePartId={props.activePartId}
          view={props.view}
          onPreview={props.onPreview}
          onClearPreview={props.onClearPreview}
          onActivate={props.onActivate}
        />

        {activePart ? (
          <Html position={activePart.anchor} center distanceFactor={7.5} zIndexRange={[40, 0]}>
            <article className="part-popover" onPointerDown={(event) => event.stopPropagation()}>
              <div className="popover-kicker">
                <span>{activePart.index} / COMPONENT</span>
                {activePart.abbreviation ? <b>{activePart.abbreviation}</b> : null}
              </div>
              <h2>{activePart.title}</h2>
              <p>{activePart.description}</p>
              <a
                href={activePart.glossaryUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => props.onSelect(activePart.id)}
              >
                OPEN GLOSSARY ↗
              </a>
            </article>
          </Html>
        ) : null}

        <gridHelper args={[18, 36, "#315e2a", "#173214"]} position={[0, -0.52, 0]} />
        <ContactShadows position={[0, -0.5, 0]} opacity={0.7} scale={11} blur={2.5} far={5} color="#020602" />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          target={[0, 0.35, 0]}
          enablePan={false}
          enableDamping={!reducedMotion}
          dampingFactor={0.065}
          minDistance={6.8}
          maxDistance={24}
          minPolarAngle={0.35}
          maxPolarAngle={1.48}
          autoRotate={!props.userHasInteracted && !reducedMotion}
          autoRotateSpeed={0.55}
          onStart={props.onInteract}
        />
      </Canvas>
    </div>
  );
}
