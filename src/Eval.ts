import { Type, BooleanType, StringType, NumberType, ObjectType, ArrayType, EnumType, TypeOrString, VariantType, VariantKind, Property } from './Types';
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
import { InputView } from './views/InputView';
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
	jsonViewFactory = new ViewFactory("json", (parent: AnyView) => new JSONView(this, parent));
	objectViewFactory = new ViewFactory("object", (parent: AnyView) => new ObjectView(this, parent));
	arrayViewFactory = new ViewFactory("array", (parent: AnyView) => new ArrayView(this, parent));
	inputViewFactory = new ViewFactory("input", (parent: AnyView) => new InputView(this, parent));
	selectViewFactory = new ViewFactory("select", (parent: AnyView) => new SelectView(this, parent));
	categoryViewFactory = new ViewFactory("selectCategory", (parent: AnyView) => new CategoryView(this, parent));
	variantViewFactory = new ViewFactory("variant", (parent: AnyView) => new VariantView(this, parent));
	linkViewFactory = new ViewFactory("link", (parent: AnyView) => new LinkView(this, parent));
	paragraphViewFactory = new ViewFactory("paragraph", (parent: AnyView) => new ParagraphView(this, parent));

	private types: { [key: string]: Type } = {};

	viewFactories: { [key: string]: ViewFactory } = {};
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


	constructor() {

		this.viewFactories = {
			json: this.jsonViewFactory,
			object: this.objectViewFactory,
			array: this.arrayViewFactory,
			input: this.inputViewFactory,
			select: this.selectViewFactory,
			category: this.categoryViewFactory,
			variant: this.variantViewFactory,
			link: this.linkViewFactory,
			paragraph: this.paragraphViewFactory
		};

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

		this.addType("object", null, "object", (type) => (type as ObjectType).properties = []);
		this.addType("array", null, "array");
		this.addType("variant", null, "variant");
		this.addType("string", "String", "input", (type, addProperty) => {
			type.htmlType = "text";
			addProperty({ name: "defaultValue", type: { _kind: "string" } });
			addProperty({ name: "minimalLength", type: { _kind: "number" } });
			addProperty({ name: "maximalLength", type: { _kind: "number" } });
			addProperty({ name: "regexp", type: { _kind: "string" } });
			addProperty({ name: "regexpMessage", type: { _kind: "string" } });
			addProperty({ name: "cols", type: { _kind: "number" } });
			addProperty({ name: "rows", type: { _kind: "number" } });
		});
		this.addType("number", "Number", "input");
		this.addType("boolean", "Boolean", "input", (type) => type.htmlType = "checkbox");
		this.addType("select", "Select", "select", (type, addProperty) => {
			(type as EnumType).entries = [];
			addProperty({ name: "entries", type: this.arrayOfEnum });
		});
		this.addType("category", "Category", "category", (type, addProperty) => {
			addProperty({ name: "categoryName", type: { _kind: "string" } });
		});
		this.addType("tel", "Telephone number", "input");
		this.addType("url", "URL", "input");
		this.addType("datetime", "Date and time", "input");
		this.addType("date", "Date", "input");
		this.addType("time", "Time", "input");
		this.addType("month", "Month and Year", "input");
		this.addType("week", "Week", "input");
		this.addType("color", "Color", "input");
		this.addType("range", "Range", "input");
		this.addType("password", "Password", "input");
		this.addType("link", "Link", "link", (type) => type.htmlType = "table");
		this.addType("paragraph", "Paragraphs", "paragraph", (type) => {
			type.editView = "object";
			(type as ObjectType).properties = [
				{ name: "title", type: { _kind: "string" } },
				{ name: "content", type: { _kind: "string" } },
				{
					name: "children",
					type: { _kind: "array", entryType: type }
				}
			];
			return
		});
		this.addType("array", "Array", "array");
		this.database = new Database(this);
		this.setTheme(new Bootstrap(this));

	}

	addType(key: string, label: string, view: string, typeCallback?: (type: Type, addProperty: (property: Property) => void) => void): void {

		var type = { _kind: key, editView: view, printView: view } as Type;

		this.registerType(key, type);
		var properties: Property[] = [
			{ name: "type", type: { _kind: "const", value: type } }
		];
		if (label != null) {
			var variantKind: VariantKind = {
				key: key, label: label, type: {
					_kind: "object",
					properties: properties
				}
			}
			this.variantKinds.push(variantKind);
		}

		if (typeCallback) typeCallback(type, (property) => {
			properties.push(property)
		});
	}

	nextId(prefix: string) {
		var counter = this.idCounter[prefix] = (this.idCounter[prefix] || 0) + 1;
		var result = prefix + counter;
		if (result == "div2111") {
			debugger;
		}
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
				case "table":
					var fieldDefinition: ObjectType = {
						_kind: "object",
						properties: [
							{ name: "group", type: { _kind: "string", description: "Each group is displayed on its own tab." } },
							{ name: "name", type: { _kind: "string" } },
							{
								name: "type", type: {
									_kind: "variant",
									kinds: this.variantKinds
								}
							}
						]
					};

					var fieldsDefinition: ArrayType<any> = {
						_kind: "array",
						entryType: fieldDefinition
					};

					var tableDefinition: ObjectType = {
						properties: [
							{ name: "_kind", type: { _kind: "const", value: "object" } },
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
		$('head').append(themeoutput.toString());
	}
}

