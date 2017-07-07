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
	TableType,
	ObjectType,
	propertiesType,
	tabsType,
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
import { RenderMode } from "./Output";

export interface VariableBag {
	getVariable(name: string): any;
	setVariable(name: string, value: any): void;
	getView(): AnyView;
}

export class Eval {
	variableBag = {}

	globalVariables: VariableBag = {
		getVariable: (name: string) => { return this.variableBag[name]; },
		setVariable: (name: string, value: any): void => { this.variableBag[name] = value; },
		getView() { return null; }
	}

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
		var result = this.globalVariables.getVariable(variableName);
		if (result == null) {

		}
		return result;
	}

	setVariable(variableName: string, value: any): void {
		this.globalVariables.setVariable(variableName, value);
	}

	stringify(expr: Expression<any>, type?: Type): string {
		return JSON.stringify(expr);
	}

	getTypeDef(data: any, _type: Type | string): Type {
		if (typeof _type == "string") _type = types[_type];
		if (!_type) {
			switch (typeof data) {
				case "object":
					_type = Array.isArray(data) ? types['table'] : types['object'];
					break;
				default:
					_type = types[typeof data] || types['object'];
					break;
			}
		}
		if (!_type.printView) {
			// inherits from base type
			var baseType = types[_type._kind] || types["object"];
			if (baseType != _type) {
				for (var prop in baseType) {
					if (!_type.hasOwnProperty(prop)) _type[prop] = baseType[prop];
				}
			}
		}
		return _type;
	}

	instantiate(parent: ViewParent, name: string, expr: any, exprType: Type, renderMode: RenderMode, printArgs?: PrintArgs): AnyView {
		var typeDef = this.getTypeDef(expr, exprType)
		if (!printArgs) printArgs = {};

		var viewName = (renderMode == RenderMode.Edit ? typeDef.editView : typeDef.printView) || typeDef._kind;
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
		var pageType: Type;

		switch (typeName) {

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
				pageType = objectDefinition;
				break;
			case "dog":
				var carType: ObjectType = {
					_kind: "object",
					properties: [
						{ name: "make", type: { _kind: "string" } },
						{ name: "model", type: { _kind: "string" }, tab: "standard" },
						{ name: "year", type: { _kind: "number" }, tab: "standard" },
						{ name: "description", type: { _kind: "textarea" } as any as VariantType, tab: "advanced" },
						{
							name: "secondary", type: {
								_kind: "table",
								entryType: {
									_kind: "object",
									properties: [
										{ name: "p1", type: { _kind: "string" } },
										{
											name: "p2", type: { _kind: "string" },
											visibility: "drilldown"
										},
										{ name: "p3", type: { _kind: "string" }, tab: "tab1" },
										{ name: "p4", type: { _kind: "string" }, tab: "tab2" },
										{ name: "p5", type: { _kind: "string" }, tab: "tab2" }
									],
									template: "{p1} ({p2})"
								}
							},
							visibility: "visible",
							tab: "reallyAdvanced"
						}

					],
					template: "<p>hi {make} {model} {secondary}</p>"
				};
				pageType = carType;
				break;
			case "movie":
				var movieType: ObjectType = {
 					_kind: "object",
 					properties: [
						{ name: "title", type: { _kind: "string" } },
						{ name: "poster", type: { _kind: "image" } },
						{ name: "score", type: { _kind: "number" } },
						{ name: "director", type: { _kind: "string" } },
						{ name: "writer", type: { _kind: "string" } },
						{ name: "stars", type: { _kind: "string" } },
						{ name: "plotSummary", type: { _kind: "string" } },
						{ name: "synopsis", type: { _kind: "string" } },
						{ name: "country", type: { _kind: "array", entryType: { _kind: "link", pageName: "country" } } }
						// { name: "language", type: { _kind: "array", entryType: { _kind: "link", pageName: "language" } } },
						// { name: "genre", type: { _kind: "array", entryType: { kind: "film_genre" } } },
						// {
						// 	name: "box_office", type: {
						// 		_kind: "object", properties: [
						// 			{ name: "budget", type: { _kind: "number" } },
						// 			{
						// 				name: "gross", type: {
						// 					_kind: "array", entryType: {
						// 						_kind: "object", properties: [

						// 						]
						// 					}
						// 				}
						// 			}]
						// 	}

						// }
						]
 				};
				pageType = movieType;
 				break;
			
			case "pagetemplate":
				var singlePage: ObjectType = {
					_kind: "object",
					properties: [
						{ name: "_kind", type: { _kind: "const", value: "pageTemplate" }, visibility: "hidden" },
						{ name: "pluralName", type: { _kind: "string" } },
						{ name: "description", type: { _kind: "string" } },
						{ name: "template", type: { _kind: "string" } },

						{ name: "properties", type: propertiesType, tab: "properties" },
						{ name: "tabs", type: tabsType, tab: "tabs" },
					],
					tabs: [
						{ name: "tabs", label: "Tabs1", viewAs: "dialog" }
					]
				};

				var pageCollection: ObjectType = {
					_kind: "object",
					properties: [
						{ name: "_kind", type: { _kind: "const", value: "pageCollection" }, visibility: "hidden" },
						{ name: "description", type: { _kind: "string" } },
						{ name: "template", type: { _kind: "string" } },

						{ name: "pageName", type: { _kind: "string" } },
						{ name: "nameValidation", type: arrayOfValidationRegexp },
						{ name: "singularName", type: { _kind: "string" } },

						{ name: "properties", type: propertiesType, tab: "properties" },

						{ name: "indexTitle", type: { _kind: "string" } },
						{ name: "indexDescription", type: { _kind: "string" } }
					]
				};
				var redirectionPage: ObjectType = {
					_kind: "object",
					properties: [
						{ name: "_kind", type: { _kind: "const", value: "redirection" }, visibility: "hidden" },
						{ name: "newPage", type: { _kind: "string" } },
						{ name: "message", type: { _kind: "string" } }
					]
				};
				var variantPageTemplate: VariantType = {
					_kind: "variant",
					kinds: [
						{ key: "singleton", label: "Single page", type: singlePage },
						{ key: "collection", label: "Page collection", type: pageCollection },
						{ key: "redirect", label: "Redirection", type: redirectionPage }
					]
				};
				pageType = variantPageTemplate;
				break;
			case "process":

				var processDefinition: ObjectType = {
					_kind: "object",
					properties: [
						{ name: "description", type: { _kind: "string" } },
						{ name: "onclick", type: stepsType }
					]
				};
				pageType = processDefinition;
				break;
		}

		if (pageType) {
			callback(pageType);
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
		if (instanceType == null) return null;

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
			case "table":
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
