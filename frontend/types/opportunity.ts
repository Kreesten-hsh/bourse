export type OpportunityType = "scholarship" | "internship" | "job" | "fellowship" | "training" | "volunteer";
export type FundingType = "full" | "partial" | "none" | "unknown";
export type OpportunityRequiredLevel = "undergrad" | "masters" | "phd" | "professional" | "any";
export type OpportunityStatus = "new" | "analyzing" | "priority" | "applying" | "applied" | "result" | "archived";

export type ScoreBreakdown = Readonly<Record<string, number>>;

export type Opportunity = Readonly<{
  id: string;
  external_id: string;
  source_name: string;
  source_url: string;
  official_url: string;
  title: string;
  organization: string;
  type: OpportunityType;
  destination_country: string | null;
  destination_city: string | null;
  is_remote: boolean;
  deadline: string | null;
  deadline_confirmed: boolean;
  funding_type: FundingType;
  monthly_stipend: number | null;
  monthly_stipend_currency: string | null;
  travel_covered: boolean | null;
  housing_covered: boolean | null;
  tuition_covered: boolean | null;
  visa_covered: boolean | null;
  insurance_covered: boolean | null;
  meals_covered: boolean | null;
  application_fee: boolean;
  required_nationality: string | null;
  age_min: number | null;
  age_max: number | null;
  required_level: OpportunityRequiredLevel;
  required_domains: ReadonlyArray<string>;
  required_experience_years: number | null;
  required_languages: ReadonlyArray<string>;
  required_documents: ReadonlyArray<string>;
  raw_description: string;
  summary: string | null;
  eligibility_notes: string | null;
  risks: string | null;
  candidacy_angle: string | null;
  score: number;
  score_breakdown: ScoreBreakdown;
  status: OpportunityStatus;
  is_duplicate: boolean;
  duplicate_of_id: string | null;
  created_at: string;
  updated_at: string;
  collected_at: string;
  expires_at: string | null;
}>;

export type OpportunityBenefit = Readonly<{
  label: string;
  value: string;
  confirmed: boolean;
}>;

export type OpportunityCondition = Readonly<{
  label: string;
  value: string;
  blocking: boolean;
}>;
