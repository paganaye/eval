import { ArrayView } from './ArrayView';
import { AnyView, View, ViewParent } from '../View';
import { Output, RenderMode } from "../Output";
import { Type, ArrayType, SelectEntry, VariantObject, ObjectType, Visibility } from "../Types";
import { Parser } from "../Parser";
import { Eval } from "../Eval";

var $: any = (window as any).$;

interface Column {
	name: string;
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

	renderOne(index: number, output: Output) {
		output.printStartTag('tr', { class: 'table-row' });
		var row = this.data[index];
		var first = true;
		for (var key of this.columns) {
			if (first) {
				output.printTag('th', { class: 'table-handle' }, (o) => {
					output.printTag('span', { class: "handle" }, "☰");
					// debugger;

					//				output.printTag("div", {}, view.toString());
					var modalId = this.evalContext.nextId("modal");
					output.printModal({ id: modalId, title: "#" + (index + 1), buttons: ["Close"] }, (output) => {
						var innerView = this.evalContext.instantiate(this, "[" + index + ']', this.data[index], this.type.entryType, RenderMode.View, {});
						innerView.render(output);
						//super.renderOne(index, output);
					});
					//output.domReplace();

					output.printButton({ buttonText: row[key.name], viewAsLink: true }, () => {
						$('#' + modalId).modal('show')
						//						...modal
						// 					$('#' + modalId).modal('show')
					});

					output.printButton({ buttonText: "×", class: "close" }, (ev: Event) => {
						var elt = (ev.target as HTMLElement).parentElement;
						if (elt) elt.parentElement.remove();
					});
				});


				first = false;
			}
			else output.printTag('td', {}, row[key.name]);
		}
		output.printEndTag();
	}

	// this is use for appending rows fast
	getTemporaryParentTag(): string {
		return "tbody";
	}

	printBottomButtons(output: Output) {
		var modalId = this.evalContext.nextId("modal");

		output.printModal({ id: modalId, title: "#newEntry", buttons: ["Create", "Cancel"] }, (output) => {
			var newInstance = this.evalContext.newInstance(this.entryType);
			var innerView = this.evalContext.instantiate(this, "new entry", newInstance, this.type.entryType, RenderMode.View, {});
			innerView.render(output);
			//super.renderOne(index, output);
		});

		output.printButton({ buttonText: "+" }, (ev: Event) => {

			//output.domReplace();

			// output.printButton({ buttonText: row[key.name], viewAsLink: true }, () => {
			$('#' + modalId).modal('show')
			// 	//						...modal
			// 	// 					$('#' + modalId).modal('show')
			// });

			// output.printButton({ buttonText: "×", class: "close" }, (ev: Event) => {
			// 	var elt = (ev.target as HTMLElement).parentElement;
			// 	if (elt) elt.parentElement.remove();
			// });

			// var index = this.buildOne(null, null, true);
			// this.renderOne(index, this.arrayEntriesOutput);
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

