import fs from "node:fs";
import path from "node:path";
import { openDb, ROOT } from "./lib/db.mjs";
import { hashPassword } from "./lib/password.mjs";

const db = await openDb();

async function insertIfEmpty(table, rows, insertFn) {
  const { c } = await db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get();
  if (c > 0) {
    console.log(`skip ${table} (already has ${c} rows)`);
    return;
  }
  await db.exec("BEGIN");
  try {
    for (const row of rows) await insertFn(row);
    await db.exec("COMMIT");
    console.log(`seeded ${table}: ${rows.length} rows`);
  } catch (err) {
    await db.exec("ROLLBACK");
    throw err;
  }
}

// ---------- Admin user ----------
{
  const { c } = await db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get();
  if (c === 0) {
    const password = "OotyNigel@" + Math.random().toString(36).slice(2, 8);
    const hash = hashPassword(password);
    await db.prepare(
      `INSERT INTO users (role, name, phone, email, password_hash) VALUES ('admin', 'Site Administrator', '9000000000', 'admin@ootynigeltravels.com', ?)`
    ).run(hash);
    console.log("\n=== ADMIN ACCOUNT CREATED ===");
    console.log("  Phone:    9000000000");
    console.log(`  Password: ${password}`);
    console.log("  Sign in at /admin/login — change this password after first login.\n");
  } else {
    console.log("skip admin user (already exists)");
  }
}

// ---------- Drivers ----------
await insertIfEmpty(
  "drivers",
  [
    {
      slug: "suresh-kumar",
      name: "Suresh Kumar",
      phone: "9440011122",
      license_no: "TN43-2011-0045821",
      photo: null,
      experience_years: 15,
      languages: ["English", "Tamil", "Hindi"],
      rating: 4.9,
      bio: "Fifteen years navigating the Nilgiri ghats — Suresh knows every hairpin bend, viewpoint and shortcut between Ooty and Mudumalai.",
    },
    {
      slug: "ravi-prakash",
      name: "Ravi Prakash",
      phone: "9440022233",
      license_no: "TN43-2015-0078213",
      photo: null,
      experience_years: 10,
      languages: ["English", "Tamil", "Kannada"],
      rating: 4.8,
      bio: "A specialist in early-sunrise Doddabetta runs and calm, unhurried driving for family groups.",
    },
    {
      slug: "manoj-bose",
      name: "Manoj Bose",
      phone: "9440033344",
      license_no: "TN43-2018-0091456",
      photo: null,
      experience_years: 8,
      languages: ["English", "Hindi", "Bengali"],
      rating: 4.7,
      bio: "Fluent in Hindi and Bengali — the preferred pairing for guests visiting from North and East India.",
    },
  ],
  (d) =>
    db
      .prepare(
        `INSERT INTO drivers (slug, name, phone, license_no, photo, experience_years, languages, rating, bio)
         VALUES (@slug, @name, @phone, @license_no, @photo, @experience_years, @languages, @rating, @bio)`
      )
      .run({ ...d, languages: JSON.stringify(d.languages) })
);

// ---------- Fleet ----------
await insertIfEmpty(
  "fleet",
  [
    {
      slug: "mercedes-gls-580",
      name: "Mercedes-Benz GLS 580",
      category: "Luxury SUV",
      seats: 6,
      luggage: "4 large + 2 cabin",
      price_per_day: 18000,
      model_kind: "3d",
      hero_asset: "/models/gls.fbx",
      gallery: JSON.stringify([]),
      features: JSON.stringify([
        "Captain seats with massage function",
        "Panoramic sunroof",
        "Chauffeur in formal uniform",
        "Complimentary chilled water & Wi-Fi",
      ]),
    },
    {
      slug: "audi-a3",
      name: "Audi A3 Premium",
      category: "Premium Sedan",
      seats: 4,
      luggage: "2 large + 1 cabin",
      price_per_day: 9000,
      model_kind: "photo",
      hero_asset: "/images/fleet/audi-a3-three-quarter.png",
      gallery: JSON.stringify([
        "/images/fleet/audi-a3-three-quarter.png",
        "/images/fleet/audi-a3-front.png",
      ]),
      features: JSON.stringify([
        "German-engineered ride comfort",
        "Leather upholstery",
        "Ideal for couples & business travel",
      ]),
    },
    {
      slug: "toyota-innova-crysta",
      name: "Toyota Innova Crysta",
      category: "Family MPV",
      seats: 7,
      luggage: "3 large + 2 cabin",
      price_per_day: 6500,
      model_kind: "photo",
      hero_asset: "/images/fleet/toyota-innova-front.png",
      gallery: JSON.stringify([
        "/images/fleet/toyota-innova-front.png",
        "/images/fleet/toyota-innova-rear.png",
      ]),
      features: JSON.stringify([
        "Best-in-class ground clearance for ghat roads",
        "Captain seating in row two",
        "Preferred for family groups of 5-7",
      ]),
    },
    {
      slug: "tempo-traveller-12",
      name: "Tempo Traveller",
      category: "Group Traveller",
      seats: 12,
      luggage: "Roof carrier + rear boot",
      price_per_day: 11000,
      model_kind: "photo",
      hero_asset: "/images/fleet/tempo-traveller.png",
      gallery: JSON.stringify(["/images/fleet/tempo-traveller.png"]),
      features: JSON.stringify([
        "Push-back reclining seats",
        "Ideal for corporate & wedding groups",
        "Onboard music system",
      ]),
    },
    {
      slug: "maruti-dzire",
      name: "Maruti Suzuki Dzire",
      category: "Economy Sedan",
      seats: 4,
      luggage: "2 medium",
      price_per_day: 4500,
      model_kind: "photo",
      hero_asset: "/images/fleet/maruti-dzire-three-quarter.png",
      gallery: JSON.stringify([
        "/images/fleet/maruti-dzire-three-quarter.png",
        "/images/fleet/maruti-dzire-left.png",
        "/images/fleet/maruti-dzire-front.png",
      ]),
      features: JSON.stringify([
        "Fuel-efficient for longer transfers",
        "Compact and easy through hill-town traffic",
      ]),
    },
  ],
  (f) =>
    db
      .prepare(
        `INSERT INTO fleet (slug, name, category, seats, luggage, price_per_day, model_kind, hero_asset, gallery, features)
         VALUES (@slug, @name, @category, @seats, @luggage, @price_per_day, @model_kind, @hero_asset, @gallery, @features)`
      )
      .run(f)
);

// ---------- Destinations ----------
// Ordered per the homepage brief: Ooty first, then Mudumalai, Pykara, Coonoor,
// Avalanche, then the remaining nearby sites.
const DESTINATIONS_SEED = [
  {
    slug: "ooty",
    name: "Ooty (Udhagamandalam)",
    region: "The Nilgiris",
    description:
      "The Queen of Hill Stations — misty botanical gardens, a colonial-era toy train, and Doddabetta's panoramic summit.",
    image: "/images/destinations/ooty.jpg",
    highlights: ["Government Botanical Garden", "Ooty Lake", "Doddabetta Peak", "Nilgiri Mountain Railway"],
    best_season: "October to June",
    distance_from_ooty: "0 km",
    images: [
      { src: "/images/destinations/ooty.jpg", alt: "Ooty town wrapped in evening mist" },
      { src: "/images/attractions/rose-garden.jpg", alt: "Terraced blooms at the Government Rose Garden" },
      { src: "/images/attractions/botanical-garden.jpg", alt: "Government Botanical Garden lawns" },
      { src: "/images/attractions/nilgiris.jpg", alt: "Rolling green hills around Ooty" },
      { src: "/images/attractions/shooting-point.jpg", alt: "Shooting Point valley view" },
    ],
  },
  {
    slug: "mudumalai",
    name: "Mudumalai National Park",
    region: "Nilgiri Biosphere",
    description:
      "Dense deciduous forest at the Tamil Nadu–Karnataka–Kerala tri-junction, home to elephant herds, tigers and langurs.",
    image: "/images/destinations/mudumalai.jpg",
    highlights: ["Jeep safari", "Elephant camp", "Moyar river gorge"],
    best_season: "November to April",
    distance_from_ooty: "65 km",
    images: [
      { src: "/images/destinations/mudumalai.jpg", alt: "Mudumalai National Park forest canopy" },
      { src: "/images/destinations/mudumalai-2.jpg", alt: "Wild elephant herd in Mudumalai National Park" },
      { src: "/images/destinations/mudumalai-3.jpg", alt: "Jeep safari track through Mudumalai forest" },
      { src: "/images/destinations/mudumalai-4.jpg", alt: "Spotted deer grazing in Mudumalai National Park" },
    ],
  },
  {
    slug: "pykara-lake",
    name: "Pykara Lake",
    region: "The Nilgiris",
    description:
      "Pine-fringed waters, a golden-hour boat ride, and one of the Nilgiris' most cinematic drives out of Ooty.",
    image: "/images/attractions/pykara-lake.jpg",
    highlights: ["Pykara boat house", "Pykara Falls", "Pine forest drive"],
    best_season: "October to May",
    distance_from_ooty: "19 km",
    images: [
      { src: "/images/attractions/pykara-lake.jpg", alt: "Pykara Lake boat jetty at sunrise" },
      { src: "/images/destinations/pykara-lake-2.jpg", alt: "Pine-fringed shoreline at Pykara Lake" },
      { src: "/images/destinations/pykara-lake-3.jpg", alt: "Boating on Pykara Lake" },
      { src: "/images/destinations/pykara-lake-4.jpg", alt: "Pykara Falls cascading through the pines" },
      { src: "/images/destinations/pykara-lake-5.jpg", alt: "Misty pine forest drive near Pykara" },
    ],
  },
  {
    slug: "coonoor",
    name: "Coonoor",
    region: "The Nilgiris",
    description:
      "A quieter, greener hill town wrapped in tea estates, with Sim's Park and dramatic viewpoints over the Nilgiri escarpment.",
    image: "/images/destinations/coonoor.jpg",
    highlights: ["Sim's Park", "Lamb's Rock", "Dolphin's Nose", "Tea factory tours"],
    best_season: "September to May",
    distance_from_ooty: "19 km",
    images: [
      { src: "/images/destinations/coonoor.jpg", alt: "Coonoor hill town at dusk" },
      { src: "/images/attractions/sims-park.jpg", alt: "Terraced botanical garden at Sim's Park" },
      { src: "/images/attractions/dolphins-nose.jpg", alt: "Dolphin's Nose viewpoint over the escarpment" },
      { src: "/images/attractions/tea-gardens.jpg", alt: "Terraced tea gardens near Coonoor" },
      { src: "/images/attractions/tea-factory-museum.jpg", alt: "Working tea factory floor near Coonoor" },
    ],
  },
  {
    slug: "avalanche-lake",
    name: "Avalanche & Emerald Lake",
    region: "The Nilgiris",
    description:
      "A restricted-access, forest-department-permitted valley of untouched shola forest and glassy reservoirs — the Nilgiris few visitors see.",
    image: "/images/destinations/avalanche-lake.jpg",
    highlights: ["Shola forest trekking", "Emerald Lake boating", "Birdwatching"],
    best_season: "December to April",
    distance_from_ooty: "28 km",
    images: [
      { src: "/images/destinations/avalanche-lake.jpg", alt: "Avalanche Lake framed by shola forest" },
      { src: "/images/destinations/avalanche-lake-2.jpg", alt: "Emerald Lake still waters at Avalanche" },
      { src: "/images/destinations/avalanche-lake-3.jpg", alt: "Shola forest trekking trail near Avalanche" },
      { src: "/images/destinations/avalanche-lake-4.jpg", alt: "Reflections on Avalanche Lake at dawn" },
      { src: "/images/destinations/avalanche-lake-5.jpg", alt: "Dense shola forest canopy near Avalanche valley" },
    ],
  },
  {
    slug: "kotagiri",
    name: "Kotagiri",
    region: "The Nilgiris",
    description:
      "The oldest of the Nilgiri hill towns — fewer crowds, cooler air, and the thundering Catherine Falls nearby.",
    image: "/images/destinations/kotagiri.jpg",
    highlights: ["Catherine Falls", "Elk Falls", "Kodanad Viewpoint"],
    best_season: "October to May",
    distance_from_ooty: "28 km",
    images: [
      { src: "/images/destinations/kotagiri.jpg", alt: "Kotagiri tea gardens in morning light" },
      { src: "/images/attractions/kodanad-viewpoint.jpg", alt: "Kodanad Viewpoint over the Nilgiri escarpment" },
      { src: "/images/attractions/catherine-falls.jpg", alt: "Catherine Falls cascading through the forest" },
      { src: "/images/attractions/elk-falls.jpg", alt: "Elk Falls tucked into the forest near Kotagiri" },
      { src: "/images/destinations/kotagiri-5.jpg", alt: "Kotagiri hill town skyline" },
    ],
  },
  {
    slug: "ooty-lake",
    name: "Ooty Lake",
    region: "The Nilgiris",
    description:
      "A serene, artificial lake at the heart of Ooty town, framed by eucalyptus groves — the classic boat-ride stop on every itinerary.",
    image: "/images/destinations/ooty-lake.jpg",
    highlights: ["Boat House pedal & row boats", "Lakeside toy train halt", "Eucalyptus-lined walking paths"],
    best_season: "October to June",
    distance_from_ooty: "2 km",
    images: [
      { src: "/images/destinations/ooty-lake.jpg", alt: "Boats on Ooty Lake" },
      { src: "/images/destinations/ooty-lake-2.jpg", alt: "Pedal boats on Ooty Lake" },
      { src: "/images/destinations/ooty-lake-3.jpg", alt: "Eucalyptus-lined walking path by Ooty Lake" },
      { src: "/images/destinations/ooty-lake-4.jpg", alt: "Ooty Lake at sunset" },
      { src: "/images/destinations/ooty-lake-5.jpg", alt: "Toy train halt beside Ooty Lake" },
    ],
  },
  {
    slug: "coimbatore",
    name: "Coimbatore",
    region: "Gateway city",
    description:
      "The nearest major airport and railhead — our most-booked airport & railway transfer route into the Nilgiris.",
    image: "/images/destinations/coimbatore.jpg",
    highlights: ["Coimbatore International Airport", "Coimbatore Junction"],
    best_season: "Year-round",
    distance_from_ooty: "88 km",
    images: [
      { src: "/images/destinations/coimbatore.jpg", alt: "Coimbatore gateway city skyline" },
      { src: "/images/destinations/coimbatore-2.jpg", alt: "Coimbatore International Airport terminal" },
      { src: "/images/destinations/coimbatore-3.jpg", alt: "Coimbatore city streets by night" },
      { src: "/images/destinations/coimbatore-4.jpg", alt: "Marudhamalai temple hilltop near Coimbatore" },
      { src: "/images/destinations/coimbatore-5.jpg", alt: "Coimbatore Junction railway station" },
    ],
  },
  {
    slug: "pine-forest",
    name: "Pine Forest",
    region: "The Nilgiris",
    description:
      "A hauntingly beautiful, dense plantation of tall pines just outside Ooty — a favourite for quiet walks and cinematic photography.",
    image: "/images/attractions/pine-forest.jpg",
    highlights: ["Elevated walking trails", "Popular film-shoot location", "Golden-hour light through the canopy"],
    best_season: "September to May",
    distance_from_ooty: "7 km",
    images: [
      { src: "/images/attractions/pine-forest.jpg", alt: "Tall pine grove near Ooty" },
      { src: "/images/destinations/pine-forest-2.jpg", alt: "Sunlight filtering through the pine forest canopy" },
      { src: "/images/destinations/pine-forest-3.jpg", alt: "Quiet walking trail through the pine forest" },
      { src: "/images/destinations/pine-forest-4.jpg", alt: "Misty pine forest at golden hour" },
      { src: "/images/destinations/pine-forest-5.jpg", alt: "Tall pine trunks lining a forest path near Ooty" },
    ],
  },
];

await insertIfEmpty(
  "destinations",
  DESTINATIONS_SEED.map((d, i) => ({ ...d, sort_order: i })),
  async (d) => {
    const result = await db
      .prepare(
        `INSERT INTO destinations (slug, name, region, description, image, highlights, best_season, distance_from_ooty, sort_order)
         VALUES (@slug, @name, @region, @description, @image, @highlights, @best_season, @distance_from_ooty, @sort_order)
         RETURNING *`
      )
      .get({
        slug: d.slug,
        name: d.name,
        region: d.region,
        description: d.description,
        image: d.image,
        highlights: JSON.stringify(d.highlights),
        best_season: d.best_season,
        distance_from_ooty: d.distance_from_ooty,
        sort_order: d.sort_order,
      });
    const destinationId = result.id;
    const imgStmt = db.prepare(
      `INSERT INTO destination_images (destination_id, src, alt, sort_order) VALUES (@destination_id, @src, @alt, @sort_order)`
    );
    let sortOrder = 0;
    for (const img of d.images) {
      if (!fs.existsSync(path.join(ROOT, "public", img.src))) continue;
      await imgStmt.run({ destination_id: destinationId, src: img.src, alt: img.alt, sort_order: sortOrder });
      sortOrder += 1;
    }
  }
);

// ---------- Hidden gems (attractions) ----------
const ATTRACTIONS_SEED = [
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

// Extra angles fetched by scripts/fetch-card-images.mjs (Wikimedia Commons)
// fill slots 2-5 for every hidden gem, at these predictable filenames — only
// rows for files that actually downloaded successfully get inserted, so a
// search that came up short never leaves a broken image reference behind.
const EXTRA_ANGLE_LABELS = ["a wider view", "a closer detail", "a different season", "a different time of day"];

await insertIfEmpty(
  "attractions",
  ATTRACTIONS_SEED.map((a, i) => ({ ...a, sort_order: i })),
  async (a) => {
    const result = await db
      .prepare(
        `INSERT INTO attractions (slug, name, category, blurb, sort_order) VALUES (@slug, @name, @category, @blurb, @sort_order)
         RETURNING *`
      )
      .get({ slug: a.slug, name: a.name, category: a.category, blurb: a.blurb, sort_order: a.sort_order });
    const attractionId = result.id;
    const imgStmt = db.prepare(
      `INSERT INTO attraction_images (attraction_id, src, alt, sort_order) VALUES (@attraction_id, @src, @alt, @sort_order)`
    );
    await imgStmt.run({ attraction_id: attractionId, src: a.image, alt: `${a.name} — ${a.category}`, sort_order: 0 });
    let sortOrder = 1;
    for (const [idx, label] of EXTRA_ANGLE_LABELS.entries()) {
      const src = `/images/attractions/${a.slug}-${idx + 2}.jpg`;
      if (!fs.existsSync(path.join(ROOT, "public", src))) continue;
      await imgStmt.run({ attraction_id: attractionId, src, alt: `${a.name} — ${label}`, sort_order: sortOrder });
      sortOrder += 1;
    }
  }
);

// ---------- Packages ----------
// Every package is upserted by slug (INSERT ... ON CONFLICT DO UPDATE), so this
// list is always the source of truth for package content — safe to run again on
// a live db, and it also refreshes rows seeded by an older version of this file.
function pkgImages(category, from, to) {
  const paths = [];
  for (let i = from; i <= to; i++) paths.push(`/images/packages/${category}/${i}.jpg`);
  return paths;
}

const packages = [
  {
    slug: "nilgiri-grand-circuit",
    name: "Nilgiri Grand Circuit",
    tagline: "The complete Nilgiris, at an unhurried pace",
    summary: "5 days, 4 nights across Ooty, Coonoor, Kotagiri and Mudumalai.",
    description:
      "Our signature multi-town circuit strings together every essential Nilgiri experience — botanical gardens, tea estates, waterfalls and a wildlife safari — with a private chauffeur throughout, so you never touch a shared vehicle.",
    duration_label: "5 Days / 4 Nights",
    duration_days: 5,
    price_from: 42000,
    original_price: 48000,
    hero_image: null,
    gallery: pkgImages("Family", 1, 3),
    category: "Family",
    rating: 4.8,
    review_count: 96,
    vehicle_options: ["Family MPV", "Premium Sedan"],
    max_group_size: 7,
    distance_label: "Approx. 210 km round trip",
    pickup_drop: "Coimbatore Airport / Railway Station, hotel-to-hotel each night",
    driver_info: "Assigned a ghat-route specialist with 8+ years' experience on this exact circuit.",
    best_time: "October to June",
    places_covered: ["Ooty Lake", "Botanical Garden", "Doddabetta Peak", "Sim's Park", "Lamb's Rock", "Dolphin's Nose", "Catherine Falls", "Mudumalai National Park"],
    itinerary: [
      { day: 1, title: "Arrival & Ooty orientation", description: "Pickup from Coimbatore, check-in, evening at Ooty Lake." },
      { day: 2, title: "Botanical Gardens & Doddabetta", description: "Morning gardens visit, sunset at Doddabetta viewpoint." },
      { day: 3, title: "Coonoor tea trail", description: "Sim's Park, a working tea factory, Lamb's Rock and Dolphin's Nose." },
      { day: 4, title: "Kotagiri & Catherine Falls", description: "Quiet Kotagiri lanes and the thundering Catherine Falls." },
      { day: 5, title: "Mudumalai safari & departure", description: "Dawn jeep safari, then drop-off at Coimbatore." },
    ],
    includes: ["Private chauffeur-driven vehicle", "4 nights hotel stay", "Daily breakfast", "All toll & parking fees", "Mudumalai safari permit"],
    excludes: ["Airfare/train fare", "Lunch & dinner (unless specified)", "Entry tickets at monuments", "Personal expenses"],
    faqs: [
      { question: "Can the itinerary be shortened?", answer: "Yes — we tailor the circuit to 3-6 days depending on your dates." },
      { question: "Is this suitable for elderly travellers?", answer: "Yes, the pace is unhurried with no early-morning treks required." },
    ],
    highlights: ["4 hill towns", "Private safari permit included", "No shared transport"],
  },
  {
    slug: "ooty-honeymoon-escape",
    name: "Ooty Honeymoon Escape",
    tagline: "A quiet, candlelit start to forever",
    summary: "3 days, 2 nights of scenic drives, lakeside picnics and sunset viewpoints.",
    description:
      "A gentle, romance-first itinerary — later starts, candlelit dinners arranged on request, and viewpoints timed for golden hour rather than sunrise crowds.",
    duration_label: "3 Days / 2 Nights",
    duration_days: 3,
    price_from: 21000,
    original_price: 24000,
    hero_image: null,
    gallery: pkgImages("Honeymoon", 1, 6),
    category: "Honeymoon",
    rating: 4.9,
    review_count: 74,
    vehicle_options: ["Premium Sedan", "Luxury SUV"],
    max_group_size: 2,
    distance_label: "Approx. 95 km round trip",
    pickup_drop: "Coimbatore Airport / Railway Station, hotel-to-hotel each night",
    driver_info: "Paired with a driver experienced in unhurried, couple-paced itineraries.",
    best_time: "October to March",
    places_covered: ["Ooty Lake", "Doddabetta Peak", "Coonoor tea estates", "Botanical Garden"],
    itinerary: [
      { day: 1, title: "Arrival & Ooty Lake boating", description: "Late check-in, evening boating at Ooty Lake." },
      { day: 2, title: "Doddabetta sunrise & Coonoor drive", description: "Optional sunrise viewpoint, scenic Coonoor loop, tea estate photo stop." },
      { day: 3, title: "Botanical Gardens & departure", description: "Relaxed morning at the gardens before drop-off." },
    ],
    includes: ["Private chauffeur-driven sedan", "2 nights couple-friendly stay", "Daily breakfast", "Ooty Lake boating tickets"],
    excludes: ["Airfare/train fare", "Lunch & dinner", "Spa or candlelight dinner add-ons (available on request)"],
    faqs: [
      { question: "Can you arrange a candlelight dinner?", answer: "Yes, on request with 24 hours' notice, at an additional cost." },
    ],
    highlights: ["Golden-hour viewpoint timing", "Couple-friendly stays", "Flexible late starts"],
  },
  {
    slug: "tea-trail-weekend",
    name: "Tea Trail Weekend",
    tagline: "Coonoor & Kotagiri, at the pace of a teacup",
    summary: "2 days, 1 night through the Nilgiris' working tea estates.",
    description:
      "A short escape built entirely around the Nilgiris' tea culture — estate walks, factory tours, and tastings, away from Ooty's busier core.",
    duration_label: "2 Days / 1 Night",
    duration_days: 2,
    price_from: 12500,
    original_price: null,
    hero_image: null,
    gallery: pkgImages("NatureTea", 1, 6),
    category: "NatureTea",
    rating: 4.7,
    review_count: 41,
    vehicle_options: ["Premium Sedan", "Family MPV"],
    max_group_size: 6,
    distance_label: "Approx. 70 km round trip",
    pickup_drop: "Ooty hotel pickup, drop at Coonoor or Kotagiri accommodation",
    driver_info: "Familiar with the working estates that welcome public factory-floor visits.",
    best_time: "September to May",
    places_covered: ["Sim's Park", "Coonoor tea factory", "Kotagiri", "Catherine Falls"],
    itinerary: [
      { day: 1, title: "Coonoor estates", description: "Sim's Park, a working tea factory tour and tasting." },
      { day: 2, title: "Kotagiri & Catherine Falls", description: "Quiet estate roads and a waterfall stop before departure." },
    ],
    includes: ["Private vehicle", "1 night stay", "Breakfast", "Tea factory tour & tasting"],
    excludes: ["Airfare/train fare", "Lunch & dinner"],
    faqs: [{ question: "Is this a walking-heavy trip?", answer: "Light walking only — estate paths are gentle and well-formed." }],
    highlights: ["Working tea factory visit", "Two hill towns in one weekend"],
  },
  {
    slug: "wildlife-waterfalls-expedition",
    name: "Wildlife & Waterfalls Expedition",
    tagline: "Mudumalai's forests, Avalanche's silence",
    summary: "3 days, 2 nights combining a jeep safari with restricted-access valley trekking.",
    description:
      "For travellers who want the Nilgiris beyond the postcard viewpoints — a dawn safari through Mudumalai and a permitted trek into the Avalanche valley.",
    duration_label: "3 Days / 2 Nights",
    duration_days: 3,
    price_from: 26000,
    original_price: null,
    hero_image: null,
    gallery: pkgImages("Wildlife", 1, 6),
    category: "Wildlife",
    rating: 4.8,
    review_count: 58,
    vehicle_options: ["Family MPV", "Group Traveller"],
    max_group_size: 10,
    distance_label: "Approx. 180 km round trip",
    pickup_drop: "Coimbatore Airport / Railway Station, hotel-to-hotel each night",
    driver_info: "Forest-permit experienced driver, briefed on safari-slot timings.",
    best_time: "November to April",
    places_covered: ["Avalanche & Emerald Lake", "Mudumalai National Park", "Moyar river gorge"],
    itinerary: [
      { day: 1, title: "Arrival & Avalanche valley", description: "Forest-permit trek and Emerald Lake." },
      { day: 2, title: "Mudumalai dawn safari", description: "Early transfer, jeep safari, elephant camp visit." },
      { day: 3, title: "Return & departure", description: "Relaxed morning, drop-off at Coimbatore." },
    ],
    includes: ["Private vehicle", "2 nights stay", "Forest entry & safari permits", "Breakfast"],
    excludes: ["Airfare/train fare", "Lunch & dinner", "Camera fees at forest checkpoints"],
    faqs: [{ question: "Do you arrange the forest permits?", answer: "Yes, permits for Avalanche and Mudumalai are arranged in advance — carry a photo ID." }],
    highlights: ["Restricted-access valley trek", "Dawn wildlife safari"],
  },
  {
    slug: "corporate-retreat-transfers",
    name: "Corporate Retreat Transfers",
    tagline: "On-time, every time, for your whole team",
    summary: "Multi-vehicle coordination for offsites, conferences and team retreats.",
    description:
      "Dedicated coordination for corporate groups — synchronized pickups across multiple vehicles, a single point of contact, and consolidated monthly billing on request.",
    duration_label: "Custom",
    duration_days: 1,
    price_from: 6500,
    original_price: null,
    hero_image: null,
    gallery: pkgImages("Corporate", 1, 6),
    category: "Corporate",
    rating: 4.7,
    review_count: 33,
    vehicle_options: ["Group Traveller", "Family MPV"],
    max_group_size: 40,
    distance_label: "Custom, quoted per itinerary",
    pickup_drop: "Multi-point pickup across Coimbatore / Ooty hotels, synchronized convoy departure",
    driver_info: "A lead coordinator plus one driver per vehicle for groups over 12.",
    best_time: "Year-round",
    places_covered: ["Custom — built around your offsite venue and agenda"],
    itinerary: [],
    includes: ["Fleet coordination for groups", "Single point of contact", "Flexible billing"],
    excludes: ["Accommodation (unless requested)"],
    faqs: [{ question: "Can you handle 20+ person groups?", answer: "Yes, via tempo travellers and multi-vehicle convoys with a lead coordinator." }],
    highlights: ["Multi-vehicle convoy coordination", "Corporate billing available"],
  },
  {
    slug: "airport-railway-transfers",
    name: "Airport & Railway Transfers",
    tagline: "Coimbatore to your hotel door, tracked and on time",
    summary: "Point-to-point transfers from Coimbatore airport or railway station.",
    description:
      "Flight- and train-tracked pickups so your driver is always waiting, even if your arrival time shifts.",
    duration_label: "One-way / Round-trip",
    duration_days: 1,
    price_from: 3200,
    original_price: null,
    hero_image: null,
    gallery: pkgImages("Budget", 1, 3),
    category: "Budget",
    rating: 4.6,
    review_count: 122,
    vehicle_options: ["Economy Sedan", "Premium Sedan"],
    max_group_size: 4,
    distance_label: "Approx. 88 km one-way (Coimbatore ⇄ Ooty)",
    pickup_drop: "Coimbatore Airport / Railway Station to any Nilgiris hotel, or reverse",
    driver_info: "Meets you with a name board; flight/train tracked automatically.",
    best_time: "Year-round",
    places_covered: ["Coimbatore", "Ooty"],
    itinerary: [],
    includes: ["Flight/train tracking", "Meet & greet with name board", "30 minutes complimentary wait time"],
    excludes: ["Tolls beyond standard route (rare diversions)"],
    faqs: [{ question: "What if my flight is delayed?", answer: "We track your flight automatically — no need to inform us of delays." }],
    highlights: ["Live flight/train tracking", "Fixed transparent pricing"],
  },
  {
    slug: "ooty-family-sightseeing-day",
    name: "Ooty Family Sightseeing Day",
    tagline: "Every classic Ooty stop, one easy day for the whole family",
    summary: "A single, unhurried day covering Ooty's best-loved family attractions.",
    description:
      "Built for families with kids and grandparents alike — gentle pacing, easy-access attractions, and a mix of gardens, a lake, and a chocolate factory that keeps everyone happy.",
    duration_label: "1 Day",
    duration_days: 1,
    price_from: 4200,
    original_price: null,
    hero_image: null,
    gallery: pkgImages("Family", 4, 6),
    category: "Family",
    rating: 4.7,
    review_count: 88,
    vehicle_options: ["Family MPV", "Economy Sedan"],
    max_group_size: 7,
    distance_label: "Approx. 35 km, Ooty city circuit",
    pickup_drop: "Ooty hotel pickup and drop, same day",
    driver_info: "Comfortable with frequent short stops and family pacing.",
    best_time: "October to June",
    places_covered: ["Doddabetta Peak", "Tea & Chocolate Factory", "Botanical Garden", "Rose Garden", "Boat House", "Thread Garden"],
    itinerary: [
      {
        day: 1,
        title: "Ooty city circuit",
        description:
          "Doddabetta Peak, Tea & Chocolate Factory, Wax Museum, Botanical Garden, Rose Garden, Boat House, Thread Garden, Karnataka Horticulture Garden and the Exotic Birds Park.",
      },
    ],
    includes: ["Private chauffeur-driven vehicle", "All stops on the Ooty city circuit", "Bottled water on board"],
    excludes: ["Entry tickets at each attraction", "Lunch & snacks", "Boat House ride charges"],
    faqs: [
      { question: "Is this suitable for small children and elders?", answer: "Yes — the route is short drives between easy-access, mostly flat attractions with plenty of rest stops." },
      { question: "Can we skip a stop to spend more time elsewhere?", answer: "Yes, the order and time spent at each stop is flexible on the day." },
    ],
    highlights: ["9 family attractions in one day", "Chocolate factory tasting stop", "Flexible pacing for kids & elders"],
  },
  {
    slug: "pykara-lakeside-romance",
    name: "Pykara Lakeside Romance",
    tagline: "Pine forests, a private boat ride, and golden-hour lake views",
    summary: "A romantic day trip through Pykara's forests, dam and boathouse.",
    description:
      "The Nilgiris' most cinematic drive for couples — golf-course lawns, a pine forest walk, and a quiet boat ride on Pykara Lake timed for the best light.",
    duration_label: "1 Day",
    duration_days: 1,
    price_from: 4800,
    original_price: 5500,
    hero_image: null,
    gallery: pkgImages("Couple", 1, 6),
    category: "Couple",
    rating: 4.9,
    review_count: 63,
    vehicle_options: ["Premium Sedan"],
    max_group_size: 2,
    distance_label: "Approx. 40 km round trip from Ooty",
    pickup_drop: "Ooty hotel pickup and drop, same day",
    driver_info: "Times the drive for golden-hour arrival at Pykara Lake.",
    best_time: "October to March",
    places_covered: ["Pykara Golf Links", "Pykara Pine Forest", "Pykara Dam", "Pykara Falls", "Pykara Boat House"],
    itinerary: [
      {
        day: 1,
        title: "Pykara — Flimy Chakkar",
        description:
          "Golf Links, Pine Forest, Kamarajar Sagar Dam (outer view), Pykara Dam, Pykara Water Falls and a boat ride at Pykara Boat House.",
      },
    ],
    includes: ["Private chauffeur-driven vehicle", "All stops on the Pykara circuit", "Timed for golden-hour lake views"],
    excludes: ["Boat House ride tickets", "Lunch & snacks", "Candlelight dinner add-on (available on request)"],
    faqs: [
      { question: "Can you arrange a candlelight dinner after?", answer: "Yes, on request with 24 hours' notice, at an additional cost — same as our honeymoon packages." },
    ],
    highlights: ["Private boat ride at Pykara Lake", "Pine forest photo stop", "Golden-hour timing"],
  },
  {
    slug: "avalanche-mudumalai-wild-trail",
    name: "Avalanche & Mudumalai Wild Trail",
    tagline: "Forest valleys, a tribal museum, and a jungle safari for thrill-seekers",
    summary: "2 days combining the Avalanchi forest trail with a Mudumalai jungle ride.",
    description:
      "For travellers chasing the Nilgiris' wilder side — a forest-department escorted valley trail past the Cairnhill eco-awareness centre, followed by a Mudumalai jungle ride the next morning.",
    duration_label: "2 Days / 1 Night",
    duration_days: 2,
    price_from: 15500,
    original_price: null,
    hero_image: null,
    gallery: pkgImages("Adventure", 1, 6),
    category: "Adventure",
    rating: 4.7,
    review_count: 29,
    vehicle_options: ["Family MPV", "Group Traveller"],
    max_group_size: 10,
    distance_label: "Approx. 150 km round trip",
    pickup_drop: "Ooty hotel pickup, drop at Mudumalai-side accommodation",
    driver_info: "Coordinates directly with the Forest Department vehicle handover.",
    best_time: "November to April",
    places_covered: ["Cauliflower Mountain viewpoint", "Tribal Museum", "Cairnhill Eco Awareness Centre", "Mudumalai National Park"],
    itinerary: [
      {
        day: 1,
        title: "Avalanchi forest trail",
        description:
          "Forest Dept. vehicle to the Cauliflower Mountain viewpoint, the Tribal Museum, Cairnhill Forest's Eco Awareness Centre, Karnataka Horticulture Garden and the Birds Park.",
      },
      {
        day: 2,
        title: "Mudumalai jungle ride",
        description: "Early transfer to Mudumalai for a Forest Dept. jungle ride, plus horse riding at Tree Park and the 9th Mile shooting spot en route.",
      },
    ],
    includes: ["Private vehicle for both days", "1 night stay", "Breakfast"],
    excludes: ["Forest Dept. vehicle charges at Avalanchi (extra, paid on-site per brochure)", "Mudumalai jungle ride permit (extra charges)", "Horse riding charges", "Lunch & dinner"],
    faqs: [
      { question: "Why are Forest Dept. vehicle charges separate?", answer: "Both the Avalanchi valley and Mudumalai jungle ride require a Forest Department vehicle and permit, billed directly by the forest office — we arrange it, but the fee itself is extra, as noted on the tour brochure." },
    ],
    highlights: ["Forest-escorted valley trail", "Mudumalai jungle ride", "Horse riding stop at Tree Park"],
  },
  {
    slug: "coonoor-ridge-viewpoints-run",
    name: "Coonoor Ridge & Viewpoints Run",
    tagline: "Tea trails, cliffside viewpoints, and a strawberry farm — built for a group",
    summary: "A lively full day through Coonoor's viewpoints, ideal for a group of friends.",
    description:
      "Coonoor's best photo stops in one loop — a valley view, dramatic ridge-edge viewpoints, and a strawberry farm to end the day, paced for a group that wants to see everything.",
    duration_label: "1 Day",
    duration_days: 1,
    price_from: 4500,
    original_price: null,
    hero_image: null,
    gallery: pkgImages("Friends", 1, 6),
    category: "Friends",
    rating: 4.6,
    review_count: 47,
    vehicle_options: ["Family MPV", "Group Traveller"],
    max_group_size: 10,
    distance_label: "Approx. 45 km, Coonoor loop",
    pickup_drop: "Ooty or Coonoor hotel pickup and drop, same day",
    driver_info: "Builds in photo-stop buffer time at the ridge viewpoints.",
    best_time: "September to May",
    places_covered: ["Ketti Valley View", "Sim's Park", "Sleeping Lady View Point", "Strawberry Farm", "Lamb's Rock", "Dolphin's Nose"],
    itinerary: [
      {
        day: 1,
        title: "Coonoor viewpoints loop",
        description:
          "Ketti Valley View, MRC Museum, Sim's Park, Tea Garden, Sleeping Lady View Point, Eucalyptus Oil Factory, Strawberry Farm, Lamb's Rock and Dolphin's Nose.",
      },
    ],
    includes: ["Private chauffeur-driven vehicle", "All stops on the Coonoor loop"],
    excludes: ["Entry tickets at each attraction", "Lunch & snacks", "Strawberry farm produce"],
    faqs: [
      { question: "Is there enough time for photos at each viewpoint?", answer: "Yes — the loop is timed with buffer at Lamb's Rock and Dolphin's Nose specifically for group photos." },
    ],
    highlights: ["Lamb's Rock & Dolphin's Nose in one day", "Strawberry farm stop", "Great for group photos"],
  },
  {
    slug: "nilgiri-group-explorer",
    name: "Nilgiri Group Explorer",
    tagline: "Built for bigger parties — one convoy, one itinerary",
    summary: "4 days, 3 nights across Ooty and Coonoor, sized for groups of 10-15.",
    description:
      "A full-Nilgiri itinerary designed around a tempo traveller rather than a sedan — wider stops, group-friendly meal venues, and pacing that keeps a larger party together.",
    duration_label: "4 Days / 3 Nights",
    duration_days: 4,
    price_from: 15500,
    original_price: null,
    hero_image: null,
    gallery: pkgImages("Group", 1, 6),
    category: "Group",
    rating: 4.6,
    review_count: 22,
    vehicle_options: ["Group Traveller"],
    max_group_size: 15,
    distance_label: "Approx. 160 km round trip",
    pickup_drop: "Coimbatore Airport / Railway Station, hotel-to-hotel each night",
    driver_info: "Assigned a tempo-traveller specialist experienced with large groups.",
    best_time: "October to June",
    places_covered: ["Ooty Lake", "Botanical Garden", "Doddabetta Peak", "Sim's Park", "Tea estates"],
    itinerary: [
      { day: 1, title: "Arrival & Ooty orientation", description: "Group check-in, evening at Ooty Lake." },
      { day: 2, title: "Ooty city circuit", description: "Botanical Garden, Doddabetta Peak, Rose Garden." },
      { day: 3, title: "Coonoor tea trail", description: "Sim's Park, tea factory visit, ridge viewpoints." },
      { day: 4, title: "Departure", description: "Relaxed morning, drop-off at Coimbatore." },
    ],
    includes: ["Tempo Traveller for the full group", "3 nights hotel stay", "Daily breakfast", "Single point of coordination"],
    excludes: ["Airfare/train fare", "Lunch & dinner", "Entry tickets at monuments"],
    faqs: [{ question: "What's the minimum group size?", answer: "This package is priced per person for groups of 10 or more." }],
    highlights: ["Sized for 10-15 travellers", "One vehicle, one coordinator", "Group-friendly meal stops"],
  },
  {
    slug: "ooty-quick-weekend-escape",
    name: "Ooty Quick Weekend Escape",
    tagline: "A full Ooty weekend, no leave application required",
    summary: "2 days, 1 night covering Ooty's essentials — built to fit a Saturday-Sunday.",
    description:
      "For travellers with just a weekend to spare — a tightly scheduled but unrushed loop through Ooty's lake, gardens and viewpoints, back home by Sunday evening.",
    duration_label: "2 Days / 1 Night",
    duration_days: 2,
    price_from: 8500,
    original_price: 9800,
    hero_image: null,
    gallery: pkgImages("Weekend", 1, 6),
    category: "Weekend",
    rating: 4.7,
    review_count: 51,
    vehicle_options: ["Economy Sedan", "Premium Sedan"],
    max_group_size: 4,
    distance_label: "Approx. 55 km, Ooty-only loop",
    pickup_drop: "Coimbatore Airport / Railway Station, Saturday arrival, Sunday departure",
    driver_info: "Plans the route to beat weekend day-tripper traffic from Coimbatore.",
    best_time: "Year-round, best October to May",
    places_covered: ["Ooty Lake", "Doddabetta Peak", "Botanical Garden", "Rose Garden"],
    itinerary: [
      { day: 1, title: "Arrival & lake evening", description: "Check-in, sunset at Ooty Lake." },
      { day: 2, title: "Gardens & departure", description: "Doddabetta Peak at sunrise, Botanical Garden, then drop-off." },
    ],
    includes: ["Private chauffeur-driven vehicle", "1 night stay", "Breakfast"],
    excludes: ["Airfare/train fare", "Lunch & dinner", "Entry tickets"],
    faqs: [{ question: "Can we start Friday night instead?", answer: "Yes, a Friday evening start is available on request at no extra cost." }],
    highlights: ["Fits a standard weekend", "Beats day-tripper traffic", "Fixed, predictable pricing"],
  },
  {
    slug: "nilgiri-hill-station-panorama",
    name: "Nilgiri Hill Station Panorama",
    tagline: "Every classic Nilgiri viewpoint, three towns, one trip",
    summary: "3 days, 2 nights through Ooty, Coonoor and Kotagiri's best viewpoints.",
    description:
      "A viewpoint-first itinerary across the three core Nilgiri hill towns — built for travellers who want the classic panoramas without a full multi-town circuit.",
    duration_label: "3 Days / 2 Nights",
    duration_days: 3,
    price_from: 17500,
    original_price: null,
    hero_image: null,
    gallery: pkgImages("HillStation", 1, 6),
    category: "HillStation",
    rating: 4.7,
    review_count: 36,
    vehicle_options: ["Premium Sedan", "Family MPV"],
    max_group_size: 6,
    distance_label: "Approx. 130 km round trip",
    pickup_drop: "Coimbatore Airport / Railway Station, hotel-to-hotel each night",
    driver_info: "Times each stop for clear-sky viewpoint visibility.",
    best_time: "October to March",
    places_covered: ["Doddabetta Peak", "Lamb's Rock", "Dolphin's Nose", "Kodanad Viewpoint", "Catherine Falls"],
    itinerary: [
      { day: 1, title: "Arrival & Doddabetta", description: "Check-in, sunset at Doddabetta Peak." },
      { day: 2, title: "Coonoor viewpoints", description: "Lamb's Rock, Dolphin's Nose, Sim's Park." },
      { day: 3, title: "Kotagiri & departure", description: "Kodanad Viewpoint, Catherine Falls, drop-off." },
    ],
    includes: ["Private chauffeur-driven vehicle", "2 nights hotel stay", "Daily breakfast"],
    excludes: ["Airfare/train fare", "Lunch & dinner", "Entry tickets"],
    faqs: [{ question: "Is there a lot of walking between viewpoints?", answer: "No — every viewpoint on this route has vehicle access within a short walk." }],
    highlights: ["3 hill towns' best viewpoints", "Clear-sky timing", "Compact 3-day pace"],
  },
  {
    slug: "nilgiri-luxury-gls-experience",
    name: "Nilgiri Luxury GLS Experience",
    tagline: "A private Mercedes-Benz GLS, premium stays, a fully curated pace",
    summary: "4 days, 3 nights in our flagship chauffeured Mercedes-Benz GLS 580.",
    description:
      "Our top-tier experience — the Mercedes-Benz GLS 580 throughout, premium hotel categories, and an itinerary curated around your preferences rather than a fixed template.",
    duration_label: "4 Days / 3 Nights",
    duration_days: 4,
    price_from: 68000,
    original_price: 78000,
    hero_image: null,
    gallery: pkgImages("Luxury", 1, 6),
    category: "Luxury",
    rating: 4.9,
    review_count: 18,
    vehicle_options: ["Luxury SUV"],
    max_group_size: 6,
    distance_label: "Fully customizable, typically 180-220 km",
    pickup_drop: "Coimbatore Airport / Railway Station, door-to-door each day",
    driver_info: "Uniformed chauffeur, dedicated for the full duration of your stay.",
    best_time: "October to June",
    places_covered: ["Ooty", "Coonoor", "Kotagiri", "Private curated stops on request"],
    itinerary: [
      { day: 1, title: "Arrival in the GLS", description: "Private airport pickup, premium check-in." },
      { day: 2, title: "Curated Ooty day", description: "Itinerary shaped around your preferences." },
      { day: 3, title: "Coonoor & tea estates", description: "Premium tea-estate visit, scenic viewpoints." },
      { day: 4, title: "Departure", description: "Relaxed checkout, private drop-off." },
    ],
    includes: ["Mercedes-Benz GLS 580 with chauffeur", "3 nights premium hotel stay", "Daily breakfast", "Fully curated itinerary planning"],
    excludes: ["Airfare/train fare", "Lunch & dinner (unless specified)", "Personal expenses"],
    faqs: [{ question: "Can the itinerary be fully custom?", answer: "Yes — this package is a starting price; our team builds the day-by-day plan around your preferences." }],
    highlights: ["Flagship Mercedes-Benz GLS 580", "Premium hotel categories", "Fully curated, not fixed-template"],
  },
  {
    slug: "ooty-budget-explorer",
    name: "Ooty Budget Explorer",
    tagline: "The Nilgiri essentials, without the extras",
    summary: "2 days, 1 night covering Ooty's must-see spots at the lowest fare on our board.",
    description:
      "A no-frills itinerary in our most economical vehicle — the same key Ooty stops as our premium packages, minus the extras, for travellers watching their budget.",
    duration_label: "2 Days / 1 Night",
    duration_days: 2,
    price_from: 5200,
    original_price: 6000,
    hero_image: null,
    gallery: pkgImages("Budget", 4, 6),
    category: "Budget",
    rating: 4.5,
    review_count: 39,
    vehicle_options: ["Economy Sedan"],
    max_group_size: 4,
    distance_label: "Approx. 50 km, Ooty-only loop",
    pickup_drop: "Coimbatore Railway Station preferred; airport pickup available on request",
    driver_info: "Standard-rostered driver, same safety and licensing standard as every package.",
    best_time: "Year-round",
    places_covered: ["Ooty Lake", "Botanical Garden", "Doddabetta Peak"],
    itinerary: [
      { day: 1, title: "Arrival & Ooty Lake", description: "Check-in, evening at Ooty Lake." },
      { day: 2, title: "Gardens & departure", description: "Botanical Garden, Doddabetta Peak, then drop-off." },
    ],
    includes: ["Private economy-sedan transport", "1 night budget-category stay", "Breakfast"],
    excludes: ["Airfare/train fare", "Lunch & dinner", "Entry tickets"],
    faqs: [{ question: "Is the vehicle shared with other travellers?", answer: "No — even our budget package uses a private vehicle for your group only." }],
    highlights: ["Lowest starting price on our board", "Same key Ooty stops", "Private vehicle, not shared"],
  },
  {
    slug: "nilgiri-student-expedition",
    name: "Nilgiri Student Expedition",
    tagline: "An educational, budget-friendly trip built for college groups",
    summary: "3 days, 2 nights mixing sightseeing with a wildlife safari, priced for student groups.",
    description:
      "Designed for college trips and educational excursions — a tempo traveller for the group, a Mudumalai safari for the syllabus-friendly wildlife component, and dorm-style budget stays.",
    duration_label: "3 Days / 2 Nights",
    duration_days: 3,
    price_from: 6800,
    original_price: null,
    hero_image: null,
    gallery: pkgImages("Student", 1, 6),
    category: "Student",
    rating: 4.6,
    review_count: 27,
    vehicle_options: ["Group Traveller", "Family MPV"],
    max_group_size: 15,
    distance_label: "Approx. 150 km round trip",
    pickup_drop: "College/institution pickup point, or Coimbatore Railway Station",
    driver_info: "Experienced coordinating with faculty chaperones on group trips.",
    best_time: "November to February",
    places_covered: ["Botanical Garden", "Doddabetta Peak", "Tea factory", "Mudumalai National Park"],
    itinerary: [
      { day: 1, title: "Arrival & Ooty orientation", description: "Group check-in, Botanical Garden visit." },
      { day: 2, title: "Doddabetta & tea factory", description: "Viewpoint visit, working tea factory tour." },
      { day: 3, title: "Mudumalai safari & departure", description: "Morning safari, then drop-off." },
    ],
    includes: ["Group vehicle transport", "2 nights dorm/budget-category stay", "Breakfast", "Mudumalai safari permit"],
    excludes: ["Airfare/train fare", "Lunch & dinner", "Entry tickets"],
    faqs: [{ question: "Do you coordinate directly with faculty chaperones?", answer: "Yes — we assign one coordinator as the single point of contact for the accompanying faculty." }],
    highlights: ["Priced per student for groups", "Wildlife safari included", "Faculty-coordinator liaison"],
  },
];

const packageColumns = [
  "slug", "name", "tagline", "summary", "description", "duration_label", "price_from",
  "hero_image", "category", "itinerary", "includes", "excludes", "faqs", "highlights",
  "gallery", "original_price", "rating", "review_count", "vehicle_options", "max_group_size",
  "duration_days", "distance_label", "pickup_drop", "driver_info", "best_time", "places_covered",
];
const jsonPackageColumns = new Set(["itinerary", "includes", "excludes", "faqs", "highlights", "gallery", "vehicle_options", "places_covered"]);
const insertPackage = db.prepare(
  `INSERT INTO packages (${packageColumns.join(", ")})
   VALUES (${packageColumns.map((c) => `@${c}`).join(", ")})
   ON CONFLICT(slug) DO UPDATE SET
   ${packageColumns.filter((c) => c !== "slug").map((c) => `${c} = @${c}`).join(", ")}`
);
for (const p of packages) {
  const serialized = { ...p };
  for (const col of jsonPackageColumns) serialized[col] = JSON.stringify(p[col] ?? []);
  await insertPackage.run(serialized);
}
console.log(`seeded/updated packages: ${packages.length} rows`);

// These 3 packages (added by an earlier, standalone scripts/expand-homepage-content.mjs run)
// are near-duplicates of packages already covered above with full premium data — deactivate
// rather than delete, so nothing is lost and an admin can reinstate them from /admin/packages.
const legacyDuplicateSlugs = ["ooty-sightseeing", "coonoor-ride", "tea-estate-tour"];
const deactivate = db.prepare("UPDATE packages SET active = 0 WHERE slug = ? AND active = 1");
for (const slug of legacyDuplicateSlugs) {
  const result = await deactivate.run(slug);
  if (result.rowCount > 0) console.log(`deactivated legacy duplicate package: ${slug}`);
}

// ---------- Coupons ----------
await insertIfEmpty(
  "coupons",
  [
    { code: "WELCOME10", pct: 10, note: "First-booking welcome offer" },
    { code: "HONEYMOON15", pct: 15, note: "Honeymoon package special" },
  ],
  (c) =>
    db
      .prepare("INSERT INTO coupons (code, pct, note) VALUES (@code, @pct, @note)")
      .run(c)
);

// ---------- Reviews ----------
await insertIfEmpty(
  "reviews",
  [
    { customer_name: "Ananya R.", rating: 5, comment: "The GLS pickup at Coimbatore airport made the whole trip feel five-star from minute one. Suresh was a wonderful, unhurried driver.", source: "website" },
    { customer_name: "Karthik & Divya", rating: 5, comment: "Booked the Honeymoon Escape — every viewpoint was timed perfectly for golden hour. Loved the lakeside evening.", source: "website" },
    { customer_name: "Meera S.", rating: 4, comment: "Tea Trail Weekend was exactly the short, calm break we needed. Would have liked a bit more time at Sim's Park.", source: "website" },
    { customer_name: "Rohit Verma", rating: 5, comment: "Corporate offsite for 24 people, three vehicles, perfectly synced. Single coordinator made it painless.", source: "google" },
    { customer_name: "Fatima N.", rating: 5, comment: "Mudumalai safari + Avalanche trek in one trip — permits arranged in advance, no queueing at all.", source: "google" },
    { customer_name: "Arjun Mehta", rating: 4, comment: "Great value on the Nilgiri Grand Circuit. Hotel in Kotagiri was a little basic but the driving experience was excellent.", source: "website" },
  ],
  (r) =>
    db
      .prepare(
        "INSERT INTO reviews (customer_name, rating, comment, source) VALUES (@customer_name, @rating, @comment, @source)"
      )
      .run(r)
);

// ---------- Blog posts ----------
const blogPosts = [
    {
      slug: "best-time-to-visit-ooty",
      title: "The Best Time to Visit Ooty (And When to Avoid the Crowds)",
      excerpt: "October's monsoon-clearing skies vs. the busy April-May season — how to time your Nilgiri trip.",
      content:
        "Ooty sees two very different personalities across the year. April and May bring peak crowds — Tamil Nadu's summer holidays send families up the ghats in large numbers, and popular spots like the Botanical Garden get genuinely busy by mid-morning.\n\nOctober through December, right after the monsoon clears, is our recommended window: crisp air, full waterfalls, and green hillsides without the queues. Winter (December-February) brings crisp mornings and the best visibility from Doddabetta.\n\nWhichever month you choose, an early departure from your hotel — ahead of the day-tripper traffic from Coimbatore — makes the single biggest difference to how peaceful your day feels.",
      cover_image: "/images/blog/best-time-to-visit-ooty.jpg",
      author: "Ooty Nigel Travels Desk",
      read_minutes: 5,
      tags: ["planning", "seasons"],
      category: "Seasonal",
    },
    {
      slug: "nilgiri-tea-estate-guide",
      title: "A First-Timer's Guide to the Nilgiri Tea Estates",
      excerpt: "What separates a tourist tea-shop stop from an actual working estate visit.",
      content:
        "Not every 'tea factory tour' near Ooty is created equal. Many roadside shops sell tea without ever showing you a working estate. The genuine experience — walking between tea rows, watching the withering and rolling process, tasting freshly graded leaf — is concentrated around Coonoor, where several estates still run public-facing tours.\n\nOur Tea Trail Weekend package is built specifically around these working estates rather than retail-only stops, with a guided factory walkthrough included.",
      cover_image: "/images/blog/nilgiri-tea-estate-guide.jpg",
      author: "Ooty Nigel Travels Desk",
      read_minutes: 4,
      tags: ["tea", "coonoor"],
      category: "Guides",
    },
    {
      slug: "mudumalai-safari-tips",
      title: "5 Things to Know Before Your Mudumalai Safari",
      excerpt: "Permit timing, what to wear, and why the dawn slot matters more than you think.",
      content:
        "Mudumalai's forest department safaris run in two daily slots — dawn and dusk — and the dawn slot consistently offers better wildlife sightings as animals are most active before the heat sets in.\n\nPermits are limited and allocated by vehicle, so booking ahead (which we handle as part of our Wildlife & Waterfalls package) avoids a wasted early-morning trip to a sold-out counter. Wear muted colours, keep noise low, and bring a zoom lens rather than a flash — flash photography is prohibited near wildlife.",
      cover_image: "/images/blog/mudumalai-safari-tips.jpg",
      author: "Ooty Nigel Travels Desk",
      read_minutes: 4,
      tags: ["wildlife", "mudumalai"],
      category: "Tips",
    },
    {
      slug: "best-photo-spots-nilgiris",
      title: "The Best Photo Spots in the Nilgiris",
      excerpt: "Where to point your camera for the shots that actually look like the postcards.",
      content:
        "Doddabetta's telescope house gets the crowds, but the real panorama is from the car park just below it, ten minutes before sunrise, when the valley is still filling with mist.\n\nPykara's boat jetty is postcard-pretty by mid-morning, but the reflected-mountain shot needs stiller water — try just after the first boats go out, when the wake has settled again. Elk Falls rewards a slow shutter (bring a small travel tripod) far more than a phone snapshot ever will.\n\nOn tea estate roads, the rows themselves are the subject — shoot along them, not across, and the terracing does the composition for you. And don't skip the drive itself: the switchbacks between Coonoor and Kotagiri catch some of the best late-afternoon light on the whole route.",
      cover_image: "/images/gallery/sunrise/3.jpg",
      author: "Ooty Nigel Travels Desk",
      read_minutes: 5,
      tags: ["photography", "viewpoints"],
      category: "Photo Spots",
    },
    {
      slug: "what-to-eat-in-ooty",
      title: "What to Eat in Ooty — A Local Food Guide",
      excerpt: "Beyond the chocolate shops: filter coffee, Nilgiri cuisine and where locals actually eat.",
      content:
        "Ooty's chocolate shops are everywhere and worth a stop, but the town's real food identity is built around its tea-estate breakfasts and Nilgiri-Kurumba influenced home cooking — think ragi mudde, wild honey, and slow-cooked meat curries you won't find on a standard Tamil Nadu menu.\n\nStart the day the way estate workers do: hot filter coffee and a plate of soft idli with a coconut-heavy chutney. For lunch, a full banana-leaf thali at one of the older Charing Cross eateries is still the best value in town. And however full you are, leave room for a cup of fresh Nilgiri tea, tasted within sight of the garden it came from — it tastes nothing like the box at home.",
      cover_image: "/images/gallery/food/1.jpg",
      author: "Ooty Nigel Travels Desk",
      read_minutes: 4,
      tags: ["food", "local-cuisine"],
      category: "Food",
    },
    {
      slug: "monsoon-vs-winter-packing-tips",
      title: "Monsoon vs Winter: What to Pack for the Nilgiris",
      excerpt: "Two very different Ooty trips — and two very different bags.",
      content:
        "Monsoon (June-September) means the hills at their greenest, waterfalls at full force, and rain that can arrive with almost no warning. Pack a proper waterproof shell rather than an umbrella (the wind on open viewpoints makes umbrellas useless), quick-dry layers, and grippy footwear — the ghat roads and forest trails get slick fast.\n\nWinter (December-February) is a different packing list entirely: early mornings can dip close to freezing, especially around Avalanche and Doddabetta, so a proper insulated jacket and a warm layer for the car earn their space. Either season, keep a dry bag for your camera — one unexpected shower is all it takes.",
      cover_image: "/images/attractions/wenlock-downs.jpg",
      author: "Ooty Nigel Travels Desk",
      read_minutes: 4,
      tags: ["packing", "seasons"],
      category: "Tips",
    },
    {
      slug: "2026-season-update",
      title: "2026 Season Update: New Routes & Fleet",
      excerpt: "What's new this season — expanded fleet, refreshed packages, and a few route changes worth knowing.",
      content:
        "This season we've expanded the fleet with additional premium sedans and a second Tempo Traveller to handle larger group bookings during peak weekends without the wait.\n\nWe've also refreshed several signature packages with updated itineraries around Avalanche and Pykara, reflecting seasonal access changes from the forest department. As always, check your package's itinerary page for the current route before travel — we keep it updated in real time rather than relying on a static brochure.",
      cover_image: "/images/gallery/drone-photography/2.jpg",
      author: "Ooty Nigel Travels Desk",
      read_minutes: 3,
      tags: ["updates", "fleet"],
      category: "Updates",
    },
    {
      slug: "doddabetta-peak-guide",
      title: "Doddabetta Peak: Sunrise, Views and the Telescope House",
      excerpt: "The Nilgiris' highest point, and exactly when to go to have it mostly to yourself.",
      content:
        "At 2,637 metres, Doddabetta is the highest peak in the Nilgiris, and on a clear day the view from the telescope house stretches past Mysore towards the Western Ghats. The catch is that 'clear day' — cloud cover rolls in fast after mid-morning, especially between June and September.\n\nArrive before 7am and you'll not only beat the crowds bussed up from Ooty town, you'll catch the valley while it's still filling with mist rather than obscured by it. The paid telescope house is worth the small entry fee on a good day, but the car park just below it offers nearly the same panorama for free.\n\nCarry a light jacket even in summer — the wind at the summit is noticeably colder than in Ooty town, ten minutes down the road. Most of our Ooty and Nilgiri Grand Circuit itineraries build in a Doddabetta stop early in the day for exactly this reason.",
      cover_image: "/images/attractions/doddabetta-peak.jpg",
      author: "Ooty Nigel Travels Desk",
      read_minutes: 4,
      tags: ["doddabetta", "viewpoints", "tips"],
      category: "Guides",
    },
    {
      slug: "nilgiri-waterfalls-guide",
      title: "Chasing Waterfalls: Catherine Falls, Elk Falls and Beyond",
      excerpt: "Which Nilgiri waterfall to visit in which season, and how close you can actually get.",
      content:
        "Catherine Falls, a two-tier drop near Coonoor, is the most photogenic of the region's waterfalls but also the least accessible — the viewpoint requires a short, occasionally slippery walk down from the road, so proper footwear matters more here than almost anywhere else on a Nilgiri itinerary.\n\nElk Falls sits closer to Kotagiri and is an easier stop — a short walk from the parking area to a fenced viewpoint, making it the better choice if you're travelling with young children or elderly family members.\n\nMonsoon season (June-September) is when both falls are at their most dramatic, but also their most dangerous — barricades exist for a reason, and we don't recommend crossing them for a photo. Post-monsoon, October through December, still gives you strong flow with far safer footing, which is why it's the window we build into most of our waterfall-inclusive packages.",
      cover_image: "/images/attractions/catherine-falls.jpg",
      author: "Ooty Nigel Travels Desk",
      read_minutes: 4,
      tags: ["waterfalls", "coonoor", "kotagiri"],
      category: "Guides",
    },
    {
      slug: "avalanche-lake-trek-guide",
      title: "Avalanche Lake & the Emerald Valley: What the Permit Process Actually Involves",
      excerpt: "Forest permits, trek timing and why you can't just drive up on a whim.",
      content:
        "Avalanche Lake sits inside the Nilgiris Forest Division's reserve area, which means — unlike most stops on a Nilgiri itinerary — you can't simply drive up and park. A forest department permit is required, numbers are capped per day, and the checkpoint closes access once the daily quota is reached, sometimes by mid-morning in peak season.\n\nThe reward for the extra planning is real: a genuinely quiet, emerald-green lake ringed by shola forest, with none of the crowd-noise of Ooty or Pykara. The full loop trek takes roughly 2-3 hours at an easy pace, and the forest floor can stay muddy well after the monsoon has technically ended.\n\nWe arrange the permit in advance as part of our Wildlife & Waterfalls and Nilgiri Grand Circuit packages, which avoids the single most common way this stop goes wrong for independent travellers: arriving after the day's permits are gone.",
      cover_image: "/images/destinations/avalanche-lake.jpg",
      author: "Ooty Nigel Travels Desk",
      read_minutes: 5,
      tags: ["avalanche", "trekking", "permits"],
      category: "Tips",
    },
    {
      slug: "coonoor-in-a-day",
      title: "Coonoor in a Day: Sim's Park, Dolphin's Nose & Lamb's Rock",
      excerpt: "A quieter alternative to Ooty, and how to see its highlights without rushing.",
      content:
        "Coonoor gets a fraction of Ooty's tourist traffic despite sitting only 20km away, which makes it the better choice if you want viewpoints and gardens without the queue. Sim's Park, a terraced botanical garden dating to 1874, is at its best in the first hour after opening, before the day's tour groups arrive.\n\nDolphin's Nose and Lamb's Rock are best visited back-to-back — they're a short drive apart, both offer sweeping views over the escarpment towards the plains, and the light is noticeably better in the late afternoon than at midday, when haze tends to flatten the view.\n\nCoonoor's tea estates are also more accessible for a genuine working-estate visit than Ooty's — several still run public tours with an actual factory walkthrough, not just a retail counter. Our Tea Trail Weekend package is built around exactly this loop.",
      cover_image: "/images/attractions/dolphins-nose.jpg",
      author: "Ooty Nigel Travels Desk",
      read_minutes: 4,
      tags: ["coonoor", "viewpoints", "tea"],
      category: "Guides",
    },
    {
      slug: "family-trip-tips-ooty",
      title: "Family Trips to Ooty: Practical Tips for Travelling with Kids or Elderly Parents",
      excerpt: "Altitude, easy-access viewpoints and pacing a Nilgiri itinerary for every generation in the car.",
      content:
        "Ooty sits at roughly 2,240 metres, and the elevation gain from Coimbatore — around 1,500 metres over just a couple of hours of driving — is enough to leave some travellers lightheaded on arrival. Building in a slow first evening rather than a packed itinerary on day one makes a real difference, especially for elderly parents or very young children.\n\nNot every attraction is equally accessible. Elk Falls and the Botanical Garden involve minimal walking and are easy for most mobility levels; Avalanche's forest trek and Catherine Falls' viewpoint steps are better suited to travellers who are comfortable on uneven ground.\n\nA private vehicle with a driver who knows which stops to skip on a tired afternoon — rather than a fixed group-tour schedule — is genuinely the biggest comfort factor for multi-generational trips. It's also why we build flexibility into every family package rather than a rigid hour-by-hour plan.",
      cover_image: "/images/attractions/botanical-garden.jpg",
      author: "Ooty Nigel Travels Desk",
      read_minutes: 4,
      tags: ["family", "tips", "accessibility"],
      category: "Tips",
    },
  ];
const blogPostColumns = ["slug", "title", "excerpt", "content", "cover_image", "author", "read_minutes", "tags", "category"];
const insertBlogPost = db.prepare(
  `INSERT INTO blog_posts (${blogPostColumns.join(", ")})
   VALUES (${blogPostColumns.map((c) => `@${c}`).join(", ")})
   ON CONFLICT(slug) DO UPDATE SET
   ${blogPostColumns.filter((c) => c !== "slug").map((c) => `${c} = @${c}`).join(", ")}`
);
for (const b of blogPosts) {
  await insertBlogPost.run({ ...b, tags: JSON.stringify(b.tags) });
}
console.log(`seeded/updated blog_posts: ${blogPosts.length} rows`);

// ---------- FAQs ----------
await insertIfEmpty(
  "faqs",
  [
    { category: "Booking", question: "Do I need to create an account to book?", answer: "No — every package and transfer can be booked as a guest. Creating an account afterwards links your existing bookings automatically by phone number.", sort_order: 1 },
    { category: "Booking", question: "How far in advance should I book?", answer: "For signature packages, 3-5 days ahead is comfortable. Airport/railway transfers can often be booked same-day, subject to vehicle availability.", sort_order: 2 },
    { category: "Payments", question: "What payment methods are accepted?", answer: "Bookings are confirmed on request, with payment collected via bank transfer or UPI once our team confirms availability.", sort_order: 1 },
    { category: "Payments", question: "Is there a cancellation fee?", answer: "Cancellations made 48+ hours before travel are fee-free. See our Cancellation Policy page for the full schedule.", sort_order: 2 },
    { category: "General", question: "Are your drivers familiar with the ghat roads?", answer: "Yes — every driver on our roster has a minimum of 5 years' experience specifically on Nilgiri ghat routes.", sort_order: 1 },
    { category: "General", question: "Can you customize a package?", answer: "Yes, every signature package is a starting point — use our Custom Tour Planner or contact us directly to adjust duration, stops or vehicle.", sort_order: 2 },
  ],
  (f) =>
    db
      .prepare(
        "INSERT INTO faqs (category, question, answer, sort_order) VALUES (@category, @question, @answer, @sort_order)"
      )
      .run(f)
);

// ---------- Gallery images ----------
function gallery(category, entries) {
  return entries.map((e, i) => ({ category, sort_order: i, featured: 0, caption: null, credit: null, ...e }));
}

const galleryImages = [
  ...gallery("ooty", [
    { src: "/images/destinations/ooty.jpg", alt: "Ooty town wrapped in evening mist", featured: 1 },
    { src: "/images/attractions/rose-garden.jpg", alt: "Terraced blooms at the Government Rose Garden" },
    { src: "/images/attractions/botanical-garden.jpg", alt: "Government Botanical Garden lawns" },
    { src: "/images/attractions/nilgiris.jpg", alt: "Rolling green hills around Ooty" },
    { src: "/images/attractions/shooting-point.jpg", alt: "Shooting Point valley view" },
    { src: "/images/attractions/ooty-2.jpg", alt: "Ooty town streets in the afternoon light" },
    { src: "/images/attractions/ooty-3.jpg", alt: "Ooty town streets in the afternoon light" },
    { src: "/images/attractions/ooty-4.jpg", alt: "Ooty town streets in the afternoon light" },
    { src: "/images/attractions/ooty-5.jpg", alt: "Ooty town streets in the afternoon light" },
    { src: "/images/attractions/nilgiri-mountain-railway.jpg", alt: "The Nilgiri Mountain Railway toy train" },
  ]),
  ...gallery("coonoor", [
    { src: "/images/destinations/coonoor.jpg", alt: "Coonoor hill town at dusk", featured: 1 },
    { src: "/images/attractions/sims-park.jpg", alt: "Terraced botanical garden at Sim's Park" },
    { src: "/images/attractions/dolphins-nose.jpg", alt: "Dolphin's Nose viewpoint over the escarpment" },
    { src: "/images/attractions/coonoor-2.jpg", alt: "Coonoor hill town scenery" },
    { src: "/images/attractions/coonoor-3.jpg", alt: "Coonoor hill town scenery" },
    { src: "/images/attractions/coonoor-4.jpg", alt: "Coonoor hill town scenery" },
    { src: "/images/attractions/coonoor-5.jpg", alt: "Coonoor hill town scenery" },
    { src: "/images/attractions/sims-park-2.jpg", alt: "Terraced lawns at Sim's Park" },
    { src: "/images/attractions/sims-park-3.jpg", alt: "Terraced lawns at Sim's Park" },
    { src: "/images/attractions/sims-park-4.jpg", alt: "Terraced lawns at Sim's Park" },
  ]),
  ...gallery("kotagiri", [
    { src: "/images/destinations/kotagiri.jpg", alt: "Kotagiri tea gardens in morning light", featured: 1 },
    { src: "/images/attractions/kodanad-viewpoint.jpg", alt: "Kodanad Viewpoint over the Nilgiri escarpment" },
    { src: "/images/attractions/kotagiri-2.jpg", alt: "Kotagiri tea country" },
    { src: "/images/attractions/kotagiri-3.jpg", alt: "Kotagiri tea country" },
    { src: "/images/attractions/kotagiri-4.jpg", alt: "Kotagiri tea country" },
    { src: "/images/attractions/kotagiri-5.jpg", alt: "Kotagiri tea country" },
    { src: "/images/attractions/nilgiris-2.jpg", alt: "Hills wrapped in mist near Kotagiri" },
    { src: "/images/attractions/nilgiris-3.jpg", alt: "Hills wrapped in mist near Kotagiri" },
    { src: "/images/attractions/nilgiris-4.jpg", alt: "Hills wrapped in mist near Kotagiri" },
    { src: "/images/attractions/nilgiris-5.jpg", alt: "Hills wrapped in mist near Kotagiri" },
  ]),
  ...gallery("avalanche", [
    { src: "/images/destinations/avalanche-lake.jpg", alt: "Avalanche Lake framed by shola forest", featured: 1 },
    { src: "/images/attractions/avalanche-lake-2.jpg", alt: "Avalanche Lake framed by shola forest" },
    { src: "/images/attractions/avalanche-lake-3.jpg", alt: "Avalanche Lake framed by shola forest" },
    { src: "/images/attractions/avalanche-lake-4.jpg", alt: "Avalanche Lake framed by shola forest" },
    { src: "/images/attractions/avalanche-lake-5.jpg", alt: "Avalanche Lake framed by shola forest" },
    { src: "/images/destinations/avalanche-lake-2.jpg", alt: "Avalanche Lake's emerald water" },
    { src: "/images/destinations/avalanche-lake-3.jpg", alt: "Avalanche Lake's emerald water" },
    { src: "/images/destinations/avalanche-lake-4.jpg", alt: "Avalanche Lake's emerald water" },
    { src: "/images/destinations/avalanche-lake-5.jpg", alt: "Avalanche Lake's emerald water" },
    { src: "/images/gallery/avalanche/1.jpg", alt: "Misty shola forest around Avalanche Lake", credit: "Photo via Unsplash" },
  ]),
  ...gallery("pykara", [
    { src: "/images/attractions/pykara-lake.jpg", alt: "Pykara Lake boat jetty at sunrise", featured: 1 },
    { src: "/images/attractions/pykara-lake-2.jpg", alt: "Pykara Lake and boat jetty" },
    { src: "/images/attractions/pykara-lake-3.jpg", alt: "Pykara Lake and boat jetty" },
    { src: "/images/attractions/pykara-lake-4.jpg", alt: "Pykara Lake and boat jetty" },
    { src: "/images/attractions/pykara-lake-5.jpg", alt: "Pykara Lake and boat jetty" },
    { src: "/images/destinations/pykara-lake-2.jpg", alt: "Pykara Lake boating deck" },
    { src: "/images/destinations/pykara-lake-3.jpg", alt: "Pykara Lake boating deck" },
    { src: "/images/destinations/pykara-lake-4.jpg", alt: "Pykara Lake boating deck" },
    { src: "/images/destinations/pykara-lake-5.jpg", alt: "Pykara Lake boating deck" },
    { src: "/images/gallery/pykara/1.jpg", alt: "Boats docked on Pykara Lake", credit: "Photo via Unsplash" },
  ]),
  ...gallery("doddabetta", [
    { src: "/images/attractions/doddabetta-peak.jpg", alt: "Doddabetta Peak, the Nilgiris' highest point", featured: 1 },
    { src: "/images/attractions/doddabetta-peak-2.jpg", alt: "Doddabetta Peak, the Nilgiris' highest point" },
    { src: "/images/attractions/doddabetta-peak-3.jpg", alt: "Doddabetta Peak, the Nilgiris' highest point" },
    { src: "/images/attractions/doddabetta-peak-4.jpg", alt: "Doddabetta Peak, the Nilgiris' highest point" },
    { src: "/images/attractions/doddabetta-peak-5.jpg", alt: "Doddabetta Peak, the Nilgiris' highest point" },
    { src: "/images/gallery/doddabetta/1.jpg", alt: "Doddabetta Peak telescope house", credit: "Photo via Unsplash" },
    { src: "/images/gallery/doddabetta/2.jpg", alt: "Sunrise view from Doddabetta Peak", credit: "Photo via Unsplash" },
    { src: "/images/gallery/doddabetta/3.jpg", alt: "Panoramic view from the Nilgiris' highest peak", credit: "Photo via Unsplash" },
    { src: "/images/gallery/doddabetta/4.jpg", alt: "Misty mountain peak in the Nilgiris", credit: "Photo via Unsplash" },
    { src: "/images/gallery/doddabetta/5.jpg", alt: "Forest trail up to Doddabetta Peak", credit: "Photo via Unsplash" },
  ]),
  ...gallery("tea-estates", [
    { src: "/images/attractions/tea-gardens.jpg", alt: "Terraced tea gardens near Coonoor", featured: 1 },
    { src: "/images/attractions/tea-factory-museum.jpg", alt: "Working tea factory floor" },
    { src: "/images/attractions/tea-gardens-2.jpg", alt: "Terraced tea gardens near Coonoor" },
    { src: "/images/attractions/tea-gardens-3.jpg", alt: "Terraced tea gardens near Coonoor" },
    { src: "/images/attractions/tea-gardens-4.jpg", alt: "Terraced tea gardens near Coonoor" },
    { src: "/images/attractions/tea-gardens-5.jpg", alt: "Terraced tea gardens near Coonoor" },
    { src: "/images/attractions/tea-factory-museum-2.jpg", alt: "Working tea factory floor" },
    { src: "/images/attractions/tea-factory-museum-3.jpg", alt: "Working tea factory floor" },
    { src: "/images/attractions/tea-factory-museum-4.jpg", alt: "Working tea factory floor" },
    { src: "/images/attractions/tea-factory-museum-5.jpg", alt: "Working tea factory floor" },
  ]),
  ...gallery("waterfalls", [
    { src: "/images/attractions/catherine-falls.jpg", alt: "Catherine Falls cascading through the forest", featured: 1 },
    { src: "/images/attractions/elk-falls.jpg", alt: "Elk Falls in full monsoon flow" },
    { src: "/images/attractions/catherine-falls-2.jpg", alt: "Catherine Falls cascading through the forest" },
    { src: "/images/attractions/catherine-falls-3.jpg", alt: "Catherine Falls cascading through the forest" },
    { src: "/images/attractions/catherine-falls-4.jpg", alt: "Catherine Falls cascading through the forest" },
    { src: "/images/attractions/catherine-falls-5.jpg", alt: "Catherine Falls cascading through the forest" },
    { src: "/images/gallery/waterfalls/1.jpg", alt: "Kalhatti Falls in the Nilgiris", credit: "Photo via Unsplash" },
    { src: "/images/gallery/waterfalls/2.jpg", alt: "Pykara Falls in full flow", credit: "Photo via Unsplash" },
    { src: "/images/gallery/waterfalls/3.jpg", alt: "Kattery Falls near Coonoor", credit: "Photo via Unsplash" },
    { src: "/images/gallery/waterfalls/4.jpg", alt: "A forest waterfall in the Western Ghats", credit: "Photo via Unsplash" },
  ]),
  ...gallery("lakes", [
    { src: "/images/destinations/ooty-lake.jpg", alt: "Boats on Ooty Lake", featured: 1 },
    { src: "/images/destinations/ooty-lake-2.jpg", alt: "Boats on Ooty Lake" },
    { src: "/images/destinations/ooty-lake-3.jpg", alt: "Boats on Ooty Lake" },
    { src: "/images/destinations/ooty-lake-4.jpg", alt: "Boats on Ooty Lake" },
    { src: "/images/destinations/ooty-lake-5.jpg", alt: "Boats on Ooty Lake" },
    { src: "/images/gallery/lakes/1.jpg", alt: "A mountain lake reflecting the hills", credit: "Photo via Unsplash" },
    { src: "/images/gallery/lakes/2.jpg", alt: "Boating at sunrise on a hill-station lake", credit: "Photo via Unsplash" },
    { src: "/images/gallery/lakes/3.jpg", alt: "Still lake water framed by mountains", credit: "Photo via Unsplash" },
    { src: "/images/gallery/lakes/4.jpg", alt: "Misty lakeshore in the hills", credit: "Photo via Unsplash" },
    { src: "/images/gallery/lakes/5.jpg", alt: "A rowing boat crossing a mountain lake", credit: "Photo via Unsplash" },
  ]),
  ...gallery("forest", [
    { src: "/images/attractions/pine-forest.jpg", alt: "Sunlight through a pine forest", featured: 1 },
    { src: "/images/attractions/wenlock-downs.jpg", alt: "Open grassland at Wenlock Downs" },
    { src: "/images/destinations/pine-forest.jpg", alt: "Misty pine forest trail" },
    { src: "/images/attractions/pine-forest-2.jpg", alt: "Sunlight through a pine forest" },
    { src: "/images/attractions/pine-forest-3.jpg", alt: "Sunlight through a pine forest" },
    { src: "/images/attractions/pine-forest-4.jpg", alt: "Sunlight through a pine forest" },
    { src: "/images/attractions/pine-forest-5.jpg", alt: "Sunlight through a pine forest" },
    { src: "/images/attractions/wenlock-downs-2.jpg", alt: "Open grassland at Wenlock Downs" },
    { src: "/images/attractions/wenlock-downs-3.jpg", alt: "Open grassland at Wenlock Downs" },
    { src: "/images/attractions/wenlock-downs-4.jpg", alt: "Open grassland at Wenlock Downs" },
  ]),
  ...gallery("adventure", [
    { src: "/images/trip-styles/Adventure.jpg", alt: "Friends hiking a forest trail", featured: 1 },
    { src: "/images/gallery/adventure/1.jpg", alt: "Hikers on a mountain trail", credit: "Photo via Unsplash" },
    { src: "/images/gallery/adventure/2.jpg", alt: "Zipline adventure through the forest canopy", credit: "Photo via Unsplash" },
    { src: "/images/gallery/adventure/3.jpg", alt: "Camping under the Nilgiri night sky", credit: "Photo via Unsplash" },
    { src: "/images/gallery/adventure/4.jpg", alt: "Mountain biking a forest trail", credit: "Photo via Unsplash" },
    { src: "/images/gallery/adventure/5.jpg", alt: "Rock climbing a Nilgiri cliff face", credit: "Photo via Unsplash" },
    { src: "/images/gallery/adventure/6.jpg", alt: "River rafting through the hills", credit: "Photo via Unsplash" },
    { src: "/images/gallery/adventure/7.jpg", alt: "Rappelling down a forest waterfall", credit: "Photo via Unsplash" },
    { src: "/images/gallery/adventure/8.jpg", alt: "Off-road jeep trail through the forest", credit: "Photo via Unsplash" },
    { src: "/images/gallery/adventure/9.jpg", alt: "Paragliding over the Nilgiri hills", credit: "Photo via Unsplash" },
  ]),
  ...gallery("wildlife", [
    { src: "/images/destinations/mudumalai.jpg", alt: "Mudumalai National Park grassland", featured: 1 },
    { src: "/images/gallery/wildlife/1.jpg", alt: "Wild elephant in the Nilgiri forest", credit: "Photo via Unsplash" },
    { src: "/images/gallery/wildlife/2.jpg", alt: "Spotted deer at a wildlife sanctuary", credit: "Photo via Unsplash" },
    { src: "/images/gallery/wildlife/3.jpg", alt: "Indian gaur grazing near the forest edge", credit: "Photo via Unsplash" },
    { src: "/images/gallery/wildlife/4.jpg", alt: "Nilgiri langur in the forest canopy", credit: "Photo via Unsplash" },
    { src: "/images/destinations/mudumalai-2.jpg", alt: "Mudumalai National Park grassland" },
    { src: "/images/destinations/mudumalai-3.jpg", alt: "Mudumalai National Park grassland" },
    { src: "/images/destinations/mudumalai-4.jpg", alt: "Mudumalai National Park grassland" },
    { src: "/images/gallery/wildlife/5.jpg", alt: "Sambar deer in Mudumalai forest", credit: "Photo via Unsplash" },
    { src: "/images/gallery/wildlife/6.jpg", alt: "Hornbill in the Nilgiri forest canopy", credit: "Photo via Unsplash" },
  ]),
  ...gallery("vehicles", [
    { src: "/images/fleet/audi-a3-three-quarter.png", alt: "Audi A3 Premium — three-quarter view", featured: 1 },
    { src: "/images/fleet/audi-a3-front.png", alt: "Audi A3 Premium — front" },
    { src: "/images/fleet/toyota-innova-front.png", alt: "Toyota Innova Crysta — front" },
    { src: "/images/fleet/toyota-innova-rear.png", alt: "Toyota Innova Crysta — rear" },
    { src: "/images/fleet/tempo-traveller.png", alt: "Force Tempo Traveller for group travel" },
    { src: "/images/fleet/maruti-dzire-three-quarter.png", alt: "Maruti Suzuki Dzire — three-quarter view" },
    { src: "/images/fleet/maruti-dzire-left.png", alt: "Maruti Suzuki Dzire — left profile" },
    { src: "/images/fleet/maruti-dzire-front.png", alt: "Maruti Suzuki Dzire — front" },
    { src: "/images/gallery/vehicles/1.jpg", alt: "Chauffeur-driven car on a hill road", credit: "Photo via Unsplash" },
    { src: "/images/gallery/vehicles/2.jpg", alt: "Family sedan on a mountain drive", credit: "Photo via Unsplash" },
  ]),
  ...gallery(
    "customer-memories",
    Array.from({ length: 11 }, (_, i) => ({
      src: `/images/gallery/customer-memories/${i + 1}.jpeg`,
      alt: "A guest's trip with Ooty Nigel Travels",
      featured: i === 0 ? 1 : 0,
    }))
  ),
  ...gallery("drone-photography", [
    { src: "/images/gallery/drone-photography/1.jpg", alt: "Aerial view of a hill station", credit: "Photo via Unsplash", featured: 1 },
    { src: "/images/gallery/drone-photography/2.jpg", alt: "Aerial view of tea plantations", credit: "Photo via Unsplash" },
    { src: "/images/gallery/drone-photography/3.jpg", alt: "Aerial view of a mountain valley road", credit: "Photo via Unsplash" },
    { src: "/images/gallery/drone-photography/4.jpg", alt: "Aerial view of a lake surrounded by forest", credit: "Photo via Unsplash" },
    { src: "/images/gallery/drone-photography/5.jpg", alt: "Aerial view of a winding mountain road", credit: "Photo via Unsplash" },
    { src: "/images/gallery/drone-photography/6.jpg", alt: "Aerial view of a forest reservoir", credit: "Photo via Unsplash" },
    { src: "/images/gallery/drone-photography/7.jpg", alt: "Aerial view of hairpin bends on a ghat road", credit: "Photo via Unsplash" },
    { src: "/images/gallery/drone-photography/8.jpg", alt: "Aerial view of green valley terraces", credit: "Photo via Unsplash" },
    { src: "/images/gallery/drone-photography/9.jpg", alt: "Drone shot of misty hills at sunrise", credit: "Photo via Unsplash" },
    { src: "/images/gallery/drone-photography/10.jpg", alt: "Aerial view of a small hill town", credit: "Photo via Unsplash" },
  ]),
  ...gallery("sunrise", [
    { src: "/images/gallery/sunrise/1.jpg", alt: "Sunrise over misty hills", credit: "Photo via Unsplash", featured: 1 },
    { src: "/images/gallery/sunrise/2.jpg", alt: "Sunrise over a tea plantation", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunrise/3.jpg", alt: "Sunrise fog filling a mountain valley", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunrise/4.jpg", alt: "Sunrise clouds over a hill station", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunrise/5.jpg", alt: "Golden sunrise light through a forest", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunrise/6.jpg", alt: "Sunrise over a valley of clouds", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunrise/7.jpg", alt: "Silhouetted trees at sunrise", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunrise/8.jpg", alt: "Sunrise reflected on a mountain lake", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunrise/9.jpg", alt: "Hikers watching the sunrise from a viewpoint", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunrise/10.jpg", alt: "Orange sky at sunrise over a hill station", credit: "Photo via Unsplash" },
  ]),
  ...gallery("sunset", [
    { src: "/images/gallery/sunset/1.jpg", alt: "Golden hour sunset over the hills", credit: "Photo via Unsplash", featured: 1 },
    { src: "/images/gallery/sunset/2.jpg", alt: "Sunset over a mountain lake", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunset/3.jpg", alt: "Silhouetted hills at sunset", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunset/4.jpg", alt: "Golden light over a tea garden", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunset/5.jpg", alt: "Sunset over a tea plantation", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunset/6.jpg", alt: "Silhouetted mountains at sunset", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunset/7.jpg", alt: "A road trip through the hills at sunset", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunset/8.jpg", alt: "Sunset clouds over a valley", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunset/9.jpg", alt: "Golden hour light through a forest", credit: "Photo via Unsplash" },
    { src: "/images/gallery/sunset/10.jpg", alt: "Sunset over a lake with boats", credit: "Photo via Unsplash" },
  ]),
  ...gallery("food", [
    { src: "/images/gallery/food/1.jpg", alt: "South Indian breakfast — dosa and idli", credit: "Photo via Unsplash", featured: 1 },
    { src: "/images/gallery/food/2.jpg", alt: "Filter coffee at a tea estate", credit: "Photo via Unsplash" },
    { src: "/images/gallery/food/3.jpg", alt: "A full South Indian thali", credit: "Photo via Unsplash" },
    { src: "/images/gallery/food/4.jpg", alt: "Homemade hill-station cooking", credit: "Photo via Unsplash" },
    { src: "/images/gallery/food/5.jpg", alt: "A banana-leaf South Indian meal", credit: "Photo via Unsplash" },
    { src: "/images/gallery/food/6.jpg", alt: "Masala chai at a hill-station stall", credit: "Photo via Unsplash" },
    { src: "/images/gallery/food/7.jpg", alt: "A fresh cup of Nilgiri tea", credit: "Photo via Unsplash" },
    { src: "/images/gallery/food/8.jpg", alt: "Indian street food and snacks", credit: "Photo via Unsplash" },
    { src: "/images/gallery/food/9.jpg", alt: "Homestyle curry and rice", credit: "Photo via Unsplash" },
    { src: "/images/gallery/food/10.jpg", alt: "Hot samosas with tea", credit: "Photo via Unsplash" },
  ]),
  ...gallery("hotels", [
    { src: "/images/gallery/hotels/2.jpg", alt: "Cozy mountain resort room", credit: "Photo via Unsplash", featured: 1 },
    { src: "/images/gallery/hotels/3.jpg", alt: "Hotel balcony with a mountain view", credit: "Photo via Unsplash" },
    { src: "/images/gallery/hotels/4.jpg", alt: "Resort swimming pool in the hills", credit: "Photo via Unsplash" },
    { src: "/images/gallery/hotels/5.jpg", alt: "Hotel room with a mountain-view window", credit: "Photo via Unsplash" },
    { src: "/images/gallery/hotels/6.jpg", alt: "Resort dining area in the hills", credit: "Photo via Unsplash" },
    { src: "/images/gallery/hotels/7.jpg", alt: "Cozy hotel lobby with a fireplace", credit: "Photo via Unsplash" },
    { src: "/images/gallery/hotels/8.jpg", alt: "Resort garden with a hill view", credit: "Photo via Unsplash" },
    { src: "/images/gallery/hotels/9.jpg", alt: "Hotel bedroom in a hill station", credit: "Photo via Unsplash" },
    { src: "/images/gallery/hotels/10.jpg", alt: "Mountain resort exterior in the evening", credit: "Photo via Unsplash" },
    { src: "/images/gallery/hotels/11.jpg", alt: "Boutique hotel room in the hills", credit: "Photo via Unsplash" },
  ]),
  ...gallery("festivals", [
    { src: "/images/gallery/festivals/1.jpg", alt: "Local festival celebration with colour", credit: "Photo via Unsplash", featured: 1 },
    { src: "/images/gallery/festivals/2.jpg", alt: "Diwali lights celebration", credit: "Photo via Unsplash" },
    { src: "/images/gallery/festivals/3.jpg", alt: "South Indian temple festival colours", credit: "Photo via Unsplash" },
    { src: "/images/gallery/festivals/4.jpg", alt: "Diwali oil lamps at celebration", credit: "Photo via Unsplash" },
    { src: "/images/gallery/festivals/5.jpg", alt: "Holi colour festival crowd", credit: "Photo via Unsplash" },
    { src: "/images/gallery/festivals/6.jpg", alt: "Traditional festival dance performance", credit: "Photo via Unsplash" },
    { src: "/images/gallery/festivals/7.jpg", alt: "Flower rangoli festival decoration", credit: "Photo via Unsplash" },
    { src: "/images/gallery/festivals/8.jpg", alt: "Festival fireworks at night", credit: "Photo via Unsplash" },
    { src: "/images/gallery/festivals/9.jpg", alt: "Harvest festival celebration", credit: "Photo via Unsplash" },
    { src: "/images/gallery/festivals/10.jpg", alt: "Festival street procession", credit: "Photo via Unsplash" },
  ]),
];

const availableGalleryImages = galleryImages.filter((g) =>
  fs.existsSync(path.join(ROOT, "public", g.src))
);
if (availableGalleryImages.length < galleryImages.length) {
  console.log(
    `skipping ${galleryImages.length - availableGalleryImages.length} gallery image row(s) — file not yet downloaded (rerun scripts/fetch-gallery-images.mjs)`
  );
}

// Insert-if-missing per row (rather than insertIfEmpty) so that re-running
// this script after scripts/fetch-gallery-images.mjs downloads more photos
// (e.g. once an Unsplash rate limit resets) picks up the newly-available
// rows instead of skipping the whole table because it already has rows.
const existsBySrc = db.prepare("SELECT 1 FROM gallery_images WHERE src = ?");
const insertGalleryImage = db.prepare(
  `INSERT INTO gallery_images (category, src, alt, caption, credit, featured, sort_order)
   VALUES (@category, @src, @alt, @caption, @credit, @featured, @sort_order)`
);
let insertedGalleryRows = 0;
for (const g of availableGalleryImages) {
  if (await existsBySrc.get(g.src)) continue;
  await insertGalleryImage.run(g);
  insertedGalleryRows++;
}
console.log(
  insertedGalleryRows > 0
    ? `seeded gallery_images: ${insertedGalleryRows} new row(s)`
    : "skip gallery_images (no new rows)"
);

await db.close();
console.log("\nSeed complete.");
