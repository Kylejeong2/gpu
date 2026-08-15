# H100 GPU Glossary

An interactive 3D guide to the NVIDIA H100 SXM5 module. Rotate the module, inspect its physical and conceptual parts, and open the matching entries in the [Modal GPU Glossary](https://modal.com/gpu-glossary/device-hardware/cuda-device-architecture).

The site uses Next.js and React Three Fiber. The H100 is built from procedural Three.js geometry, so the project does not depend on an external 3D asset.

## Built from Modal's GPU Glossary

This project began with [Modal's GPU Glossary](https://modal.com/gpu-glossary/device-hardware/cuda-device-architecture). The glossary provides the conceptual structure, terminology, and source material for the interactive explanations. Its green-on-black palette, monospace typography, borders, and documentation-first layout also informed the visual design of this site.

The 3D explorer turns a connected set of Modal glossary entries into a spatial interface. Every interactive component links back to its corresponding source page:

- [CUDA device architecture](https://modal.com/gpu-glossary/device-hardware/cuda-device-architecture)
- [GPU RAM](https://modal.com/gpu-glossary/device-hardware/gpu-ram)
- [Graphics/GPU Processing Cluster](https://modal.com/gpu-glossary/device-hardware/graphics-processing-cluster)
- [Streaming Multiprocessor](https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor)
- [Tensor Core](https://modal.com/gpu-glossary/device-hardware/tensor-core)
- [CUDA Core](https://modal.com/gpu-glossary/device-hardware/cuda-core)
- [Tensor Memory Accelerator](https://modal.com/gpu-glossary/device-hardware/tensor-memory-accelerator)

Modal's glossary is the primary editorial and design reference for this project. NVIDIA documentation and photographed hardware references are used separately to constrain the H100 reconstruction. This is an independent educational project and is not affiliated with or endorsed by Modal or NVIDIA.

## Run the site

Install the dependencies:

```bash
npm ci
```

Start the development server on port 3024:

```bash
npm run dev -- --port 3024
```

Open [http://localhost:3024](http://localhost:3024).

## Use the explorer

- Drag the model to rotate it.
- Scroll or pinch to zoom.
- Hover a component to open its description.
- Click a component or glossary link to open the related Modal page.
- Switch between **Exterior** and **Architecture** without losing the selected view when you hover another part.
- Press Escape to clear the active component.

The **Exterior** view shows the physical module. The **Architecture** view adds a conceptual map of GPU processing clusters, streaming multiprocessors, Tensor Cores, CUDA Cores, and the Tensor Memory Accelerator.

## Accuracy boundary

The exterior is a reference-based reconstruction, not a dimension-certified CAD model. It follows the visible top-side construction of the H100 SXM5, including the central GH100 package, the power stages, the mounting points, and the controller daughterboard.

The package contains five active HBM3 stacks and one structural dummy site. [NVIDIA documents the five active HBM3 stacks](https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/). [Reporting about the photographed module](https://www.comptoir-hardware.com/actus/cartes-graphiques/45965-le-h100-hopper-prend-la-pose-sacre-engin-.html) identifies the sixth physical site as a stabilizer.

The architecture overlay is educational. It does not claim to reproduce NVIDIA's physical die floorplan. The project also omits unsupported underside detail rather than inventing connector geometry.

## Code structure

```text
app/
  globals.css                         terminal-style layout and responsive UI
  layout.tsx                          page metadata and document shell
  page.tsx                            route entry point
features/
  exhibits/h100.ts                    glossary copy, links, views, and popover anchors
  h100-explorer/H100Experience.tsx    page UI and explorer state wiring
  h100-explorer/SceneViewport.tsx     Three.js canvas, camera, controls, and popovers
  h100-explorer/H100Model.tsx         procedural H100 exterior and architecture overlay
  h100-explorer/h100Geometry.ts       typed SXM5 geometry data
  h100-explorer/interaction.ts        reducer and pointer gesture rules
```

`features/exhibits/h100.ts` is the content boundary. It owns the component names, descriptions, glossary destinations, required views, and popover anchors. `h100Geometry.ts` owns repeated physical geometry such as the HBM sites and mounting points. The renderer consumes both models without embedding glossary copy in the Three.js scene.

## Checks

Run the full local verification set:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The tests cover explorer state, cross-view hover behavior, pointer gesture arbitration, the SXM5 board proportions, and the active HBM3 stack count.

## Stack

- Next.js 15
- React 19
- React Three Fiber
- Drei
- Three.js
- TypeScript
- Vitest

## License

The code in this repository is available under the [MIT License](LICENSE). Modal and NVIDIA retain ownership of their respective names, products, and linked reference material.
