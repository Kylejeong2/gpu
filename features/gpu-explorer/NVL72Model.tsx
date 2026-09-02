"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode, type RefObject } from "react";
import type { Group } from "three";
import type { PartId, Vec3 } from "@/features/exhibits";
import { COPPER, DARK_METAL, GREEN, InteractivePart, METAL, type ModelProps, type PartInteraction } from "./modelPrimitives";
import { NVL72_GEOMETRY, type TraySlot } from "./nvl72Geometry";

const TRAY_COLORS = { compute: "#14181a", switch: "#182024", power: "#262a29" } as const;
const LED_COLORS = { compute: GREEN, switch: "#5ad4e6", power: "#e0a84a" } as const;
const TRAY_PART: Record<TraySlot["kind"], PartId> = { compute: "compute-tray", switch: "switch-tray", power: "power-shelf" };
const CPU = "#e0a84a";
const SWITCH = "#5ad4e6";
const SUPPLY = "#3d7bd6";
const RETURN = "#c9503c";

const { traySize, trayFrontZ, psusPerShelf, chipSize, switchChipSize, superchips, switchChips } = NVL72_GEOMETRY;
const TRAY_CENTER_Z = trayFrontZ - traySize[2] / 2;
const BEZEL_Z = trayFrontZ + 0.03;
const SHELF_OFFSET = 0.075;
const CHIP_Y = -SHELF_OFFSET + 0.015 + 0.06;
const CHIP_HEIGHT = 0.12;

const PSU_XS = Array.from({ length: psusPerShelf }, (_, i) => (i - (psusPerShelf - 1) / 2) * 0.33);

const EXPLODE_TRAYS_PER_TURN = 9;
const EXPLODE_RADIUS = 3.7;
const EXPLODE_TRAY_PITCH = 0.235;

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function useExplodeProgress(exploded: boolean): RefObject<number> {
  const progress = useRef(exploded ? 1 : 0);
  useFrame((_, delta) => {
    const target = exploded ? 1 : 0;
    const remaining = target - progress.current;
    progress.current = Math.abs(remaining) < 0.0005 ? target : progress.current + remaining * (1 - Math.exp(-delta * 4.5));
  });
  return progress;
}

type ExplodingProps = Readonly<{ progress: RefObject<number>; offset: Vec3; spin?: number; children: ReactNode }>;

function Exploding({ progress, offset, spin = 0, children }: ExplodingProps) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    const eased = easeInOut(progress.current);
    group.position.set(offset[0] * eased, offset[1] * eased, offset[2] * eased);
    group.rotation.y = spin * eased;
  });
  return <group ref={ref}>{children}</group>;
}

function explodedTrayPlacement(slot: TraySlot): Readonly<{ offset: Vec3; spin: number }> {
  const totalSlots = NVL72_GEOMETRY.traySlots.length;
  const angle = slot.index * ((Math.PI * 2) / EXPLODE_TRAYS_PER_TURN);
  const targetY = NVL72_GEOMETRY.floorY + 0.55 + (totalSlots - 1 - slot.index) * EXPLODE_TRAY_PITCH;
  return {
    offset: [EXPLODE_RADIUS * Math.sin(angle), targetY - slot.y, EXPLODE_RADIUS * Math.cos(angle) - TRAY_CENTER_Z],
    spin: angle,
  };
}

function HighlightMaterial({ base, highlighted }: Readonly<{ base: string; highlighted: boolean }>) {
  return (
    <meshStandardMaterial
      color={highlighted ? GREEN : base}
      emissive={highlighted ? GREEN : base}
      emissiveIntensity={highlighted ? 0.6 : 0.3}
      metalness={0.4}
      roughness={0.35}
    />
  );
}

function TrayBody({ slot, highlighted, open }: Readonly<{ slot: TraySlot; highlighted: boolean; open: boolean }>) {
  if (open) {
    return (
      <mesh position={[0, slot.y - SHELF_OFFSET, TRAY_CENTER_Z]}>
        <boxGeometry args={[traySize[0], 0.03, traySize[2]]} />
        <meshStandardMaterial
          color={highlighted ? "#2f5c2b" : "#0f1a12"}
          emissive={highlighted ? GREEN : "#1f4a1c"}
          emissiveIntensity={highlighted ? 0.4 : 0.12}
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
    );
  }

  return (
    <mesh position={[0, slot.y, TRAY_CENTER_Z]} castShadow>
      <boxGeometry args={[traySize[0], traySize[1], traySize[2]]} />
      <meshStandardMaterial
        color={highlighted ? "#2f5c2b" : TRAY_COLORS[slot.kind]}
        emissive={highlighted ? GREEN : "#000000"}
        emissiveIntensity={highlighted ? 0.28 : 0}
        metalness={0.5}
        roughness={0.45}
      />
    </mesh>
  );
}

function TrayBezel({ slot }: Readonly<{ slot: TraySlot }>) {
  const led = (
    <mesh position={[0.92, slot.y, BEZEL_Z + 0.01]}>
      <boxGeometry args={[0.05, 0.05, 0.02]} />
      <meshStandardMaterial color={LED_COLORS[slot.kind]} emissive={LED_COLORS[slot.kind]} emissiveIntensity={1.2} />
    </mesh>
  );

  if (slot.kind === "power") {
    return (
      <group>
        {PSU_XS.map((x) => (
          <mesh key={x} position={[x, slot.y, BEZEL_Z]}>
            <boxGeometry args={[0.29, 0.14, 0.05]} />
            <meshStandardMaterial color="#8b8f8c" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {led}
      </group>
    );
  }

  if (slot.kind === "switch") {
    return (
      <group>
        <mesh position={[0, slot.y + 0.06, BEZEL_Z]}>
          <boxGeometry args={[traySize[0], 0.03, 0.04]} />
          <meshStandardMaterial color="#3a5a66" metalness={0.6} roughness={0.4} />
        </mesh>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, slot.y - 0.01, BEZEL_Z]}>
            <boxGeometry args={[0.7, 0.09, 0.04]} />
            <meshStandardMaterial color="#0a0d0c" metalness={0.3} roughness={0.8} />
          </mesh>
        ))}
        {led}
      </group>
    );
  }

  return (
    <group>
      {[-0.72, -0.5, -0.28, -0.06].map((x) => (
        <mesh key={x} position={[x, slot.y, BEZEL_Z]}>
          <boxGeometry args={[0.16, 0.09, 0.04]} />
          <meshStandardMaterial color="#0a0d0c" metalness={0.3} roughness={0.8} />
        </mesh>
      ))}
      {[-0.98, 0.98].map((x) => (
        <mesh key={x} position={[x, slot.y, BEZEL_Z]}>
          <boxGeometry args={[0.06, 0.12, 0.05]} />
          <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
      {led}
    </group>
  );
}

type TrayContentsProps = Readonly<{ slot: TraySlot; activePartId: PartId | null; interaction: PartInteraction }>;

function TrayContents({ slot, activePartId, interaction }: TrayContentsProps) {
  if (slot.kind === "power") return null;

  if (slot.kind === "switch") {
    return (
      <InteractivePart partId="nvlink-switch" {...interaction}>
        {switchChips.map(([x, z]) => (
          <mesh key={x} position={[x, slot.y + CHIP_Y, z]}>
            <boxGeometry args={[switchChipSize[0], switchChipSize[1], switchChipSize[2]]} />
            <HighlightMaterial base={SWITCH} highlighted={activePartId === "nvlink-switch"} />
          </mesh>
        ))}
      </InteractivePart>
    );
  }

  return (
    <group name="superchip-modules">
      <InteractivePart partId="gpu" {...interaction}>
        {superchips.flatMap((superchip) =>
          superchip.gpus.map(([x, z]) => (
            <mesh key={`${x}-${z}`} position={[x, slot.y + CHIP_Y, z]}>
              <boxGeometry args={[chipSize[0], chipSize[1], chipSize[2]]} />
              <HighlightMaterial base="#2c7a3a" highlighted={activePartId === "gpu"} />
            </mesh>
          )),
        )}
      </InteractivePart>
      <InteractivePart partId="grace-cpu" {...interaction}>
        {superchips.map(({ cpu: [x, z] }) => (
          <mesh key={x} position={[x, slot.y + CHIP_Y, z]}>
            <boxGeometry args={[chipSize[0] * 0.87, chipSize[1], chipSize[2] * 0.87]} />
            <HighlightMaterial base={CPU} highlighted={activePartId === "grace-cpu"} />
          </mesh>
        ))}
      </InteractivePart>
      {superchips.map(({ cpu, gpus }) => (
        <mesh key={`board-${cpu[0]}`} position={[cpu[0], slot.y - SHELF_OFFSET + 0.025, (cpu[1] + gpus[0][1]) / 2]}>
          <boxGeometry args={[0.98, 0.02, 1.68]} />
          <meshStandardMaterial color="#14301a" metalness={0.2} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

type RackFrameProps = Readonly<{ sidePanels: boolean; progress: RefObject<number> }>;

function RackFrame({ sidePanels, progress }: RackFrameProps) {
  const [width, height, depth] = NVL72_GEOMETRY.rackSize;
  const centerY = NVL72_GEOMETRY.floorY + height / 2;
  const postX = width / 2 - 0.07;
  const postZ = depth / 2 - 0.07;

  return (
    <group name="rack-frame">
      {[-postX, postX].flatMap((x) =>
        [-postZ, postZ].map((z) => (
          <Exploding key={`${x}-${z}`} progress={progress} offset={[Math.sign(x) * 1.3, 0.45, Math.sign(z) * 1.3]}>
            <mesh position={[x, centerY, z]} castShadow>
              <boxGeometry args={[0.14, height, 0.14]} />
              <meshStandardMaterial color={DARK_METAL} metalness={0.7} roughness={0.4} />
            </mesh>
          </Exploding>
        )),
      )}
      <mesh position={[0, NVL72_GEOMETRY.floorY + NVL72_GEOMETRY.baseHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[width, NVL72_GEOMETRY.baseHeight, depth]} />
        <meshStandardMaterial color="#0f1312" metalness={0.5} roughness={0.5} />
      </mesh>
      <Exploding progress={progress} offset={[0, 0.9, 0]}>
        <mesh position={[0, NVL72_GEOMETRY.floorY + height - NVL72_GEOMETRY.baseHeight / 2, 0]} castShadow>
          <boxGeometry args={[width, NVL72_GEOMETRY.baseHeight, depth]} />
          <meshStandardMaterial color="#0f1312" metalness={0.5} roughness={0.5} />
        </mesh>
      </Exploding>
      {sidePanels
        ? [-postX, postX].map((x) => (
            <mesh key={`side-${x}`} position={[x, centerY, TRAY_CENTER_Z]}>
              <boxGeometry args={[0.04, height - NVL72_GEOMETRY.baseHeight * 2, traySize[2] + 0.2]} />
              <meshStandardMaterial color="#121615" metalness={0.4} roughness={0.6} transparent opacity={0.55} />
            </mesh>
          ))
        : null}
    </group>
  );
}

function NvlinkSpine({ highlighted, glow }: Readonly<{ highlighted: boolean; glow: boolean }>) {
  const { spine } = NVL72_GEOMETRY;
  const height = spine.top - spine.bottom;
  const centerY = (spine.top + spine.bottom) / 2;
  const cableXs = Array.from({ length: spine.cableColumns }, (_, i) => (i - (spine.cableColumns - 1) / 2) * (spine.width / spine.cableColumns));
  const cableColor = highlighted ? GREEN : glow ? "#5ad4e6" : COPPER;

  return (
    <group name="nvlink-spine">
      <mesh position={[spine.x, centerY, spine.z + 0.16]}>
        <boxGeometry args={[traySize[0], height, 0.08]} />
        <meshStandardMaterial
          color={highlighted ? "#2f5c2b" : "#0c0f0e"}
          emissive={highlighted ? GREEN : "#000000"}
          emissiveIntensity={highlighted ? 0.25 : 0}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      {Array.from({ length: spine.cableLayers }, (_, layer) => layer).flatMap((layer) =>
        cableXs.map((x) => (
          <mesh key={`${layer}-${x}`} position={[spine.x + x + (layer % 2) * 0.03, centerY, spine.z - layer * 0.09]}>
            <boxGeometry args={[0.04, height, 0.04]} />
            <meshStandardMaterial
              color={cableColor}
              emissive={highlighted || glow ? cableColor : "#000000"}
              emissiveIntensity={highlighted ? 0.6 : glow ? 0.35 : 0}
              metalness={0.75}
              roughness={0.35}
            />
          </mesh>
        )),
      )}
    </group>
  );
}

function CoolingManifold({ manifold, highlighted }: Readonly<{ manifold: (typeof NVL72_GEOMETRY.manifolds)[number]; highlighted: boolean }>) {
  const [, height] = NVL72_GEOMETRY.rackSize;
  const pipeHeight = height - NVL72_GEOMETRY.baseHeight * 2;
  const centerY = NVL72_GEOMETRY.floorY + height / 2;
  const color = highlighted ? GREEN : manifold.role === "supply" ? SUPPLY : RETURN;

  return (
    <group position={[manifold.x, centerY, manifold.z]}>
      <mesh>
        <cylinderGeometry args={[0.085, 0.085, pipeHeight, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={highlighted ? 0.5 : 0.12} metalness={0.6} roughness={0.3} />
      </mesh>
      {[-0.42, -0.14, 0.14, 0.42].map((fraction) => (
        <mesh key={fraction} position={[0, fraction * pipeHeight, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 12]} />
          <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export function NVL72Model(props: ModelProps) {
  const active = (partId: PartId) => props.activePartId === partId;
  const interaction: PartInteraction = {
    onPreview: props.onPreview,
    onClearPreview: props.onClearPreview,
    onActivate: props.onActivate,
  };
  const architecture = props.view === "architecture";
  const progress = useExplodeProgress(props.exploded);
  const open = architecture || props.exploded;
  const showBezels = !architecture || props.exploded;

  return (
    <group name="gb300-nvl72" rotation={[0, -0.08, 0]}>
      <RackFrame sidePanels={!open} progress={progress} />

      {NVL72_GEOMETRY.traySlots.map((slot) => {
        const placement = explodedTrayPlacement(slot);
        return (
          <Exploding key={slot.index} progress={progress} offset={placement.offset} spin={placement.spin}>
            <InteractivePart partId={TRAY_PART[slot.kind]} {...interaction}>
              <TrayBody slot={slot} highlighted={active(TRAY_PART[slot.kind])} open={open && slot.kind !== "power"} />
              {showBezels ? <TrayBezel slot={slot} /> : null}
              {open ? <TrayContents slot={slot} activePartId={props.activePartId} interaction={interaction} /> : null}
            </InteractivePart>
          </Exploding>
        );
      })}

      <Exploding progress={progress} offset={[0, 1.0, -3.4]}>
        <InteractivePart partId="nvlink-spine" {...interaction}>
          <NvlinkSpine highlighted={active("nvlink-spine")} glow={architecture} />
        </InteractivePart>
      </Exploding>

      <InteractivePart partId="cooling-manifold" {...interaction}>
        {NVL72_GEOMETRY.manifolds.map((manifold) => (
          <Exploding key={manifold.role} progress={progress} offset={[Math.sign(manifold.x) * 2.6, 0.6, -1.8]}>
            <CoolingManifold manifold={manifold} highlighted={active("cooling-manifold")} />
          </Exploding>
        ))}
      </InteractivePart>
    </group>
  );
}
