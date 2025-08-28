import {
  IRELAND_ROAD_SEGMENTS,
  IRELAND_ROAD_COORDINATES,
  getSegmentById,
  getConnectedSegments,
  RoadSegment,
  RoadPoint,
} from '../demo/roadCoordinates';
import { distance, bearing, destination } from '@turf/turf';

export interface VehiclePosition {
  latitude: number;
  longitude: number;
  heading: number;
  segmentId?: number;
  offsetOnSegment?: number; // 0 to 1, representing position along segment
}

export interface SegmentPosition {
  segmentId: number;
  offsetOnSegment: number; // 0 to 1
  position: { latitude: number; longitude: number };
  heading: number;
}

/**
 * Find the nearest road segment to a given position
 */
export function snapToNearestRoad(
  latitude: number,
  longitude: number
): SegmentPosition {
  let nearestSegment: RoadSegment | null = null;
  let nearestDistance = Infinity;
  let nearestOffset = 0;
  let nearestPoint = { latitude, longitude };

  IRELAND_ROAD_SEGMENTS.forEach((segment) => {
    const { point, offset, dist } = closestPointOnSegment(
      { latitude, longitude },
      segment
    );

    if (dist < nearestDistance) {
      nearestDistance = dist;
      nearestSegment = segment;
      nearestOffset = offset;
      nearestPoint = point;
    }
  });

  if (!nearestSegment) {
    // Fallback to a random segment if none found
    nearestSegment = IRELAND_ROAD_SEGMENTS[0];
    nearestOffset = 0.5;
    nearestPoint = interpolateOnSegment(nearestSegment, nearestOffset);
  }

  const segmentHeading = getSegmentBearing(nearestSegment);

  return {
    segmentId: nearestSegment.id,
    offsetOnSegment: nearestOffset,
    position: nearestPoint,
    heading: segmentHeading,
  };
}

/**
 * Move a vehicle along road network for a given distance
 */
export function moveAlongRoad(
  currentPosition: SegmentPosition,
  distanceMeters: number,
  preferredBearing?: number
): SegmentPosition {
  let { segmentId, offsetOnSegment } = currentPosition;
  let remainingDistance = distanceMeters;

  while (remainingDistance > 0) {
    const segment = getSegmentById(segmentId);
    if (!segment) break;

    // Distance remaining on current segment
    const remainingSegmentDistance = segment.length * (1 - offsetOnSegment);

    if (remainingDistance <= remainingSegmentDistance) {
      // We can complete the movement on this segment
      const additionalOffset = remainingDistance / segment.length;
      offsetOnSegment = Math.min(1, offsetOnSegment + additionalOffset);
      remainingDistance = 0;
    } else {
      // We need to move to the next segment
      remainingDistance -= remainingSegmentDistance;
      offsetOnSegment = 1;

      // Choose next segment
      const nextSegmentId = chooseNextSegment(segmentId, preferredBearing);
      if (nextSegmentId === null) {
        // Dead end or no good options, stop here
        break;
      }

      segmentId = nextSegmentId;
      offsetOnSegment = 0;
    }
  }

  const segment = getSegmentById(segmentId);
  if (!segment) {
    return currentPosition; // Return original if something went wrong
  }

  const position = interpolateOnSegment(segment, offsetOnSegment);
  const heading = getSegmentBearing(segment);

  return {
    segmentId,
    offsetOnSegment,
    position,
    heading,
  };
}

/**
 * Choose the next road segment when reaching end of current segment
 */
function chooseNextSegment(
  currentSegmentId: number,
  preferredBearing?: number
): number | null {
  const connectedSegments = getConnectedSegments(currentSegmentId);

  if (connectedSegments.length === 0) {
    return null; // Dead end
  }

  if (connectedSegments.length === 1) {
    return connectedSegments[0]!.id; // Only one choice
  }

  // If we have a preferred bearing, choose the segment that best matches it
  if (preferredBearing !== undefined) {
    let bestSegment = connectedSegments[0]!;
    let bestBearingDiff = Math.abs(
      getSegmentBearing(bestSegment) - preferredBearing
    );

    connectedSegments.forEach((segment) => {
      const segmentBearing = getSegmentBearing(segment);
      const bearingDiff = Math.abs(segmentBearing - preferredBearing);
      if (bearingDiff < bestBearingDiff) {
        bestBearingDiff = bearingDiff;
        bestSegment = segment;
      }
    });

    return bestSegment.id;
  }

  // Random selection with bias towards continuing straight
  // (prefer segments with similar names or higher speed limits)
  const currentSegment = getSegmentById(currentSegmentId);
  if (currentSegment) {
    const sameRoadSegments = connectedSegments.filter(
      (s) => s.roadName === currentSegment.roadName
    );

    if (sameRoadSegments.length > 0) {
      // Prefer continuing on the same road
      return sameRoadSegments[
        Math.floor(Math.random() * sameRoadSegments.length)
      ].id;
    }
  }

  // Random selection
  return connectedSegments[Math.floor(Math.random() * connectedSegments.length)]
    .id;
}

/**
 * Find the closest point on a road segment to a given position
 */
function closestPointOnSegment(
  point: { latitude: number; longitude: number },
  segment: RoadSegment
): {
  point: { latitude: number; longitude: number };
  offset: number;
  dist: number;
} {
  const start = [segment.start.longitude, segment.start.latitude];
  const end = [segment.end.longitude, segment.end.latitude];
  const target = [point.longitude, point.latitude];

  // Calculate the closest point on the line segment
  const A = target[0] - start[0];
  const B = target[1] - start[1];
  const C = end[0] - start[0];
  const D = end[1] - start[1];

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let closestPoint: [number, number];
  let offset: number;

  if (param < 0) {
    closestPoint = start;
    offset = 0;
  } else if (param > 1) {
    closestPoint = end;
    offset = 1;
  } else {
    closestPoint = [start[0] + param * C, start[1] + param * D];
    offset = param;
  }

  const dist = distance(target, closestPoint, { units: 'meters' });

  return {
    point: { latitude: closestPoint[1], longitude: closestPoint[0] },
    offset,
    dist,
  };
}

/**
 * Interpolate a position along a road segment
 */
function interpolateOnSegment(
  segment: RoadSegment,
  offset: number
): { latitude: number; longitude: number } {
  const start = segment.start;
  const end = segment.end;

  const lat = start.latitude + (end.latitude - start.latitude) * offset;
  const lng = start.longitude + (end.longitude - start.longitude) * offset;

  return { latitude: lat, longitude: lng };
}

/**
 * Get the bearing (heading) of a road segment
 */
function getSegmentBearing(segment: RoadSegment): number {
  const start: [number, number] = [
    segment.start.longitude,
    segment.start.latitude,
  ];
  const end: [number, number] = [segment.end.longitude, segment.end.latitude];
  return bearing(start, end);
}

/**
 * Get speed for road type
 */
export function getSpeedForRoadType(roadType: string): number {
  switch (roadType) {
    case 'freeway':
      return 80;
    case 'avenue':
      return 45;
    case 'boulevard':
      return 40;
    case 'street':
      return 30;
    default:
      return 35;
  }
}

/**
 * Get a random road segment for initialization
 */
export function getRandomRoadSegment(): SegmentPosition {
  const segment =
    IRELAND_ROAD_SEGMENTS[
      Math.floor(Math.random() * IRELAND_ROAD_SEGMENTS.length)
    ];
  const offset = Math.random();
  const position = interpolateOnSegment(segment, offset);
  const heading = getSegmentBearing(segment);

  return {
    segmentId: segment.id,
    offsetOnSegment: offset,
    position,
    heading,
  };
}
