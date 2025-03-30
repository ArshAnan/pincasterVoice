"use client";

import { useEffect, useState } from "react";
import {
  generateItinerary,
  getEndTime,
  buildGoogleMapsURL,
} from "@/lib/generateItinerary";
import { getTourSummary } from "@/lib/getTourSummary";

type ItineraryItem = {
  id: string;
  type: "poi" | "walking" | "subway" | "bike" | "car";
  name: string;
  description: string;
  duration: string;
  timestamp: string;
};
const mockPOIs = [
  {
    name: "Devoción Coffee",
    description: "coffee shop",
    duration: 20,
    category: "coffee",
  },
  {
    name: "McNally Jackson Books",
    description: "bookstore",
    duration: 25,
    category: "bookstores",
  },
  {
    name: "Domino Park",
    description: "park",
    duration: 30,
    category: "parks",
  },
  {
    name: "Museum of Street Art",
    description: "art museum",
    duration: 30,
    category: "art",
  },
  {
    name: "Sunday in Brooklyn",
    description: "restaurant",
    duration: 40,
    category: "food",
  },
  {
    name: "Mmuseumm",
    description: "tiny museum of interesting artifacts",
    duration: 20,
    category: "hidden gems",
  },
];

function getTransitEmoji(type: ItineraryItem["type"]) {
  const icons: Record<string, string> = {
    walking: "🚶",
    subway: "🚇",
    bike: "🚴",
    car: "🚗",
    poi: "📍",
  };
  return icons[type] || "";
}

export default function TourPage() {
  const [formData, setFormData] = useState<any>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [endTime, setEndTime] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("tourForm");
    if (raw) {
      const parsed = JSON.parse(raw);
      setFormData(parsed);

      const generate = async () => {
        try {
          const generated = generateItinerary(parsed);
          setItinerary(generated);

          const userPreferredMode = parsed.transit?.[0];
          setMapLink(buildGoogleMapsURL(generated, userPreferredMode));
          setEndTime(getEndTime(generated));

          const response = await fetch("/api/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itinerary: generated }),
          });

          const data = await response.json();
          setSummary(data.summary);
        } catch (err) {
          console.error("Failed to generate tour:", err);
          setSummary("Could not generate summary.");
        } finally {
          setLoading(false);
        }
      };

      generate();
    }
  }, []);

  return (
    <main className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Your Tour Itinerary</h1>

      {loading && <p>Loading tour...</p>}

      {!loading && summary && (
        <p className="text-gray-700 italic bg-yellow-50 p-3 rounded-md">
          {summary}
        </p>
      )}

      {!loading &&
        itinerary.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-md rounded-xl p-4 space-y-1"
          >
            <div className="text-lg font-semibold">
              {item.type === "poi"
                ? item.name
                : `${getTransitEmoji(item.type)} ${item.name}`}
            </div>

            <div className="text-sm text-gray-500">{item.description}</div>
            <div className="text-sm">
              🕒 {item.duration} • {item.timestamp}
            </div>
          </div>
        ))}

      {!loading && endTime && (
        <p className="text-sm text-gray-500 text-center mt-6">
          🎯 End by <span className="font-semibold">{endTime}</span>
        </p>
      )}

      {!loading && mapLink && (
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-blue-600 text-white py-2 rounded-md mt-6 hover:bg-blue-700 transition"
        >
          📍 View in Google Maps
        </a>
      )}
    </main>
  );
}
