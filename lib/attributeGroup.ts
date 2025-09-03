export interface AttributeGroup {
  ID: number;           // Primary key, int, not nullable
  ROWSTAMP: string;     // timestamp, not nullable
  Name: string;         // varchar(100), not nullable
  isActive: number;     // tinyint, not nullable
}
