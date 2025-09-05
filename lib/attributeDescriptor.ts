export interface AttributeDescriptor {
  ID: number;
  ROWSTAMP: string;
  AttributeID: number;
  FieldName: string;
  Label?: string | null;
  TabNumber: number;
  RowNumber: number;
  ColumnNumber: number;
  LookupGroupID?: number | null;
}
