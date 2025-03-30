"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    start: "",
    end: "",
    duration: "1 hr",
    interests: [] as string[],
    transit: [] as string[],
  });

  const interestsList = [
    "coffee",
    "food",
    "bookstores",
    "art",
    "parks",
    "hidden gems",
  ];
  const transitOptions = ["walk", "subway", "Uber", "Citibike", "ferry"];
  const durations = ["30 mins", "1 hr", "2 hrs", "3 hrs"];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckbox = (field: string, value: string) => {
    setFormData((prev) => {
      const current = prev[field as keyof typeof prev] as string[];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    // Save formData to localStorage for now
    if (typeof window !== "undefined") {
      localStorage.setItem("tourForm", JSON.stringify(formData));
      window.location.href = "/tour";
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Plan Your Micro-Tour</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Start Location</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={formData.start}
            onChange={(e) => handleChange("start", e.target.value)}
            placeholder="e.g. Google Chelsea"
          />
        </div>

        <div>
          <label className="block font-medium">End Location (optional)</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={formData.end}
            onChange={(e) => handleChange("end", e.target.value)}
            placeholder="e.g. Washington Square Park"
          />
        </div>

        <div>
          <label className="block font-medium">Available Time</label>
          <select
            className="w-full border rounded p-2"
            value={formData.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
          >
            {durations.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Interests</label>
          <div className="flex flex-wrap gap-2">
            {interestsList.map((interest) => (
              <button
                key={interest}
                type="button"
                className={`px-3 py-1 border rounded-full ${
                  formData.interests.includes(interest)
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
                onClick={() => handleCheckbox("interests", interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium">Transit Preferences</label>
          <div className="flex flex-wrap gap-2">
            {transitOptions.map((mode) => (
              <label key={mode} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.transit.includes(mode)}
                  onChange={() => handleCheckbox("transit", mode)}
                />
                {mode}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded"
        >
          Generate Tour
        </button>
      </form>
    </main>
  );
}
