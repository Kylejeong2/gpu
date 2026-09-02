"use client";

import { RoundedBox } from "@react-three/drei";
import type { PartId } from "@/features/exhibits";
import { H100_SXM5_GEOMETRY } from "./h100Geometry";
import { SmInset } from "./SmInset";
import {
  CHIP,
  ComponentBlock,
  DARK_METAL,
  GOLD,
  GREEN,
  HbmStack,
  InteractivePart,
  METAL,
  MountingHole,
  PACKAGE,
  PCB,
  PCB_EDGE,
  paddedHitbox,
  type ModelProps,
} from "./modelPrimitives";

const DIE_COLORS = ["#9a6d2c", "#a58c35", "#728b3f", "#3e8053", "#347271", "#554f7f"] as const;

const DIE_TILES = Array.from(
  { length: H100_SXM5_GEOMETRY.dieTileColumns * H100_SXM5_GEOMETRY.dieTileRows },
  (_, index) => ({
    column: index % H100_SXM5_GEOMETRY.dieTileColumns,
    row: Math.floor(index / H100_SXM5_GEOMETRY.dieTileColumns),
  }),
);

function DieSurface({ active }: Readonly<{ active: boolean }>) {
  const { dieTileColumns, dieTileRows } = H100_SXM5_GEOMETRY;

  return (
    <group position={[0, 0.73, 0]}>
      <RoundedBox args={[1.52, 0.08, 1.28]} radius={0.035} smoothness={2}>
        <meshStandardMaterial color="#171b19" metalness={0.72} roughness={0.24} />
      </RoundedBox>
      {DIE_TILES.map(({ column, row }) => {
        const x = (column - (dieTileColumns - 1) / 2) * 0.113;
        const z = (row - (dieTileRows - 1) / 2) * 0.115;
        return (
          <mesh key={`${column}-${row}`} position={[x, 0.061, z]}>
            <boxGeometry args={[0.078, 0.018, 0.078]} />
            <meshStandardMaterial
              color={active ? GREEN : DIE_COLORS[Math.floor((column / dieTileColumns) * DIE_COLORS.length)]}
              emissive={active ? GREEN : "#000000"}
              emissiveIntensity={active ? 0.22 : 0}
              metalness={0.68}
              roughness={0.26}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function H100Model(props: ModelProps) {
  const active = (partId: PartId) => props.activePartId === partId;
  const interaction = {
    onPreview: props.onPreview,
    onClearPreview: props.onClearPreview,
    onActivate: props.onActivate,
  };

  return (
    <group name="h100-sxm5" rotation={[0, -0.08, 0]} position={[0, 0.08, 0]}>
      <RoundedBox
        args={[
          H100_SXM5_GEOMETRY.boardSize[0],
          H100_SXM5_GEOMETRY.boardSize[1],
          H100_SXM5_GEOMETRY.boardSize[2],
        ]}
        radius={0.16}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={PCB_EDGE} metalness={0.28} roughness={0.68} />
      </RoundedBox>
      <RoundedBox args={[8.48, 0.1, 3.88]} radius={0.13} smoothness={3} position={[0, 0.13, 0]}>
        <meshStandardMaterial color={PCB} metalness={0.18} roughness={0.76} />
      </RoundedBox>

      {H100_SXM5_GEOMETRY.mountingHoles.map((position) => (
        <MountingHole key={`${position[0]}-${position[1]}`} position={position} />
      ))}

      {[-1.65, -1.23, 1.23, 1.65].map((z) => (
        <mesh key={`trace-${z}`} position={[-0.03, 0.195, z]}>
          <boxGeometry args={[5.15, 0.008, 0.018]} />
          <meshStandardMaterial color="#5a4a35" metalness={0.5} roughness={0.55} />
        </mesh>
      ))}

      {H100_SXM5_GEOMETRY.leftPowerStages.map(([x, z], index) => (
        <ComponentBlock
          key={`left-vrm-${x}-${z}`}
          position={[x, 0.29, z]}
          size={[0.29, index % 3 === 0 ? 0.34 : 0.27, 0.36]}
          color={index % 4 === 0 ? "#202421" : CHIP}
          metalness={0.42}
        />
      ))}
      {H100_SXM5_GEOMETRY.rightPowerStages.map(([x, z], index) => (
        <ComponentBlock
          key={`right-vrm-${x}-${z}`}
          position={[x, 0.29, z]}
          size={[0.31, index % 4 === 0 ? 0.36 : 0.28, 0.35]}
          color={index % 5 === 0 ? "#222724" : CHIP}
          metalness={0.42}
        />
      ))}

      {[-1.38, -1.02, -0.66, 0.68, 1.04, 1.4].map((z) => (
        <group key={`capacitors-${z}`}>
          {[-2.66, -2.49, 2.32, 2.49].map((x) => (
            <ComponentBlock key={x} position={[x, 0.24, z]} size={[0.1, 0.17, 0.18]} color="#aaa99f" metalness={0.75} />
          ))}
        </group>
      ))}

      {H100_SXM5_GEOMETRY.topClampPositions.map((x) => (
        <group key={`clamp-${x}`}>
          <ComponentBlock position={[x, 0.39, -1.77]} size={[0.34, 0.46, 0.42]} color={DARK_METAL} metalness={0.7} />
          <ComponentBlock position={[x, 0.39, 1.77]} size={[0.34, 0.46, 0.42]} color={DARK_METAL} metalness={0.7} />
          <mesh position={[x, 0.61, -1.77]}>
            <boxGeometry args={[0.35, 0.03, 0.34]} />
            <meshStandardMaterial color={METAL} metalness={0.88} roughness={0.24} />
          </mesh>
          <mesh position={[x, 0.61, 1.77]}>
            <boxGeometry args={[0.35, 0.03, 0.34]} />
            <meshStandardMaterial color={METAL} metalness={0.88} roughness={0.24} />
          </mesh>
        </group>
      ))}

      <RoundedBox
        args={[
          H100_SXM5_GEOMETRY.packageSize[0],
          H100_SXM5_GEOMETRY.packageSize[1],
          H100_SXM5_GEOMETRY.packageSize[2],
        ]}
        radius={0.11}
        smoothness={4}
        position={[0, 0.35, 0]}
        castShadow
      >
        <meshStandardMaterial color={PACKAGE} metalness={0.54} roughness={0.34} />
      </RoundedBox>
      <RoundedBox args={[2.48, 0.12, 2.42]} radius={0.065} smoothness={3} position={[0, 0.55, 0]}>
        <meshStandardMaterial color="#080a09" metalness={0.5} roughness={0.42} />
      </RoundedBox>
      <InteractivePart partId="cuda-architecture" {...interaction}>
        <DieSurface active={active("cuda-architecture")} />
      </InteractivePart>

      <InteractivePart partId="gpu-ram" {...interaction}>
        {H100_SXM5_GEOMETRY.packageSites
          .filter((site) => site.kind === "memory")
          .map((site) => (
            <HbmStack key={`hbm-${site.position[0]}-${site.position[1]}`} position={site.position} highlighted={active("gpu-ram")} />
          ))}
      </InteractivePart>
      {H100_SXM5_GEOMETRY.packageSites
        .filter((site) => site.kind === "structural")
        .map((site) => (
          <HbmStack key={`structural-${site.position[0]}-${site.position[1]}`} position={site.position} />
        ))}

      {H100_SXM5_GEOMETRY.sideContacts.map((z) => (
        <group key={`package-contact-${z}`}>
          <mesh position={[-1.3, 0.64, z * 0.58]}>
            <boxGeometry args={[0.025, 0.035, 0.075]} />
            <meshStandardMaterial color={GOLD} metalness={0.86} roughness={0.2} />
          </mesh>
          <mesh position={[1.3, 0.64, z * 0.58]}>
            <boxGeometry args={[0.025, 0.035, 0.075]} />
            <meshStandardMaterial color={GOLD} metalness={0.86} roughness={0.2} />
          </mesh>
        </group>
      ))}

      <group name="power-controller-daughterboard" position={[3.22, 0.53, -1.43]} rotation={[0, -0.06, 0]}>
        <RoundedBox args={[1.08, 0.1, 0.76]} radius={0.035} smoothness={2}>
          <meshStandardMaterial color="#243b26" metalness={0.24} roughness={0.65} />
        </RoundedBox>
        <ComponentBlock position={[-0.26, 0.12, 0.03]} size={[0.34, 0.16, 0.34]} />
        <ComponentBlock position={[0.25, 0.12, -0.13]} size={[0.26, 0.14, 0.22]} />
        {[-0.35, -0.12, 0.11, 0.34].map((x) => (
          <ComponentBlock key={x} position={[x, 0.12, 0.29]} size={[0.11, 0.12, 0.12]} color="#a5a59c" metalness={0.78} />
        ))}
      </group>

      {props.view === "architecture" ? (
        <group name="illustrative-die-architecture" position={[0, 0.92, 0]}>
          <mesh>
            <boxGeometry args={[1.5, 0.045, 1.26]} />
            <meshStandardMaterial color="#081209" transparent opacity={0.92} />
          </mesh>
          <InteractivePart partId="gpc" {...interaction}>
            {[
              [-0.46, -0.36],
              [0, -0.36],
              [0.46, -0.36],
              [-0.46, 0.36],
              [0, 0.36],
              [0.46, 0.36],
            ].map(([x, z]) => (
              <RoundedBox key={`${x}-${z}`} args={[0.38, 0.085, 0.42]} radius={0.025} smoothness={2} position={[x, 0.05, z]}>
                <meshStandardMaterial color={active("gpc") ? GREEN : "#254d23"} emissive={GREEN} emissiveIntensity={active("gpc") ? 0.42 : 0.05} />
              </RoundedBox>
            ))}
          </InteractivePart>
          <InteractivePart partId="sm" hitbox={paddedHitbox([0.48, 0.15, -0.35], [0.17, 0.15, 0.19])} {...interaction}>
            <ComponentBlock position={[0.48, 0.15, -0.35]} size={[0.17, 0.15, 0.19]} color={active("sm") ? GREEN : "#6a9862"} />
          </InteractivePart>
          <InteractivePart partId="tensor-core" hitbox={paddedHitbox([-0.46, 0.17, 0.36], [0.18, 0.18, 0.2])} {...interaction}>
            <ComponentBlock position={[-0.46, 0.17, 0.36]} size={[0.18, 0.18, 0.2]} color={active("tensor-core") ? GREEN : "#8cad87"} />
          </InteractivePart>
          <InteractivePart partId="cuda-core" hitbox={paddedHitbox([0, 0.16, 0.36], [0.27, 0.16, 0.19])} {...interaction}>
            <group position={[0, 0.16, 0.36]}>
              {[-0.1, 0, 0.1].map((x) => (
                <ComponentBlock key={x} position={[x, 0, 0]} size={[0.065, 0.16, 0.19]} color={active("cuda-core") ? GREEN : "#5f8a58"} />
              ))}
            </group>
          </InteractivePart>
          <InteractivePart partId="tma" hitbox={paddedHitbox([0.47, 0.16, 0.36], [0.18, 0.17, 0.2])} {...interaction}>
            <ComponentBlock position={[0.47, 0.16, 0.36]} size={[0.18, 0.17, 0.2]} color={active("tma") ? GREEN : "#456d42"} />
          </InteractivePart>
          <SmInset
            position={[-1.6, 0.3, 2.2]}
            calloutFrom={[0.48, 0.22, -0.35]}
            tensorMemory={false}
            activePartId={props.activePartId}
            interaction={interaction}
          />
        </group>
      ) : null}
    </group>
  );
}
