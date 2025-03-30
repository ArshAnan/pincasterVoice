type Point = [number, number]; // [lat, lng]

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

export async function getNearbyPOIs(
  point: Point,
  category: string,
  accessToken: string
): Promise<{ name: string; address: string; lat: number; lng: number }[]> {
  const [lat, lng] = point;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    category
  )}.json?proximity=${lng},${lat}&types=poi&access_token=${accessToken}`;

  const res = await fetch(url);
  const data = await res.json();

  return (data.features || []).map((f: any) => ({
    name: f.text,
    address: f.place_name,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
  }));
}
