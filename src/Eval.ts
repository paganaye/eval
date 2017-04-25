import { Type, BooleanType, StringType, NumberType, ObjectType, ArrayType, EnumType, TypeOrString, VariantType, VariantKind, Property, Visibility } from './Types';
import { View, AnyView, ViewFactory } from "./View";
import { Command } from "./Command";
import { JSONView } from "./views/JSONView";
import { ObjectView } from './views/ObjectView';
import { ArrayView } from './views/ArrayView';
import { Print } from "./commands/Print";
import { Hello } from "./commands/Hello";
import { Tests } from "./commands/Tests";
import { Assign } from "./commands/Assign";
import { AbsFunction, RoundFunction, RandomFunction } from './functions/Math';
import { NowFunction } from './functions/Time';
import { Alert } from "./commands/Alert";
import { Expression } from './Expression';
import { Output } from './Output';
import { NumberInputView, StringInputView, BooleanInputView, TelInputView, UrlInputView, DateTimeInputView, DateInputView, MonthInputView, TimeInputView, WeekInputView, ColorInputView, RangeInputView, PasswordInputView } from './views/InputView';
import { Input } from './commands/Input';
import { Load } from './commands/Load';
import { Database } from './Database';
import { Crud } from './commands/Crud';
import { Theme, ViewOptions } from "./Theme";
import { Bootstrap } from "./themes/Bootstrap";
import { SelectView } from "./views/SelectView";
import { VariantView } from "./views/VariantView";
import { LinkView } from "./views/LinkView";
import { CategoryView } from "./views/CategoryView";
import { ParagraphView, IParagraph } from "./views/ParagraphView"
import { EvalFunction } from "./EvalFunction";

export class Eval {

	viewFactories: { [key: string]: ViewFactory } = {};

	addViewFactory(viewName: string, viewConstructor: (parent: AnyView) => AnyView): ViewFactory {
		return (this.viewFactories[viewName] = new ViewFactory(viewName, viewConstructor));
	}

	jsonViewFactory = this.addViewFactory("json", (parent: AnyView) => new JSONView(this, parent));
	objectViewFactory = this.addViewFactory("object", (parent: AnyView) => new ObjectView(this, parent));
	arrayViewFactory = this.addViewFactory("array", (parent: AnyView) => new ArrayView(this, parent));

	numberInputViewFactory = this.addViewFactory("number", (parent: AnyView) => new NumberInputView(this, parent));
	stringInputViewFactory = this.addViewFactory("string", (parent: AnyView) => new StringInputView(this, parent));
	booleanInputViewFactory = this.addViewFactory("boolean", (parent: AnyView) => new BooleanInputView(this, parent));
	telInputViewFactory = this.addViewFactory("tel", (parent: AnyView) => new TelInputView(this, parent));
	urlViewFactory = this.addViewFactory("url", (parent: AnyView) => new UrlInputView(this, parent));
	datetimeViewFactory = this.addViewFactory("datetime", (parent: AnyView) => new DateTimeInputView(this, parent));
	dateViewFactory = this.addViewFactory("date", (parent: AnyView) => new DateInputView(this, parent));
	timeViewFactory = this.addViewFactory("time", (parent: AnyView) => new TimeInputView(this, parent));
	monthViewFactory = this.addViewFactory("month", (parent: AnyView) => new MonthInputView(this, parent));
	weekViewFactory = this.addViewFactory("week", (parent: AnyView) => new WeekInputView(this, parent));
	colorViewFactory = this.addViewFactory("color", (parent: AnyView) => new ColorInputView(this, parent));
	rangeViewFactory = this.addViewFactory("range", (parent: AnyView) => new RangeInputView(this, parent));
	passwordViewFactory = this.addViewFactory("password", (parent: AnyView) => new PasswordInputView(this, parent));

	selectViewFactory = this.addViewFactory("select", (parent: AnyView) => new SelectView(this, parent));
	categoryViewFactory = this.addViewFactory("category", (parent: AnyView) => new CategoryView(this, parent));
	variantViewFactory = this.addViewFactory("variant", (parent: AnyView) => new VariantView(this, parent));
	linkViewFactory = this.addViewFactory("link", (parent: AnyView) => new LinkView(this, parent));
	paragraphViewFactory = this.addViewFactory("paragraph", (parent: AnyView) => new ParagraphView(this, parent));

	private types: { [key: string]: Type } = {};

	commands: { [key: string]: (evalContext: Eval) => Command } = {};
	functions: { [key: string]: (parent: Expression<any>) => EvalFunction<any> } = {};
	variables: { [key: string]: any } = {};
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


	constructor() {

		this.registerCommand("print", () => new Print(this));
		this.registerCommand("hello", () => new Hello(this));
		this.registerCommand("hi", () => new Hello(this));
		this.registerCommand("assign", () => new Assign(this));
		this.registerCommand("alert", () => new Alert(this));
		this.registerCommand("input", () => new Input(this));
		this.registerCommand("create", () => new Crud(this, "create"));
		this.registerCommand("read", () => new Crud(this, "read"));
		this.registerCommand("update", () => new Crud(this, "update"));
		this.registerCommand("delete", () => new Crud(this, "delete"));
		this.registerCommand("tests", () => new Tests(this));
		this.registerCommand("test", () => new Tests(this));

		this.registerFunctions("abs", (parent: Expression<any>) => new AbsFunction(parent));
		this.registerFunctions("round", (parent: Expression<any>) => new RoundFunction(parent));
		this.registerFunctions("random", (parent: Expression<any>) => new RandomFunction(parent));
		this.registerFunctions("now", (parent: Expression<any>) => new NowFunction(parent));

		this.variantKinds = [];

		this.addType("object", null, null, (type) => (type as ObjectType).properties = []);
		//this.addType("array", null);
		this.addType("variant", null, null);
		this.addType("string", "standard", "String", (type, addProperty) => {
			addProperty({ name: "defaultValue", type: { _kind: "string", tab: "value" } });
			addProperty({ name: "validation", type: this.arrayOfValidationRegexp });
			addProperty({ name: "cols", type: { _kind: "number", tab: "display" } });
			addProperty({ name: "rows", type: { _kind: "number", tab: "display" } });
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
			(type as EnumType).entries = [];
			addProperty({ name: "entries", type: this.arrayOfEnum });
		});

		this.addType("array", "advanced", "Array", (type, addProperty) => {
			type.editView = "array";
			var arrayType = (type as ArrayType<object>);
			var entryType = arrayType.entryType || (arrayType.entryType = {} as Type);
			entryType._kind = "object";
			addProperty({
				name: "entryType", type: {
					_kind: "object",
					properties: [
						{ name: "_kind", type: { _kind: "const", value: "object", visibility: Visibility.Hidden } },
						{ name: "properties", type: { _kind: "array", entryType: this.getNewFieldDefinition(), visibility: Visibility.HiddenLabel } }
					],
					tab: "entryType",
					visibility: Visibility.HiddenLabel
				}
			});
			addProperty({ name: "minimumCount", type: { _kind: "number", tab: "behaviour" } });
			addProperty({ name: "maximumCount", type: { _kind: "number", tab: "behaviour" } });
			addProperty({ name: "canAddOrDelete", type: { _kind: "boolean", tab: "behaviour" } });
			addProperty({ name: "canReorder", type: { _kind: "boolean", tab: "behaviour" } });
		});

		this.addType("category", "wiki", "Category", (type, addProperty) => {
			addProperty({ name: "categoryName", type: { _kind: "string" } });
		});
		this.addType("link", "wiki", "Link", (type) => {

		});
		// this.addType("paragraph", "Paragraphs", (type, addProperty) => {
		// 	type.editView = "object";
		// 	(type as ObjectType).properties = [
		// 		{ name: "title", type: { _kind: "string" } },
		// 		{ name: "content", type: { _kind: "string" } },
		// 		{
		// 			name: "children",
		// 			type: { _kind: "array", entryType: type }
		// 		}
		// 	];
		// });
		this.database = new Database(this);
		this.setTheme(new Bootstrap(this));

	}

	addType(key: string, group: string, label: string, typeCallback?: (type: Type, addProperty: (property: Property) => void) => void): void {

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

	registerView(name: string, getNew: (parent: AnyView) => AnyView) {
		this.viewFactories[name] = new ViewFactory(name, getNew);
	}

	registerFunctions(name: string, getNew: (parent: Expression<any>) => EvalFunction<any>) {
		this.functions[name] = getNew;
	}

	registerType<T>(name: string, type: Type) {
		this.types[name] = type;
	}

	getVariable(variableName: string): any {
		var result = this.variables[variableName];
		if (result == null) {

		}
		return result;
	}

	setVariable(variableName: string, value: any): void {
		this.variables[variableName] = value;
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


	instantiate(expr: any, type: Type, parent: AnyView, editMode: boolean, options?: ViewOptions): AnyView {
		var typeDef = this.getTypeDef(expr, type)
		if (!options) options = {};

		var viewName = (editMode ? typeDef.editView : typeDef.printView) || typeDef._kind;
		var viewFactory = this.viewFactories[viewName] || this.jsonViewFactory;
		var view = viewFactory.instantiateNewView(parent);

		var actualValue = (expr && expr.getValue)
			? expr.getValue(this)
			: expr;
		if (!options) options = {};

		view.beforeBuild(actualValue, typeDef, options);
		this.theme.prepareViewBeforeBuild(view);
		view.build();
		return view;
	}

	getNewFieldDefinition(): ObjectType {
		return {
			_kind: "object",
			properties: [
				{ name: "name", type: { _kind: "string" } },
				{
					name: "type", type: {
						_kind: "variant",
						kinds: this.variantKinds,
						visibility: Visibility.HiddenLabel
					}
				}
			]
		};
	}


	getTableType(typeName: string, callback: (type: Type) => void): void {
		typeName = (typeName || "object").toLowerCase();
		this.database.on("tables/table/" + typeName, (data, error) => {
			var type = data as Type;
			//var y: Table;


			switch (typeName) {
				case "category":
					type = {
						_kind: "object",
						properties: [
							{ name: "description", type: { _kind: "string" } },
							{ name: "entries", type: this.arrayOfEnum }
						]
					};
					break;
				case "lenient":
					type = {
						_kind: "variant",
						kinds: [
							{ key: "number", type: { _kind: "number" } },
							{ key: "boolean", type: { _kind: "boolean" } },
							{ key: "string", type: { _kind: "string" } },
							{ key: "object", type: { _kind: "object", properties: [] } }
						]
					}
					break;
				case "table":
					var fieldsDefinition: ArrayType<any> = {
						_kind: "array",
						entryType: this.getNewFieldDefinition(),
						visibility: Visibility.HiddenLabel
					};

					var tableDefinition: ObjectType = {
						properties: [
							{ name: "_kind", type: { _kind: "const", value: "object", visibility: Visibility.Hidden } },
							{ name: "description", type: { _kind: "string" } },
							{ name: "properties", type: fieldsDefinition }
						],
						_kind: "object"
					}
					type = tableDefinition;
					break;
			}
			if (!type) {
				type = {
					_kind: "object",
					properties: [
						{ name: "id", type: { _kind: "string" } }
					]
				};
			}
			callback(type);
		});
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
		var themeoutput = new Output(this);
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
}

