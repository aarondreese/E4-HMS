export interface PropertyDetails {
  PropertyID: number;
  PropertyTypeID: number;
  AddressID: number;
  PropIsVirtual: boolean;
  TakeOnDate: string;
  DisposedDate: string | null;
  DisposalMethod: number | null;
  AddressLine1: string;
  AddressLine2: string | null;
  AddressLine3: string | null;
  PostCode: string | null;
  UPRN: string | null;
  TypeName: string;
  isBlock: boolean;
  isDwelling: boolean;
  isLettable: boolean;
  isCommunual: boolean;
  isVirtual: boolean;
  isUtility: boolean;
  isPrivate: boolean;
  TakeonType: string;
}

export interface PropertyAttribute {
  ID: number;
  ROWSTAMP: string;
  PropertyID: number;
  AttributeID: number;
  isActive: number;
  String01?: string;
  String02?: string;
  String03?: string;
  Date01?: string;
  Date02?: string;
  Date03?: string;
  Int01?: number;
  Int02?: number;
  Int03?: number;
  Decimal01?: number;
  Decimal02?: number;
  Decimal03?: number;
  Lookup01?: number;
  Lookup02?: number;
  Lookup03?: number;
  Boolean01?: number;
  Boolean02?: number;
  Boolean03?: number;
  Image01?: string | null; // base64 string from varbinary(max)
  Image02?: string | null; // base64 string from varbinary(max)
  Image03?: string | null; // base64 string from varbinary(max)
  Name?: string;
}

export interface PropertyHierarchy {
  ID: number;
  ParentPropertyID: number | null;
  ChildPropertyID: number;
  StartDate: string; // ISO date string (YYYY-MM-DD)
  EndDate: string | null; // ISO date string or null
}
