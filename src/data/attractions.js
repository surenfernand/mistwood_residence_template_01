// Nearby attractions for the Explore page "Discover Nearby Attractions" section.
//
// Replacing placeholder photographs later:
//   Drop a real image at the `image` path below (e.g. public/images/attractions/gregory-lake.jpg)
//   and it will appear automatically. Until a file exists at that path, a themed local
//   placeholder (public/images/attractions/placeholder.svg) is shown instead.
//
// Distance / travel time are intentionally left null until the exact Mistwood Residence
// street address is confirmed. When set to a string they will render on the cards and in
// the details modal; while null, those elements stay hidden but the layout is preserved.

export const PLACEHOLDER_IMAGE = "/images/attractions/placeholder.svg";

// Filter order shown in the UI. Every attraction's `category` must match one of these labels.
export const ATTRACTION_CATEGORIES = [
  "All Attractions",
  "Lakes & Parks",
  "Tea Estates",
  "Waterfalls",
  "Gardens",
  "Farms",
  "Nature & Hiking",
  "Cultural Sites",
];

const mapsUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const ATTRACTIONS = [
  {
    id: "gregory-lake",
    name: "Gregory Lake",
    category: "Lakes & Parks",
    description:
      "A scenic lake with boating, walking paths, and beautiful mountain views right beside the town.",
    image: "/images/attractions/gregory-lake.jpg",
    alt: "Boats on Gregory Lake with flower-lined paths in Nuwara Eliya",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Gregory Lake, Nuwara Eliya, Sri Lanka"),
  },
  {
    id: "pedro-tea-estate",
    name: "Pedro Tea Estate",
    category: "Tea Estates",
    description:
      "Visit a working tea estate and see how Ceylon tea is grown, picked, and processed.",
    image: "/images/attractions/pedro-tea-estate.jpg",
    alt: "Tea pickers working the slopes of Pedro Tea Estate",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Pedro Tea Estate, Nuwara Eliya, Sri Lanka"),
  },
  {
    id: "horton-plains",
    name: "Horton Plains National Park",
    category: "Nature & Hiking",
    description:
      "A stunning national park with cloud forest, rich wildlife, and the famous World's End escarpment.",
    image: "/images/attractions/horton-plains.jpg",
    alt: "Highland grassland path across Horton Plains National Park",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Horton Plains National Park, Sri Lanka"),
  },
  {
    id: "lovers-leap-falls",
    name: "Lover's Leap Falls",
    category: "Waterfalls",
    description:
      "A picturesque waterfall in the tea hills above town, reached by a short walk from the estate road.",
    image: "/images/attractions/lovers-leap-falls.jpg",
    alt: "Lover's Leap waterfall falling through the tea hills near Nuwara Eliya",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Lover's Leap Waterfall, Nuwara Eliya, Sri Lanka"),
  },
  {
    id: "victoria-park",
    name: "Victoria Park",
    category: "Gardens",
    description:
      "A beautiful public park in the heart of Nuwara Eliya, known for its flower beds and birdlife.",
    image: "/images/attractions/victoria-park.jpg",
    alt: "Flower beds and paths in Victoria Park, Nuwara Eliya",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Victoria Park, Nuwara Eliya, Sri Lanka"),
  },
  {
    id: "hakgala-garden",
    name: "Hakgala Botanical Garden",
    category: "Gardens",
    description:
      "One of Sri Lanka's most beautiful botanical gardens, with a wide variety of roses, ferns, and orchids.",
    image: "/images/attractions/hakgala-garden.jpg",
    alt: "Terraced lawns and flower beds at Hakgala Botanical Garden",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Hakgala Botanical Garden, Nuwara Eliya, Sri Lanka"),
  },
  {
    id: "moon-plains",
    name: "Moon Plains",
    category: "Nature & Hiking",
    description:
      "Open highland grasslands with sweeping panoramic views of the surrounding mountains and valleys.",
    image: "/images/attractions/moon-plains.jpg",
    alt: "Open grassland and mountain views at Moon Plains, Sandathenna",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Moon Plains, Sandathenna, Nuwara Eliya, Sri Lanka"),
  },
  {
    id: "ambewela-farm",
    name: "Ambewela Farm",
    category: "Farms",
    description:
      "A green dairy farm set among rolling pastures, often called Sri Lanka's Little New Zealand.",
    image: "/images/attractions/ambewela-farm.jpg",
    alt: "Cattle grazing on the green pastures of Ambewela Farm",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Ambewela Farm, Sri Lanka"),
  },
  {
    id: "seetha-amman-temple",
    name: "Seetha Amman Temple",
    category: "Cultural Sites",
    description:
      "A colourful Hindu temple near Hakgala, steeped in Ramayana legend and framed by highland scenery.",
    image: "/images/attractions/seetha-amman-temple.jpg",
    alt: "The colourful Seetha Amman Temple near Nuwara Eliya",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Seetha Amman Temple, Nuwara Eliya, Sri Lanka"),
  },
  {
    id: "ramboda-falls",
    name: "Ramboda Falls",
    category: "Waterfalls",
    description:
      "A tall, dramatic waterfall tumbling through the hills along the scenic Ramboda pass.",
    image: "/images/attractions/ramboda-falls.jpg",
    alt: "Ramboda Falls cascading down forested hills",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Ramboda Falls, Sri Lanka"),
  },
  {
    id: "single-tree-hill",
    name: "Single Tree Hill",
    category: "Nature & Hiking",
    description:
      "The highest viewpoint near town, offering a rewarding short hike and sweeping highland vistas.",
    image: "/images/attractions/single-tree-hill.jpg",
    alt: "View from Single Tree Hill over Nuwara Eliya",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Single Tree Hill, Nuwara Eliya, Sri Lanka"),
  },
  {
    id: "damro-labookellie",
    name: "Damro Labookellie Tea Centre",
    category: "Tea Estates",
    description:
      "A roadside tea estate and tasting centre surrounded by sweeping emerald tea fields.",
    image: "/images/attractions/damro-labookellie.jpg",
    alt: "Tea fields around the Damro Labookellie Tea Centre",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Damro Labookellie Tea Centre, Sri Lanka"),
  },
  {
    id: "bomburu-ella",
    name: "Bomburu Ella Waterfall",
    category: "Waterfalls",
    description:
      "A wide, multi-tiered waterfall set deep in forest, reached by a scenic countryside walk.",
    image: "/images/attractions/bomburu-ella.jpg",
    alt: "The broad cascade of Bomburu Ella Waterfall",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Bomburu Ella Waterfall, Sri Lanka"),
  },
  {
    id: "kande-ela-reservoir",
    name: "Kande Ela Reservoir",
    category: "Lakes & Parks",
    description:
      "A calm highland reservoir ringed by pine woodland, ideal for a quiet lakeside pause.",
    image: "/images/attractions/kande-ela-reservoir.jpg",
    alt: "Pine woodland around the calm Kande Ela Reservoir",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Kande Ela Reservoir, Sri Lanka"),
  },
  {
    id: "galways-land",
    name: "Galway's Land National Park",
    category: "Nature & Hiking",
    description:
      "A compact montane forest reserve within town, popular with birdwatchers and nature lovers.",
    image: "/images/attractions/galways-land.jpg",
    alt: "Forest trail in Galway's Land National Park",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Galway's Land National Park, Nuwara Eliya, Sri Lanka"),
  },
  {
    id: "new-zealand-farm",
    name: "New Zealand Farm",
    category: "Farms",
    description:
      "Rolling green pastures and grazing cattle in Ambewela, evoking a quiet slice of the countryside.",
    image: "/images/attractions/new-zealand-farm.jpg",
    alt: "Green pastures at the New Zealand Farm in Ambewela",
    distance: null,
    travelTime: null,
    maps: mapsUrl("New Zealand Farm, Ambewela, Sri Lanka"),
  },
  {
    id: "devon-falls",
    name: "Devon Falls",
    category: "Waterfalls",
    description:
      "A graceful waterfall framed by tea-covered hills, viewed from the Talawakele road.",
    image: "/images/attractions/devon-falls.jpg",
    alt: "Devon Falls set among tea-covered hills",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Devon Falls, Sri Lanka"),
  },
  {
    id: "st-clairs-falls",
    name: "St. Clair's Falls",
    category: "Waterfalls",
    description:
      "Known as the Little Niagara of Sri Lanka, a broad cascade among the tea estates near Talawakele.",
    image: "/images/attractions/st-clairs-falls.jpg",
    alt: "The wide cascade of St. Clair's Falls near Talawakele",
    distance: null,
    travelTime: null,
    maps: mapsUrl("St. Clair's Falls, Talawakele, Sri Lanka"),
  },
  {
    id: "old-post-office",
    name: "Nuwara Eliya Old Post Office",
    category: "Cultural Sites",
    description:
      "A charming red-brick colonial landmark, one of the oldest post offices on the island.",
    image: "/images/attractions/old-post-office.jpg",
    alt: "The red-brick Nuwara Eliya Old Post Office",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Nuwara Eliya Post Office, Sri Lanka"),
  },
  {
    id: "strawberry-farms",
    name: "Strawberry Farms (Ambewela)",
    category: "Farms",
    description:
      "Pick-your-own strawberry farms along the Ambewela road, a sweet stop for families.",
    image: "/images/attractions/strawberry-farms.jpg",
    alt: "Rows of strawberries at a farm along the Ambewela road",
    distance: null,
    travelTime: null,
    maps: mapsUrl("Strawberry farms near Ambewela, Sri Lanka"),
  },
];
