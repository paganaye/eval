import { ArrayView } from './ArrayView';
import { AnyView, View, ViewParent } from '../View';
import { Output, RenderMode } from "../Output";
import { Type, ArrayType, SelectEntry, VariantObject, ObjectType, Visibility } from "../Types";
import { Parser } from "../Parser";
import { Eval } from "../Eval";

interface Column {
	name: string;
	type?: Type;
	label?: string;
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
			var row = this.data[index];
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
		output.printHTML('<thead><tr>');
		for (var column of this.columns) {
			output.printTag('th', {}, column.name);
		}
		output.printHTML('</tr></thead>');

		output.printAsync('tbody', { id: "table" }, "", (output) => {
			printContent(output);
		});
		output.printHTML('</tbody>');
		output.printEndTag();
	}

	renderRow(index: number, output: Output) {
		output.printStartTag("tr", { class: 'table-row' });
		var row = this.data[index];
		var firstColumn = this.columns[0];
		var lastColumn = this.columns[this.columns.length - 1];
		for (var key of this.columns) {
			output.printStartTag(key == firstColumn ? 'th' : 'td', { class: 'table-handle' });
			if (key == firstColumn) {
				output.printTag('span', { class: "handle" }, "☰");
				var text = row[key.name] || "blank";
				output.printButton({ buttonText: text, viewAsLink: true }, () => {
					var modalId = this.evalContext.nextId("modal");
					output.printModal({ id: modalId, title: "#" + (index + 1), buttons: ["Close"] }, (output) => {
						var innerView = this.evalContext.instantiate(this, "[" + index + ']', this.data[index], this.type.entryType, RenderMode.View, {});
						innerView.render(output);
					}, b => {
						output.closeModal(modalId);
					});
					//output.domReplace();
					output.showModal(modalId);
				});
			}
			else {
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
			var innerView: AnyView;

			output.printModal({ id: modalId, title: "#newEntry", buttons: ["Add", "Cancel"] }, (output) => {
				newInstance = this.evalContext.newInstance(this.entryType);
				innerView = this.evalContext.instantiate(this, "new entry", newInstance, this.type.entryType, RenderMode.View, {});
				innerView.render(output);
			}, b => {
				switch (b.buttonText) {
					case "Add":
						console.log("adding...");
						//var index = this.buildOne(null, null, true);
						newInstance = innerView.getValue();
						var index = this.data.length;
						this.data.push(newInstance);
						this.addView(index, true);
						this.renderRow(index, this.arrayEntriesOutput);
						this.arrayEntriesOutput.domAppend(this.getTemporaryParentTag());
						output.closeModal(modalId);
						break;
					case "Cancel":
						alert(b.buttonText);
						output.closeModal(modalId);
						break;
				}
			});

			// output.printButton({ buttonText: row[key.name], viewAsLink: true }, () => {
			output.showModal(modalId);


			// 	//						...modal
			// 	// 					$('#' + modalId).modal('show')
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

	makeSortable(tbody: HTMLElement) {
		var Sortable = (window as any).Sortable;
		var sortable = Sortable.create(tbody, {
			animation: 200,
			draggable: '.table-row',
			handle: ".table-handle"
		});

	}
}

View.registerViewFactory("table", () => new TableView<any>());

