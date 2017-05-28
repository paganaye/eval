import { Action, stepsType } from './Action';
import { View } from "./View";


export var types: { [key: string]: Type } = {};
export var variantKinds: VariantKind[] = [];

export interface TypeDefinition<T> {
	validate?: (value: T) => ValidationResult;
	editView?: string;
	printView?: string;
	pageName?: string;
	mandatory?: boolean;
	description?: string;
	template?: string;
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

addType("string", "basic", "String", (type, addProperty) => {
	addProperty({ name: "defaultValue", type: { _kind: "string" }, tab: "value" });
	addProperty({ name: "validation", type: arrayOfValidationRegexp });
	addProperty({ name: "cols", type: { _kind: "number" }, tab: "display" });
	addProperty({ name: "rows", type: { _kind: "number" }, tab: "display" });
});

export interface ValidationRegexp {
	regexp: string;
	message: string;
}

export interface BooleanType extends TypeDefinition<boolean> {
	_kind: "boolean";
	defaultValue?: boolean;
}

export type Visibility = "visible" | "hiddenLabel" | "hidden";

export interface Property {
	name: string;
	label?: string;
	type: Type;
	tab?: string;
	visibility?: Visibility;
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


export var arrayOfEnum: ArrayType<any> = {
	_kind: "array", entryType: {
		_kind: "object",
		properties: [
			{ name: "group", type: { _kind: "string" } },
			{ name: "key", type: { _kind: "string" } },
			{ name: "label", type: { _kind: "string" } },
		]
	}
};

export var arrayOfValidationRegexp: ArrayType<any> = {
	_kind: "array", entryType: {
		_kind: "object",
		properties: [
			{ name: "regexp", type: { _kind: "string" } },
			{ name: "message", type: { _kind: "string" } }
		]
	}
};

export var variantType: VariantType = {
	_kind: "variant",
	kinds: [], // will come later
};

export var propertiesType: ArrayType<object> = {
	_kind: "array",
	entryType: {
		_kind: "object",
		properties: [
			{ name: "name", type: { _kind: "string" } },
			{ name: "type", type: variantType, tab: "type" },
			{
				name: "visibility", type: {
					_kind: "select", description: "Property visibility.",
					entries: [
						{ key: "visible", label: "Visible" },
						{ key: "hiddenLabel", label: "Hidden label" },
						{ key: "hidden", label: "Hidden" }
					]
				}, tab: "display"
			},
			{ name: "tab", type: { _kind: "string" }, tab: "display" }
		],
		template: "{name} ({type._kind})"
	}
};


function addType(key: string, group: string, label: string, typeCallback?: (newType: Type, addProperty: (property: Property) => void) => void): Type {
	var type = { _kind: key, editView: key, printView: key } as Type;
	if (types[key]) {
		console.warn("type " + key + " is already declared.");
	}

	types[key] = type;
	var properties: Property[] = [];
	if (label != null) {
		// Labelled type will apear in the type list.
		var variantKind: VariantKind = {
			key: key,
			label: label,
			group: group,
			type: { _kind: "object", properties: properties }
		}
		variantKinds.push(variantKind);
	}

	if (typeCallback) typeCallback(type, (property) => {
		properties.push(property)
	});

	return type;
}

addType("string", "basic", "String", (type, addProperty) => {
	addProperty({ name: "defaultValue", type: { _kind: "string" }, tab: "value" });
	addProperty({ name: "validation", type: arrayOfValidationRegexp });
	addProperty({ name: "cols", type: { _kind: "number" }, tab: "display" });
	addProperty({ name: "rows", type: { _kind: "number" }, tab: "display" });
});

addType("number", "basic", "Number", (type, addProperty) => {
	addProperty({ name: "defaultValue", type: { _kind: "number" }, tab: "value" });
	addProperty({ name: "minimum", type: { _kind: "number" }, tab: "validation" });
	addProperty({ name: "maximum", type: { _kind: "number" }, tab: "validation" });
	addProperty({ name: "rows", type: { _kind: "number" }, tab: "display" });
});

addType("boolean", "basic", "Boolean", (type, addProperty) => {
	addProperty({ name: "defaultValue", type: { _kind: "boolean" }, tab: "value" });
});

addType("textarea", "html", "Multi-line string");
addType("pre", "html", "Preformated text");
addType("color", "html", "Color");
addType("date", "html", "Date");
addType("datetime", "html", "Date and time");
addType("month", "html", "Month and Year");
addType("password", "html", "Password");
addType("range", "html", "Range");
addType("tel", "html", "Telephone number");
addType("time", "html", "Time");
addType("url", "html", "URL");
addType("week", "html", "Week");

addType("select", "advanced", "Select", (type, addProperty) => {
	(type as SelectType).entries = [];
	addProperty({ name: "entries", type: arrayOfEnum });
});

addType("array", "advanced", "Array", (type, addProperty) => {
	type.editView = "array";
	var arrayType = (type as ArrayType<object>);
	var entryType = arrayType.entryType || (arrayType.entryType = {} as Type);
	entryType._kind = "object";

	var entryTypeDefinition: VariantType = {
		_kind: "variant",
		kinds: variantKinds
	};

	addProperty({
		name: "entryType", type: entryTypeDefinition
	});
	addProperty({ name: "minimumCount", type: { _kind: "number" }, tab: "validation" });
	addProperty({ name: "maximumCount", type: { _kind: "number" }, tab: "validation" });
	addProperty({ name: "canAddOrDelete", type: { _kind: "boolean" }, tab: "validation" });
	addProperty({ name: "canReorder", type: { _kind: "boolean" }, tab: "validation" });
});


addType("object", "advanced", "Object", (type, addProperty) => {
	type.editView = "object";
	var objectType = (type as ObjectType);
	objectType.properties = [];

	addProperty({ name: "properties", type: propertiesType });
	addProperty({ name: "template", type: { _kind: "string" }, tab: "display" });
});

addType("variant", "advanced", "Variant", (type, addProperty) => {
	type.editView = "variant";
	var variantKindsType: ArrayType<any> = {
		_kind: "array",
		entryType: {
			_kind: "object",
			properties: [
				{ name: "key", type: { _kind: "string" } },
				{ name: "group", type: { _kind: "string" } },
				{ name: "label", type: { _kind: "string" } },
				{ name: "type", type: variantType }
			],
			template: "{key} ({type._kind})"
		}
	};

	addProperty({ name: "kinds", type: variantKindsType });

});

addType("category", "wiki", "Category", (type, addProperty) => {
	addProperty({ name: "categoryName", type: { _kind: "string", editView: "link", pageName: "category" } });
});

addType("link", "wiki", "Link", (type, addProperty) => {
	addProperty({ name: "pageName", type: { _kind: "string", editView: "link", pageName: "page" } });
});

addType("button", "wiki", "Button", (type, addProperty) => {
	addProperty({ name: "text", type: { _kind: "string" } });
	addProperty({ name: "onclick", type: stepsType });
});

addType("type", "wiki", "Type", (type, addProperty) => {
	addProperty({ name: "pageName", type: { _kind: "string", editView: "link", pageName: "type" } });
});

addType("frame", "wiki", "Frame", (type, addProperty) => {
	addProperty({ name: "pageName", type: { _kind: "string", editView: "link", pageName: "page" } });
});

var illustrationType: Type = addType("illustration", "wiki", "Illustration", (type, addProperty) => {
	type.editView = 'object';
	var illustrationProperties: Property[] = [{
		name: "url",
		type: { _kind: "string" }
	},
	{
		name: "legend",
		type: { _kind: "string" }
	}];
	(type as ObjectType).properties = illustrationProperties;
});

var quoteType: Type = addType("quote", "wiki", "Quote", (type, addProperty) => {
	type.editView = 'object';
	var illustrationProperties: Property[] = [{
		name: "text",
		type: { _kind: "string" }
	},
	{
		name: "author",
		type: { _kind: "string" }
	},
	{
		name: "details",
		type: { _kind: "string" }
	}];
	(type as ObjectType).properties = illustrationProperties;
});

addType("paragraph", "wiki", "Paragraph", (type, addProperty) => {
	type.editView = 'object';
	var paragraphProperties: Property[] = [{
		name: "title",
		type: { _kind: "string" }
	},
	{
		name: "text",
		type: { _kind: "string" }
	}];

	paragraphProperties.push({
		name: "children",
		type: {
			_kind: "array", entryType: {
				_kind: "variant",
				kinds: [
					{ key: "paragraph", type: type },
					{ key: "illustration", type: illustrationType },
					{ key: "quote", type: quoteType }
				] // will come later
			}
		}
	});
	(type as ObjectType).properties = paragraphProperties;
});

variantType.kinds = variantKinds;
