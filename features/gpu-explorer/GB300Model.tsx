"use client";

import { RoundedBox } from "@react-three/drei";
import type { PartId } from "@/features/exhibits";
import { BlackwellPackage } from "./B200Model";
import { GB300_GEOMETRY } from "./gb300Geometry";
import {
  CHIP,
  ComponentBlock,
  GOLD,
  GREEN,
  InteractivePart,
  METAL,
  MountingHole,
  PACKAGE,
  PCB,
  PCB_EDGE,
  type ModelProps,
} from "./modelPrimitives";

const GRACE_TILE = "#4f6f8c";
const C2C = "#8fd9ff";

const GRACE_CORES = Array.from(
  { length: GB300_GEOMETRY.graceCoreColumns * GB300_GEOMETRY.graceCoreRows },
  (_, index) => ({
    column: index % GB300_GEOMETRY.graceCoreColumns,
    row: Math.floor(index / GB300_GEOMETRY.graceCoreColumns),
  }),
);

function GraceCpu({ active, showCores }: Readonly<{ active: boolean; showCores: boolean }>) {
  const { gracePackageSize, graceDieSize, graceCoreColumns, graceCoreRows } = GB300_GEOMETRY;

  return (
    <group position={[GB300_GEOMETRY.graceCenter[0], 0, GB300_GEOMETRY.graceCenter[1]]}>
      <RoundedBox
        args={[gracePackageSize[0], gracePackageSize[1], gracePackageSize[2]]}
        radius={0.1}
        smoothness={4}
        position={[0, 0.35, 0]}
        castShadow
      >
        <meshStandardMaterial color={PACKAGE} metalness={0.54} roughness={0.34} />
      </RoundedBox>
      <RoundedBox args={[graceDieSize[0], graceDieSize[1], graceDieSize[2]]} radius={0.03} smoothness={2} position={[0, 0.56, 0]}>
        <meshStandardMaterial
          color={active ? "#2f5c2b" : "#1b2229"}
          emissive={active ? GREEN : "#000000"}
          emissiveIntensity={active ? 0.3 : 0}
          metalness={0.7}
          roughness={0.26}
        />
      </RoundedBox>
      {showCores
        ? GRACE_CORES.map(({ column, row }) => (
            <mesh
              key={`${column}-${row}`}
              position={[
                (column - (graceCoreColumns - 1) / 2) * 0.13,
                0.61,
                (row - (graceCoreRows - 1) / 2) * 0.145,
              ]}
            >
              <boxGeometry args={[0.095, 0.018, 0.105]} />
              <meshStandardMaterial
                color={active ? GREEN : GRACE_TILE}
                emissive={active ? GREEN : GRACE_TILE}
                emissiveIntensity={active ? 0.4 : 0.18}
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
          ))
        : null}
    </group>
  );
}

function LinkBar({
  from,
  to,
  y,
  color,
  thickness = 0.05,
}: Readonly<{ from: readonly [number, number]; to: readonly [number, number]; y: number; color: string; thickness?: number }>) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);

  return (
    <mesh position={[(from[0] + to[0]) / 2, y, (from[1] + to[1]) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
      <boxGeometry args={[length, thickness, thickness]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} metalness={0.2} roughness={0.3} />
    </mesh>
  );
}

export function GB300Model(props: ModelProps) {
  const active = (partId: PartId) => props.activePartId === partId;
  const interaction = {
    onPreview: props.onPreview,
    onClearPreview: props.onClearPreview,
    onActivate: props.onActivate,
  };
  const { boardSize, gpuCenters, gpuScale, graceCenter, gracePackageSize, nvlinkConnectors, nvlinkConnectorSize } =
    GB300_GEOMETRY;
  const architecture = props.view === "architecture";
  const graceEdgeX = graceCenter[0] + gracePackageSize[0] / 2;
  const gpuEdgeX = gpuCenters[0][0] - (4.06 * gpuScale) / 2;
  const gpuFarEdgeX = gpuCenters[0][0] + (4.06 * gpuScale) / 2;

  return (
    <group name="gb300-superchip" rotation={[0, -0.08, 0]} position={[0, 0.08, 0]}>
      <RoundedBox args={[boardSize[0], boardSize[1], boardSize[2]]} radius={0.16} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={PCB_EDGE} metalness={0.28} roughness={0.68} />
      </RoundedBox>
      <RoundedBox args={[boardSize[0] - 0.12, 0.1, boardSize[2] - 0.12]} radius={0.13} smoothness={3} position={[0, 0.13, 0]}>
        <meshStandardMaterial color={PCB} metalness={0.18} roughness={0.76} />
      </RoundedBox>

      {GB300_GEOMETRY.mountingHoles.map((position) => (
        <MountingHole key={`${position[0]}-${position[1]}`} position={position} />
      ))}

      {[-2.6, 2.6].map((z) => (
        <mesh key={`trace-${z}`} position={[0.3, 0.195, z]}>
          <boxGeometry args={[6.4, 0.008, 0.018]} />
          <meshStandardMaterial color="#5a4a35" metalness={0.5} roughness={0.55} />
        </mesh>
      ))}

      {GB300_GEOMETRY.powerStages.map(([x, z], index) => (
        <ComponentBlock
          key={`vrm-${x}-${z}`}
          position={[x, 0.29, z]}
          size={[0.27, index % 3 === 0 ? 0.34 : 0.27, 0.36]}
          color={index % 4 === 0 ? "#202421" : CHIP}
          metalness={0.42}
        />
      ))}

      {[-2.45, -2.25, 2.25, 2.45].map((z) => (
        <group key={`capacitors-${z}`}>
          {[-3.6, -3.3, -3.0, -2.7, -2.4, -2.1, -1.8, -1.5].map((x) => (
            <ComponentBlock key={x} position={[x, 0.24, z]} size={[0.1, 0.17, 0.12]} color="#aaa99f" metalness={0.75} />
          ))}
        </group>
      ))}

      <InteractivePart partId="grace-cpu" {...interaction}>
        <GraceCpu active={active("grace-cpu")} showCores={architecture} />
      </InteractivePart>

      <InteractivePart partId="lpddr5x" {...interaction}>
        {GB300_GEOMETRY.lpddrModules.map(([x, z]) => (
          <group key={`lpddr-${x}-${z}`} position={[x, 0.29, z]}>
            <RoundedBox
              args={[GB300_GEOMETRY.lpddrSize[0], GB300_GEOMETRY.lpddrSize[1], GB300_GEOMETRY.lpddrSize[2]]}
              radius={0.03}
              smoothness={2}
              castShadow
            >
              <meshStandardMaterial
                color={active("lpddr5x") ? "#2f5c2b" : "#1d201f"}
                emissive={active("lpddr5x") ? GREEN : "#000000"}
                emissiveIntensity={active("lpddr5x") ? 0.32 : 0}
                metalness={0.46}
                roughness={0.4}
              />
            </RoundedBox>
            <mesh position={[0, 0.08, 0]}>
              <boxGeometry args={[0.025, 0.016, 0.8]} />
              <meshStandardMaterial color="#6c716d" metalness={0.68} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </InteractivePart>

      {gpuCenters.map(([x, z]) => (
        <group key={`gpu-${z}`} position={[x, 0, z]} scale={gpuScale}>
          <BlackwellPackage
            diePartId="gpu"
            memoryPartId="gpu-ram"
            activePartId={props.activePartId}
            interaction={interaction}
          />
        </group>
      ))}

      <InteractivePart partId="nvlink" {...interaction}>
        {nvlinkConnectors.map(([x, z]) => (
          <group key={`nvlink-${z}`} position={[x, 0.3, z]}>
            <RoundedBox args={[nvlinkConnectorSize[0], nvlinkConnectorSize[1], nvlinkConnectorSize[2]]} radius={0.03} smoothness={2} castShadow>
              <meshStandardMaterial
                color={active("nvlink") ? "#2f5c2b" : "#2a2e2c"}
                emissive={active("nvlink") ? GREEN : "#000000"}
                emissiveIntensity={active("nvlink") ? 0.32 : 0}
                metalness={0.7}
                roughness={0.32}
              />
            </RoundedBox>
            {Array.from({ length: 9 }, (_, index) => (index - 4) * 0.17).map((offset) => (
              <mesh key={offset} position={[0.13, 0.02, offset]}>
                <boxGeometry args={[0.04, 0.16, 0.06]} />
                <meshStandardMaterial color={GOLD} metalness={0.86} roughness={0.2} />
              </mesh>
            ))}
          </group>
        ))}
        {architecture
          ? gpuCenters.map(([, z]) => (
              <LinkBar key={`nvlink-bar-${z}`} from={[gpuFarEdgeX, z]} to={[nvlinkConnectors[0][0] - 0.14, z]} y={0.95} color={active("nvlink") ? GREEN : GOLD} />
            ))
          : null}
      </InteractivePart>

      {[-2.05, 2.05].map((z) => (
        <mesh key={`rail-${z}`} position={[1.75, 0.3, z * 1.34]}>
          <boxGeometry args={[3.7, 0.16, 0.08]} />
          <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.28} />
        </mesh>
      ))}

      {architecture ? (
        <InteractivePart
          partId="nvlink-c2c"
          hitbox={{ position: [(graceEdgeX + gpuEdgeX) / 2, 0.95, 0], size: [gpuEdgeX - graceEdgeX + 0.2, 0.3, 3.3] }}
          {...interaction}
        >
          {gpuCenters.map(([, z]) => (
            <group key={`c2c-${z}`}>
              <LinkBar from={[graceEdgeX, 0]} to={[gpuEdgeX, z]} y={0.95} color={active("nvlink-c2c") ? GREEN : C2C} thickness={0.07} />
              <mesh position={[gpuEdgeX, 0.95, z]}>
                <boxGeometry args={[0.12, 0.12, 0.3]} />
                <meshStandardMaterial color={active("nvlink-c2c") ? GREEN : C2C} emissive={active("nvlink-c2c") ? GREEN : C2C} emissiveIntensity={0.9} />
              </mesh>
            </group>
          ))}
          <mesh position={[graceEdgeX, 0.95, 0]}>
            <boxGeometry args={[0.12, 0.12, 0.5]} />
            <meshStandardMaterial color={active("nvlink-c2c") ? GREEN : C2C} emissive={active("nvlink-c2c") ? GREEN : C2C} emissiveIntensity={0.9} />
          </mesh>
        </InteractivePart>
      ) : null}
    </group>
  );
}
