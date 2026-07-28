import type { ScenicVariant } from "@/components/ui/ScenicArt";

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceStep {
  step: string;
  detail: string;
}

export interface ServiceContent {
  slug: string;
  /** Short name used in nav/cards, e.g. "Airport Transfer" */
  name: string;
  seoTitle: string;
  metaDescription: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroVariant: ScenicVariant;
  /** Card blurb for the /services hub grid */
  cardBlurb: string;
  overview: string[];
  highlights: string[];
  howItWorks: ServiceStep[];
  faqs: ServiceFaq[];
  /** Filters relatedPackages by TourPackage.category when set */
  relatedPackageCategory?: string;
}

export const SERVICES: ServiceContent[] = [
  {
    slug: "ooty-taxi-service",
    name: "Ooty Taxi Service",
    seoTitle: "Ooty Taxi Service — Ooty Cab & Call Taxi Booking",
    metaDescription:
      "Book a reliable Ooty taxi or call taxi with Ooty Nigel Travels — clean cars, verified drivers, transparent fares and 24×7 availability across Ooty and the Nilgiris.",
    eyebrow: "Ooty Taxi & Cab",
    heroTitle: "Ooty taxi service you can call any hour",
    heroDescription:
      "Ooty Nigel Travels is a call-taxi and cab-booking service for the Nilgiris — airport runs, station pickups, local sightseeing and outstation drops, all with a private chauffeur.",
    heroVariant: "mountains",
    cardBlurb: "Call-taxi and cab booking across Ooty, on call 24×7.",
    overview: [
      "Ooty Nigel Travels runs a dedicated taxi and cab-booking desk for Ooty (Udhagamandalam) and the wider Nilgiris — the same service locals mean when they search for an \"Ooty call taxi\" or \"Ooty cab.\" Every car on the road is maintained, insured and driven by a chauffeur who knows the ghat roads, hairpin bends and weather patterns of the hills.",
      "Whether it's a quick local hop across town, a scheduled airport or station transfer, or a same-day outstation trip, one call or WhatsApp message is enough to get a car moving. There's no app to install and no waiting on a street corner — the taxi is booked ahead and arrives at your door.",
      "Fares are quoted upfront over WhatsApp or phone before you confirm, so there are no surprises at drop-off. For fixed itineraries and multi-day plans, browse our packages instead — this service is built for point-to-point and on-demand journeys.",
    ],
    highlights: [
      "24×7 call-taxi availability, including early-morning airport runs",
      "Sedans, SUVs and vans for solo travellers up to large family groups",
      "Chauffeurs experienced on the Ooty–Coonoor–Kotagiri ghat roads",
      "Clear, upfront fare quotes before you confirm — no meter surprises",
    ],
    howItWorks: [
      { step: "Share your trip details", detail: "Call, WhatsApp or use the booking form with pickup point, drop point and time." },
      { step: "Get an instant quote", detail: "We confirm the vehicle type and fare within minutes." },
      { step: "Track your driver", detail: "Once confirmed, you get the driver's name, number and vehicle details ahead of pickup." },
      { step: "Ride, relax, arrive", detail: "Pay on completion — cash or UPI, your choice." },
    ],
    faqs: [
      {
        question: "How quickly can an Ooty taxi be arranged?",
        answer:
          "For same-day local trips within Ooty town, a car can usually reach you within 20–30 minutes. Airport, station and outstation transfers are best booked a few hours ahead, or the previous evening for early-morning pickups.",
      },
      {
        question: "Do you operate at night?",
        answer: "Yes — the call-taxi desk runs 24×7, including late-night airport arrivals and early hill-station departures.",
      },
      {
        question: "Can I book a taxi for just a few hours in Ooty?",
        answer: "Yes, short local-use bookings (a few hours or half a day) are available — see our Local Sightseeing Taxi service for day-use car hire with a driver.",
      },
      {
        question: "What vehicles are available?",
        answer: "Hatchbacks and sedans for 2–4 passengers, SUVs for 5–6, and Tempo Travellers/vans for larger groups — see the full fleet for seating and luggage capacity.",
      },
    ],
  },
  {
    slug: "airport-transfer",
    name: "Airport Transfer",
    seoTitle: "Ooty Airport Pickup & Coimbatore Airport Taxi Transfer",
    metaDescription:
      "Coimbatore Airport to Ooty taxi transfers with flight-tracked pickups, meet-and-greet at arrivals, and a fixed fare quoted in advance.",
    eyebrow: "Airport Pickup & Drop",
    heroTitle: "Coimbatore Airport ⇄ Ooty, met at arrivals",
    heroDescription:
      "The nearest airport to Ooty is Coimbatore International Airport (CJB), roughly 3 hours away by road. We track your flight and have the car waiting.",
    heroVariant: "forest",
    cardBlurb: "Flight-tracked Coimbatore Airport pickups and drops to Ooty.",
    overview: [
      "Coimbatore International Airport (CJB) is the closest airport to Ooty, around 100 km and roughly 3 hours away via the Mettupalayam ghat road. For travellers flying in from Chennai, Bangalore, Mumbai, Delhi or overseas via a connecting flight, an airport transfer is usually the first leg of an Ooty trip.",
      "We track your flight number, so the driver adjusts for early or delayed landings — there's no charge for reasonable wait time at arrivals. Your driver waits at the exit with a name board, helps with luggage, and drives you straight to your hotel or homestay in Ooty, Coonoor or Kotagiri.",
      "The same service runs in reverse for departures — book a drop transfer timed to your flight, with enough buffer built in for the ghat road and any weekend traffic near Mettupalayam.",
    ],
    highlights: [
      "Live flight tracking — no extra charge for delayed landings",
      "Meet-and-greet at arrivals with a name board",
      "Fixed, upfront fare agreed before the flight lands",
      "Return/departure transfers timed to your flight",
    ],
    howItWorks: [
      { step: "Share your flight details", detail: "Flight number, arrival time and drop address (or pickup point for departures)." },
      { step: "Get a fixed quote", detail: "One fare covering the full Coimbatore–Ooty leg, confirmed before you fly." },
      { step: "Meet your driver", detail: "Driver waits at arrivals with a name board; flight delays are tracked automatically." },
      { step: "Straight to your stay", detail: "Non-stop drive up the ghat road to your hotel, homestay or the next leg of your trip." },
    ],
    faqs: [
      {
        question: "How long is the drive from Coimbatore Airport to Ooty?",
        answer: "Approximately 86–100 km depending on the route taken, typically 3 to 3.5 hours via the Mettupalayam–Coonoor ghat road with its well-known hairpin bends.",
      },
      {
        question: "What happens if my flight is delayed?",
        answer: "We track your flight number and adjust the pickup time automatically — there's no extra charge for a delayed landing.",
      },
      {
        question: "Can you also book a return airport drop?",
        answer: "Yes, drop transfers to Coimbatore Airport are timed against your departure flight with buffer for ghat-road travel time.",
      },
      {
        question: "Is Coimbatore the only airport near Ooty?",
        answer: "It's the closest and most commonly used. Mysore and Bangalore airports are also reachable — see our route pages for those transfers.",
      },
    ],
    relatedPackageCategory: "honeymoon",
  },
  {
    slug: "railway-bus-stand-pickup",
    name: "Railway & Bus Stand Pickup",
    seoTitle: "Mettupalayam Railway Station & Ooty Bus Stand Taxi Pickup",
    metaDescription:
      "Taxi pickup from Mettupalayam and Coimbatore railway stations, and Ooty/Coimbatore bus stands — timed to your train or bus arrival.",
    eyebrow: "Station & Bus Stand Transfers",
    heroTitle: "Met at the station, met at the stand",
    heroDescription:
      "Arriving by the Nilgiri Mountain Railway, an overnight train into Coimbatore, or an overnight bus — a driver is waiting either way.",
    heroVariant: "tea-rows",
    cardBlurb: "Timed pickups from railway stations and bus stands.",
    overview: [
      "Many Ooty trips begin at Mettupalayam railway station — the starting point of the UNESCO-listed Nilgiri Mountain Railway — or at Coimbatore Junction for travellers arriving by overnight train from Chennai, Bangalore or further afield. Others arrive by overnight bus into the Ooty or Coimbatore bus stand.",
      "We track train and bus arrival times where available, and the driver waits at the platform or stand with a name board. Luggage help is included, and the drive up into the hills starts as soon as you're in the car.",
      "This is a point-to-point transfer, not a scheduled shuttle — the car is booked for you alone (or your group), at the time you actually arrive.",
    ],
    highlights: [
      "Covers Mettupalayam Railway Station, Coimbatore Junction, and Ooty/Coimbatore bus stands",
      "Driver waits at the platform/stand with a name board",
      "Arrival-time tracking where the train or bus service allows it",
      "Direct drive into Ooty, Coonoor or Kotagiri — no shared shuttle",
    ],
    howItWorks: [
      { step: "Share your arrival details", detail: "Train/bus number, expected arrival time, and your onward destination in the hills." },
      { step: "Confirm the fare", detail: "One quote for the full transfer, agreed before you travel." },
      { step: "Driver meets you", detail: "Name board at the platform exit or bus stand, luggage help included." },
      { step: "Straight to your stay", detail: "No stops, no shared shuttle — direct to your hotel or homestay." },
    ],
    faqs: [
      {
        question: "Do you pick up from Mettupalayam railway station?",
        answer: "Yes — Mettupalayam is the base station for the Nilgiri Mountain Railway toy train, and a common arrival point for an Ooty taxi pickup.",
      },
      {
        question: "What if my train or bus is delayed?",
        answer: "We track arrival times where the service provides live status and adjust the pickup accordingly, at no extra charge for reasonable delays.",
      },
      {
        question: "Can you pick up a group from the bus stand?",
        answer: "Yes — larger groups are matched to an SUV or Tempo Traveller depending on headcount and luggage.",
      },
    ],
  },
  {
    slug: "one-way-taxi",
    name: "One Way Taxi",
    seoTitle: "Ooty One Way Taxi — Drop Service to/from Ooty",
    metaDescription:
      "One-way taxi drop to or from Ooty — pay only for the distance travelled, no return-fare charged. Coimbatore, Mysore, Bangalore and Nilgiris routes covered.",
    eyebrow: "One Way Drop",
    heroTitle: "One-way taxi — pay for the trip you actually take",
    heroDescription:
      "Travelling into Ooty but flying or training back from elsewhere? A one-way drop means you're not charged for a return leg you won't use.",
    heroVariant: "lake",
    cardBlurb: "Single-leg taxi drop, no return-fare charged.",
    overview: [
      "A one-way taxi is the right fit whenever your onward plans don't loop back through the same pickup point — arriving into Ooty from Coimbatore, Mysore or Bangalore and then flying out from a different city, or a single drop from Ooty to any nearby town.",
      "Unlike a round-trip booking, a one-way fare reflects only the distance actually driven between your two points, with no return leg built into the price. It suits solo drops, one-direction relocations, and travellers combining a taxi leg with a train or flight for the return.",
      "Available on all our common routes — Coimbatore to Ooty, Mysore to Ooty, Bangalore to Ooty, and transfers between Ooty, Coonoor, Kotagiri and Mudumalai.",
    ],
    highlights: [
      "Pay only for the distance actually travelled — no return leg charged",
      "Available on all major routes into and out of the Nilgiris",
      "Same clean cars and verified drivers as our round-trip service",
      "Ideal when your onward journey continues by flight or train",
    ],
    howItWorks: [
      { step: "Tell us your route", detail: "Pickup point, drop point, date and preferred time." },
      { step: "Get a one-way quote", detail: "Fare reflects the single leg only — no return distance included." },
      { step: "Confirm and travel", detail: "Driver details shared ahead of pickup." },
    ],
    faqs: [
      {
        question: "Is a one-way taxi cheaper than a round trip?",
        answer: "For a single leg, yes — you're charged for the distance actually driven, not a return leg you won't use.",
      },
      {
        question: "Which routes offer a one-way drop?",
        answer: "All major routes — Coimbatore to Ooty, Mysore to Ooty, Bangalore to Ooty, and transfers between Ooty, Coonoor, Kotagiri and Mudumalai.",
      },
      {
        question: "Can I book a one-way taxi for the same day?",
        answer: "Same-day bookings are often possible depending on vehicle availability — call or WhatsApp to check the nearest available slot.",
      },
    ],
  },
  {
    slug: "round-trip-taxi",
    name: "Round Trip Taxi",
    seoTitle: "Ooty Round Trip Taxi — Outstation Return Journeys",
    metaDescription:
      "Round-trip and outstation taxi bookings to Ooty with the same car and driver for the full journey, out and back.",
    eyebrow: "Round Trip / Outstation",
    heroTitle: "Round trip taxi — one car, one driver, there and back",
    heroDescription:
      "Keep the same car and chauffeur for the whole trip — outbound, days in the hills, and the return leg home.",
    heroVariant: "mountains",
    cardBlurb: "Outstation round trips with the same car and driver throughout.",
    overview: [
      "A round-trip (outstation) taxi keeps the same vehicle and chauffeur for your entire journey — the drive up to Ooty, time spent sightseeing across the hills, and the drive back to your starting city, whether that's Coimbatore, Mysore, Bangalore or elsewhere in the Nilgiris circuit.",
      "This suits travellers who want a familiar driver throughout, flexibility to make stops along the ghat road (viewpoints, tea estates, breakfast halts), and a single fare covering the full out-and-back distance.",
      "For multi-day itineraries with a fixed day-by-day plan, our tour packages bundle this kind of round-trip transport with a curated schedule — this service is for travellers who want the transport handled with their own loose itinerary.",
    ],
    highlights: [
      "Same car and driver for the entire out-and-back journey",
      "Flexible stops en route — viewpoints, tea estates, breakfast halts",
      "One combined fare for the full round trip",
      "Available on Coimbatore, Mysore, Bangalore and Nilgiris-circuit routes",
    ],
    howItWorks: [
      { step: "Share your travel window", detail: "Start city, travel dates, and roughly how many days you'll be in the hills." },
      { step: "Get a round-trip quote", detail: "One fare covering the outbound and return legs." },
      { step: "Travel with one driver", detail: "The same chauffeur and car for the whole trip, available for local runs in between if needed." },
    ],
    faqs: [
      {
        question: "Does the same driver stay with me the whole trip?",
        answer: "Yes — a round-trip booking keeps the same car and chauffeur for the outbound leg, your time in the hills, and the return journey.",
      },
      {
        question: "Can we stop along the way?",
        answer: "Yes — the ghat road has well-known viewpoints and tea-estate stops, and the driver is happy to pause for photos or breakfast.",
      },
      {
        question: "How is this different from a tour package?",
        answer: "A round-trip taxi covers transport only, on your own loose schedule. Our tour packages add a fixed day-by-day itinerary on top.",
      },
    ],
    relatedPackageCategory: "family",
  },
  {
    slug: "local-sightseeing-taxi",
    name: "Local Sightseeing Taxi",
    seoTitle: "Ooty Local Sightseeing Taxi — Day Car Hire with Driver",
    metaDescription:
      "Hire a taxi with driver for a day of local sightseeing in Ooty — Botanical Garden, Doddabetta, Rose Garden, tea estates and more, at your own pace.",
    eyebrow: "Local Sightseeing",
    heroTitle: "See Ooty at your own pace, one day at a time",
    heroDescription:
      "A car and driver for the day — set your own stops among Ooty's gardens, viewpoints and tea estates, no fixed group tour timetable.",
    heroVariant: "tea-rows",
    cardBlurb: "Day-use car hire with driver for Ooty local sightseeing.",
    overview: [
      "Local sightseeing is a single day (or half-day) car hire with a driver, built for travellers who want to see Ooty's landmarks — Botanical Garden, Rose Garden, Doddabetta Peak, Ooty Lake, a tea factory, and nearby viewpoints — without joining a fixed-timetable group tour.",
      "The car and driver are yours for the hours booked; the stops, pace and order are up to you. Drivers know the local roads well and can suggest a sensible route to fit the most into a morning or a full day, including quieter spots beyond the main tourist stops.",
      "This works well as a standalone day in Ooty, or as one day slotted into a longer multi-day trip alongside our Coonoor, Kotagiri or Mudumalai destination pages.",
    ],
    highlights: [
      "Half-day or full-day car hire with driver, no fixed group timetable",
      "Covers Botanical Garden, Rose Garden, Doddabetta, Ooty Lake, tea estates and more",
      "Set your own pace and stop order",
      "Works as a standalone day or as part of a longer trip",
    ],
    howItWorks: [
      { step: "Pick your day and duration", detail: "Half-day or full-day, starting from your hotel." },
      { step: "Share your must-see spots", detail: "We'll suggest a sensible route covering them plus a few extras." },
      { step: "Explore at your pace", detail: "The driver waits at each stop — no rushing between attractions." },
    ],
    faqs: [
      {
        question: "What's included in local sightseeing?",
        answer: "The car and driver for the booked hours — fuel and driver allowance are included; entry tickets to gardens/attractions are paid separately at the gate.",
      },
      {
        question: "How many places can we cover in a day?",
        answer: "Most full-day local sightseeing covers 5–7 stops comfortably, depending on how long you linger at each one.",
      },
      {
        question: "Can this be combined with a Coonoor or Kotagiri day trip?",
        answer: "Yes — see our Destinations pages for Coonoor and Kotagiri, which can be booked as a separate day or combined into a longer package.",
      },
    ],
  },
  {
    slug: "corporate-tour",
    name: "Corporate Tour",
    seoTitle: "Corporate Travel & Group Transport in Ooty",
    metaDescription:
      "Corporate offsites, MICE groups and business travel transport in Ooty — multi-vehicle coordination, fixed billing, and dedicated point of contact.",
    eyebrow: "Corporate & Group Travel",
    heroTitle: "Corporate travel, handled end to end",
    heroDescription:
      "Offsites, incentive trips and business travel for teams of any size — coordinated transport with a single point of contact.",
    heroVariant: "forest",
    cardBlurb: "Corporate offsites and group transport with centralised billing.",
    overview: [
      "Corporate groups travelling to Ooty for an offsite, incentive trip, or business visit need transport that scales — from a single executive car to a multi-vehicle convoy for a large team, coordinated to arrive together.",
      "We assign a single point of contact for the whole booking, coordinate pickup times across multiple vehicles (airport, station, or hotel-to-venue transfers), and consolidate billing into one invoice rather than separate receipts per car.",
      "This service pairs well with our fleet of sedans, SUVs and Tempo Travellers for teams of any size, and can be scheduled around a fixed offsite agenda with adjustments for changing flight times.",
    ],
    highlights: [
      "Single point of contact for multi-vehicle group bookings",
      "Coordinated pickup timing across cars for teams arriving together",
      "Consolidated invoicing for corporate accounting",
      "Scales from a single executive car to a full team convoy",
    ],
    howItWorks: [
      { step: "Share your group plan", detail: "Headcount, arrival points, dates and the offsite agenda." },
      { step: "Get a fleet proposal", detail: "Vehicle mix and coordinated timing plan, with one consolidated quote." },
      { step: "One contact, whole trip", detail: "A single coordinator handles changes across all vehicles." },
    ],
    faqs: [
      {
        question: "Can you coordinate multiple vehicles arriving at the same time?",
        answer: "Yes — pickup times across cars (airport, station or hotel transfers) are coordinated so the group arrives together.",
      },
      {
        question: "Do you provide a single consolidated invoice?",
        answer: "Yes — corporate bookings are billed as one consolidated invoice rather than per-vehicle receipts.",
      },
      {
        question: "What's the largest group you can handle?",
        answer: "Fleet size scales to the booking — from a single executive sedan to several Tempo Travellers for large teams. Share your headcount for a fleet proposal.",
      },
    ],
  },
  {
    slug: "coimbatore-to-ooty-taxi",
    name: "Coimbatore to Ooty Taxi",
    seoTitle: "Coimbatore to Ooty Taxi — Fare, Route & Booking",
    metaDescription:
      "Book a Coimbatore to Ooty taxi — approx. 86 km via the Mettupalayam ghat road, around 3 hours, one-way or round trip.",
    eyebrow: "Coimbatore ⇄ Ooty Route",
    heroTitle: "Coimbatore to Ooty, up the 36 hairpin bends",
    heroDescription:
      "The classic route into the Nilgiris — Coimbatore through Mettupalayam and the famous ghat road climb to Ooty.",
    heroVariant: "mountains",
    cardBlurb: "Coimbatore to Ooty taxi — approx. 86 km / 3 hours via Mettupalayam.",
    overview: [
      "The Coimbatore–Ooty road is the most travelled route into the Nilgiris, connecting Coimbatore city and Coimbatore International Airport to Ooty via Mettupalayam and the ghat road's well-known sequence of hairpin bends up through Coonoor.",
      "At roughly 86 km, the drive typically takes about 3 to 3.5 hours depending on traffic near Mettupalayam and weather on the ghat section. It's used equally by airport arrivals, travellers coming from Coimbatore Junction railway station, and anyone driving up from the city.",
      "Available as a one-way drop or a round trip with the same driver — see our One Way Taxi and Round Trip Taxi services for how fares are structured on this route.",
    ],
    highlights: [
      "Approx. 86 km, roughly 3–3.5 hours by road",
      "Via Mettupalayam and the Coonoor ghat road's hairpin bends",
      "Covers Coimbatore city, Coimbatore Junction and Coimbatore Airport starts",
      "One-way or round-trip fares available",
    ],
    howItWorks: [
      { step: "Share your pickup point", detail: "Coimbatore city, Coimbatore Junction, or the airport, plus your Ooty drop address." },
      { step: "Choose one-way or round trip", detail: "Get a fare quote matching your travel plan." },
      { step: "Travel the ghat road", detail: "A driver experienced on this exact route takes you up through Mettupalayam and Coonoor." },
    ],
    faqs: [
      {
        question: "How far is Ooty from Coimbatore?",
        answer: "Approximately 86 km by road, typically a 3 to 3.5 hour drive via Mettupalayam and the Coonoor ghat road.",
      },
      {
        question: "Is the ghat road safe at night?",
        answer: "The ghat section has hairpin bends and limited lighting — our drivers are experienced on this route, but daytime travel is generally recommended for first-time visitors.",
      },
      {
        question: "Can I stop at Mettupalayam or Coonoor on the way?",
        answer: "Yes — stops for breakfast, photos or a short tea-estate visit can be built into the drive.",
      },
    ],
  },
  {
    slug: "mysore-to-ooty-taxi",
    name: "Mysore to Ooty Taxi",
    seoTitle: "Mysore to Ooty Taxi — Route via Bandipur & Masinagudi",
    metaDescription:
      "Mysore to Ooty taxi via Bandipur and Masinagudi — approx. 130 km, around 4.5 hours through forest reserve roads.",
    eyebrow: "Mysore ⇄ Ooty Route",
    heroTitle: "Mysore to Ooty, through the forest reserves",
    heroDescription:
      "A scenic drive through Bandipur and Mudumalai's forest roads, connecting Karnataka's Mysore to Ooty in the Nilgiris.",
    heroVariant: "wildlife",
    cardBlurb: "Mysore to Ooty taxi — approx. 130 km via Bandipur & Masinagudi.",
    overview: [
      "The Mysore–Ooty road runs through Bandipur National Park and Masinagudi before climbing into Gudalur and on to Ooty — a route that passes through two forest reserves and offers a real chance of spotting wildlife along the way, especially in the early morning or evening.",
      "At around 130 km, the drive typically takes about 4.5 hours, including the winding descent-then-climb through Masinagudi's own hairpin sequence. Forest-area driving hours can be time-restricted after dark in places, so departure timing matters more on this route than most.",
      "Popular with travellers combining a Mysore Palace visit or a Karnataka leg of a South India trip with an Ooty stay — available as one-way or round trip.",
    ],
    highlights: [
      "Approx. 130 km, roughly 4.5 hours by road",
      "Via Bandipur National Park and Masinagudi's forest roads",
      "Real chance of spotting wildlife en route",
      "Departure timing matters — forest-road hours can be restricted after dark",
    ],
    howItWorks: [
      { step: "Share your pickup and timing", detail: "Mysore pickup point and preferred departure time (forest-road hours may apply)." },
      { step: "Get a route-specific quote", detail: "Fare and estimated travel time for this exact road." },
      { step: "Travel through the reserves", detail: "A driver familiar with Bandipur/Masinagudi timing restrictions takes you through." },
    ],
    faqs: [
      {
        question: "How far is Ooty from Mysore?",
        answer: "Approximately 130 km by road, typically around 4.5 hours via Bandipur and Masinagudi.",
      },
      {
        question: "Is there a curfew on this road?",
        answer: "Sections through the forest reserves can have restricted driving hours after dark — we plan departure times to account for this.",
      },
      {
        question: "Will we see wildlife on this route?",
        answer: "It's common to spot deer, elephants or other wildlife through Bandipur and Mudumalai, particularly early morning or dusk — sightings aren't guaranteed but are frequent.",
      },
    ],
  },
  {
    slug: "bangalore-to-ooty-taxi",
    name: "Bangalore to Ooty Taxi",
    seoTitle: "Bangalore to Ooty Taxi — Route via Mysore",
    metaDescription:
      "Bangalore to Ooty taxi via Mysore — approx. 270 km, around 7 to 8 hours, one-way or round trip with a private chauffeur.",
    eyebrow: "Bangalore ⇄ Ooty Route",
    heroTitle: "Bangalore to Ooty, via Mysore",
    heroDescription:
      "The longest of our regular routes — Bangalore through Mysore and Bandipur into the Nilgiri hills.",
    heroVariant: "lake",
    cardBlurb: "Bangalore to Ooty taxi — approx. 270 km via Mysore.",
    overview: [
      "Bangalore to Ooty is a full-day drive, typically covering around 270 km via Mysore and then joining the Mysore–Ooty road through Bandipur and Masinagudi. Most travellers on this route either start early to arrive by evening, or break the journey with a stop in Mysore.",
      "Because of the distance, this route is booked almost exclusively as a private chauffeur-driven trip rather than a self-drive — the driver manages the highway stretch to Mysore and the forest-road timing restrictions through Bandipur in one continuous, well-paced journey.",
      "Available one-way (useful if you're flying back from Coimbatore or Bangalore) or as a round trip if the same car is bringing you back.",
    ],
    highlights: [
      "Approx. 270 km, typically 7–8 hours including breaks",
      "Via Mysore, then Bandipur and Masinagudi into the hills",
      "Best started early to avoid forest-road timing restrictions after dark",
      "One-way or round-trip options with a private chauffeur",
    ],
    howItWorks: [
      { step: "Share your Bangalore pickup point", detail: "Home, hotel, or Bangalore airport, plus preferred start time." },
      { step: "Get a route-specific quote", detail: "Fare for the full Bangalore–Ooty distance, one-way or round trip." },
      { step: "One long day, well-paced", detail: "Driver builds in a Mysore stop and manages forest-road timing on the final stretch." },
    ],
    faqs: [
      {
        question: "How long does the Bangalore to Ooty drive take?",
        answer: "Around 270 km, typically 7 to 8 hours including a stop, most commonly broken up around Mysore.",
      },
      {
        question: "Is it possible to do this trip in a day?",
        answer: "Yes, with an early start — most travellers leave Bangalore by early morning to reach Ooty by evening.",
      },
      {
        question: "Can we stop in Mysore on the way?",
        answer: "Yes — a Mysore Palace visit or lunch stop is a common and easy addition to this route.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceContent | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
