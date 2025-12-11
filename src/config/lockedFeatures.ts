/**
 * Configuration for locked navigation features
 * This file contains metadata for premium/locked features that require a demo or upgrade
 */

export interface FeatureValueProp {
  id: string;
  title: string;
  description: string;
}

export interface LockedFeature {
  id: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  longDescription?: string;
  image: string;
  valueProps: FeatureValueProp[];
  comingSoon?: boolean;
}

export const lockedFeatures: Record<string, LockedFeature> = {
  cameras: {
    id: 'cameras',
    title: 'Cameras',
    tagline: 'See What Your Fleet Sees',
    category: 'Safety & Compliance',
    description:
      'Video telematics with AI-powered incident detection, driver coaching, and evidence capture.',
    longDescription:
      'Transform fleet safety with intelligent dashcam technology. Capture critical footage, automatically detect risky driving events, and use video evidence to protect your drivers and reduce insurance costs. AI-powered coaching helps improve driver behavior over time.',
    image: '/pointing at laptop screen with data on show.webp',
    valueProps: [
      {
        id: 'incident-capture',
        title: 'Automatic Incident Capture',
        description:
          'AI detects and records safety-critical events like harsh braking, collisions, and near-misses with full video context.',
      },
      {
        id: 'driver-coaching',
        title: 'Video-Based Driver Coaching',
        description:
          'Use real footage to provide constructive feedback and improve driver behavior with evidence-based coaching sessions.',
      },
      {
        id: 'insurance-evidence',
        title: 'Insurance Evidence & Claims',
        description:
          'Protect your fleet from false claims with timestamped, GPS-verified video evidence for insurance disputes.',
      },
      {
        id: 'live-streaming',
        title: 'Live Vehicle Streaming',
        description:
          'View real-time video feeds from any vehicle in your fleet for immediate situational awareness.',
      },
      {
        id: 'event-alerts',
        title: 'Real-Time Event Alerts',
        description:
          'Receive instant notifications when safety events are detected, enabling rapid response to incidents.',
      },
      {
        id: 'compliance-recording',
        title: 'Compliance Recording',
        description:
          'Maintain detailed video logs for regulatory compliance, audits, and duty of care documentation.',
      },
    ],
  },
  'fuel-electric': {
    id: 'fuel-electric',
    title: 'Fuel/Electric Vehicles',
    tagline: 'Accelerate Your Electric Transition',
    category: 'EV Management',
    description:
      'Comprehensive EV fleet management with charging optimization, range analytics, and transition planning.',
    longDescription:
      'Seamlessly manage mixed fleets of traditional and electric vehicles. Track charging sessions, optimize charging schedules, monitor battery health, and plan your transition to electric with confidence.',
    image: '/vans charging up at electrical charging points.webp',
    valueProps: [
      {
        id: 'charging-management',
        title: 'Smart Charging Management',
        description:
          'Monitor charging sessions in real-time, track charging costs, and optimize charging schedules to minimize electricity expenses.',
      },
      {
        id: 'range-analytics',
        title: 'Range & Battery Analytics',
        description:
          'Real-time range predictions, battery health monitoring, and degradation tracking to maximize vehicle lifespan.',
      },
      {
        id: 'transition-planning',
        title: 'EV Transition Planning',
        description:
          'ROI calculators, TCO comparisons, and route suitability analysis to support your fleet electrification strategy.',
      },
      {
        id: 'charging-infrastructure',
        title: 'Charging Infrastructure Insights',
        description:
          'Identify optimal charging station locations, track utilization, and plan infrastructure expansion.',
      },
      {
        id: 'mixed-fleet',
        title: 'Mixed Fleet Optimization',
        description:
          'Intelligently assign the right vehicle (EV or ICE) to each job based on range requirements and charging availability.',
      },
    ],
  },
};

/**
 * Get a locked feature by ID
 */
export function getLockedFeature(featureId: string): LockedFeature | undefined {
  return lockedFeatures[featureId];
}

/**
 * Get all locked features
 */
export function getAllLockedFeatures(): LockedFeature[] {
  return Object.values(lockedFeatures);
}

/**
 * Check if a feature ID is valid
 */
export function isValidFeatureId(featureId: string): boolean {
  return featureId in lockedFeatures;
}
