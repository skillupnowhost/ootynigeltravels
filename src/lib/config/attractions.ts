// Photography for places without an existing local asset originates from
// Wikimedia Commons (freely licensed, verified live via their search API) and
// is downloaded into public/images/attractions/ rather than hotlinked, since
// upload.wikimedia.org rate-limits bursts of concurrent requests from one
// server — swap for licensed brand photography before launch.
export type AttractionCategory =
  | "Hill Town"
  | "Region"
  | "Viewpoint"
  | "Lake"
  | "Tea Culture"
  | "Forest"
  | "Garden"
  | "Waterfall"
  | "Wildlife"
  | "Grassland"
  | "Heritage";

export interface Attraction {
  slug: string;
  name: string;
  category: AttractionCategory;
  blurb: string;
  image: string;
}

export const ATTRACTIONS: Attraction[] = [
  {
    slug: "ooty",
    name: "Ooty (Udhagamandalam)",
    category: "Hill Town",
    blurb: "The Queen of Hill Stations — misty lakes, colonial charm and the Nilgiris' liveliest town centre.",
    image: "/images/destinations/ooty.jpg",
  },
  {
    slug: "nilgiris",
    name: "The Nilgiris",
    category: "Region",
    blurb: "Rolling blue hills, shola forests and tea country stretching across three hill towns.",
    image: "/images/attractions/nilgiris.jpg",
  },
  {
    slug: "coonoor",
    name: "Coonoor",
    category: "Hill Town",
    blurb: "A quieter, greener hill town wrapped in tea estates and dramatic escarpment views.",
    image: "/images/destinations/coonoor.jpg",
  },
  {
    slug: "kotagiri",
    name: "Kotagiri",
    category: "Hill Town",
    blurb: "The oldest Nilgiri hill town — cooler air, fewer crowds, and Catherine Falls close by.",
    image: "/images/destinations/kotagiri.jpg",
  },
  {
    slug: "doddabetta-peak",
    name: "Doddabetta Peak",
    category: "Viewpoint",
    blurb: "The highest point in the Nilgiris — a 360° panorama over the entire hill range.",
    image: "/images/attractions/doddabetta-peak.jpg",
  },
  {
    slug: "pykara-lake",
    name: "Pykara Lake",
    category: "Lake",
    blurb: "Pine-fringed waters, a golden-hour boat ride, and the Nilgiris' most cinematic drive.",
    image: "/images/attractions/pykara-lake.jpg",
  },
  {
    slug: "avalanche-lake",
    name: "Avalanche Lake",
    category: "Lake",
    blurb: "A restricted-access valley of untouched shola forest and glassy reservoirs.",
    image: "/images/destinations/avalanche-lake.jpg",
  },
  {
    slug: "tea-gardens",
    name: "Tea Gardens",
    category: "Tea Culture",
    blurb: "Emerald rows of working tea estates threaded through Coonoor's ridgelines.",
    image: "/images/attractions/tea-gardens.jpg",
  },
  {
    slug: "pine-forest",
    name: "Pine Forest",
    category: "Forest",
    blurb: "Tall, whispering pine groves near Pykara — a favourite quiet-walk photo stop.",
    image: "/images/attractions/pine-forest.jpg",
  },
  {
    slug: "botanical-garden",
    name: "Botanical Garden",
    category: "Garden",
    blurb: "Terraced Government Botanical Garden — rare blooms, a fossil tree, and Italian-style lawns.",
    image: "/images/attractions/botanical-garden.jpg",
  },
  {
    slug: "rose-garden",
    name: "Rose Garden",
    category: "Garden",
    blurb: "Asia's largest rose garden — thousands of varieties terraced down a hillside.",
    image: "/images/attractions/rose-garden.jpg",
  },
  {
    slug: "shooting-point",
    name: "Shooting Point",
    category: "Viewpoint",
    blurb: "A classic film-shoot backdrop on the Pykara road — sweeping valley and forest views.",
    image: "/images/attractions/shooting-point.jpg",
  },
  {
    slug: "dolphins-nose",
    name: "Dolphin's Nose",
    category: "Viewpoint",
    blurb: "A dramatic cliff-edge lookout over Coonoor's valley and the Catherine Falls gorge.",
    image: "/images/attractions/dolphins-nose.jpg",
  },
  {
    slug: "catherine-falls",
    name: "Catherine Falls",
    category: "Waterfall",
    blurb: "A two-tiered, thundering waterfall tucked into the forest near Kotagiri.",
    image: "/images/attractions/catherine-falls.jpg",
  },
  {
    slug: "mudumalai-national-park",
    name: "Mudumalai National Park",
    category: "Wildlife",
    blurb: "Dense deciduous forest home to elephant herds, tigers, and a dawn jeep safari.",
    image: "/images/destinations/mudumalai.jpg",
  },
  {
    slug: "wenlock-downs",
    name: "Wenlock Downs",
    category: "Grassland",
    blurb: "Open rolling grassland once used for horse racing — now a golf course and picnic favourite.",
    image: "/images/attractions/wenlock-downs.jpg",
  },
  {
    slug: "tea-factory-museum",
    name: "Tea Factory & Museum",
    category: "Tea Culture",
    blurb: "Watch withering, rolling and grading up close, then taste freshly graded Nilgiri leaf.",
    image: "/images/attractions/tea-factory-museum.jpg",
  },
  {
    slug: "ooty-lake",
    name: "Ooty Lake",
    category: "Lake",
    blurb: "A serene, eucalyptus-fringed lake at the heart of town — the classic boat-ride stop.",
    image: "/images/destinations/ooty-lake.jpg",
  },
  {
    slug: "nilgiri-mountain-railway",
    name: "Nilgiri Mountain Railway",
    category: "Heritage",
    blurb: "A UNESCO World Heritage steam toy train, switchbacking through 46 tunnels up the ghats.",
    image: "/images/attractions/nilgiri-mountain-railway.jpg",
  },
  {
    slug: "sims-park",
    name: "Sim's Park",
    category: "Garden",
    blurb: "A terraced botanical park in Coonoor, laid out along a natural ravine.",
    image: "/images/attractions/sims-park.jpg",
  },
  {
    slug: "kodanad-viewpoint",
    name: "Kodanad Viewpoint",
    category: "Viewpoint",
    blurb: "Sweeping sunrise views over the Nilgiri foothills and the Moyar river valley below.",
    image: "/images/attractions/kodanad-viewpoint.jpg",
  },
  {
    slug: "elk-falls",
    name: "Elk Falls",
    category: "Waterfall",
    blurb: "A tucked-away cascade near Kotagiri, framed by dense forest and few crowds.",
    image: "/images/attractions/elk-falls.jpg",
  },
];
