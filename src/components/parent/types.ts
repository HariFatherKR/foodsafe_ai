export type ParentNotice = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export type ParentMenuPlan = {
  id: string;
  days: Array<{
    day: string;
    items: string[];
    allergyWarnings?: string[];
  }>;
};
