import { TypeDefinition, Type, BooleanDefinition, StringDefinition, NumberDefinition, ObjectDefinition, ArrayDefinition, MapDefinition, EnumDefinition } from './Types';
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
import { Theme } from "./Theme";
import { Bootstrap } from "./themes/Bootstrap";
import { SelectView } from "./views/SelectView";


export class Eval {
	jsonViewFactory = (id: string) => new JSONView(this, id);
	objectViewFactory = (id: string) => new ObjectView(this, id);
	mapViewFactory = (id: string) => new MapView(this, id);
	arrayViewFactory = (id: string) => new ArrayView(this, id);
	inputViewFactory = (id: string) => new InputView(this, id);
	selectViewFactory = (id: string) => new SelectView(this, id);

	idCounter: number = 0;

	types: { [key: string]: TypeDefinition } = {};
	viewFactory: { [key: string]: (id: string) => View<any> } = {};
	commands: { [key: string]: (Eval) => Command } = {};
	functions: { [key: string]: (Eval) => EvalFunction<any> } = {};
	variables: { [key: string]: any } = {};


	database: Database;
	theme: Theme;

	constructor() {

		this.viewFactory = {
			json: this.jsonViewFactory,
			object: this.objectViewFactory,
			map: this.mapViewFactory,
			array: this.arrayViewFactory,
			input: this.inputViewFactory,
			select: this.selectViewFactory,
			enum: this.selectViewFactory
		};

		this.types = {
			boolean: { type: "boolean", view: "json" },
			string: { type: "string", view: "json" },
			number: { type: "number", view: "json" }
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

	nextId(): string {
		return "elt" + this.idCounter++;
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

	registerView(name: string, getNew: (id: string) => View<any>) {
		this.viewFactory[name] = getNew;
	}

	registerFunctions(name: string, getNew: (parent: Expression<any>) => EvalFunction<any>) {
		this.functions[name] = getNew;
	}

	registerType<T>(name: string, typeDefinition: TypeDefinition) {
		this.types[name] = typeDefinition;
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

	getTypeDef(data: any, type: Type): TypeDefinition {
		if (typeof type == "string") type = this.types[type];
		if (!type) type = this.types[typeof data] || { type: "object" };
		return type;
	}


	getView(type: TypeDefinition, id: string, editMode: boolean): View<any> {
		var viewName = type.view || type.type;
		var view = (editMode ? this.viewFactory[viewName] : null) || this.inputViewFactory;
		return view(id);
	}

	getViewForExpr(expr: any, type: Type, editMode: boolean, attributes?: { [key: string]: string }): View<any> {
		var typeDef = this.getTypeDef(expr, type)
		if (!attributes) attributes = {};
		var id = attributes.id;
		if (!id) {
			id = this.nextId();
			attributes.id = id;
		}
		var view: View<any> = this.getView(typeDef, id, editMode)
		var actualValue = (expr && expr.getValue)
			? expr.getValue(this)
			: expr;
		if (!attributes) attributes = {};
		attributes.id = view.getId();
		view.build(actualValue, typeDef, attributes);
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