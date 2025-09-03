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
