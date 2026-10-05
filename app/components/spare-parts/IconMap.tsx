import {
  AirVent,
  Box,
  Cpu,
  Droplets,
  Fan,
  Filter,
  Gauge,
  Grid2X2,
  Hammer,
  Layers3,
  Package,
  Refrigerator,
  Settings,
  ShieldCheck,
  Thermometer,
  WashingMachine,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

export const iconMap = {
  air: AirVent,
  "air-conditioner": AirVent,
  ac: AirVent,

  fan: Fan,
  blower: Wind,
  wind: Wind,

  refrigerator: Refrigerator,
  fridge: Refrigerator,

  "washing-machine": WashingMachine,
  washingmachine: WashingMachine,
  washer: WashingMachine,

  water: Droplets,
  pump: Droplets,
  drainage: Droplets,

  electrical: Zap,
  electric: Zap,
  capacitor: Zap,
  relay: Zap,

  sensor: Thermometer,
  thermostat: Thermometer,
  temperature: Thermometer,

  motor: Settings,
  compressor: Settings,
  mechanical: Settings,
  gear: Settings,

  filter: Filter,

  pcb: Cpu,
  board: Cpu,
  control: Cpu,
  electronics: Cpu,

  gauge: Gauge,
  pressure: Gauge,

  protection: ShieldCheck,
  shield: ShieldCheck,

  tools: Wrench,
  wrench: Wrench,
  repair: Hammer,

  parts: Package,
  package: Package,
  box: Box,

  category: Grid2X2,
  categories: Grid2X2,
  layers: Layers3,
} as const;

export type IconMapKey = keyof typeof iconMap;

export function getIcon(
  icon?: string | null,
  fallback: IconMapKey = "category",
) {
  if (!icon) {
    return iconMap[fallback];
  }

  const normalized = String(icon)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

  return (
    iconMap[normalized as IconMapKey] ||
    iconMap[fallback]
  );
}

export function getCategoryIcon(
  name?: string | null,
  icon?: string | null,
) {
  if (icon) {
    const mapped = getIcon(icon);

    if (mapped) {
      return mapped;
    }
  }

  const value = String(name || "").toLowerCase();

  if (
    value.includes("compressor") ||
    value.includes("motor") ||
    value.includes("gear") ||
    value.includes("bearing")
  ) {
    return Settings;
  }

  if (
    value.includes("filter") ||
    value.includes("screen")
  ) {
    return Filter;
  }

  if (
    value.includes("pump") ||
    value.includes("water") ||
    value.includes("drain")
  ) {
    return Droplets;
  }

  if (
    value.includes("pcb") ||
    value.includes("board") ||
    value.includes("control") ||
    value.includes("module")
  ) {
    return Cpu;
  }

  if (
    value.includes("capacitor") ||
    value.includes("relay") ||
    value.includes("electrical") ||
    value.includes("electric")
  ) {
    return Zap;
  }

  if (
    value.includes("sensor") ||
    value.includes("thermostat") ||
    value.includes("temperature")
  ) {
    return Thermometer;
  }

  if (
    value.includes("fan") ||
    value.includes("blower") ||
    value.includes("condenser")
  ) {
    return Fan;
  }

  if (
    value.includes("air") ||
    value.includes("ac")
  ) {
    return AirVent;
  }

  if (
    value.includes("refrigerator") ||
    value.includes("fridge")
  ) {
    return Refrigerator;
  }

  if (
    value.includes("washing") ||
    value.includes("washer")
  ) {
    return WashingMachine;
  }

  if (
    value.includes("tool") ||
    value.includes("repair")
  ) {
    return Wrench;
  }

  if (
    value.includes("protection") ||
    value.includes("safety") ||
    value.includes("shield")
  ) {
    return ShieldCheck;
  }

  return Grid2X2;
}

export default iconMap;