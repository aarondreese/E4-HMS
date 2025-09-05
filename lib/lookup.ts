export interface Lookup {
  ID: number;
  ROWSTAMP: string;
  LookupGroupID: number;
  Value: string;
  isActive: number;
  MetaData?: string | null;
}
