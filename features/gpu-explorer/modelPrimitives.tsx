"use client";

import { RoundedBox, useCursor } from "@react-three/drei";
import { useRef, useState, type ReactNode } from "react";
import type { ModelView, PartId, Vec3 } from "@/features/exhibits";
import { isActivationGesture, type PointerPoint } from "./interaction";

export type BoardPoint = readonly [x: number, z: number];

export const GREEN = "#7fee64";
export const PCB = "#111512";
export const PCB_EDGE = "#080b09";
export const PACKAGE = "#171918";
export const CHIP = "#080a09";
export const COPPER = "#dc6d42";
export const GOLD = "#c7a85b";
export const METAL = "#777b78";
export const DARK_METAL = "#363b38";

export type ModelProps = Readonly<{
  activePartId: PartId | null;
  view: ModelView;
  exploded: boolean;
  onPreview: (partId: PartId, point?: Vec3) => void;
  onClearPreview: () => void;
  onActivate: (partId: PartId) => void;
}>;

export type PartInteraction = Pick<ModelProps, "onPreview" | "onClearPreview" | "onActivate">;

export type Hitbox = Readonly<{ position: Vec3; size: Vec3 }>;

type InteractivePartProps = PartInteraction &
  Readonly<{
    partId: PartId;
    children: ReactNode;
    hitbox?: Hitbox;
  }>;

const HITBOX_PADDING = 0.1;

export function paddedHitbox(position: Vec3, size: Vec3): Hitbox {
  return {
    position,
    size: [size[0] + HITBOX_PADDING * 2, size[1] + HITBOX_PADDING * 2, size[2] + HITBOX_PADDING * 2],
  };
}

function pointFromEvent(event: Readonly<{ nativeEvent: MouseEvent }>): PointerPoint {
  return { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY };
}

export function InteractivePart({ partId, children, hitbox, onPreview, onClearPreview, onActivate }: InteractivePartProps) {
  const [hovered, setHovered] = useState(false);
  const pressOrigin = useRef<PointerPoint | null>(null);
  useCursor(hovered, "pointer", "grab");

  return (
    <group
      name={`part-${partId}`}
      userData={{ partId }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        onPreview(partId, [event.point.x, event.point.y, event.point.z]);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
        onClearPreview();
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        pressOrigin.current = pointFromEvent(event);
      }}
      onClick={(event) => {
        event.stopPropagation();
        const origin = pressOrigin.current;
        pressOrigin.current = null;
        if (origin && isActivationGesture({ origin, release: pointFromEvent(event) })) onActivate(partId);
      }}
    >
      {hitbox ? (
        <mesh name="hitbox" position={hitbox.position}>
          <boxGeometry args={[hitbox.size[0], hitbox.size[1], hitbox.size[2]]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      ) : null}
      {children}
    </group>
  );
}

export function ComponentBlock({
  position,
  size,
  color = CHIP,
  metalness = 0.3,
}: Readonly<{ position: Vec3; size: Vec3; color?: string; metalness?: number }>) {
  return (
    <RoundedBox args={[size[0], size[1], size[2]]} radius={0.035} smoothness={2} position={position} castShadow>
      <meshStandardMaterial color={color} metalness={metalness} roughness={0.48} />
    </RoundedBox>
  );
}

export function MountingHole({ position: [x, z] }: Readonly<{ position: BoardPoint }>) {
  return (
    <group position={[x, 0.22, z]}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.035, 32]} />
        <meshBasicMaterial color={COPPER} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.055, 24]} />
        <meshStandardMaterial color="#020302" metalness={0.1} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function HbmStack({
  position: [x, z],
  size = [0.64, 0.15, 0.5],
  highlighted = false,
}: Readonly<{ position: BoardPoint; size?: Vec3; highlighted?: boolean }>) {
  const markerAlongX = size[0] >= size[2];

  return (
    <group position={[x, 0.72, z]}>
      <RoundedBox args={[size[0], size[1], size[2]]} radius={0.035} smoothness={2} castShadow>
        <meshStandardMaterial
          color={highlighted ? "#2f5c2b" : "#202321"}
          emissive={highlighted ? GREEN : "#000000"}
          emissiveIntensity={highlighted ? 0.32 : 0}
          metalness={0.48}
          roughness={0.38}
        />
      </RoundedBox>
      <mesh position={[0, size[1] / 2 + 0.01, 0]}>
        <boxGeometry args={markerAlongX ? [size[0] * 0.75, 0.018, 0.025] : [0.025, 0.018, size[2] * 0.75]} />
        <meshStandardMaterial color="#6c716d" metalness={0.68} roughness={0.3} />
      </mesh>
    </group>
  );
}
