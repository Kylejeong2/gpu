import type { Metadata } from "next";
import { GB300_EXHIBIT } from "@/features/exhibits/gb300";
import { GpuExperience } from "@/features/gpu-explorer/GpuExperience";

export const metadata: Metadata = {
  title: "GB300 / GPU Glossary",
  description: GB300_EXHIBIT.description,
};

export default function GB300Page() {
  return <GpuExperience exhibitId="gb300" />;
}
