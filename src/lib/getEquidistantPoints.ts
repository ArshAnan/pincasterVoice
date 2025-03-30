type Point = [number, number]; // [lat, lng]

function haversineDistance(a: Point, b: Point): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters

  const [lat1, lng1] = a;
  const [lat2, lng2] = b;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const aVal =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

export function getEquidistantPoints(path: Point[], numStops: number): Point[] {
  if (path.length < 2) return [];

  // Step 1: Calculate total path distance
  const distances = path.map((_, i) =>
    i === 0 ? 0 : haversineDistance(path[i - 1], path[i])
  );
  const totalDistance = distances.reduce((sum, d) => sum + d, 0);

  // Step 2: Determine spacing between stops
  const segmentDistance = totalDistance / (numStops + 1);
  const result: Point[] = [];

  let target = segmentDistance;
  let acc = 0;

  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const d = haversineDistance(prev, curr);

    if (acc + d >= target) {
      result.push(curr);
      target += segmentDistance;
    }

    acc += d;
  }

  return result.slice(0, numStops);
}
