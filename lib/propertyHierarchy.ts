export interface PropertyHierarchy {
  ID: number;
  ParentPropertyID: number | null;
  ChildPropertyID: number;
  StartDate: string; // ISO date string (YYYY-MM-DD)
  EndDate: string | null; // ISO date string or null
}
