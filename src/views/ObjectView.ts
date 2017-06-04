import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type, ObjectType, Property, Visibility } from "../Types";
import { PrintArgs } from "../Theme";
import { Parser } from "../Parser";
import { Eval } from "../Eval";

export class ObjectView extends View<Object, ObjectType, PrintArgs> {
	allKeys: string[];
	typedKeys: string[];
	properties: Property[];
	views: { [key: string]: AnyView } = {};
	propertyByName: { [key: string]: Property } = {};
	tabByName: { [key: string]: Property[] };
	tabNames: string[];
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
			this.addProperty({ name: key, type: { _kind: "string" }, group: "orphans", visibility: "visible" });
		}
	}

	private addProperty(p: Property) {
		this.propertyByName[p.name] = p;
		this.allKeys.push(p.name);
		this.typedKeys.push(p.name);
		if (p.group) {
			var group = this.tabByName[p.group];
			if (!group) {
				group = [];
				this.tabByName[p.group] = group;
				this.tabNames.push(p.group);
			}
			group.push(p);
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
		if (this.type.template && !output.isEditMode()) {
			this.printTemplate(output);
		}
		else {
			output.printSection({ name: "object" }, (output, printArgs) => {
				if (this.mainProperties.length) {
					output.printSection({ name: "object-properties" }, (printArgs) => {
						for (var property of this.mainProperties) {
							this.printProperty(property, output);
						}
					});
				}
				if (this.tabNames.length) {
					var groups: { text: string, id: string }[];
					groups = this.tabNames.map(s => { return { text: s, id: this.evalContext.nextId("group") }; });

					output.printTabHeaders(groups);

					output.printTabContent({}, () => {

						var first = true;
						for (var tab0 of groups) {
							var group = this.tabByName[tab0.text];
							output.printTabPage({
								id: tab0.id,
								active: first, title: tab0.text
								//orphans: (tab0.text == "orphans")
							}, (output) => {
								for (var property of group) {
									this.printProperty(property, output);
								}
							});
							if (first) first = false;
						}
					});
				}
				/*
								output.printAsync("div", {}, "Preview...",
									(output) => {
										this.previewOutput = output;
										this.printTemplate(output);
										output.domReplace();
									});
				*/
			});
		}
	}

	printTemplate(output: Output) {
		var html: string;
		var parser = new Parser(this.evalContext);
		try {
			var expr = parser.parseTemplate(this.type.template);
			this.data = this.getValue();
			this.evalContext.globalVariables = this.data;
			html = expr.getValue(this.evalContext);
			output.printHTML(html);
		} catch (error) {
			output.printTag("div", { class: "error" }, error);
		}
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

}
View.registerViewFactory("object", () => new ObjectView());
