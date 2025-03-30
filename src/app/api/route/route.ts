import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import polyline from "@mapbox/polyline";

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

async function geocode(place: string): Promise<string | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    place
  )}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.features || data.features.length === 0) return null;

  const [lng, lat] = data.features[0].center;
  return `${lng},${lat}`; // formatted for Mapbox Directions
}

export async function POST(req: NextRequest) {
  const { start, end } = await req.json();

  const startCoords = await geocode(start);
  const endCoords = await geocode(end);

  if (!startCoords || !endCoords) {
    return NextResponse.json(
      { error: "Failed to geocode start or end" },
      { status: 400 }
    );
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords};${endCoords}?geometries=polyline&access_token=${MAPBOX_ACCESS_TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || !data.routes[0]) {
    return NextResponse.json({ error: "No route found" }, { status: 500 });
  }

  const coordinates = polyline.decode(data.routes[0].geometry);
  return NextResponse.json({ coordinates });
}
