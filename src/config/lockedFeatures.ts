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
  'cost-management': {
    id: 'cost-management',
    title: 'Cost Management',
    tagline: 'Unlock Insights and Optimise Costs',
    category: 'Fleet Analytics',
    description:
      'Complete Total Cost of Ownership (TCO) analysis and cost optimization tools for your fleet.',
    longDescription:
      'Get comprehensive insights into your fleet\'s total cost of ownership with advanced analytics, predictive maintenance costs, and optimization recommendations. Make data-driven decisions to reduce operational expenses and maximize ROI.',
    image: '/vehicle-maintenance.webp',
    valueProps: [
      {
        id: 'tco-analysis',
        title: 'Total Cost of Ownership Analysis',
        description:
          'Comprehensive TCO tracking including fuel, maintenance, insurance, and depreciation costs across your entire fleet.',
      },
      {
        id: 'cost-forecasting',
        title: 'Predictive Cost Forecasting',
        description:
          'AI-powered predictions for upcoming maintenance and operational costs to help you budget more effectively.',
      },
      {
        id: 'cost-optimization',
        title: 'Cost Optimization Recommendations',
        description:
          'Actionable insights to reduce expenses through route optimization, fuel efficiency improvements, and preventive maintenance.',
      },
      {
        id: 'benchmark-reporting',
        title: 'Benchmark Reporting',
        description:
          'Compare your fleet costs against industry standards and identify opportunities for improvement.',
      },
      {
        id: 'custom-reporting',
        title: 'Custom Cost Reports',
        description:
          'Build detailed custom reports with flexible filtering, grouping, and export options for stakeholder communication.',
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
