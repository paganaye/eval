import { ArrayType, VariantKind, VariantType } from './Types';

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
	pageName: string;
}

export type Action = ShowMessageAction | AddRecordAction | AlertAction;


// Removed those. They are now in string definitions
//  | ColorDefinition | DateDefinition | DatetimeLocalDefinition
//  | EmaiDefinition | MonthDefinition | RangeDefinition | TelDefinition
//  | TextDefinition | TimeDefinition 
//  | UrlDefinition | WeekDefinition | ExternalDefinition | MapType



var stepType: VariantType = {
	_kind: "variant",
	kinds: null /*soon processActionKinds*/
};

export var stepsType: ArrayType<any> = {
	_kind: "array",
	entryType: this.stepType
};

var stepKinds: VariantKind[] = [
	{
		group: "display",
		key: "showMessage",
		type: {
			_kind: "object",
			properties: [
				{ name: "text", type: { _kind: "string" } }]
		}
	},
	{
		group: "data",
		key: "addRecord",
		type: {
			_kind: "object",
			properties: [
				{ name: "pageName", type: { _kind: "string", editView: "link", pageName: "page" } }]
		}
	},
	{
		group: "display",
		key: "showForm",
		type: {
			_kind: "object",
			properties: [
				{ name: "text", type: { _kind: "string" } },
				{ name: "properties", type: this.propertiesType }]
		}
	},
	{
		group: "entry",
		key: "input",
		type: {
			_kind: "object",
			properties: [
				{ name: "text", type: { _kind: "string" } },
				{ name: "variableName", type: { _kind: "string" } },]
		}
	},
	{
		group: "control flow",
		key: "if",
		type: {
			_kind: "object", properties: [
				{ name: "condition", type: { _kind: "string" } },
				{ name: "then", type: this.stepsType },
				{ name: "else", type: this.stepsType }
			]
		}
	},
	{
		group: "control flow",
		key: "while",
		type: {
			_kind: "object", properties: [
				{ name: "condition", type: { _kind: "string" } },
				{ name: "steps", type: this.stepsType }
			]
		}
	},
	{
		group: "control flow",
		key: "repeat",
		type: {
			_kind: "object", properties: [
				{ name: "steps", type: this.stepsType },
				{ name: "until", type: { _kind: "string" } }
			]
		}
	},
	{
		group: "control flow",
		key: "run",
		label: "Run process",
		type: {
			_kind: "object",
			properties: [
				{ name: "process", type: { _kind: "string", editView: "link", pageName: "process" } }
			]
		}
	}];

stepType.kinds = stepKinds;
