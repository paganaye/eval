import { Type, BooleanType, StringType, NumberType, ObjectDefinition, ArrayType, EnumType, TypeOrString, DynamicType, DynamicKind } from './Types';
import { View, AnyView, ViewFactory } from "./View";
import { Command } from "./Command";
import { JSONView } from "./views/JSONView";
import { ObjectView } from './views/ObjectView';
import { ArrayView } from './views/ArrayView';
import { Print } from "./commands/Print";
import { Hello } from "./commands/Hello";
import { Tests } from "./commands/Tests";
import { Assign } from "./commands/Assign";
import { EvalFunction } from "./EvalFunction";
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
import { DynamicView } from "./views/DynamicView";


export class Eval {
	jsonViewFactory = new ViewFactory("json", (parent: AnyView) => new JSONView(this, parent));
	objectViewFactory = new ViewFactory("object", (parent: AnyView) => new ObjectView(this, parent));
	arrayViewFactory = new ViewFactory("array", (parent: AnyView) => new ArrayView(this, parent));
	inputViewFactory = new ViewFactory("input", (parent: AnyView) => new InputView(this, parent));
	selectViewFactory = new ViewFactory("select", (parent: AnyView) => new SelectView(this, parent));
	dynamicViewFactory = new ViewFactory("dynamic", (parent: AnyView) => new DynamicView(this, parent));

	private types: { [key: string]: Type } = {};

	viewFactories: { [key: string]: ViewFactory } = {};
	commands: { [key: string]: (evalContext: Eval) => Command } = {};
	functions: { [key: string]: (parent: Expression<any>) => EvalFunction<any> } = {};
	variables: { [key: string]: any } = {};
	dynamicKinds: DynamicKind[];


	database: Database;
	theme: Theme;
	private idCounter: { [key: string]: number } = {};

	constructor() {

		this.viewFactories = {
			json: this.jsonViewFactory,
			object: this.objectViewFactory,
			array: this.arrayViewFactory,
			input: this.inputViewFactory,
			select: this.selectViewFactory,
			dynamic: this.dynamicViewFactory
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

		this.dynamicKinds = [];

		this.types = {
			object: { _kind: "object", properties: [], printView: "object", editView: "object" },
		}

		this.addWellKnownType("boolean", "Boolean", "input", "checkbox");
		this.addWellKnownType("string", "String", "input", "text");
		this.addWellKnownType("number", "Number", "input");
		this.addWellKnownType("color", "Color", "input");
		this.addWellKnownType("datetime", "Date and time", "input");
		this.addWellKnownType("date", "Date", "input");
		this.addWellKnownType("time", "Time", "input");
		this.addWellKnownType("month", "Month and Year", "input");
		this.addWellKnownType("week", "Week", "input");
		this.addWellKnownType("password", "Password", "input");
		this.addWellKnownType("range", "Range", "input");
		this.addWellKnownType("tel", "Telephone number", "input");
		this.addWellKnownType("url", "URL", "input");


		this.database = new Database(this);
		this.setTheme(new Bootstrap(this));


	}

	addWellKnownType(key: string, label: string, editView: string, htmlType?: string, printView?: string): void {

		var type = { _kind: key, editView: editView, printView: printView || editView } as Type;
		this.registerType(key, type);

		var dynamicKind: DynamicKind = {
			key: key, label: label, type: {
				_kind: "object", properties: [
					{ name: "type", type: { _kind: "const", value: { _kind: key, htmlType: htmlType || key } } }]
			}
		}
		this.dynamicKinds.push(dynamicKind);
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
			if (baseType!=type){
				for (var prop in baseType) {
					if (!type.hasOwnProperty(prop)) type[prop] = baseType[prop];
				}
			}
		}
		return type;
	}



	instantiateNewViewForExpr(expr: any, type: Type, parent: AnyView, editMode: boolean, options?: ViewOptions): AnyView {
		var typeDef = this.getTypeDef(expr, type)
		if (!options) options = {};

		var viewName = (editMode ? type.editView : type.printView) || type._kind;
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
				case "table":
					var fieldDefinition: ObjectDefinition = {
						_kind: "object", properties: [
							{ name: "name", type: { _kind: "string" } },
							{
								name: "type", type: {
									_kind: "dynamic",
									kinds: this.dynamicKinds
								}
							}
						]
					};

					var fieldsDefinition: ArrayType<any> = {
						_kind: "array",
						entryType: fieldDefinition
					};

					var tableDefinition: ObjectDefinition = {
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

