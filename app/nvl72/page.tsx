import type { Metadata } from "next";
import { NVL72_EXHIBIT } from "@/features/exhibits/nvl72";
import { GpuExperience } from "@/features/gpu-explorer/GpuExperience";

export const metadata: Metadata = {
  title: "NVL72 / GPU Glossary",
  description: NVL72_EXHIBIT.description,
};

export default function NVL72Page() {
  return <GpuExperience exhibitId="nvl72" />;
}
