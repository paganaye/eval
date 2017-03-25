import { Type, BooleanDefinition, StringDefinition, NumberDefinition, ObjectDefinition, ArrayDefinition, MapDefinition, EnumDefinition, TypeOrString } from './Types';
import { View } from "./View";
import { Command } from "./Command";
import { JSONView } from "./views/JSONView";
import { ObjectView } from './views/ObjectView';
import { ArrayView } from './views/ArrayView';
import { MapView } from './views/MapView';
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
import { Theme, ElementAttributes } from "./Theme";
import { Bootstrap } from "./themes/Bootstrap";
import { SelectView } from "./views/SelectView";
import { DynamicView } from "./views/DynamicView";


export class Eval {
	jsonViewFactory = () => new JSONView(this);
	objectViewFactory = () => new ObjectView(this);
	mapViewFactory = () => new MapView(this);
	arrayViewFactory = () => new ArrayView(this);
	inputViewFactory = () => new InputView(this);
	selectViewFactory = () => new SelectView(this);
	dynamicViewFactory = () => new DynamicView(this);

	private types: { [key: string]: Type } = {};

	viewFactory: { [key: string]: () => View<any, Type, ElementAttributes> } = {};
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
			map: this.mapViewFactory,
			array: this.arrayViewFactory,
			input: this.inputViewFactory,
			select: this.selectViewFactory,
			enum: this.selectViewFactory,
			dynamic: this.dynamicViewFactory
		};

		this.types = {
			boolean: { type: "boolean", view: "json", inputView: "input" },
			string: { type: "string", view: "json", inputView: "input" },
			number: { type: "number", view: "json", inputView: "input" },
			object: { type: "object", view: "object", inputView: "object" }
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
		return prefix + counter;
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

	registerView(name: string, getNew: () => View<any, Type, ElementAttributes>) {
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


	getView(type: Type, editMode: boolean): View<any, Type, ElementAttributes> {
		var viewName = editMode ? type.inputView || type.view || type.type
			: type.view || type.type;
		var view = (editMode ? this.viewFactory[viewName] : null) || this.inputViewFactory;
		return view();
	}

	getViewForExpr(expr: any, type: Type, editMode: boolean, attributes?: ElementAttributes): View<any, Type, ElementAttributes> {
		var typeDef = this.getTypeDef(expr, type)
		if (!attributes) attributes = {};
		var view: View<any, Type, ElementAttributes> = this.getView(typeDef, editMode)
		var actualValue = (expr && expr.getValue)
			? expr.getValue(this)
			: expr;
		if (!attributes) attributes = {};
		var cssAttributes = attributes.cssAttributes || (attributes.cssAttributes = {});
		//cssAttributes.id = view.getId();
		view.beforeBuild(actualValue, typeDef, attributes);
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
				case "client":
					var x: ObjectDefinition = { "displayOrder": ["firstName", "lastName", "address"], "properties": { "address": { "rows": 4, "type": "string" }, "firstName": { "type": "string" }, "lastName": { "type": "string" } }, "type": "object" };
					// type = {
					// 	type: "object",
					// 	properties: {
					// 		firstName: { type: "string" },
					// 		lastName: { type: "string" },
					// 		address: { type: "string", rows: 4 }
					// 	},
					// 	displayOrder: ["firstName", "lastName", "address"]
					// };
					break;
				case "table":
					type = {
						type: "object",
						properties: {
							properties: {
								type: "map",
								key: { type: "string", regexp: "[a-zA-Z][a-zA-Z0-9]*" },
								entryType: {
									type: "object", properties: {
										type: { type: "string", regexp: "[a-zA-Z][a-zA-Z0-9]*" }
									}
								}
							}
						}
					};
					break;
			}
			if (!type) {
				type = {
					type: "object",
					properties: {
						id: { type: "string" }
					}
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
		var themeoutput = new Output(this, null);
		themeoutput.printHTML(themeStart);
		this.theme.initialize(themeoutput);
		themeoutput.printHTML(themeEnd);
		$('head').append(themeoutput.toString());
	}
}