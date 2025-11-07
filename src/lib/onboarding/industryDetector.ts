import type { Industry, VehicleMission } from "@/types/onboarding"

interface IndustryDetectionResult {
  industry: Industry
  confidence: "high" | "medium" | "low"
  suggestedMission: VehicleMission
}

// Keywords associated with each industry
const industryKeywords: Record<Industry, string[]> = {
  utility: [
    "water",
    "electric",
    "power",
    "gas",
    "energy",
    "utilities",
    "sewage",
    "waste",
  ],
  logistics: [
    "logistics",
    "delivery",
    "courier",
    "freight",
    "shipping",
    "transport",
    "cargo",
    "fedex",
    "ups",
    "dhl",
  ],
  construction: [
    "construction",
    "builders",
    "contractors",
    "building",
    "excavation",
    "roofing",
    "plumbing",
    "electrical contractors",
  ],
  healthcare: [
    "health",
    "medical",
    "hospital",
    "clinic",
    "ambulance",
    "healthcare",
    "care",
    "nursing",
  ],
  retail: [
    "retail",
    "store",
    "shop",
    "market",
    "supermarket",
    "mall",
    "boutique",
  ],
  manufacturing: [
    "manufacturing",
    "factory",
    "industrial",
    "production",
    "assembly",
    "automotive",
  ],
  telecommunications: [
    "telecom",
    "telecommunications",
    "internet",
    "cable",
    "wireless",
    "broadband",
    "network",
  ],
  other: [],
}

// Mission mapping based on industry
const industryToMission: Record<Industry, VehicleMission> = {
  utility: "field-service",
  logistics: "delivery",
  construction: "field-service",
  healthcare: "emergency-services",
  retail: "delivery",
  manufacturing: "transportation",
  telecommunications: "field-service",
  other: "other",
}

/**
 * Detects the industry based on company name
 * @param companyName - The name of the company
 * @returns Detection result with industry, confidence level, and suggested mission
 */
export function detectIndustry(companyName: string): IndustryDetectionResult {
  const normalizedName = companyName.toLowerCase()

  // Check for exact or strong matches
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (industry === "other") continue

    for (const keyword of keywords) {
      if (normalizedName.includes(keyword)) {
        return {
          industry: industry as Industry,
          confidence: "high",
          suggestedMission: industryToMission[industry as Industry],
        }
      }
    }
  }

  // No match found
  return {
    industry: "other",
    confidence: "low",
    suggestedMission: "other",
  }
}

/**
 * Get a human-readable label for an industry
 */
export function getIndustryLabel(industry: Industry): string {
  const labels: Record<Industry, string> = {
    utility: "Utility Industry",
    logistics: "Logistics & Transportation",
    construction: "Construction",
    healthcare: "Healthcare",
    retail: "Retail",
    manufacturing: "Manufacturing",
    telecommunications: "Telecommunications",
    other: "Other",
  }
  return labels[industry]
}

/**
 * Get a human-readable label for a vehicle mission
 */
export function getVehicleMissionLabel(mission: VehicleMission): string {
  const labels: Record<VehicleMission, string> = {
    "field-service": "Field Service",
    delivery: "Delivery",
    transportation: "Transportation",
    "emergency-services": "Emergency Services",
    maintenance: "Maintenance",
    other: "Other",
  }
  return labels[mission]
}
