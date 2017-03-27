import { Type, BooleanType, StringType, NumberType, ObjectDefinition, ArrayType, EnumType, TypeOrString, DynamicType } from './Types';
import { View, AnyView } from "./View";
import { Command } from "./Command";
import { JSONView } from "./views/JSONView";
import { ObjectView } from './views/ObjectView';
import { ArrayView } from './views/ArrayView';
import { Print } from "./commands/Print";
import { Hello } from "./commands/Hello";
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
	jsonViewFactory = (parent: AnyView) => new JSONView(this, parent);
	objectViewFactory = (parent: AnyView) => new ObjectView(this, parent);
	arrayViewFactory = (parent: AnyView) => new ArrayView(this, parent);
	inputViewFactory = (parent: AnyView) => new InputView(this, parent);
	selectViewFactory = (parent: AnyView) => new SelectView(this, parent);
	dynamicViewFactory = (parent: AnyView) => new DynamicView(this, parent);

	private types: { [key: string]: Type } = {};

	viewFactory: { [key: string]: (parent: AnyView) => AnyView } = {};
	commands: { [key: string]: (Eval) => Command } = {};
	functions: { [key: string]: (Eval) => EvalFunction<any> } = {};
	variables: { [key: string]: any } = {};


	database: Database;
	theme: Theme;
	private idCounter: { [key: string]: number } = {};

	constructor() {

		this.viewFactory = {
			json: this.jsonViewFactory,
			object: this.objectViewFactory,
			array: this.arrayViewFactory,
			input: this.inputViewFactory,
			select: this.selectViewFactory,
			enum: this.selectViewFactory,
			dynamic: this.dynamicViewFactory
		};

		this.types = {
			boolean: { kind: "boolean", view: "json", inputView: "input" },
			string: { kind: "string", view: "json", inputView: "input" },
			number: { kind: "number", view: "json", inputView: "input" },
			object: { kind: "object", properties: [], view: "object", inputView: "object" }
		}

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

		this.registerFunctions("abs", (parent) => new AbsFunction(parent));
		this.registerFunctions("round", (parent) => new RoundFunction(parent));
		this.registerFunctions("random", (parent) => new RandomFunction(parent));
		this.registerFunctions("now", (parent) => new NowFunction(parent));

		this.database = new Database(this);
		this.setTheme(new Bootstrap(this));
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
		this.viewFactory[name] = getNew;
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

		// if (type.type == "dynamic") {
		// 	type.type = data ? (data.type || "object") : "object";
		// }
		return type;
	}


	getView(type: Type, parent: AnyView, editMode: boolean): AnyView {
		var viewName = editMode ? type.inputView || type.view || type.kind
			: type.view || type.kind;
		var viewFactory = (editMode ? this.viewFactory[viewName] : null) || this.inputViewFactory;
		return viewFactory(parent);
	}

	getViewForExpr(expr: any, type: Type, parent: AnyView, editMode: boolean, options?: ViewOptions): AnyView {
		var typeDef = this.getTypeDef(expr, type)
		if (!options) options = {};
		var view: AnyView = this.getView(typeDef, parent, editMode)
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
					var fieldDefinition: DynamicType = {
						kind: "dynamic",
						entries: [
							//{ key: "String", type: { type: "object", properties: [{ name: "fieldName", type: "string" }] } },
							//{ key: "Number", type: { type: "object", properties: [{ name: "fieldName", type: "string" }] } },
							//{ key: "Boolean", type: { type: "object", properties: [{ name: "fieldName", type: "string" }] } }
							{ key: "String", type: { kind: "object", properties: [{ name: "fieldName", type: { kind: "string" } }] } },
							{ key: "Number", type: { kind: "object", properties: [{ name: "fieldName", type: { kind: "string" } }] } },
							{ key: "Boolean", type: { kind: "object", properties: [{ name: "fieldName", type: { kind: "string" } }] } }
						]
					};

					var fieldsDefinition: ArrayType<any> = {
						kind: "array",
						entryType: fieldDefinition
					};

					var tableDefinition: ObjectDefinition = {
						properties: [
							{ name: "tableName", type: { kind: "string" } },
							{ name: "fields", type: fieldsDefinition }
						],
						kind: "object"
					}
					type = tableDefinition;
					break;
			}
			if (!type) {
				type = {
					kind: "object",
					properties: [
						{ name: "id", type: { kind: "string" } }
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