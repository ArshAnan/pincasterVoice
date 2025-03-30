type FormData = {
  start: string;
  end: string;
  duration: string; // "1 hr", "2 hrs", etc.
  interests: string[];
  transit: string[];
};

type ItineraryItem = {
  id: string;
  type: "poi" | "walking" | "subway" | "bike" | "car";
  name: string;
  description: string;
  duration: string;
  timestamp: string;
};

function pickTransitType(preferences: string[]): ItineraryItem["type"] {
  const fallback = "walking";
  if (!preferences || preferences.length === 0) return fallback;

  const mapping: Record<string, ItineraryItem["type"]> = {
    walk: "walking",
    subway: "subway",
    Uber: "car",
    Citibike: "bike",
    ferry: "subway", // fallback to subway
  };

  const matched = preferences
    .map((pref) => mapping[pref])
    .filter((type): type is ItineraryItem["type"] => !!type);

  if (matched.length === 0) return fallback;

  return matched[Math.floor(Math.random() * matched.length)];
}

function getTravelDuration(
  transitType: "walking" | "subway" | "bike" | "car"
): number {
  const speeds = {
    walking: 3,
    subway: 20,
    bike: 10,
    car: 25,
  };

  const speed = speeds[transitType] || 3;
  const distance = 0.4;
  const hours = distance / speed;
  return Math.ceil(hours * 60);
}

const interestEmojis: Record<string, string> = {
  coffee: "☕️",
  food: "🍽️",
  bookstores: "📚",
  parks: "🌳",
  art: "🎨",
  "hidden gems": "🕵️‍♀️",
};

export function generateItinerary(form: FormData): ItineraryItem[] {
  const durationMap: Record<string, number> = {
    "30 mins": 30,
    "1 hr": 60,
    "2 hrs": 120,
    "3 hrs": 180,
  };

  const totalTime = durationMap[form.duration] || 60;
  let usedTime = 0;
  let currentHour = 12;
  let currentMin = 0;

  const itinerary: ItineraryItem[] = [];

  const mockPOIs = [
    // Coffee
    {
      name: "Devoción Coffee",
      description: "coffee shop",
      duration: 20,
      category: "coffee",
    },
    {
      name: "Birch Coffee",
      description: "local roastery",
      duration: 25,
      category: "coffee",
    },
    {
      name: "Blue Bottle Bryant Park",
      description: "minimalist café",
      duration: 20,
      category: "coffee",
    },

    // Food
    {
      name: "Sunday in Brooklyn",
      description: "restaurant",
      duration: 40,
      category: "food",
    },
    {
      name: "Los Tacos No.1",
      description: "Mexican street food",
      duration: 30,
      category: "food",
    },
    {
      name: "Prince Street Pizza",
      description: "famous slice spot",
      duration: 25,
      category: "food",
    },

    // Bookstores
    {
      name: "McNally Jackson Books",
      description: "bookstore",
      duration: 25,
      category: "bookstores",
    },
    {
      name: "Books Are Magic",
      description: "indie bookstore",
      duration: 20,
      category: "bookstores",
    },
    {
      name: "Strand Bookstore",
      description: "18 miles of books",
      duration: 30,
      category: "bookstores",
    },

    // Parks
    {
      name: "Domino Park",
      description: "riverfront park",
      duration: 30,
      category: "parks",
    },
    {
      name: "Washington Square Park",
      description: "famous arch & culture",
      duration: 25,
      category: "parks",
    },
    {
      name: "Bryant Park",
      description: "midtown oasis",
      duration: 20,
      category: "parks",
    },

    // Art
    {
      name: "Museum of Street Art",
      description: "graffiti museum",
      duration: 30,
      category: "art",
    },
    {
      name: "MoMA PS1",
      description: "contemporary art hub",
      duration: 45,
      category: "art",
    },
    {
      name: "Poster House",
      description: "graphic design museum",
      duration: 35,
      category: "art",
    },

    // Hidden gems
    {
      name: "Mmuseumm",
      description: "tiny museum of oddities",
      duration: 20,
      category: "hidden gems",
    },
    {
      name: "The Earth Room",
      description: "gallery filled with soil",
      duration: 15,
      category: "hidden gems",
    },
    {
      name: "Dream House",
      description: "light + drone installation",
      duration: 30,
      category: "hidden gems",
    },
  ];

  const walkTime = 10;
  let step = 1;

  const filteredPOIs = mockPOIs.filter((poi) =>
    form.interests.includes(poi.category)
  );

  // Add start location
  itinerary.push({
    id: `${step++}`,
    type: "poi",
    name: `Start at ${form.start.split(",")[0]}`,
    description: form.start || "Starting location",
    duration: "0 mins",
    timestamp: formatTime(currentHour, currentMin),
  });

  for (const poi of filteredPOIs) {
    const transitType = pickTransitType(form.transit) as
      | "walking"
      | "subway"
      | "bike"
      | "car";
    const travelDuration = getTravelDuration(transitType);

    if (usedTime + travelDuration + poi.duration > totalTime) break;

    itinerary.push({
      id: `${step++}`,
      type: transitType,
      name: `Travel to next location`,
      description: "0.4 miles", // still mocked
      duration: `${travelDuration} mins`,
      timestamp: formatTime(currentHour, currentMin),
    });

    usedTime += travelDuration;
    currentMin += travelDuration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin %= 60;
    }

    itinerary.push({
      id: `${step++}`,
      type: "poi",
      name: poi.name,
      description: poi.description,
      duration: `${poi.duration} mins`,
      timestamp: formatTime(currentHour, currentMin),
    });

    usedTime += poi.duration;
    currentMin += poi.duration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin %= 60;
    }
  }

  if (form.end) {
    itinerary.push({
      id: `${step++}`,
      type: "poi",
      name: `End at ${form.end.split(",")[0]}`,
      description: "Final destination",
      duration: "0 mins",
      timestamp: formatTime(currentHour, currentMin),
    });
  }

  return itinerary;
}

function formatTime(hour: number, min: number): string {
  const h = hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? "PM" : "AM";
  const paddedMin = min.toString().padStart(2, "0");
  return `${h}:${paddedMin} ${ampm}`;
}

export function getEndTime(itinerary: ItineraryItem[]): string {
  if (itinerary.length === 0) return "";
  const last = itinerary[itinerary.length - 1];
  return last.timestamp;
}

export function buildGoogleMapsURL(
  itinerary: ItineraryItem[],
  userMode?: string
): string {
  const base = "https://www.google.com/maps/dir/";
  const poiNames = itinerary
    .filter((item) => item.type === "poi")
    .map((item) => encodeURIComponent(item.name));
  const allStops = ["Current+Location", ...poiNames];
  const mode = mapUserModeToGoogleMode(userMode);
  return `${base}${allStops.join("/")}?travelmode=${mode}`;
}

function mapUserModeToGoogleMode(userMode?: string): string {
  const map: Record<string, string> = {
    walk: "walking",
    Uber: "driving",
    Citibike: "bicycling",
    subway: "transit",
    ferry: "transit",
  };
  return map[userMode || "walk"] || "walking";
}
