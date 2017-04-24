import { View } from "./View";


export interface TypeDefinition<T> {
   validate?: (value: T) => ValidationResult;
   editView?: string;
   printView?: string;
   mandatory?: boolean;
   description?: string;
}

export interface ValidationResult {
   valid: boolean;
   code?: string;
   message?: string;
}

export interface NumberType extends TypeDefinition<number> {
   _kind: "number";
   defaultValue?: number;
   minimum?: number;
   maximum?: number;
   decimals?: number;
}

export interface ConstType extends TypeDefinition<any> {
   _kind: "const";
   value: any;
}

export interface VariableType extends TypeDefinition<any> {
   _kind: "variable";
   name: string;
}

export interface StringType extends TypeDefinition<string> {
   _kind: "string";
   defaultValue?: string;
   validation?: ValidationRegexp[];
   cols?: number;
   rows?: number;
}

export interface ValidationRegexp {
   regexp: string;
   message: string;   
}

export interface BooleanType extends TypeDefinition<boolean> {
   _kind: "boolean";
   defaultValue?: boolean;
}

export interface Property {
   name: string;
   type: Type;
   group?: string;
}


export interface ObjectType extends TypeDefinition<object> {
   _kind: "object";
   properties: Property[];
}

export interface Group {
   defaultValue?: string;
   entries: EnumEntry[];
   multiple?: boolean;
}


export interface ArrayType<T> extends TypeDefinition<T[]> {
   _kind: "array";
   entryType: Type;
   minimumCount?: number;
   maximumCount?: number;
   canAddOrDelete?: boolean;
   canReorder?: boolean;
}

export interface EnumType extends TypeDefinition<string> {
   _kind: "enum";
   defaultValue?: string;
   entries: EnumEntry[];
   multiple?: boolean;
}

export interface CategoryType extends TypeDefinition<string> {
   _kind: "enum";
   defaultValue?: string;
   entries: EnumEntry[];
   multiple?: boolean;
   categoryName: string;
}


export interface EnumEntry {
   group?: string;
   key: string
   label?: string
}

export interface VariantType extends TypeDefinition<any> {
   _kind: "variant";
   kinds: VariantKind[];
}

export interface VariantKind extends EnumEntry {
   group?: string;
   key: string;
   label?: string;
   properties?: Property[]
}

export interface VariantObject {
   _kind: string;
   //[otherFields: string]: any;
}

export type Type = NumberType | StringType | BooleanType | ConstType | VariableType
   | EnumType | ObjectType | ArrayType<any> | VariantType;

export type TypeOrString = Type | string;

// Removed those. They are now in string definitions
//  | ColorDefinition | DateDefinition | DatetimeLocalDefinition
//  | EmaiDefinition | MonthDefinition | RangeDefinition | TelDefinition
//  | TextDefinition | TimeDefinition 
//  | UrlDefinition | WeekDefinition | ExternalDefinition | MapType
