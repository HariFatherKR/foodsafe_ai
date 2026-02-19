export type RiskLevel = "safe" | "caution" | "danger";
export type SourceType = "recall" | "administrative";

export type Ingredient = {
  id: string;
  name: string;
  supplier?: string;
  expiresAt?: string;
  createdAt: string;
};

export type RiskEvent = {
  id: string;
  ingredientName: string;
  level: RiskLevel;
  sourceType: SourceType;
  sourceTitle: string;
  sourceDate?: string;
  sourceUrl?: string;
  autoMatched: boolean;
  suggestedSubstitute?: string;
  createdAt: string;
};

export type MenuPlan = {
  id: string;
  constraints: {
    people: number;
    budget: number;
    allergies: string[];
  };
  days: Array<{
    day: string;
    items: string[];
    allergyWarnings: string[];
    substitutions?: string[];
  }>;
  createdAt: string;
};

export type ParentNotice = {
  id: string;
  title: string;
  body: string;
  riskEventIds: string[];
  menuPlanId?: string;
  createdAt: string;
};

export type DomainStore = {
  ingredients: Ingredient[];
  riskEvents: RiskEvent[];
  menuPlans: MenuPlan[];
  parentNotices: ParentNotice[];
  lastSyncedAt: string | null;
};
