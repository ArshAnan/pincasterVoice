import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // for now
});

type ItineraryItem = {
  name: string;
  description: string;
};

export async function getTourSummary(
  itinerary: ItineraryItem[]
): Promise<string> {
  const stops = itinerary
    .filter((item) => item.description && item.name)
    .map((item) => `${item.name} (${item.description})`)
    .join(", ");

  const prompt = `Write a one-sentence travel summary for this tour: ${stops}`;

  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
  });

  return response.choices[0].message.content || "Here's your tour!";
}
