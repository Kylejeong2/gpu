"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box3, Vector3, type Object3D } from "three";
import type { OrbitControls as OrbitControlsInstance } from "three-stdlib";
import {
  getPart,
  getReferenceLabel,
  type CameraPreset,
  type Exhibit,
  type ModelView,
  type PartDefinition,
  type PartId,
  type Vec3,
} from "@/features/exhibits";
import { MODELS } from "./models";

type SceneViewportProps = Readonly<{
  exhibit: Exhibit;
  activePartId: PartId | null;
  previewPoint: Vec3 | null;
  view: ModelView;
  exploded: boolean;
  userHasInteracted: boolean;
  resetToken: number;
  onPreview: (partId: PartId, point?: Vec3) => void;
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

function CameraFraming({ preset, resetToken }: Readonly<{ preset: CameraPreset; resetToken: number }>) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useLayoutEffect(() => {
    const aspect = size.width / size.height;
    const narrowViewportScale = Math.max(1, 1.2 / aspect);
    const [tx, ty, tz] = preset.target;
    const [px, py, pz] = preset.position;
    camera.position.set(
      tx + (px - tx) * narrowViewportScale,
      ty + (py - ty) * narrowViewportScale,
      tz + (pz - tz) * narrowViewportScale,
    );
    camera.lookAt(tx, ty, tz);
    camera.updateProjectionMatrix();
  }, [camera, preset, resetToken, size.height, size.width]);

  return null;
}

type PartPopoverProps = Readonly<{
  part: PartDefinition;
  previewPoint: Vec3 | null;
  exploded: boolean;
  onPreview: (partId: PartId) => void;
  onClearPreview: () => void;
  onSelect: (partId: PartId) => void;
}>;

function PartPopover({ part, previewPoint, exploded, onPreview, onClearPreview, onSelect }: PartPopoverProps) {
  const scene = useThree((state) => state.scene);
  const anchor = previewPoint ?? (exploded ? explodedAnchor(scene, part.id) : null) ?? part.anchor;

  return (
    <Html position={[anchor[0], anchor[1], anchor[2]]} center distanceFactor={7.5} zIndexRange={[40, 0]}>
      <article
        className="part-popover"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerEnter={() => onPreview(part.id)}
        onPointerLeave={onClearPreview}
      >
        <div className="popover-kicker">
          <span>{part.index} / COMPONENT</span>
          {part.abbreviation ? <b>{part.abbreviation}</b> : null}
        </div>
        <h2>{part.title}</h2>
        <p>{part.description}</p>
        <a href={part.referenceUrl} target="_blank" rel="noreferrer" onClick={() => onSelect(part.id)}>
          {getReferenceLabel(part.referenceUrl)} ↗
        </a>
      </article>
    </Html>
  );
}

function explodedAnchor(scene: Object3D, partId: PartId): Vec3 | null {
  const bounds = new Box3();
  const name = `part-${partId}`;
  scene.traverse((object) => {
    if (object.name === name) bounds.expandByObject(object);
  });
  if (bounds.isEmpty()) return null;
  const center = bounds.getCenter(new Vector3());
  return [center.x, center.y, center.z];
}

function SceneFloor({ exhibitId }: Readonly<{ exhibitId: Exhibit["id"] }>) {
  const scene = useThree((state) => state.scene);
  const [floorY, setFloorY] = useState<number | null>(null);

  useLayoutEffect(() => {
    const base = scene.getObjectByName("model-base");
    if (base) {
      base.updateWorldMatrix(true, false);
      setFloorY(new Box3().setFromObject(base).min.y);
    }
  }, [scene, exhibitId]);

  if (floorY === null) return null;

  return (
    <>
      <gridHelper args={[18, 36, "#315e2a", "#173214"]} position={[0, floorY, 0]} />
      <ContactShadows position={[0, floorY, 0]} opacity={0.7} scale={11} blur={2.5} far={5} color="#020602" />
    </>
  );
}

export function SceneViewport(props: SceneViewportProps) {
  const controlsRef = useRef<OrbitControlsInstance | null>(null);
  const reducedMotion = useReducedMotion();
  const activePart = props.activePartId ? getPart(props.exhibit, props.activePartId) : null;
  const Model = MODELS[props.exhibit.id];
  const { camera } = props.exhibit;

  useEffect(() => {
    if (props.resetToken === 0) return;
    controlsRef.current?.reset();
  }, [props.resetToken]);

  return (
    <div className="canvas-wrap">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [camera.position[0], camera.position[1], camera.position[2]], fov: 32, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
        shadows
        fallback={
          <div className="scene-fallback">
            INTERACTIVE {props.exhibit.name} MODEL · USE THE COMPONENT INDEX FOR GLOSSARY LINKS
          </div>
        }
      >
        <color attach="background" args={["#0d180a"]} />
        <fog attach="fog" args={["#0d180a", 24, 42]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 10, 8]} intensity={2.8} color="#f4fff3" castShadow />
        <directionalLight position={[-6, 5, -4]} intensity={1.6} color="#dce6dc" />
        <pointLight position={[0, 2, 7]} intensity={4} distance={15} color="#7fee64" />

        <CameraFraming preset={camera} resetToken={props.resetToken} />

        <Model
          activePartId={props.activePartId}
          view={props.view}
          exploded={props.exploded}
          onPreview={props.onPreview}
          onClearPreview={props.onClearPreview}
          onActivate={props.onActivate}
        />

        {activePart ? (
          <PartPopover
            part={activePart}
            previewPoint={props.previewPoint}
            exploded={props.exploded}
            onPreview={props.onPreview}
            onClearPreview={props.onClearPreview}
            onSelect={props.onSelect}
          />
        ) : null}

        <SceneFloor exhibitId={props.exhibit.id} />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          target={[camera.target[0], camera.target[1], camera.target[2]]}
          enablePan={false}
          enableDamping={!reducedMotion}
          dampingFactor={0.065}
          minDistance={camera.minDistance}
          maxDistance={camera.maxDistance}
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
