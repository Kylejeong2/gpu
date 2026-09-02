import type { Metadata } from "next";
import { H100_EXHIBIT } from "@/features/exhibits/h100";
import { GpuExperience } from "@/features/gpu-explorer/GpuExperience";

export const metadata: Metadata = {
  title: "H100 / GPU Glossary",
  description: H100_EXHIBIT.description,
};

export default function HomePage() {
  return <GpuExperience exhibitId="h100" />;
}
