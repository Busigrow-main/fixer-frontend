import { 
  Refrigerator, 
  WashingMachine, 
  AirVent as AirConditioner, 
  Microwave, 
  Droplets as WaterPurifier, 
  Tv, 
  Flame as Droplets, // Geyser/Geyser icon mismatch in seed, using Flame
  AirVent,
  Wind as Fan,
  HardDrive as Chimney,
  Box,
  Cpu,
  ShieldCheck,
  Zap,
  Hammer
} from 'lucide-react';

export const getApplianceIcon = (iconName: string, className?: string) => {
  const icons: Record<string, any> = {
    'Refrigerator': Refrigerator,
    'WashingMachine': WashingMachine,
    'AirConditioner': AirConditioner,
    'Microwave': Microwave,
    'WaterPurifier': WaterPurifier,
    'Tv': Tv,
    'Droplets': Droplets,
    'Fan': Fan,
    'Chimney': Chimney,
    'Box': Box,
    'Cpu': Cpu,
    'ShieldCheck': ShieldCheck,
    'Zap': Zap,
    'Hammer': Hammer
  };

  const IconComponent = icons[iconName] || Box;
  return <IconComponent className={className} />;
};
