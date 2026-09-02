"use client";

import { RoundedBox } from "@react-three/drei";
import { Quaternion, Vector3 } from "three";
import type { PartId, Vec3 } from "@/features/exhibits";
import { ComponentBlock, GREEN, InteractivePart, type PartInteraction } from "./modelPrimitives";

const PANEL = "#081209";
const SCHEDULER = "#8a6f3a";
const REGISTERS = "#7f5f8f";
const CORE = "#5f8a58";
const TENSOR = "#8cad87";
const SFU = "#5b8c8f";
const LSU = "#4f7a9a";
const L1 = "#3e8053";
const TMA = "#456d42";
const TMEM = "#7bb0a4";
const TPC = "#254d23";

const PARTITION_XS = [-0.78, -0.26, 0.26, 0.78] as const;
const CORE_COLUMNS = [-0.15, -0.05, 0.05, 0.15] as const;
const CORE_ROWS = [-0.2, -0.1, 0] as const;

function Segment({ from, to, color }: Readonly<{ from: Vec3; to: Vec3; color: string }>) {
  const direction = new Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const length = direction.length();
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());

  return (
    <mesh position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]} quaternion={quaternion}>
      <cylinderGeometry args={[0.012, 0.012, length, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  );
}

type SmInsetProps = Readonly<{
  position: Vec3;
  calloutFrom: Vec3;
  tensorMemory: boolean;
  activePartId: PartId | null;
  interaction: PartInteraction;
}>;

export function SmInset({ position, calloutFrom, tensorMemory, activePartId, interaction }: SmInsetProps) {
  const active = (partId: PartId) => activePartId === partId;
  const paint = (partId: PartId, base: string) => (active(partId) ? GREEN : base);
  const depth = tensorMemory ? 1.72 : 1.5;
  const backEdge = -depth / 2;

  return (
    <group name="sm-inset">
      <Segment from={calloutFrom} to={[position[0], position[1], position[2] - depth / 2 - 0.3]} color="#4f7a45" />
      <group position={position}>
        <InteractivePart partId="sm-architecture" {...interaction}>
          <RoundedBox args={[2.2, 0.04, depth]} radius={0.03} smoothness={2}>
            <meshStandardMaterial
              color={active("sm-architecture") ? "#16351a" : PANEL}
              emissive={active("sm-architecture") ? GREEN : "#000000"}
              emissiveIntensity={active("sm-architecture") ? 0.25 : 0}
              transparent
              opacity={0.94}
            />
          </RoundedBox>
        </InteractivePart>

        <InteractivePart partId="tpc" {...interaction}>
          <RoundedBox args={[2.2, 0.04, 0.34]} radius={0.03} smoothness={2} position={[0, 0, backEdge - 0.26]}>
            <meshStandardMaterial color={paint("tpc", TPC)} emissive={GREEN} emissiveIntensity={active("tpc") ? 0.4 : 0.06} transparent opacity={0.9} />
          </RoundedBox>
          <mesh position={[0, 0.01, backEdge - 0.05]}>
            <boxGeometry args={[2.2, 0.02, 0.05]} />
            <meshStandardMaterial color={paint("tpc", "#3f7a3a")} emissive={paint("tpc", "#3f7a3a")} emissiveIntensity={0.5} />
          </mesh>
        </InteractivePart>

        <InteractivePart partId="warp-scheduler" {...interaction}>
          {PARTITION_XS.map((x) => (
            <ComponentBlock key={x} position={[x, 0.05, backEdge + 0.15]} size={[0.44, 0.06, 0.12]} color={paint("warp-scheduler", SCHEDULER)} />
          ))}
        </InteractivePart>

        <InteractivePart partId="register-file" {...interaction}>
          {PARTITION_XS.map((x) => (
            <ComponentBlock key={x} position={[x, 0.05, backEdge + 0.33]} size={[0.44, 0.06, 0.14]} color={paint("register-file", REGISTERS)} />
          ))}
        </InteractivePart>

        <InteractivePart partId="core" {...interaction}>
          {PARTITION_XS.flatMap((x) =>
            CORE_ROWS.flatMap((row) =>
              CORE_COLUMNS.map((column) => (
                <mesh key={`${x}-${row}-${column}`} position={[x + column, 0.05, backEdge + 0.62 + row + 0.1]}>
                  <boxGeometry args={[0.075, 0.06, 0.075]} />
                  <meshStandardMaterial color={paint("core", CORE)} emissive={paint("core", CORE)} emissiveIntensity={active("core") ? 0.5 : 0.15} />
                </mesh>
              )),
            ),
          )}
        </InteractivePart>

        <InteractivePart partId="tensor-core" {...interaction}>
          {PARTITION_XS.map((x) => (
            <ComponentBlock key={x} position={[x, 0.055, backEdge + 0.92]} size={[0.44, 0.07, 0.14]} color={paint("tensor-core", TENSOR)} />
          ))}
        </InteractivePart>

        <InteractivePart partId="special-function-unit" {...interaction}>
          {PARTITION_XS.map((x) => (
            <ComponentBlock key={x} position={[x - 0.115, 0.05, backEdge + 1.1]} size={[0.2, 0.06, 0.1]} color={paint("special-function-unit", SFU)} />
          ))}
        </InteractivePart>

        <InteractivePart partId="load-store-unit" {...interaction}>
          {PARTITION_XS.map((x) => (
            <ComponentBlock key={x} position={[x + 0.115, 0.05, backEdge + 1.1]} size={[0.2, 0.06, 0.1]} color={paint("load-store-unit", LSU)} />
          ))}
        </InteractivePart>

        <InteractivePart partId="l1-data-cache" {...interaction}>
          <ComponentBlock position={[-0.2, 0.055, backEdge + 1.3]} size={[1.6, 0.07, 0.16]} color={paint("l1-data-cache", L1)} />
        </InteractivePart>

        <InteractivePart partId="tma" {...interaction}>
          <ComponentBlock position={[0.82, 0.055, backEdge + 1.3]} size={[0.36, 0.07, 0.16]} color={paint("tma", TMA)} />
        </InteractivePart>

        {tensorMemory ? (
          <InteractivePart partId="tensor-memory" {...interaction}>
            <ComponentBlock position={[0, 0.055, backEdge + 1.52]} size={[2.0, 0.07, 0.14]} color={paint("tensor-memory", TMEM)} />
          </InteractivePart>
        ) : null}
      </group>
    </group>
  );
}
