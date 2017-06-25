import { Eval } from '../Eval';
import { Output, RenderMode } from '../Output';
import { Parser } from '../Parser';
import { ArrayEntryPrintArgs, ArrayPrintArgs } from '../Theme';
import { ArrayType, ObjectType, SelectEntry, Type, VariantObject, Visibility } from '../Types';
import { AnyView, View, ViewParent } from '../View';
import { ArrayView } from "./ArrayView";

interface Column {
	name: string;
	type?: Type;
	label?: string;
}

export class TableRowView extends View<any, Type, ArrayPrintArgs>
{
	innerView: AnyView;

	constructor(evalContext: Eval, private parentView: TableView<any>, private index: number, private active: boolean) {
		super()
		this.initialize(evalContext, parentView, "#" + index);
	}

	build() {
		this.innerView = this.evalContext.instantiate(this, "[" + this.index + ']', this.data, this.type, RenderMode.View, {});
	}

	protected onRender(output: Output): void {
		output.printStartTag("tr", { class: "table-row", id: this.getId() });
		var row = this.data || {};
		var columns = this.parentView.columns;
		var firstColumn = columns[0];
		var lastColumn = columns[columns.length - 1];
		for (var key of columns) {
			if (key == firstColumn) {
				output.printStartTag("th", { class: "table-handle" });
				output.printTag("span", { class: "handle" }, "☰");
				var text = row[key.name] || "blank";
				output.printButton({ buttonText: text, viewAsLink: true }, () => {
					var modalId = this.evalContext.nextId("modal");
					var modalView: AnyView;
					output.printModal({ id: modalId, title: "#" + (this.index + 1), buttons: ["Close"] }, (output) => {
						modalView = this.evalContext.instantiate(this, "[" + this.index + "]", this.data, this.type, RenderMode.View, {});
						modalView.render(output);
					}, b => {
						this.data = modalView.getValue();
						//alert(JSON.stringify());
						this.parentView.valueChanged(this);
						var elt = document.getElementById(this.getId());
						if (elt != null) {
							var output2 = this.evalContext.theme.createOutput(elt, output);
							this.render(output2);
							output2.domReplace();
						}
						output.closeModal(modalId);
					});
					output.showModal(modalId);
				});
			}
			else {
				output.printStartTag("td", {});
				var text = row[key.name] || "";
				output.printText(text);
			}
			if (key == lastColumn) {
				output.printButton({ buttonText: "×", class: "close" }, (ev: Event) => {
					var elt = (ev.target as HTMLElement).parentElement;
					if (elt) elt.parentElement.remove();
				});
			}
			output.printEndTag();
		}
		output.printEndTag();
	}

	getValue() {
		return this.innerView.getValue();
	}

}


export class TableView<T> extends ArrayView<any>
{
	columns: Column[];
	columnsByName: { [key: string]: Column };

	build(): void {
		super.build();
	}


	onRender(output: Output): void {
		super.onRender(output);

	}

	renderBody(output: Output, printContent: (output: Output) => void) {
		this.columns = [];
		this.columnsByName = {};
		var entryType = this.type.entryType || { _kind: "string" };
		if (entryType._kind == "object") {
			for (var index = 0; index < entryType.properties.length; index++) {
				var property = entryType.properties[index];
				var key = property.name;
				if (this.columnsByName[key]) continue;
				if (property.visibility == "hidden") continue;
				var column: Column = { name: key, type: property.type, label: property.label };
				this.columnsByName[key] = column;
				this.columns.push(column);
			}
		}

		for (var index = 0; index < this.data.length; index++) {
			var row = this.data[index] || {};
			var keys = Object.keys(row);
			for (var key of keys) {
				if (this.columnsByName[key]) continue;
				var column: Column = { name: key };
				this.columnsByName[key] = column;
				this.columns.push(column);
			}
		}
		if (this.columns.length == 0) {
			var column: Column = { name: "text" };
			this.columnsByName["text"] = column;
			this.columns.push(column);
		}
		output.printStartTag("table", { border: "1", class: "table-entries table", id: this.entriesElementId });
		output.printHTML("<thead><tr>");
		for (var column of this.columns) {
			output.printTag("th", {}, column.name);
		}
		output.printHTML("</tr></thead>");

		output.printAsync("tbody", { id: "table" }, "", (output) => {
			printContent(output);
		});
		output.printHTML("</tbody>");
		output.printEndTag();
	}

	createView(index: number, active: boolean): AnyView {
		var data = this.data[index];
		var view = new TableRowView(this.evalContext, this, index, active);
		view.beforeBuild(data, this.entryType, {});
		view.build();
		return view;
	}

	// this is use for appending rows fast
	getTemporaryParentTag(): string {
		return "tbody";
	}

	printBottomButtons(output: Output) {
		// that is the buttons of the table

		output.printButton({ buttonText: "+" }, (ev: Event) => {

			//output.domReplace();
			var modalId = this.evalContext.nextId("modal");
			var newInstance: any;
			var modalView: AnyView;

			output.printModal({ id: modalId, title: "#newEntry", buttons: ["Add", "Cancel"] }, (output) => {
				newInstance = this.evalContext.newInstance(this.entryType);
				modalView = this.evalContext.instantiate(this, "new entry", newInstance, this.type.entryType, RenderMode.View, {});
				modalView.render(output);
			}, b => {
				switch (b.buttonText) {
					case "Add":
						console.log("adding...");
						//var index = this.buildOne(null, null, true);
						var index = this.data.length;
						this.data[index] = modalView.getValue();
						this.buildOne(index, null, true);
						this.renderOne(index, this.arrayEntriesOutput);
						this.arrayEntriesOutput.domAppend(this.getTemporaryParentTag());
						output.closeModal(modalId);
						break;
					case "Cancel":
						output.closeModal(modalId);
						break;
				}
			});

			// output.printButton({ buttonText: row[key.name], viewAsLink: true }, () => {
			output.showModal(modalId);


			// 	//						...modal
			// 	// 					$("#" + modalId).modal("show")
			// });

			// output.printButton({ buttonText: "×", class: "close" }, (ev: Event) => {
			// 	var elt = (ev.target as HTMLElement).parentElement;
			// 	if (elt) elt.parentElement.remove();
			// });

			// var index = this.buildOne(null, null, true);
			// this.renderRow(index, this.arrayEntriesOutput);
			// this.arrayEntriesOutput.domAppend(this.getTemporaryParentTag());
		});


	}

	valueChanged(childView: TableRowView): any {
		this.data = this.getValue();
	}

	makeSortable(tbody: HTMLElement) {
		var Sortable = (window as any).Sortable;
		var sortable = Sortable.create(tbody, {
			animation: 200,
			draggable: ".table-row",
			handle: ".table-handle"
		});

	}
}

View.registerViewFactory("table", () => new TableView<any>());

