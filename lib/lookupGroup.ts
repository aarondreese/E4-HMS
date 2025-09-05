export interface LookupGroup {
  ID: number;
  ROWSTAMP: string;
  Name: string;
  isActive: number;
  Description?: string | null;
  Metadata?: string | null;
}
