export interface Attribute {
  ID: number;
  Name: string;
  isActive: number;
}

export interface AttributeGroup {
  ID: number;
  ROWSTAMP: string;
  Name: string;
  isActive: number;
}

export interface AttributeGroupAttribute {
  ID: number;
  AttributeGroupID: number;
  AttributeID: number;
  AttributeName: string;
}

export interface AttributeDescriptor {
  ID: number;
  ROWSTAMP: string;
  AttributeID: number;
  FieldName: string;
  Label: string;
  TabNumber: number;
  RowNumber: number;
  ColumnNumber: number;
  LookupGroupID?: number | null;
}
