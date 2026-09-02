import type { ComponentType } from "react";
import type { ExhibitId } from "@/features/exhibits";
import { B200Model } from "./B200Model";
import { GB300Model } from "./GB300Model";
import { H100Model } from "./H100Model";
import type { ModelProps } from "./modelPrimitives";
import { NVL72Model } from "./NVL72Model";

export const MODELS: Readonly<Record<ExhibitId, ComponentType<ModelProps>>> = {
  h100: H100Model,
  b200: B200Model,
  gb300: GB300Model,
  nvl72: NVL72Model,
};
