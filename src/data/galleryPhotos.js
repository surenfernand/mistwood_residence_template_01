// Apartment gallery photos for the "A closer look at Mistwood" section.
//
// HOW TO ADD / RE-CATEGORISE PHOTOS
// ---------------------------------
// 1. Drop the image file into: public/assets/gallery/   (client photos)
//    or reuse an existing file under public/assets/ .
// 2. Add an entry below with { src, alt, category }.
// 3. `category` must be one of GALLERY_FILTERS (excluding "All Photos").
//    "All Photos" is a virtual filter that shows every image.
//
// Both bedrooms are grouped under a single "Bedrooms" category on purpose.
// If a photo's category is ever unclear, leave it in the best-supported
// category; it will still appear under "All Photos".

export const GALLERY_FILTERS = [
  "All Photos",
  "Bedrooms",
  "Living Room",
  "Kitchen",
  "Bathroom",
  "Balcony & Views",
  "Details",
];

export const GALLERY_PHOTOS = [
  // ----- Bedrooms (both bedrooms grouped together) -----
  { src: "/assets/gallery/bedroom-art-view.jpg", category: "Bedrooms", alt: "Bedroom with a framed artwork, grey headboard and balcony doors to the hills" },
  { src: "/assets/gallery/bedroom-green-view.jpg", category: "Bedrooms", alt: "Bedroom dressed with a green leaf runner, teal chairs and a balcony view" },
  { src: "/assets/gallery/bedroom-green-runner.jpg", category: "Bedrooms", alt: "Bedroom with a green botanical bed runner and dark slatted headboard" },
  { src: "/assets/gallery/bedroom-seating-teal.jpg", category: "Bedrooms", alt: "Bedroom seating corner with two teal armchairs, wardrobe and lit mirror" },
  { src: "/assets/gallery/bedroom-teal-sunny.jpg", category: "Bedrooms", alt: "Sunlit bedroom with teal armchairs, double bed and balcony doors" },
  { src: "/assets/gallery/bedroom-teal-balcony.jpg", category: "Bedrooms", alt: "Bedroom with teal armchairs opening to a balcony over the valley" },
  { src: "/assets/gallery/bedroom-window-grey.jpg", category: "Bedrooms", alt: "Bedroom with a grey headboard and a large window onto the hills" },
  { src: "/assets/gallery/bedroom-grey-mirror.jpg", category: "Bedrooms", alt: "Bedroom with a grey bed, round mirror and dressing table by the balcony" },
  { src: "/assets/gallery/bedroom-white-desk.jpg", category: "Bedrooms", alt: "Bright white bedroom with a grey bed, wardrobe and glass dressing table" },
  { src: "/assets/gallery/bedroom-white-view.jpg", category: "Bedrooms", alt: "White bedroom with a grey bed and a balcony window over the hills" },
  { src: "/assets/gallery/bedroom-grey-view.jpg", category: "Bedrooms", alt: "Bedroom with a grey bed beside a tall window framing the green valley" },
  { src: "/assets/gallery/bedroom-cream-lamp.jpg", category: "Bedrooms", alt: "Cream bedroom with a grey bed, bedside lamp and round wall mirror" },
  { src: "/assets/gallery/bedroom-cream-view.jpg", category: "Bedrooms", alt: "Cream bedroom with a grey bed and balcony doors onto the mountains" },
  { src: "/assets/gallery/bedroom-cream-lamp2.jpg", category: "Bedrooms", alt: "Cream bedroom with a grey bed, dressing table and warm wall lights" },
  { src: "/assets/gallery/bedroom-grey-balcony.jpg", category: "Bedrooms", alt: "Bedroom with a grey bed, dressing table and balcony view of the hills" },
  { src: "/assets/gallery/bedroom-teal-portrait.jpg", category: "Bedrooms", alt: "Bedroom with a teal upholstered bed and soft layered pillows" },
  { src: "/assets/gallery/bedroom-teal-wardrobe.jpg", category: "Bedrooms", alt: "Bedroom with a teal bed, bedside lamp and white wardrobe" },
  { src: "/assets/gallery/bedroom-teal-lamp.jpg", category: "Bedrooms", alt: "Bedroom with a teal bed, warm bedside lamp and white wardrobe" },
  { src: "/assets/gallery/bedroom-teal-mirror.jpg", category: "Bedrooms", alt: "Bedroom with a teal bed, dressing table and round mirror" },
  { src: "/assets/gallery/bedroom-teal-mirror2.jpg", category: "Bedrooms", alt: "Bedroom with a teal bed, teal chair and round dressing mirror" },
  { src: "/assets/gallery/bedroom-teal-wardrobe2.jpg", category: "Bedrooms", alt: "Bedroom with a teal bed, bedside lamp and tall white wardrobe" },
  { src: "/assets/gallery/bedroom-teal-grey.jpg", category: "Bedrooms", alt: "Bedroom with a teal bed, dressing table and grey curtained window" },

  // ----- Living Room (existing open-plan living & dining photos) -----
  { src: "/assets/entry-hall.jpg", category: "Living Room", alt: "Entry hall with a console and a bench by the door" },
  { src: "/assets/living-wide.jpg", category: "Living Room", alt: "Open-plan living and dining area" },
  { src: "/assets/living-view.jpg", category: "Living Room", alt: "Living room with the hills beyond the curtains" },
  { src: "/assets/living-sofa.jpg", category: "Living Room", alt: "Long sofa facing the living room window" },
  { src: "/assets/lounge-chairs.jpg", category: "Living Room", alt: "Lounge chairs in daylight in the living room" },
  { src: "/assets/living-doors.jpg", category: "Living Room", alt: "Seating beside the balcony doors in the living room" },
  { src: "/assets/open-plan.jpg", category: "Living Room", alt: "Open-plan living space from the sofas through to the table" },
  { src: "/assets/dining-table.jpg", category: "Living Room", alt: "Wooden dining table and chairs set for a stay" },
  { src: "/assets/dining-living.jpg", category: "Living Room", alt: "Dining area looking through to the living room sofas" },
  { src: "/assets/dining-side.jpg", category: "Living Room", alt: "Dining table and chairs beside the doorway" },

  // ----- Kitchen -----
  { src: "/assets/gallery/kitchen-wide-white.jpg", category: "Kitchen", alt: "Kitchen with white cabinets, gas hob, microwave and small appliances" },
  { src: "/assets/gallery/kitchen-green-lshape.jpg", category: "Kitchen", alt: "L-shaped kitchen with pale green cabinets, hob and sink" },
  { src: "/assets/gallery/kitchen-corner-sink.jpg", category: "Kitchen", alt: "Kitchen corner with white cabinets, sink and a frosted window" },
  { src: "/assets/gallery/kitchen-cabinet-dishes.jpg", category: "Kitchen", alt: "Open kitchen cabinet with plates and bowls above the hob" },
  { src: "/assets/gallery/kitchen-cabinet-mugs.jpg", category: "Kitchen", alt: "Open kitchen cabinets with mugs and glasses above the counter" },
  { src: "/assets/gallery/kitchen-microwave.jpg", category: "Kitchen", alt: "Kitchen counter with a microwave and a rice cooker" },

  // ----- Bathroom -----
  { src: "/assets/gallery/bathroom-grey-full.jpg", category: "Bathroom", alt: "Grey-tiled bathroom with a glass shower, toilet, basin and mirror" },
  { src: "/assets/gallery/bathroom-grey-shower.jpg", category: "Bathroom", alt: "Grey-tiled bathroom with a walk-in glass shower and towel rail" },
  { src: "/assets/gallery/bathroom-beige-01.jpg", category: "Bathroom", alt: "Beige-tiled bathroom with a glass shower, toilet and basin" },
  { src: "/assets/gallery/bathroom-beige-02.jpg", category: "Bathroom", alt: "Beige-tiled bathroom with a lit mirror, basin and glass shower" },
  { src: "/assets/gallery/bathroom-beige-03.jpg", category: "Bathroom", alt: "Beige-tiled bathroom with a glass shower, basin and mirror" },
  { src: "/assets/gallery/bathroom-beige-04.jpg", category: "Bathroom", alt: "Beige-tiled bathroom with a glass shower enclosure and basin" },
  { src: "/assets/gallery/bathroom-beige-05.jpg", category: "Bathroom", alt: "Beige-tiled bathroom with a glass shower, toilet and wide mirror" },
  { src: "/assets/gallery/bathroom-heater.jpg", category: "Bathroom", alt: "Compact bathroom with an instant water heater, shower and toilet" },

  // ----- Balcony & Views -----
  { src: "/assets/gallery/balcony-view-mountains.jpg", category: "Balcony & Views", alt: "Wide balcony view over forested hills and distant mountains" },
  { src: "/assets/gallery/balcony-bed-view.jpg", category: "Balcony & Views", alt: "Bedroom opening to a balcony with a sweeping mountain view" },
  { src: "/assets/gallery/balcony-bed-view2.jpg", category: "Balcony & Views", alt: "Bedside balcony doors framing the green valley and sky" },
  { src: "/assets/hills.jpg", category: "Balcony & Views", alt: "Highland view from the Mistwood balcony" },
  { src: "/assets/stay-balcony.jpg", category: "Balcony & Views", alt: "Living room glass opening onto the balcony over the hills" },

  // ----- Details -----
  { src: "/assets/gallery/detail-cutlery-glasses.jpg", category: "Details", alt: "Cutlery caddy, toaster and glasses on the kitchen counter" },
  { src: "/assets/gallery/detail-cutlery-toaster.jpg", category: "Details", alt: "Labelled cutlery holder with spoons, forks and knives beside a toaster" },
  { src: "/assets/gallery/detail-kettle.jpg", category: "Details", alt: "Electric kettle, sandwich maker, jug and soap dispenser on the counter" },
  { src: "/assets/gallery/detail-utility-bed.jpg", category: "Details", alt: "Compact utility room with a single bed, washing machine and storage" },
  { src: "/assets/gallery/detail-storage-bed.jpg", category: "Details", alt: "Small storage room with a single bed and overhead cabinets" },
  { src: "/assets/gallery/detail-laundry.jpg", category: "Details", alt: "Laundry nook with a washing machine and wall-mounted cleaning tools" },
];
