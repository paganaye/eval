import { View } from "./View";


export interface TypeDefinition<T> {
	validate?: (value: T) => ValidationResult;
	editView?: string;
	printView?: string;
	tableName?: string;
	mandatory?: boolean;
	description?: string;
	tab?: string;
	visibility?: Visibility;
	template?: string;
}

export const enum Visibility {
	Shown,
	HiddenLabel,
	TitleInBox,
	Hidden,
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
	translate?: boolean;
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
}

export interface ObjectType extends TypeDefinition<object> {
	_kind: "object";
	properties: Property[];
}

export interface Group {
	defaultValue?: string;
	entries: SelectEntry[];
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

export interface SelectType extends TypeDefinition<string> {
	_kind: "select";
	defaultValue?: string;
	entries: SelectEntry[];
	multiple?: boolean;
}

export interface CategoryType extends TypeDefinition<string> {
	_kind: "enum";
	defaultValue?: string;
	entries: SelectEntry[];
	multiple?: boolean;
	categoryName: string;
}


export interface SelectEntry {
	group?: string;
	key: string
	label?: string
}

export interface VariantType extends TypeDefinition<any> {
	_kind: "variant";
	kinds: VariantKind[];
	fixedType?: boolean;
}

export interface ButtonType extends TypeDefinition<any> {
	_kind: "button";
	text: string;
	onclick: Action[];
	visibility: Visibility.HiddenLabel;
}

export interface VariantKind extends SelectEntry {
	group?: string;
	key: string;
	label?: string;
	type?: Type;
}

export type Type = NumberType | StringType | BooleanType | ConstType | VariableType
	| SelectType | ObjectType | ArrayType<any> | VariantType | ButtonType;

export interface VariantObject {
	_kind: string;
	//[otherFields: string]: any;
}

export interface AlertAction {
	_kind: "alert"
	text: string;
}

export interface ShowMessageAction {
	_kind: "showMessage"
	text: string;
}

export interface AddRecordAction {
	_kind: "addRecord"
	tableName: string;
}

export type Action = ShowMessageAction | AddRecordAction | AlertAction;

export type TypeOrString = Type | string;

// Removed those. They are now in string definitions
//  | ColorDefinition | DateDefinition | DatetimeLocalDefinition
//  | EmaiDefinition | MonthDefinition | RangeDefinition | TelDefinition
//  | TextDefinition | TimeDefinition 
//  | UrlDefinition | WeekDefinition | ExternalDefinition | MapType
