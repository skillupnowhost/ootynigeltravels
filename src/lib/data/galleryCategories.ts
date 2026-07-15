import type { ScenicVariant } from "@/components/ui/ScenicArt";

export interface GalleryCategory {
  slug: string;
  label: string;
  description: string;
  seedVariant: ScenicVariant;
}

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  { slug: "ooty", label: "Ooty", description: "The heart of the Nilgiris — mist, lakes and colonial charm.", seedVariant: "mountains" },
  { slug: "coonoor", label: "Coonoor", description: "Quieter hill town, sweeping valley viewpoints.", seedVariant: "tea-rows" },
  { slug: "kotagiri", label: "Kotagiri", description: "The oldest hill station, wrapped in tea gardens.", seedVariant: "tea-rows" },
  { slug: "avalanche", label: "Avalanche", description: "Emerald lake country, deep inside the reserve forest.", seedVariant: "lake" },
  { slug: "pykara", label: "Pykara", description: "Boating lake and cascading falls on the plateau's edge.", seedVariant: "lake" },
  { slug: "doddabetta", label: "Doddabetta", description: "The Nilgiris' highest peak and its telescope-house views.", seedVariant: "mountains" },
  { slug: "tea-estates", label: "Tea Estates", description: "Rolling terraced gardens and working tea factories.", seedVariant: "tea-rows" },
  { slug: "waterfalls", label: "Waterfalls", description: "Cascades tucked into the shola forest.", seedVariant: "forest" },
  { slug: "lakes", label: "Lakes", description: "Still water, reflected peaks, early morning boats.", seedVariant: "lake" },
  { slug: "forest", label: "Forest", description: "Shola forest, pine groves and misty trails.", seedVariant: "forest" },
  { slug: "adventure", label: "Adventure", description: "Trekking, trails and open-air thrills.", seedVariant: "wildlife" },
  { slug: "wildlife", label: "Wildlife", description: "Elephants, deer and birdlife of the Nilgiri Biosphere.", seedVariant: "wildlife" },
  { slug: "vehicles", label: "Vehicles", description: "Our fleet — comfortable, well-kept, ready for the hills.", seedVariant: "mountains" },
  { slug: "customer-memories", label: "Customer Memories", description: "Real trips, real guests, real smiles.", seedVariant: "wildlife" },
  { slug: "drone-photography", label: "Drone Photography", description: "The Nilgiris from above.", seedVariant: "mountains" },
  { slug: "sunrise", label: "Sunrise", description: "First light over the hills.", seedVariant: "mountains" },
  { slug: "sunset", label: "Sunset", description: "Golden hour across the valley.", seedVariant: "lake" },
  { slug: "food", label: "Food", description: "Nilgiri cuisine, local flavours and hot cups of tea.", seedVariant: "tea-rows" },
  { slug: "hotels", label: "Hotels", description: "Where our guests rest between adventures.", seedVariant: "mountains" },
  { slug: "festivals", label: "Festivals", description: "Local celebrations and seasonal colour.", seedVariant: "wildlife" },
];

export function galleryCategoryLabel(slug: string): string {
  return GALLERY_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
