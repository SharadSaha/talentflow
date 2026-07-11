import {
  Aperture,
  Boxes,
  Component,
  Hexagon,
  type LucideIcon,
  Layers,
  Orbit,
  Triangle,
} from 'lucide-react';

export interface CompanyBrand {
  name: string;
  /** A neutral logomark stand-in (Lucide icon), so no real brand assets are used. */
  icon: LucideIcon;
}

/** Fictional enterprises for the "trusted by" strip. All names are invented. */
export const COMPANIES: CompanyBrand[] = [
  { name: 'NovaTech', icon: Orbit },
  { name: 'SkyEdge', icon: Triangle },
  { name: 'Vertex', icon: Hexagon },
  { name: 'Atlas', icon: Layers },
  { name: 'Lumina', icon: Aperture },
  { name: 'Northwind', icon: Component },
  { name: 'Quantic', icon: Boxes },
];
