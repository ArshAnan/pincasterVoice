import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { itinerary } = await req.json();

  // Extract just POIs
  const stops = itinerary
    .filter((item: any) => item.type === "poi" && item.name)
    .map((item: any) => `${item.name} (${item.description})`)
    .join(", ");

  const prompt = `Write a friendly one-sentence travel itinerary summary for this tour: ${stops}`;

  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
  });

  const summary = response.choices[0].message.content;
  return NextResponse.json({ summary });
}
