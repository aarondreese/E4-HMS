export interface Lookup {
  ID: number;
  ROWSTAMP: string;
  LookupGroupID: number;
  Value: string;
  isActive: number;
  MetaData?: string | null;
}

export interface LookupGroup {
  ID: number;
  ROWSTAMP: string;
  Name: string;
  isActive: number;
  Description?: string | null;
  Metadata?: string | null;
}
