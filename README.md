# GPU Glossary

An interactive 3D guide to NVIDIA data center hardware, from a single GPU module up to a full rack. Switch exhibits with the tabs in the header, rotate each model, inspect its physical and conceptual parts, and open the matching reference: an entry in the [Modal GPU Glossary](https://modal.com/gpu-glossary/device-hardware/cuda-device-architecture) where one exists, or NVIDIA's product documentation for system-level parts the glossary does not cover.

The site uses Next.js and React Three Fiber. Every exhibit is built from procedural Three.js geometry, so the project does not depend on an external 3D asset.

- `/` shows the H100 SXM5 module.
- `/b200` shows the B200 SXM6 module.
- `/gb300` shows the GB300 Grace Blackwell Ultra Superchip board.
- `/nvl72` shows the GB300 NVL72 rack.

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
- [Tensor Memory](https://modal.com/gpu-glossary/device-hardware/tensor-memory) (B200 only)
- [Texture Processing Cluster](https://modal.com/gpu-glossary/device-hardware/texture-processing-cluster)
- [Streaming Multiprocessor Architecture](https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor-architecture)
- [Warp Scheduler](https://modal.com/gpu-glossary/device-hardware/warp-scheduler)
- [Register File](https://modal.com/gpu-glossary/device-hardware/register-file)
- [Core](https://modal.com/gpu-glossary/device-hardware/core)
- [Special Function Unit](https://modal.com/gpu-glossary/device-hardware/special-function-unit)
- [Load/Store Unit](https://modal.com/gpu-glossary/device-hardware/load-store-unit)
- [L1 Data Cache](https://modal.com/gpu-glossary/device-hardware/l1-data-cache)

Together these cover every entry in the glossary's device-hardware section. The SM internals appear in an "SM detail" inset that floats beside the die in the H100 and B200 architecture views, connected to the SM block by a callout line.

The GB300 and NVL72 exhibits also link to NVIDIA pages for parts with no glossary entry: the [Blackwell architecture](https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture/), [Grace CPU](https://www.nvidia.com/en-us/data-center/grace-cpu/), [NVLink](https://www.nvidia.com/en-us/data-center/nvlink/), [NVLink-C2C](https://www.nvidia.com/en-us/data-center/nvlink-c2c/), and the [GB300 NVL72](https://www.nvidia.com/en-us/data-center/gb300-nvl72/) system. Popover buttons say which kind of reference they open.

Modal's glossary is the primary editorial and design reference for this project. NVIDIA documentation and photographed hardware references are used separately to constrain the hardware reconstructions. This is an independent educational project and is not affiliated with or endorsed by Modal or NVIDIA.

## Run the site

Install the dependencies and start the development server on port 3024:

```bash
pnpm install
pnpm dev --port 3024
```

Open [http://localhost:3024](http://localhost:3024).

This project uses pnpm, and `packageManager` pins the version so Corepack picks it up automatically. Two committed files carry the configuration:

- `pnpm-lock.yaml` is the lockfile. The deployment installs from it with `pnpm install --frozen-lockfile`.
- `pnpm-workspace.yaml` holds the dependency pins and the build allowlist. pnpm 11 reads both from there rather than from `package.json`, and it fails the install outright if `sharp` and `unrs-resolver` are not allowlisted.

## Use the explorer

- Drag the model to rotate it.
- Scroll or pinch to zoom.
- Hover a component to open its description.
- Click a component or glossary link to open the related Modal page.
- Switch between **Exterior** and **Architecture** without losing the selected view when you hover another part.
- Use the **H100**, **B200**, **GB300**, and **NVL72** tabs in the header to change exhibit.
- On the NVL72, press **Explode** to lift every tray out of the rack into a floating spiral. Orbit the pieces and hover the GPUs, CPUs, and switch chips sitting on each tray. **Assemble** or **Reset view** puts the rack back together.
- Press Escape to clear the active component.

Popovers open next to the pointer when you hover a 3D part, and at a fixed anchor when you hover the component index. A short linger keeps a popover open while the pointer crosses a gap between neighboring parts or moves onto the card itself.

The **Exterior** view shows the physical hardware. The **Architecture** view adds a conceptual overlay. For the H100 and B200 that is a map of GPU processing clusters, streaming multiprocessors, Tensor Cores, CUDA Cores, and the Tensor Memory Accelerator, plus Tensor Memory on the B200, together with the SM detail inset showing the four SM partitions with their warp schedulers, register files, cores, Tensor Cores, special function units, and load/store units above a shared L1 data cache. For the GB300 it shows the NVLink-C2C links between Grace and each GPU, the 72 Grace cores, and the NVLink 5 paths to the board edge. For the NVL72 it opens every compute and switch tray into a shelf so the 72 GPUs, 36 Grace CPUs, and 18 NVLink Switch chips are visible, and lights up the NVLink spine.

## Accuracy boundary

The exterior is a reference-based reconstruction, not a dimension-certified CAD model. It follows the visible top-side construction of the H100 SXM5, including the central GH100 package, the power stages, the mounting points, and the controller daughterboard.

The package contains five active HBM3 stacks and one structural dummy site. [NVIDIA documents the five active HBM3 stacks](https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/). [Reporting about the photographed module](https://www.comptoir-hardware.com/actus/cartes-graphiques/45965-le-h100-hopper-prend-la-pose-sacre-engin-.html) identifies the sixth physical site as a stabilizer.

The B200 exterior follows the same approach for the SXM6 module. Its package holds two reticle-limited Blackwell dies joined by the NV-HBI bridge and eight HBM3e stacks, four on each side of the die pair. [NVIDIA documents the dual-die design and eight HBM3e stacks](https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture/); the on-package arrangement is reconstructed from published package photography and is illustrative rather than dimension-certified. Modal's glossary has no NV-HBI entry, so the bridge is rendered as part of the CUDA architecture group rather than as a separately linked component.

The GB300 board places one Grace CPU with eight LPDDR5X modules beside two Blackwell Ultra GPU packages and two NVLink edge connectors. Component counts follow NVIDIA's published superchip specifications; the board layout itself is illustrative.

The NVL72 rack follows the published GB300 NVL72 configuration. Vendor documentation confirms 18 liquid-cooled 1U compute trays holding two Grace CPUs and four Blackwell B300 GPUs each at 288 GB of HBM3e per GPU, nine 1U NVLink Switch trays with two switch chips each, eight power shelves of six 5.5 kW supplies located at the top and bottom of the rack, a rear cable cartridge backplane, and rear cooling manifolds. Those counts and placements are reproduced faithfully.

Two details are illustrative. The split of compute trays above and below the switch trays is not stated in the documentation consulted, and the chip positions within a tray are schematic: the model groups each tray into two superchip modules to show the Grace-to-GPU pairing rather than to reproduce a board layout. The rack also omits the CDU, busbar, and cable management that occupy the remaining rack units.

The architecture overlays are educational. They do not claim to reproduce NVIDIA's physical die floorplans. The project also omits unsupported underside detail rather than inventing connector geometry.

## Code structure

```text
app/
  globals.css                         terminal-style layout, GPU tabs, and responsive UI
  layout.tsx                          document shell and default metadata
  page.tsx                            H100 route
  b200/page.tsx                       B200 route
  gb300/page.tsx                      GB300 superchip route
  nvl72/page.tsx                      NVL72 rack route
features/
  exhibits/types.ts                   shared Exhibit, PartDefinition, PartId, and camera types
  exhibits/h100.ts                    H100 copy, links, views, camera, and popover anchors
  exhibits/b200.ts                    B200 copy, links, views, camera, and popover anchors
  exhibits/gb300.ts                   GB300 copy, links, views, camera, and popover anchors
  exhibits/nvl72.ts                   NVL72 copy, links, views, camera, and popover anchors
  exhibits/index.ts                   exhibit registry and header tab order
  gpu-explorer/GpuExperience.tsx      page UI, GPU tabs, and explorer state wiring
  gpu-explorer/SceneViewport.tsx      Three.js canvas, camera, controls, and popovers
  gpu-explorer/models.ts              exhibit id to procedural model component
  gpu-explorer/modelPrimitives.tsx    shared materials, interactive groups, HBM stacks, mounts
  gpu-explorer/SmInset.tsx            floating SM detail inset shared by the H100 and B200
  gpu-explorer/H100Model.tsx          procedural H100 exterior and architecture overlay
  gpu-explorer/B200Model.tsx          procedural B200 module and the reusable Blackwell package
  gpu-explorer/GB300Model.tsx         procedural GB300 superchip board
  gpu-explorer/NVL72Model.tsx         procedural NVL72 rack, trays, spine, manifolds, and explode animation
  gpu-explorer/h100Geometry.ts        typed SXM5 geometry data
  gpu-explorer/b200Geometry.ts        typed SXM6 geometry data
  gpu-explorer/gb300Geometry.ts       typed superchip board geometry data
  gpu-explorer/nvl72Geometry.ts       typed rack layout and tray slot data
  gpu-explorer/interaction.ts         reducer and pointer gesture rules
```

`features/exhibits/` is the content boundary. Each exhibit owns its component names, descriptions, glossary destinations, required views, and popover anchors. The geometry files own repeated physical geometry such as the HBM sites and mounting points. The renderer consumes both without embedding glossary copy in the Three.js scene. Each exhibit also carries its own camera preset, so a flat board and a tall rack frame correctly in the same viewport. Adding another exhibit means adding an exhibit file, a geometry file, a model component, a registry entry, and a route.

## Checks

Run the full local verification set:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The tests cover explorer state, cross-view hover behavior, pointer-anchored previews, explode mode, pointer gesture arbitration, the SXM board proportions, the H100's active HBM3 stack count, the B200's dual-die and eight-stack HBM3e layout, the GB300's CPU, GPU, memory, and connector counts, and the NVL72's tray layout, GPU and CPU totals, and spine extent.

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
