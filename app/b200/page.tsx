import type { Metadata } from "next";
import { B200_EXHIBIT } from "@/features/exhibits/b200";
import { GpuExperience } from "@/features/gpu-explorer/GpuExperience";

export const metadata: Metadata = {
  title: "B200 / GPU Glossary",
  description: B200_EXHIBIT.description,
};

export default function B200Page() {
  return <GpuExperience exhibitId="b200" />;
}
