
import { View } from "./View";


export interface BaseTypeDefinition<T> {
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

export interface NumberDefinition extends BaseTypeDefinition<number> {
   type: "number";
   defaultValue?: number
   minimalValue?: number;
   maximalValue?: number;
   nbDecimals?: number;
}

export interface StringDefinition extends BaseTypeDefinition<string> {
   type: "string";
   defaultValue?: string;
   minimalLength?: number;
   maximalLength?: number;
   regexp?: string;
   regexpMessage?: string;
   cols?: number;
   rows?: number;
}

export interface BooleanDefinition extends BaseTypeDefinition<boolean> {
   type: "boolean";
   defaultValue?: boolean;
}

export interface ObjectDefinition extends BaseTypeDefinition<object> {
   type: "object";
   properties?: { [key: string]: Type };
   displayOrder?: string[];
}

export interface ArrayDefinition extends BaseTypeDefinition<any[]> {
   type: "array";
   entryType: TypeDefinition;
   minimumCount?: number;
   maximumCount?: number;
   canAddOrDelete?: boolean;
   canReorder?: boolean;
}

export interface MapDefinition extends BaseTypeDefinition<object> {
   type: "map";
   entryType: TypeDefinition;
   key: StringDefinition | EnumDefinition;
}

export interface EnumDefinition extends BaseTypeDefinition<string> {
   type: "select";
   defaultValue?: string;
   entries: EnumEntry[];
   multiple?: boolean;
}

export interface EnumEntry {
   group?: string;
   key: string
   label?: string
}

export interface DynamicDefinition extends BaseTypeDefinition<any> {
   type: "dynamic";
   entries: DynamicEntry[];
}

export interface DynamicEntry extends EnumEntry {
   // group?: string;
   // key: string
   // label?: string
   type: Type;
}

export interface TypedObject {
   type: string;
   [otherFields: string]: any;
}

export type TypeDefinition = NumberDefinition | StringDefinition | BooleanDefinition
   | EnumDefinition | ObjectDefinition | ArrayDefinition | MapDefinition | DynamicDefinition;

export type Type = TypeDefinition | string;

// Removed those. They are now in string definitions
//  | ColorDefinition | DateDefinition | DatetimeLocalDefinition
//  | EmaiDefinition | MonthDefinition | RangeDefinition | TelDefinition
//  | TextDefinition | TimeDefinition
//  | UrlDefinition | WeekDefinition | ExternalDefinition
