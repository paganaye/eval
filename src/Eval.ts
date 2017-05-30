import { stepsType } from './Action';
import { Command } from './Command';
import { Database } from './Database';
import { EvalFunction } from './EvalFunction';
import { Expression } from './Expression';
import { PrintArgs, Theme } from './Theme';
import {
   arrayOfEnum,
   arrayOfValidationRegexp,
   ArrayType,
   ObjectType,
   propertiesType,
   Property,
   SelectEntry,
   SelectType,
   Type,
   types,
   VariantKind,
   variantKinds,
   VariantType,
   variantType
} from './Types';
import { AnyView, View, ViewFactory, ViewParent } from './View';
import { JSONView } from './views/JSONView';


export class Eval {
	globalVariables: { [key: string]: any } = {};
	userName: string = "guest";
	userId: string = null;
	defaultViewFactory: ViewFactory = new ViewFactory("default", () => new JSONView());




	database: Database;
	theme: Theme;
	private idCounter: { [key: string]: number } = {};


	constructor() {



		this.database = new Database(this);

		this.setTheme(new Theme(this));

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

	getTypeDef(data: any, type: Type | string): Type {
		if (typeof type == "string") type = types[type];
		if (!type) type = types[typeof data] || types['object'];
		if (!type.printView) {
			// inherits from base type
			var baseType = types[type._kind];
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
		var viewFactory = View.getViewFactory(viewName) || this.defaultViewFactory;
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
						{ name: "entries", type: arrayOfEnum }
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
						visibility: "hiddenLabel",
						type: {
							_kind: "variant",
							kinds: variantKinds,
						}
					}]
				};
				tableType = objectDefinition;
				break;
			case "pagetemplate":
				var tableDefinition: ObjectType = {
					_kind: "object",
					properties: [
						{ name: "_kind", type: { _kind: "const", value: "object" }, visibility: "hidden" },
						{ name: "description", type: { _kind: "string" }, tab: "display" },
						{name: "template", type: { _kind: "string" }, tab: "display" },

						{ name: "pageName", type: { _kind: "string" }, tab: "pages",  },
						{ name: "nameValidation", type: arrayOfValidationRegexp, tab: "pages" },
						{ name: "pluralName", type: { _kind: "string" }, tab: "pages" },

						{ name: "properties", type: propertiesType, tab: "properties" },

						{ name: "indexTitle", type: { _kind: "string" }, tab: "index" },
						{ name: "indexDescription", type: { _kind: "string" }, tab: "index" }
					]
				};
				tableType = tableDefinition;
				break;
			case "process":

				var processDefinition: ObjectType = {
					_kind: "object",
					properties: [
						{ name: "description", type: { _kind: "string" } },
						{ name: "onclick", type: stepsType }
					]
				};
				tableType = processDefinition;
				break;
		}

		if (tableType) {
			callback(tableType);
		}
		else {
			this.database.on("eval/pagetemplate/" + typeName, (data, error) => {
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

	openWindow(command: string, parameters: object = {}) {
		var url = '#' + command;
		for (var paramName in parameters) {
			var paramValue = Eval.enquoteIfRequired(parameters[paramName]);
			url += " " + paramName + ":" + paramValue;
		}
		window.open(url, '_blank');
	}


	static enquoteIfRequired(s: string) {

		const regex = /([ "'])/g;
		if (s.match(regex)) {
			return '"' + s.replace(/["]/g, '\\"') + '"';
		}
		return s;
	}

}
