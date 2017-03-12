import { TypeDefinition, Type, BooleanDefinition, StringDefinition, NumberDefinition, ObjectDefinition, ArrayDefinition, MapDefinition } from './Types';
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


export class Eval {
	jsonView: JSONView;
	inputView: InputView;
	objectView: ObjectView;
	mapView: MapView;
	arrayView: ArrayView;
	defaultViews: { [key: string]: View<any> };
	idCounter: number = 0;

	types: { [key: string]: TypeDefinition } = {};
	views: { [key: string]: View<any> } = {};
	commands: { [key: string]: (Eval) => Command } = {};
	functions: { [key: string]: (Eval) => EvalFunction<any> } = {};
	variables: { [key: string]: any } = {};

	booleanType: BooleanDefinition;
	stringType: StringDefinition;
	numberType: NumberDefinition;
	objectType: ObjectDefinition;
	database: Database;
	theme: Theme;

	constructor() {

		this.jsonView = new JSONView(this);
		this.objectView = new ObjectView(this);
		this.mapView = new MapView(this);
		this.arrayView = new ArrayView(this);
		this.inputView = new InputView(this);
		this.defaultViews = { object: this.objectView, map: this.mapView, array: this.arrayView };


		this.registerView("json", () => new JSONView(this));
		this.registerView("object", () => new ObjectView(this));
		this.registerView("input", () => new InputView(this));

		this.registerNativeType(this.booleanType = { type: "boolean", view: "json" });
		this.registerNativeType(this.stringType = { type: "string", view: "json" });
		this.registerNativeType(this.numberType = { type: "number", view: "json" });
		this.registerNativeType(this.objectType = { type: "object", view: "object" });

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

	registerView(name: string, getNew: () => View<any>) {
		this.views[name] = getNew();
	}

	registerFunctions(name: string, getNew: (parent: Expression<any>) => EvalFunction<any>) {
		this.functions[name] = getNew;
	}

	registerNativeType(typeDefinition: TypeDefinition) {
		this.types[typeDefinition.type] = typeDefinition;
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
		if (!type) type = this.types[typeof data] || this.objectType;
		return type;
	}


	getView(type: TypeDefinition, editMode: boolean): View<any> {
		var view = (editMode ? this.views[type.inputView] : null)
			|| this.views[type.view] || this.defaultViews[type.type] || this.inputView;
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