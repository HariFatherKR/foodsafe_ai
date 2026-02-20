export type RiskEventItem = {
  id: string;
  ingredientName: string;
  level: "safe" | "caution" | "danger";
  sourceTitle: string;
};

export type MenuDay = {
  day: string;
  items: string[];
  allergyWarnings: string[];
};

export type MenuPlan = {
  id: string;
  days: MenuDay[];
};
