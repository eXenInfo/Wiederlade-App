/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CostInputs {
  powderPrice: number;
  powderWeight: number; // in kg
  powderCharge: number; // in grains
  primerPrice: number;
  primerCount: number;
  bulletPrice: number;
  bulletCount: number;
  brassPrice: number;
  brassCount: number;
  brassLife: number; // how many times brass can be reused
}

export interface LoadRecord {
  id: string;
  name: string;
  caliber: string;
  bulletWeight: number; // grains
  powderType: string;
  powderCharge: number; // grains
  primerType: string;
  date: string;
}

export interface AnalysisResult {
  groupSizeMm: number;
  groupSizeMoa?: number;
  numberOfHits: number;
  confidence: number;
  detectedHits: { x: number; y: number; ring?: number | string }[];
  referenceFound: boolean;
  rings?: { [key: string]: number };
  score?: number;
}

export const GRAINS_PER_KG = 15432.3584;
export const GRAINS_PER_GRAM = 15.4323584;
