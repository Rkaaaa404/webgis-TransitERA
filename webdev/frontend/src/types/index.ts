export type StationId =
  | 'gubeng'
  | 'pasar_turi'
  | 'semut'
  | 'wonokromo'
  | 'waru'
  | 'terminal_joyoboyo'
  | 'terminal_purabaya'
  | 'terminal_bratang'
  | 'tandes'
  | 'kandangan'
  | 'benowo'
  | 'ngagel'
  | 'margorejo'
  | 'jemursari'
  | 'kertomenanggal'
  | 'sidotopo'
  | 'kalimas'
  | 'benteng'
  | (string & {});

export interface TODDimensionScores {
  density: number;
  diversity: number;
  design: number;
  destination_accessibility: number;
  distance_to_transit: number;
}

export interface MenuGoItem {
  name: string;
  distance: string;
  price: 'Low' | 'Medium' | 'High';
  crowd: 'Low' | 'Medium' | 'High';
}

export interface TenantMixItem {
  label: string;
  value: number;
  color: string;
}

export interface IntermodalStep {
  mode: 'walk' | 'feeder' | 'bus' | 'train' | string;
  desc: string;
  duration: string;
  distance?: string;
  line_code?: string;
  line_color?: string;
}

export interface IntermodalPlan {
  destination: string;
  total_time: string;
  total_distance_km: number;
  fare: string;
  route_id?: string;
  modes_used: string[];
  steps: IntermodalStep[];
}

export interface TravelEstimateItem {
  destination: string;
  time: string;
  icon?: string;
  total_distance_km?: number;
  fare?: string;
  route_id?: string;
  steps?: IntermodalStep[];
}

export interface StationData {
  id: StationId;
  name: string;
  kecamatan?: string;
  latitude: number;
  longitude: number;
  tod_readiness_score: number;
  scores: TODDimensionScores;
  benchmark_scores: TODDimensionScores;
  typology: string;
  weakest_dimension: string;
  strongest_dimension: string;
  status: string;
  is_tier_1?: boolean;
  njop_premium: {
    avg_njop_premium_pct: number;
    ci_lower_pct: number;
    ci_upper_pct: number;
    affected_h3_count: number;
    r_squared: number;
    direct_effect_pct: number;
    spillover_effect_pct: number;
  };
  policy_recommendations: string[];
  menu_go_recommendations?: MenuGoItem[];
  tenant_mix?: TenantMixItem[];
  travel_estimates?: TravelEstimateItem[];
  intermodal_plans?: IntermodalPlan[];
}

export interface H3FeatureProperties {
  h3_index: string;
  station_cluster: StationId;
  station_name: string;
  ring_distance: number;
  tod_readiness_score: number;
  density_score: number;
  diversity_score: number;
  design_score: number;
  destination_score: number;
  distance_score: number;
  typology: string;
  predicted_njop_premium_pct: number;
  ci_lower_pct: number;
  ci_upper_pct: number;
  njop_m2: number;
}

export interface SurveyPointProperties {
  id: string;
  station_cluster: StationId;
  station_name: string;
  category: string;
  survey_type: 'activity' | 'mission';
  mission_subtype: 'properti_go' | 'struk_go' | 'menu_go' | null;
  hashtag: string;
  name: string;
  description: string;
  condition: string;
  spending_amount?: number;
  menu_price_range?: string;
  property_price?: number;
  transaction_type?: 'jual' | 'sewa';
  surveyed_at: string;
  photo_url?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  action?: string;
  targetStation?: StationId;
  timestamp: string;
  chartPayload?: any;
}
