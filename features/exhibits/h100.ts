export const PART_ORDER: readonly [
  "cuda-architecture",
  "gpu-ram",
  "gpc",
  "sm",
  "tensor-core",
  "cuda-core",
  "tma",
] = ["cuda-architecture", "gpu-ram", "gpc", "sm", "tensor-core", "cuda-core", "tma"];

export type PartId = (typeof PART_ORDER)[number];
export type ModelView = "exterior" | "architecture";
export type Vec3 = readonly [x: number, y: number, z: number];

export type PartDefinition = Readonly<{
  id: PartId;
  index: string;
  title: string;
  abbreviation?: string;
  description: string;
  glossaryUrl: `https://modal.com/gpu-glossary/${string}`;
  view: ModelView;
  anchor: Vec3;
}>;

const H100_PARTS: Readonly<Record<PartId, PartDefinition>> = {
  "cuda-architecture": {
    id: "cuda-architecture",
    index: "01",
    title: "CUDA architecture (conceptual)",
    abbreviation: "CUDA",
    description: "A conceptual map of the repeated processing units inside the physical GH100 package.",
    glossaryUrl: "https://modal.com/gpu-glossary/device-hardware/cuda-device-architecture",
    view: "exterior",
    anchor: [0, 1.32, 0],
  },
  "gpu-ram": {
    id: "gpu-ram",
    index: "02",
    title: "GPU RAM",
    abbreviation: "HBM3",
    description: "High-bandwidth memory placed beside the GPU die to keep its processors fed with data.",
    glossaryUrl: "https://modal.com/gpu-glossary/device-hardware/gpu-ram",
    view: "exterior",
    anchor: [-0.84, 1.24, -0.72],
  },
  gpc: {
    id: "gpc",
    index: "03",
    title: "GPU Processing Cluster",
    abbreviation: "GPC",
    description: "A top-level cluster that groups texture and streaming multiprocessor resources.",
    glossaryUrl: "https://modal.com/gpu-glossary/device-hardware/graphics-processing-cluster",
    view: "architecture",
    anchor: [-0.95, 1.12, -0.55],
  },
  sm: {
    id: "sm",
    index: "04",
    title: "Streaming Multiprocessor",
    abbreviation: "SM",
    description: "The repeating processor that schedules and executes groups of GPU threads.",
    glossaryUrl: "https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor",
    view: "architecture",
    anchor: [0.55, 1.22, -0.52],
  },
  "tensor-core": {
    id: "tensor-core",
    index: "05",
    title: "Tensor Core",
    description: "Specialized compute hardware for the matrix operations used heavily in machine learning.",
    glossaryUrl: "https://modal.com/gpu-glossary/device-hardware/tensor-core",
    view: "architecture",
    anchor: [-0.52, 1.34, 0.52],
  },
  "cuda-core": {
    id: "cuda-core",
    index: "06",
    title: "CUDA Core",
    description: "A scalar arithmetic unit inside an SM used for general GPU computation.",
    glossaryUrl: "https://modal.com/gpu-glossary/device-hardware/cuda-core",
    view: "architecture",
    anchor: [0.1, 1.34, 0.52],
  },
  tma: {
    id: "tma",
    index: "07",
    title: "Tensor Memory Accelerator",
    abbreviation: "TMA",
    description: "Hardware that moves multidimensional tensor data between memory spaces.",
    glossaryUrl: "https://modal.com/gpu-glossary/device-hardware/tensor-memory-accelerator",
    view: "architecture",
    anchor: [0.76, 1.34, 0.52],
  },
};

export function getPartDefinition(id: PartId): PartDefinition {
  return H100_PARTS[id];
}

export function getPartDefinitions(): readonly PartDefinition[] {
  return PART_ORDER.map(getPartDefinition);
}
