import { Type, BooleanType, StringType, NumberType, ObjectType, ArrayType, SelectType, TypeOrString, VariantType, VariantKind, Property, Visibility, SelectEntry } from './Types';
import { View, AnyView, ViewFactory, ViewParent } from "./View";
import { Command } from "./Command";
import { Print } from "./commands/Print";
import { Hello } from "./commands/Hello";
import { Tests } from "./commands/Tests";
import { Assign } from "./commands/Assign";
import { Index } from "./commands/Index";
import { Alert } from "./commands/Alert";
import { Input } from './commands/Input';
import { Load } from './commands/Load';
import { Read } from './commands/Read';
import { Update } from './commands/Update';
import { Create } from './commands/Create';

import { ButtonView } from "./views/ButtonView";
import { TypeView } from "./views/TypeView";
import { FrameView } from "./views/FrameView";
import { SelectView } from "./views/SelectView";
import { VariantView } from "./views/VariantView";
import { LinkView } from "./views/LinkView";
import { JSONView } from "./views/JSONView";
import { ObjectView } from './views/ObjectView';
import { ArrayView } from './views/ArrayView';
import { ParagraphView, IParagraph } from "./views/ParagraphView"

import { Expression } from './Expression';
import { Output } from './Output';
import { NumberInputView, StringInputView, BooleanInputView, TelInputView, UrlInputView, DateTimeInputView, DateInputView, MonthInputView, TimeInputView, WeekInputView, ColorInputView, RangeInputView, PasswordInputView } from './views/InputView';
import { Database } from './Database';
import { Theme, PrintArgs } from "./Theme";
import { Bootstrap } from "./themes/Bootstrap";

import { EvalFunction } from "./EvalFunction";
import { AbsFunction, RoundFunction, RandomFunction } from './functions/Math';
import { NowFunction } from './functions/Time';


export class Eval {
	globalVariables: { [key: string]: any } = {};
	viewFactories: { [key: string]: ViewFactory } = {};
	userName: string = "guest";
	userId: string = null;

	addViewFactory(viewName: string, viewConstructor: () => AnyView): ViewFactory {
		return (this.viewFactories[viewName] = new ViewFactory(viewName, viewConstructor));
	}

	jsonViewFactory = this.addViewFactory("json", () => new JSONView());
	objectViewFactory = this.addViewFactory("object", () => new ObjectView());
	arrayViewFactory = this.addViewFactory("array", () => new ArrayView());

	numberInputViewFactory = this.addViewFactory("number", () => new NumberInputView());
	stringInputViewFactory = this.addViewFactory("string", () => new StringInputView());
	booleanInputViewFactory = this.addViewFactory("boolean", () => new BooleanInputView());
	telInputViewFactory = this.addViewFactory("tel", () => new TelInputView());
	urlViewFactory = this.addViewFactory("url", () => new UrlInputView());
	datetimeViewFactory = this.addViewFactory("datetime", () => new DateTimeInputView());
	dateViewFactory = this.addViewFactory("date", () => new DateInputView());
	timeViewFactory = this.addViewFactory("time", () => new TimeInputView());
	monthViewFactory = this.addViewFactory("month", () => new MonthInputView());
	weekViewFactory = this.addViewFactory("week", () => new WeekInputView());
	colorViewFactory = this.addViewFactory("color", () => new ColorInputView());
	rangeViewFactory = this.addViewFactory("range", () => new RangeInputView());
	passwordViewFactory = this.addViewFactory("password", () => new PasswordInputView());

	selectViewFactory = this.addViewFactory("select", () => new SelectView());
	variantViewFactory = this.addViewFactory("variant", () => new VariantView());
	linkViewFactory = this.addViewFactory("link", () => new LinkView());
	paragraphViewFactory = this.addViewFactory("paragraph", () => new ParagraphView());
	buttonViewFactory = this.addViewFactory("button", () => new ButtonView());
	typeViewFactory = this.addViewFactory("type", () => new TypeView());
	frameViewFactory = this.addViewFactory("frame", () => new FrameView());

	private types: { [key: string]: Type } = {};

	commands: { [key: string]: (evalContext: Eval) => Command } = {};
	functions: { [key: string]: (parent: Expression<any>) => EvalFunction<any> } = {};
	variantKinds: VariantKind[];


	database: Database;
	theme: Theme;
	private idCounter: { [key: string]: number } = {};

	arrayOfEnum: ArrayType<any> = {
		_kind: "array", entryType: {
			_kind: "object",
			properties: [
				{ name: "group", type: { _kind: "string" } },
				{ name: "key", type: { _kind: "string" } },
				{ name: "label", type: { _kind: "string" } },
			]
		}
	};

	arrayOfValidationRegexp: ArrayType<any> = {
		_kind: "array", entryType: {
			_kind: "object",
			properties: [
				{ name: "regexp", type: { _kind: "string" } },
				{ name: "message", type: { _kind: "string" } }
			]
		},
		tab: "value"
	};

	variantType: VariantType = {
		_kind: "variant",
		kinds: [], // will come later
		visibility: "hiddenLabel"
	};

	propertiesType: ArrayType<object> = {
		_kind: "array",
		entryType: {
			_kind: "object",
			properties: [
				{ name: "name", type: { _kind: "string" } },
				{
					name: "type", type: this.variantType
				}
			],
			template: "{name} ({type._kind})"
		},
		visibility: "hiddenLabel"
	};

	stepType: VariantType = {
		_kind: "variant",
		kinds: null /*soon processActionKinds*/
	};

	stepsType: ArrayType<any> = {
		_kind: "array",
		entryType: this.stepType
	};

	stepKinds: VariantKind[] = [
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


	constructor() {

		this.registerCommand("print", () => new Print(this));
		this.registerCommand("hello", () => new Hello(this));
		this.registerCommand("hi", () => new Hello(this));
		this.registerCommand("assign", () => new Assign(this));
		this.registerCommand("alert", () => new Alert(this));
		this.registerCommand("input", () => new Input(this));
		this.registerCommand("read", () => new Read(this));
		this.registerCommand("create", () => new Create(this));
		this.registerCommand("update", () => new Update(this));
		this.registerCommand("index", () => new Index(this));
		//		this.registerCommand("delete", () => new Crud(this, "delete"));
		this.registerCommand("tests", () => new Tests(this));
		this.registerCommand("test", () => new Tests(this));

		this.registerFunctions("abs", (parent: Expression<any>) => new AbsFunction(parent));
		this.registerFunctions("round", (parent: Expression<any>) => new RoundFunction(parent));
		this.registerFunctions("random", (parent: Expression<any>) => new RandomFunction(parent));
		this.registerFunctions("now", (parent: Expression<any>) => new NowFunction(parent));

		this.variantKinds = [];

		//this.addType("object", null, null, (type) => (type as ObjectType).properties = []);
		//this.addType("array", null);
		this.addType("string", "standard", "String", (type, addProperty) => {
			addProperty({ name: "defaultValue", type: { _kind: "string", tab: "value" } });
			addProperty({ name: "validation", type: this.arrayOfValidationRegexp });
			addProperty({ name: "cols", type: { _kind: "number", tab: "update" } });
			addProperty({ name: "rows", type: { _kind: "number", tab: "update" } });
		});
		this.addType("number", "standard", "Number", (type, addProperty) => {
			addProperty({ name: "defaultValue", type: { _kind: "number", tab: "value" } });
			addProperty({ name: "minimum", type: { _kind: "number", tab: "value" } });
			addProperty({ name: "maximum", type: { _kind: "number", tab: "value" } });
			addProperty({ name: "rows", type: { _kind: "number", tab: "display" } });
		});

		this.addType("boolean", "standard", "Boolean", (type, addProperty) => {
			addProperty({ name: "defaultValue", type: { _kind: "boolean", tab: "value" } });
		});

		this.addType("color", "html5", "Color");
		this.addType("date", "html5", "Date");
		this.addType("datetime", "html5", "Date and time");
		this.addType("month", "html5", "Month and Year");
		this.addType("password", "html5", "Password");
		this.addType("range", "html5", "Range");
		this.addType("tel", "html5", "Telephone number");
		this.addType("time", "html5", "Time");
		this.addType("url", "html5", "URL");
		this.addType("week", "html5", "Week");

		this.addType("select", "advanced", "Select", (type, addProperty) => {
			(type as SelectType).entries = [];
			addProperty({ name: "entries", type: this.arrayOfEnum });
		});

		this.addType("array", "advanced", "Array", (type, addProperty) => {
			type.editView = "array";
			var arrayType = (type as ArrayType<object>);
			var entryType = arrayType.entryType || (arrayType.entryType = {} as Type);
			entryType._kind = "object";

			var entryTypeDefinition: VariantType = {
				_kind: "variant",
				kinds: this.variantKinds,
				visibility: "hiddenLabel"
			};
			entryTypeDefinition.tab = "entryType";
			entryTypeDefinition.visibility = "hiddenLabel"

			addProperty({
				name: "entryType", type: entryTypeDefinition
			});
			addProperty({ name: "minimumCount", type: { _kind: "number", tab: "behaviour" } });
			addProperty({ name: "maximumCount", type: { _kind: "number", tab: "behaviour" } });
			addProperty({ name: "canAddOrDelete", type: { _kind: "boolean", tab: "behaviour" } });
			addProperty({ name: "canReorder", type: { _kind: "boolean", tab: "behaviour" } });
		});


		this.addType("object", "advanced", "Object", (type, addProperty) => {
			type.editView = "object";
			var objectType = (type as ObjectType);
			objectType.properties = [];
			objectType.tab = "objectType";
			objectType.visibility = "hiddenLabel"

			addProperty({ name: "properties", type: this.propertiesType });
			addProperty({ name: "template", type: { _kind: "string" } });
		});

		this.addType("variant", "advanced", "Variant", (type, addProperty) => {
			type.editView = "variant";
			var variantType = (type as VariantType);
			variantType.kinds = [];
			var variantKindsType: ArrayType<any> = {
				_kind: "array",
				entryType: {
					_kind: "object",
					properties: [
						{ name: "key", type: { _kind: "string" } },
						{ name: "group", type: { _kind: "string" } },
						{ name: "label", type: { _kind: "string" } },
						{ name: "type", type: this.variantType }
					],
					template: "{key} ({type._kind})"
				},
				visibility: "hiddenLabel"
			};

			addProperty({ name: "kinds", type: variantKindsType });

		});

		this.addType("category", "wiki", "Category", (type, addProperty) => {
			addProperty({ name: "categoryName", type: { _kind: "string", editView: "link", pageName: "category" } });
		});
		this.addType("link", "wiki", "Link", (type, addProperty) => {
			addProperty({ name: "pageName", type: { _kind: "string", editView: "link", pageName: "page" } });
		});
		this.addType("button", "wiki", "Button", (type, addProperty) => {
			addProperty({ name: "text", type: { _kind: "string" } });
			addProperty({ name: "onclick", type: this.stepsType });
		});
		this.addType("type", "wiki", "Type", (type, addProperty) => {
			addProperty({ name: "pageName", type: { _kind: "string", editView: "link", pageName: "type" } });
		});
		this.addType("frame", "wiki", "Frame", (type, addProperty) => {
			addProperty({ name: "pageName", type: { _kind: "string", editView: "link", pageName: "page" } });
			type.visibility = "hiddenLabel";
		});

		var illustrationType: Type = this.addType("illustration", "wiki", "Illustration", (type, addProperty) => {
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

		var quoteType: Type = this.addType("quote", "wiki", "Quote", (type, addProperty) => {
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

		this.addType("paragraph", "wiki", "Paragraph", (type, addProperty) => {
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


		this.variantType.kinds = this.variantKinds;

		this.stepType.kinds = this.stepKinds;

		this.database = new Database(this);
		this.setTheme(new Bootstrap(this));

	}

	addType(key: string, group: string, label: string, typeCallback?: (newType: Type, addProperty: (property: Property) => void) => void): Type {
		var type = { _kind: key, editView: key, printView: key } as Type;
		if (this.types[key]) {
			console.warn("type " + key + " is already declared.");
		}

		this.registerType(key, type);
		var properties: Property[] = [];
		if (label != null) {


			var variantKind: VariantKind = {
				key: key,
				label: label,
				group: group,
				type: { _kind: "object", properties: properties }
			}
			this.variantKinds.push(variantKind);
		}

		if (typeCallback) typeCallback(type, (property) => {
			properties.push(property)
		});

		properties.push({
			name: "tab", type: {
				_kind: "string", description: "Each group is displayed on its own tab.", tab: "display"
			}
		});
		properties.push({
			name: "visibility", type: {
				_kind: "select", description: "Property visibility.", tab: "display",
				entries: [
					{ key: "visible", label: "Visible" },
					{ key: "hiddenLabel", label: "Hidden label" },
					{ key: "hidden", label: "Hidden" }
				]
			}
		});
		return type;
	}

	nextId(prefix: string) {
		var counter = this.idCounter[prefix] = (this.idCounter[prefix] || 0) + 1;
		var result = prefix + "-" + counter;
		return result;
	}

	raise(actions: (() => void)[]): void {
		if (!actions) return;
		for (var action of actions) {
			try {
				action();
			} catch (e) {
				console.log(e);
			}
		}
		actions.length = 0;
	}

	registerCommand(name: string, getNew: () => Command) {
		this.commands[name] = getNew;
	}

	registerView(name: string, getNew: () => AnyView) {
		this.viewFactories[name] = new ViewFactory(name, getNew);
	}

	registerFunctions(name: string, getNew: (parent: Expression<any>) => EvalFunction<any>) {
		this.functions[name] = getNew;
	}

	registerType<T>(name: string, newType: Type) {
		this.types[name] = newType;
	}

	getVariable(variableName: string): any {
		var result = this.globalVariables[variableName];
		if (result == null) {

		}
		return result;
	}

	setVariable(variableName: string, value: any): void {
		this.globalVariables[variableName] = value;
	}

	stringify(expr: Expression<any>, type?: Type): string {
		return JSON.stringify(expr);
	}

	getTypeDef(data: any, type: TypeOrString): Type {
		if (typeof type == "string") type = this.types[type];
		if (!type) type = this.types[typeof data] || this.types['object'];
		if (!type.printView) {
			// inherits from base type
			var baseType = this.types[type._kind];
			if (baseType != type) {
				for (var prop in baseType) {
					if (!type.hasOwnProperty(prop)) type[prop] = baseType[prop];
				}
			}
		}
		return type;
	}


	instantiate(parent: ViewParent, name: string, expr: any, exprType: Type, editMode: boolean, printArgs?: PrintArgs): AnyView {
		var typeDef = this.getTypeDef(expr, exprType)
		if (!printArgs) printArgs = {};

		var viewName = (editMode ? typeDef.editView : typeDef.printView) || typeDef._kind;
		var viewFactory = this.viewFactories[viewName] || this.jsonViewFactory;
		var view = viewFactory.instantiateNewView(this, parent, name);

		var actualValue = (expr && expr.getValue)
			? expr.getValue(this)
			: expr;

		if (!printArgs) printArgs = {};

		view.beforeBuild(actualValue, typeDef, printArgs);
		view.build();
		return view;
	}

	getPageType(typeName: string, callback: (loadedType: Type) => void): void {
		typeName = (typeName || "object").toLowerCase();
		var tableType: Type;

		switch (typeName) {
			case "category":
				tableType = {
					_kind: "object",
					properties: [
						{ name: "description", type: { _kind: "string" } },
						{ name: "entries", type: this.arrayOfEnum }
					]
				};
				break;
			case "lenient":
				tableType = {
					_kind: "variant",
					kinds: [
						{ key: "number", type: { _kind: "number" } },
						{ key: "boolean", type: { _kind: "boolean" } },
						{ key: "string", type: { _kind: "string" } },
						{ key: "object", type: { _kind: "object", properties: [] } }
					]
				}
				break;
			case "type":
				var objectDefinition: ObjectType = {
					_kind: "object",
					properties: [{
						name: "type",
						type: {
							_kind: "variant",
							kinds: this.variantKinds,
							visibility: "hiddenLabel"
						}
					}
					]
				};
				tableType = objectDefinition;
				break;
			case "page":
				var tableDefinition: ObjectType = {
					_kind: "object",
					properties: [
						{ name: "_kind", type: { _kind: "const", value: "object", visibility: "hidden" } },
						{ name: "description", type: { _kind: "string" } },
						{ name: "properties", type: this.propertiesType },
						{ name: "template", type: { _kind: "string" } },
					]
				};
				tableType = tableDefinition;
				break;
			case "process":

				var processDefinition: ObjectType = {
					_kind: "object",
					description: "this is the graphcet page",
					properties: [
						{ name: "description", type: { _kind: "string" } },
						{ name: "onclick", type: this.stepsType }
					]
				};
				tableType = processDefinition;
				break;
		}

		if (tableType) {
			callback(tableType);
		}
		else {
			this.database.on("eval/page/" + typeName, (data, error) => {
				var type = data as Type;
				//var y: Table;


				if (!type) {
					type = {
						_kind: "const",
						value: "The page \"" + typeName + "\" does not exist."
					};
				}
				callback(type);
			});
		}
	}

	public clearTheme() {
		var nodes = document.head.childNodes;
		var inThemeHeader = false;
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes.item(i);
			if (node.textContent == "Eval Theme Start") inThemeHeader = true;
			if (inThemeHeader) {
				node.parentNode.removeChild(node);
				i--;
			}
			if (node.textContent == "Eval Theme End") inThemeHeader = false;
		}
	}

	public setTheme(newTheme: Theme) {
		this.clearTheme();

		const themeStart = "<!--Eval Theme Start-->\n";
		const themeEnd = "<!--Eval Theme End-->";
		this.theme = newTheme;
		var themeoutput = newTheme.createOutput();
		themeoutput.printHTML(themeStart);
		this.theme.initialize(themeoutput);
		themeoutput.printHTML(themeEnd);
		var $ = window['$'];
		$('head').append(themeoutput.toString());
	}

	public fixValue(value: any): any {
		switch (typeof (value)) {
			case "number":
				if (isNaN(value)) return null;
				break;
			default:
				if (!value) return null;
				break;
		}
		return value;
	}

	newInstance(instanceType: Type): any {
		switch (instanceType._kind) {
			case "const":
				return instanceType.value;
			case "number":
			case "string":
			case "boolean":
				return instanceType.defaultValue;
			case "variant":
				var variantResult = this.newInstance(instanceType.kinds[0].type);
				if (typeof variantResult == "object") variantResult._kind = instanceType.kinds[0].key;
				return variantResult;
			case "array":
				return [];
			default:
				if ((instanceType as ObjectType).properties) {
					var result = {};
					for (var p of (instanceType as ObjectType).properties) {
						result[p.name] = this.newInstance(p.type);
					}
					return result;
				} else return {};
		}
	}

	saveRecord(pageName: string, recordId: string, data: any) {

		if (typeof data === "object" && Object.keys(data).length == 0) data = null;

		var path = "eval/" + pageName + "/" + recordId;

		this.database.addUpdate(path, data);
		var json = data == null ? null : JSON.stringify(data);
		var indexBySizePath = "eval/" + pageName + "/_index/bySize/" + recordId;
		this.database.addUpdate(indexBySizePath, json && json.length);
		this.database.runUpdates();

		alert("saved " + JSON.stringify(data));
	}

	findEntry(entries: SelectEntry[], data: string): string {
		if (!entries || entries.length == 0) return null;
		var filter = entries.filter(e => e.key == data);
		if (filter.length == 0) data = entries[0].key;
		return data;
	}

	fixEnum<T>(value: T, constEnum: any): T {
		if (typeof value === "string") {
			var valueString: string = value;
			value = constEnum[valueString];
		}
		return value;
	}
}

