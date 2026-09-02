"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import type { Group } from "three";
import type { PartId, Vec3 } from "@/features/exhibits";
import { COPPER, DARK_METAL, GREEN, InteractivePart, type ModelProps, type PartInteraction } from "./modelPrimitives";
import { NVL72_GEOMETRY, type RackSlot, type SlotKind } from "./nvl72Geometry";

const {
  traySize,
  trayFrontZ,
  psusPerShelf,
  chipSize,
  switchChipSize,
  superchips,
  switchChips,
  cartridges,
  busbar,
  fanWallZ,
  fansPerTray,
  computeBaysPerTray,
  switchPortCagesPerTray,
} = NVL72_GEOMETRY;

const TRAY_CENTER_Z = trayFrontZ - traySize[2] / 2;
const BEZEL_Z = trayFrontZ + 0.02;
const SHELF_DROP = traySize[1] / 2;
const CHIP_Y = -SHELF_DROP + 0.02 + chipSize[1] / 2;

const FACEPLATE = "#9aa3a0";
const FACE_DARK = "#0a0d0c";
const VENT = "#4d5654";
const BAY = "#c3cdd6";
const CPU_COLOR = "#e0a84a";
const SWITCH_COLOR = "#5ad4e6";
const GPU_COLOR = "#2c7a3a";
const SUPPLY = "#3d7bd6";
const RETURN = "#c9503c";

const TRAY_COLORS: Record<SlotKind, string> = {
  compute: "#14181a",
  switch: "#182024",
  power: "#262a29",
  tor: "#1a1d1c",
  blank: "#101413",
};
const LED_COLORS: Record<SlotKind, string> = {
  compute: GREEN,
  switch: SWITCH_COLOR,
  power: "#e0a84a",
  tor: "#8fd9ff",
  blank: GREEN,
};
const INTERACTIVE_PART: Partial<Record<SlotKind, PartId>> = {
  compute: "compute-tray",
  switch: "switch-tray",
  power: "power-shelf",
};

const PSU_PITCH = traySize[0] / psusPerShelf;
const PSU_XS = Array.from({ length: psusPerShelf }, (_, i) => (i - (psusPerShelf - 1) / 2) * PSU_PITCH);
const BAY_XS = Array.from({ length: computeBaysPerTray }, (_, i) => (i - (computeBaysPerTray - 1) / 2) * 0.075);
const CAGE_XS = Array.from({ length: switchPortCagesPerTray }, (_, i) => -0.78 + i * 0.085);
const FAN_XS = Array.from({ length: fansPerTray }, (_, i) => (i - (fansPerTray - 1) / 2) * 0.21);
const CARTRIDGE_PITCH = cartridges.width / cartridges.count;
const CARTRIDGE_XS = Array.from({ length: cartridges.count }, (_, i) => (i - (cartridges.count - 1) / 2) * CARTRIDGE_PITCH);

const EXPLODE_PER_TURN = 9;
const EXPLODE_RADIUS = 3.6;
const EXPLODE_PITCH = 0.235;

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

function HighlightMaterial({ base, highlighted }: Readonly<{ base: string; highlighted: boolean }>) {
  return (
    <meshStandardMaterial
      color={highlighted ? GREEN : base}
      emissive={highlighted ? GREEN : base}
      emissiveIntensity={highlighted ? 0.6 : 0.28}
      metalness={0.4}
      roughness={0.35}
    />
  );
}

function TrayBody({ slot, highlighted, open }: Readonly<{ slot: RackSlot; highlighted: boolean; open: boolean }>) {
  if (open) {
    return (
      <mesh position={[0, slot.y - SHELF_DROP, TRAY_CENTER_Z]}>
        <boxGeometry args={[traySize[0], 0.025, traySize[2]]} />
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

// Front-face detail follows the Lenovo GB300 NVL72 product guide rack photo and
// its labeled front-panel figures.
function TrayFace({ slot }: Readonly<{ slot: RackSlot }>) {
  const led = (
    <mesh position={[traySize[0] / 2 - 0.05, slot.y - 0.03, BEZEL_Z + 0.02]}>
      <boxGeometry args={[0.03, 0.03, 0.02]} />
      <meshStandardMaterial color={LED_COLORS[slot.kind]} emissive={LED_COLORS[slot.kind]} emissiveIntensity={1.2} />
    </mesh>
  );

  if (slot.kind === "blank") {
    return (
      <mesh position={[0, slot.y, BEZEL_Z]}>
        <boxGeometry args={[traySize[0], traySize[1] * 0.94, 0.02]} />
        <meshStandardMaterial color="#171b1a" metalness={0.35} roughness={0.7} />
      </mesh>
    );
  }

  if (slot.kind === "power") {
    return (
      <group>
        {PSU_XS.map((x) => (
          <group key={x}>
            <mesh position={[x, slot.y, BEZEL_Z]}>
              <boxGeometry args={[PSU_PITCH - 0.015, traySize[1] * 0.92, 0.025]} />
              <meshStandardMaterial color={FACEPLATE} metalness={0.55} roughness={0.45} />
            </mesh>
            <mesh position={[x, slot.y, BEZEL_Z + 0.02]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[traySize[1] * 0.3, traySize[1] * 0.3, 0.015, 16]} />
              <meshStandardMaterial color="#2b2f2d" metalness={0.5} roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  const plate = (
    <mesh position={[0, slot.y, BEZEL_Z]}>
      <boxGeometry args={[traySize[0], traySize[1] * 0.92, 0.025]} />
      <meshStandardMaterial color={FACEPLATE} metalness={0.55} roughness={0.45} />
    </mesh>
  );

  if (slot.kind === "tor") {
    return (
      <group>
        {plate}
        {Array.from({ length: 22 }, (_, i) => (i - 10.5) * 0.055).map((x) => (
          <mesh key={x} position={[x, slot.y + 0.01, BEZEL_Z + 0.02]}>
            <boxGeometry args={[0.038, 0.028, 0.015]} />
            <meshStandardMaterial color={FACE_DARK} metalness={0.3} roughness={0.8} />
          </mesh>
        ))}
        {led}
      </group>
    );
  }

  if (slot.kind === "switch") {
    return (
      <group>
        {plate}
        {CAGE_XS.map((x) => (
          <mesh key={x} position={[x, slot.y - 0.01, BEZEL_Z + 0.02]}>
            <boxGeometry args={[0.055, 0.04, 0.015]} />
            <meshStandardMaterial color={FACE_DARK} metalness={0.3} roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[-0.03, slot.y, BEZEL_Z + 0.015]}>
          <boxGeometry args={[0.44, 0.1, 0.012]} />
          <meshStandardMaterial color={VENT} metalness={0.4} roughness={0.85} />
        </mesh>
        <mesh position={[0.5, slot.y + 0.02, BEZEL_Z + 0.015]}>
          <boxGeometry args={[0.19, 0.04, 0.012]} />
          <meshStandardMaterial color={VENT} metalness={0.4} roughness={0.85} />
        </mesh>
        {led}
      </group>
    );
  }

  return (
    <group>
      {plate}
      <mesh position={[-0.62, slot.y + 0.03, BEZEL_Z + 0.015]}>
        <boxGeometry args={[0.44, 0.035, 0.012]} />
        <meshStandardMaterial color={VENT} metalness={0.4} roughness={0.85} />
      </mesh>
      {[-0.71, -0.53].map((x) => (
        <mesh key={x} position={[x, slot.y - 0.03, BEZEL_Z + 0.02]}>
          <boxGeometry args={[0.15, 0.028, 0.015]} />
          <meshStandardMaterial color={FACE_DARK} metalness={0.3} roughness={0.8} />
        </mesh>
      ))}
      {BAY_XS.map((x) => (
        <mesh key={x} position={[x, slot.y, BEZEL_Z + 0.02]}>
          <boxGeometry args={[0.062, 0.095, 0.015]} />
          <meshStandardMaterial color={BAY} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.4, slot.y, BEZEL_Z + 0.02]}>
        <boxGeometry args={[0.055, 0.1, 0.018]} />
        <meshStandardMaterial color={FACE_DARK} metalness={0.3} roughness={0.8} />
      </mesh>
      <mesh position={[0.66, slot.y - 0.02, BEZEL_Z + 0.02]}>
        <boxGeometry args={[0.28, 0.04, 0.015]} />
        <meshStandardMaterial color={FACE_DARK} metalness={0.3} roughness={0.8} />
      </mesh>
      {led}
    </group>
  );
}

type TrayContentsProps = Readonly<{ slot: RackSlot; activePartId: PartId | null; interaction: PartInteraction }>;

function TrayContents({ slot, activePartId, interaction }: TrayContentsProps) {
  if (slot.kind === "switch") {
    return (
      <InteractivePart partId="nvlink-switch" {...interaction}>
        {switchChips.map(([x, z]) => (
          <mesh key={x} position={[x, slot.y + CHIP_Y, z]}>
            <boxGeometry args={[switchChipSize[0], switchChipSize[1], switchChipSize[2]]} />
            <HighlightMaterial base={SWITCH_COLOR} highlighted={activePartId === "nvlink-switch"} />
          </mesh>
        ))}
      </InteractivePart>
    );
  }

  if (slot.kind !== "compute") return null;

  return (
    <group name="nvl2-boards">
      {superchips.map(({ cpu, gpus }) => (
        <mesh key={`board-${cpu[0]}`} position={[cpu[0], slot.y - SHELF_DROP + 0.02, (cpu[1] + gpus[0][1]) / 2]}>
          <boxGeometry args={[0.86, 0.012, 1.35]} />
          <meshStandardMaterial color="#14301a" metalness={0.2} roughness={0.7} />
        </mesh>
      ))}
      {FAN_XS.map((x) => (
        <mesh key={`fan-${x}`} position={[x, slot.y + CHIP_Y - 0.01, fanWallZ]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.045, 12]} />
          <meshStandardMaterial color="#20262a" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
      <InteractivePart partId="gpu" {...interaction}>
        {superchips.flatMap((board) =>
          board.gpus.map(([x, z]) => (
            <mesh key={`${x}-${z}`} position={[x, slot.y + CHIP_Y, z]}>
              <boxGeometry args={[chipSize[0], chipSize[1], chipSize[2]]} />
              <HighlightMaterial base={GPU_COLOR} highlighted={activePartId === "gpu"} />
            </mesh>
          )),
        )}
      </InteractivePart>
      <InteractivePart partId="grace-cpu" {...interaction}>
        {superchips.map(({ cpu: [x, z] }) => (
          <mesh key={x} position={[x, slot.y + CHIP_Y, z]}>
            <boxGeometry args={[chipSize[0] * 0.82, chipSize[1], chipSize[2] * 0.82]} />
            <HighlightMaterial base={CPU_COLOR} highlighted={activePartId === "grace-cpu"} />
          </mesh>
        ))}
      </InteractivePart>
    </group>
  );
}

function RackFrame({ sidePanels, progress }: Readonly<{ sidePanels: boolean; progress: RefObject<number> }>) {
  const [width, height, depth] = NVL72_GEOMETRY.rackSize;
  const { floorY, plinthHeight, topCapHeight } = NVL72_GEOMETRY;
  const centerY = floorY + height / 2;
  const postX = width / 2 - 0.06;
  const postZ = depth / 2 - 0.06;

  return (
    <group name="rack-frame">
      {[-postX, postX].flatMap((x) =>
        [-postZ, postZ].map((z) => (
          <Exploding key={`${x}-${z}`} progress={progress} offset={[Math.sign(x) * 1.2, 0.4, Math.sign(z) * 1.2]}>
            <mesh position={[x, centerY, z]} castShadow>
              <boxGeometry args={[0.12, height, 0.12]} />
              <meshStandardMaterial color={DARK_METAL} metalness={0.7} roughness={0.4} />
            </mesh>
          </Exploding>
        )),
      )}
      <mesh position={[0, floorY + plinthHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[width, plinthHeight, depth]} />
        <meshStandardMaterial color="#0f1312" metalness={0.5} roughness={0.5} />
      </mesh>
      <Exploding progress={progress} offset={[0, 0.9, 0]}>
        <mesh position={[0, floorY + height - topCapHeight / 2, 0]} castShadow>
          <boxGeometry args={[width, topCapHeight, depth]} />
          <meshStandardMaterial color="#0f1312" metalness={0.5} roughness={0.5} />
        </mesh>
      </Exploding>
      {sidePanels
        ? [-postX, postX].map((x) => (
            <mesh key={`side-${x}`} position={[x, centerY, 0]}>
              <boxGeometry args={[0.03, height - plinthHeight - topCapHeight, depth - 0.12]} />
              <meshStandardMaterial color="#121615" metalness={0.4} roughness={0.6} transparent opacity={0.5} />
            </mesh>
          ))
        : null}
    </group>
  );
}

function NvlinkCartridges({ highlighted, glow }: Readonly<{ highlighted: boolean; glow: boolean }>) {
  const height = cartridges.top - cartridges.bottom;
  const centerY = (cartridges.top + cartridges.bottom) / 2;
  const slabWidth = CARTRIDGE_PITCH - 0.02;
  const cableColor = highlighted ? GREEN : glow ? SWITCH_COLOR : COPPER;

  return (
    <group name="nvlink-cartridges">
      {CARTRIDGE_XS.map((x) => (
        <group key={x} position={[x, centerY, cartridges.z]}>
          <mesh>
            <boxGeometry args={[slabWidth, height, 0.16]} />
            <meshStandardMaterial
              color={highlighted ? "#2f5c2b" : "#0c0f0e"}
              emissive={highlighted ? GREEN : "#000000"}
              emissiveIntensity={highlighted ? 0.3 : 0}
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
          {[-0.26, 0, 0.26].map((offset) => (
            <mesh key={offset} position={[offset * slabWidth, 0, 0.09]}>
              <boxGeometry args={[slabWidth * 0.16, height * 0.98, 0.03]} />
              <meshStandardMaterial
                color={cableColor}
                emissive={cableColor}
                emissiveIntensity={highlighted ? 0.55 : glow ? 0.32 : 0.14}
                metalness={0.75}
                roughness={0.35}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Busbar() {
  const [, height] = NVL72_GEOMETRY.rackSize;
  const { floorY, plinthHeight, topCapHeight } = NVL72_GEOMETRY;
  const barHeight = height - plinthHeight - topCapHeight;

  return (
    <mesh name="busbar" position={[0, floorY + plinthHeight + barHeight / 2, busbar.z]}>
      <boxGeometry args={[busbar.width, barHeight, 0.06]} />
      <meshStandardMaterial color={COPPER} metalness={0.85} roughness={0.35} />
    </mesh>
  );
}

type ManifoldProps = Readonly<{ manifold: (typeof NVL72_GEOMETRY.manifolds)[number]; highlighted: boolean }>;

function CoolingManifold({ manifold, highlighted }: ManifoldProps) {
  const [, height] = NVL72_GEOMETRY.rackSize;
  const { floorY, plinthHeight, topCapHeight } = NVL72_GEOMETRY;
  const pipeHeight = height - plinthHeight - topCapHeight;
  const centerY = floorY + plinthHeight + pipeHeight / 2;
  const color = highlighted ? GREEN : manifold.role === "supply" ? SUPPLY : RETURN;
  const served = NVL72_GEOMETRY.slots.filter((slot) => slot.kind === "compute" || slot.kind === "switch");

  return (
    <group position={[manifold.x, centerY, manifold.z]}>
      <mesh>
        <cylinderGeometry args={[0.07, 0.07, pipeHeight, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={highlighted ? 0.5 : 0.12} metalness={0.6} roughness={0.3} />
      </mesh>
      {served.map((slot) => (
        <mesh key={slot.u} position={[0, slot.y - centerY, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.07, 8]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.4} />
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

  const placements = useMemo(() => {
    const movable = NVL72_GEOMETRY.slots.filter((slot) => INTERACTIVE_PART[slot.kind]);
    const total = movable.length;
    return new Map(
      movable.map((slot, i) => {
        const angle = i * ((Math.PI * 2) / EXPLODE_PER_TURN);
        const targetY = NVL72_GEOMETRY.floorY + 0.6 + (total - 1 - i) * EXPLODE_PITCH;
        const offset: Vec3 = [
          EXPLODE_RADIUS * Math.sin(angle),
          targetY - slot.y,
          EXPLODE_RADIUS * Math.cos(angle) - TRAY_CENTER_Z,
        ];
        return [slot.u, { offset, spin: angle }];
      }),
    );
  }, []);

  return (
    <group name="gb300-nvl72" rotation={[0, -0.08, 0]}>
      <RackFrame sidePanels={!open} progress={progress} />

      {NVL72_GEOMETRY.slots.map((slot) => {
        const partId = INTERACTIVE_PART[slot.kind];

        if (!partId) {
          return (
            <group key={slot.u}>
              <TrayBody slot={slot} highlighted={false} open={false} />
              {slot.kind === "tor" || !open ? <TrayFace slot={slot} /> : null}
            </group>
          );
        }

        const placement = placements.get(slot.u);
        const openTray = open && slot.kind !== "power";
        return (
          <Exploding key={slot.u} progress={progress} offset={placement?.offset ?? [0, 0, 0]} spin={placement?.spin ?? 0}>
            <InteractivePart partId={partId} {...interaction}>
              <TrayBody slot={slot} highlighted={active(partId)} open={openTray} />
              {!architecture || props.exploded ? <TrayFace slot={slot} /> : null}
              {openTray ? <TrayContents slot={slot} activePartId={props.activePartId} interaction={interaction} /> : null}
            </InteractivePart>
          </Exploding>
        );
      })}

      <Exploding progress={progress} offset={[0, 0.9, -3.2]}>
        <InteractivePart partId="nvlink-spine" {...interaction}>
          <NvlinkCartridges highlighted={active("nvlink-spine")} glow={architecture} />
        </InteractivePart>
        <Busbar />
      </Exploding>

      <InteractivePart partId="cooling-manifold" {...interaction}>
        {NVL72_GEOMETRY.manifolds.map((manifold) => (
          <Exploding key={manifold.role} progress={progress} offset={[Math.sign(manifold.x) * 2.4, 0.5, -1.6]}>
            <CoolingManifold manifold={manifold} highlighted={active("cooling-manifold")} />
          </Exploding>
        ))}
      </InteractivePart>
    </group>
  );
}
