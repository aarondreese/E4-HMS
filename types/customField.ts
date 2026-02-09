// Custom Field Type - lookup table for field types
export interface CustomFieldType {
  ID: number;
  FieldTypeDescription?: string | null;
  FieldTypeDefinition?: string | null;
}

// Property Custom Field - definition of custom fields
export interface PropertyCustomField {
  ID: number;
  FieldName: string;
  FieldLabel: string;
  CustomFieldTypeID: number;
  CustomFieldTypeName?: string; // for display (from join)
  TabNumber: number;
  RowNumber: number;
  ColNumber: number;
  isActive: number;
  Rules?: string | null; // XML field
}

// Property Custom Field Value - actual values for properties
export interface PropertyCustomFieldValue {
  ID: number;
  PropertyID: number;
  PropertyCustomFieldID: number;
  CustomDate?: string | null;
  CustomDateTime?: string | null;
  CustomTime?: string | null;
  CustomInt?: number | null;
  CustomDecimal?: number | null;
  CustomShortText?: string | null;
  CustomLongText?: string | null;
  CustomMaxText?: string | null;
  CustomBoolean?: number | null;
  CustomImageLink?: string | null;
}
