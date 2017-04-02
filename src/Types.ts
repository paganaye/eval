import { View } from "./View";


export interface TypeDefinition<T> {
   validate?: (value: T) => ValidationResult;
   view?: string;
   inputView?: string;
   mandatory?: boolean;
}

export interface ValidationResult {
   valid: boolean;
   code?: string;
   message?: string;
}

export interface NumberType extends TypeDefinition<number> {
   _kind: "number";
   defaultValue?: number;
   minimalValue?: number;
   maximalValue?: number;
   nbDecimals?: number;
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
   minimalLength?: number;
   maximalLength?: number;
   regexp?: string;
   regexpMessage?: string;
   cols?: number;
   rows?: number;
}

export interface BooleanType extends TypeDefinition<boolean> {
   _kind: "boolean";
   defaultValue?: boolean;
}

export interface Property {
   name: string;
   type: Type;
}


export interface ObjectDefinition extends TypeDefinition<object> {
   _kind: "object";
   properties: Property[];
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

export interface EnumEntry {
   group?: string;
   key: string
   label?: string
}

export interface DynamicType extends TypeDefinition<any> {
   _kind: "dynamic";
   kinds: DynamicKind[];
}

export interface DynamicKind extends EnumEntry {
   group?: string;
   key: string;
   label?: string;
   type: Type;
}

export interface DynamicObject {
   _kind: string;
   //[otherFields: string]: any;
}

export type Type = NumberType | StringType | BooleanType | ConstType | VariableType
   | EnumType | ObjectDefinition | ArrayType<any> | DynamicType;

export type TypeOrString = Type | string;

// Removed those. They are now in string definitions
//  | ColorDefinition | DateDefinition | DatetimeLocalDefinition
//  | EmaiDefinition | MonthDefinition | RangeDefinition | TelDefinition
//  | TextDefinition | TimeDefinition 
//  | UrlDefinition | WeekDefinition | ExternalDefinition | MapType
