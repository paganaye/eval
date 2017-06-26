import { View, AnyView } from "../View";
import { Eval, VariableBag } from '../Eval';
import { Output, RenderMode } from '../Output';
import { Parser } from '../Parser';
import { PrintArgs } from '../Theme';
import { ObjectType, Property, Type, Visibility } from '../Types';

var $: any = (window as any).$;

export class ObjectView extends View<Object, ObjectType, PrintArgs> {
	allKeys: string[];
	typedKeys: string[];
	properties: Property[];
	views: { [key: string]: AnyView } = {};
	propertyByName: { [key: string]: Property } = {};
	tabByName: { [key: string]: Property[] };
	tabNames: string[];
	tabIds: { text: string, id: string }[];
	mainProperties: Property[];
	previewOutput: Output;

	build(): void {
		this.properties = (this.type.properties) || [];
		this.allKeys = [];
		this.typedKeys = [];
		this.tabByName = {};
		this.tabNames = [];
		this.propertyByName = {};
		this.mainProperties = [];
		this.tabIds = [];

		for (var p of this.properties) {
			this.addProperty(p);
		}
		if (!this.data) this.data = {};

		if (typeof this.data !== "object") {
			this.data = { value: this.data };
		}
		for (var key in this.data) {
			if (key === "_kind") continue;
			if (this.propertyByName[key] !== undefined) continue;
			var value = this.data[key];
			if (typeof value === "string" && value.length == 0) continue;
			if (typeof value === "object" && Object.keys(value).length == 0) continue;
			this.addProperty({ name: key, type: { _kind: "string" }, tab: "orphans", visibility: "visible" });
		}
	}

	private addProperty(p: Property) {
		this.propertyByName[p.name] = p;
		this.allKeys.push(p.name);
		this.typedKeys.push(p.name);
		if (p.tab) {
			var tab = this.tabByName[p.tab];
			if (!tab) {
				tab = [];
				this.tabByName[p.tab] = tab;
				this.tabNames.push(p.tab);
			}
			tab.push(p);
		} else {
			this.mainProperties.push(p);
		}
	}

	hasProperties(): boolean { return true; }

	valueChanged(view: AnyView): void {
		if (this.previewOutput) {
			this.printTemplate(this.previewOutput);
			this.previewOutput.domReplace();
		}
		console.log("valueChanged in object view");
	}


	onRender(output: Output): void {
		switch (output.getRenderMode()) {
			case RenderMode.View:
				if (this.type.template) {
					this.printTemplate(output);
				} else {
					this.printAsForm(output);
				}
				break;
			default:
				this.printAsForm(output);
				break;
		}
	}

	printAsForm(output: Output) {
		output.printSection({ name: "object" }, (output, printArgs) => {
			if (this.mainProperties.length) {
				output.printSection({ name: "object-properties" }, (printArgs) => {
					for (var property of this.mainProperties) {
						this.printProperty(property, output);
					}
				});
			}
			if (this.tabNames.length) {
				this.tabIds = this.tabNames.map(s => { return { text: s, id: this.evalContext.nextId("tab") }; });

				output.printTabHeaders(this.tabIds);

				output.printTabContent({}, () => {

					var first = true;
					for (var tab0 of this.tabIds) {
						var tab = this.tabByName[tab0.text];
						output.printTabPage({
							id: tab0.id,
							active: first,
							title: tab0.text,
							modal: tab0.text == "tabs"
							//orphans: (tab0.text == "orphans")
						}, (output) => {
							for (var property of tab) {
								this.printProperty(property, output);
							}
						});
						if (first) first = false;
					}
				});
			}
			/*
			*/
		});
	}

	printTemplate(output: Output) {
		try {
			var html = this.getTemplateResult();
			output.printHTML(html);
		} catch (error) {
			output.printTag("div", { class: "error" }, error);
		}
	}

	getTemplateResult(): string {
		var html: string;
		var parser = new Parser(this.evalContext);
		var template = this.type ? this.type.template : "";
		var tree = parser.parseTemplate(template);
		this.data = this.getValue();
		this.evalContext.globalVariables = this;
		return tree.getValue(this.evalContext) as string;
	}

	printProperty(property: Property, output: Output) {
		//var value = this.data[key];
		//var vtype = this.typeByName[key] || {} as Type;
		if (property.visibility != "hidden") {
			var value = this.data[property.name];
			this.views[property.name] = output.printProperty(this,
				{
					label: property.label || property.name,
					visibility: property.visibility,
					description: property.description
				}, value, property.type);
		}
	}

	getValue(): any {
		var result = {};
		for (var key of this.allKeys) {
			// and we overwrite with whatever was edited.
			var view = this.views[key];
			if (view) {
				value = view.getValue();
			} else value = this.data[key];
			var value = this.evalContext.fixValue(value);
			if (value != null) result[key] = value;
		}
		return result;
	}

	getChildView(childName: string) {
		return this.views[childName];
	}

	showDialog(tab: string) {
		var tabEntry = this.tabIds.filter(e => e.text == tab);
		if (tabEntry.length > 0) {
			$('#' + tabEntry[0].id).modal('show')
		}
		else {
			super.showDialog(tab);
		}
	}

	toString(): string {
		return this.getTemplateResult();
	}


}
View.registerViewFactory("object", () => new ObjectView());
