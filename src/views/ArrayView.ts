import { AnyView, View, ViewParent } from '../View';
import { Output } from "../Output";
import { Type, ArrayType, SelectEntry, VariantObject, ObjectType, Visibility } from "../Types";
import { ArrayPrintArgs, PrintArgs, ElementAttributes, ArrayEntryPrintArgs } from "../Theme";
import { Parser } from "../Parser";
import { Eval } from "../Eval";

export class ArrayEntryView extends View<any, Type, ArrayPrintArgs>
{
	innerView: AnyView;

	constructor(evalContext: Eval, private parentView: ArrayView<any>, private index: number, private active: boolean) {
		super()
		this.initialize(evalContext, parentView, "#" + index);
	}

	build() {
		this.innerView = this.evalContext.instantiate(this, "[" + this.index + ']', this.data, this.type, false, {});
	}

	protected onRender(output: Output): void {
		var template = this.type.template;
		var label: string;
		if (template) {
			//TODO: evaluate expression here...
			var parser = new Parser(this.evalContext);
			this.evalContext.globalVariables = this.data;
			try {
				var expr = parser.parseTemplate(template);
				label = expr.getValue(this.evalContext);
			} catch (error) {
				label = error;
			}
		}
		else {
			label = "#" + (this.getId());
		}


		var printArgs: ArrayEntryPrintArgs = {
			id: this.getId(), deletable: true, label: label, frozenDynamic: false,
			entriesElementId: this.parentView.entriesElementId,
			active: this.active
		};
		//if (kind) printArgs.frozenDynamic = true;
		//var view = this.arrayEntriesOutput.printArrayEntry(this, printArgs, entry, this.entryType);
		output.printArrayEntry(this, printArgs, (output) => {
			this.innerView.render(output);
		});
	}

	getValue() {
		return this.innerView.getValue();
	}
}

export class ArrayView<T> extends View<any, ArrayType<T>, ArrayPrintArgs>
{
	data: any[];
	views: ArrayEntryView[];
	entryType: Type;
	viewById: { [key: string]: ArrayEntryView };
	arrayEntriesOutput: Output;
	entriesElementId: string;
	addButtonEntries: SelectEntry[];

	build(): void {
		if (!Array.isArray(this.data)) {
			this.data = this.data == null ? [] : [this.data];
		}
		this.views = [];
		this.viewById = {};
		this.entryType = this.type.entryType
		this.entriesElementId = this.evalContext.nextId("entries");

		if (this.entryType._kind == "variant") {
			this.addButtonEntries = [];
			for (var entry of this.entryType.kinds) {
				this.addButtonEntries.push({ key: entry.key, label: entry.label || entry.key });
			}
			this.entryType.fixedType = true;
		}
		if (Array.isArray(this.data)) {
			for (var index = 0; index < this.data.length; index++) {
				this.buildOne(index, null, index == 0);
			}
		}
	}


	onRender(output: Output): void {
		output.printSection({ name: "array" }, (printArgs) => {


			output.printAsync("div", { class: "array-entries", id: this.entriesElementId }, "...", (output) => {
				this.arrayEntriesOutput = output;

				for (var index = 0; index < this.data.length; index++) {
					this.renderOne(index, output);
				}

				this.arrayEntriesOutput.domReplace();

				// after dom replace
				var Sortable = (window as any).Sortable;
				var sortable = Sortable.create(output.getOutputElt(), {
					animation: 200,
					handle: ".sort-handle"
				});

			});
			output.printSection({ name: "array-buttons" }, (printArgs) => {
				// we won't use HTML tables because sorting does not work well on table.
				// we don't use the bootstrap pager because sorting is hard with a pager and it look crap on mobile
				if (this.addButtonEntries) {
					output.printButtonGroup({
						buttonText: "Add",
						entries: this.addButtonEntries
					}, (ev, str) => {
						var index = this.buildOne(null, str, true);
						this.renderOne(index, this.arrayEntriesOutput);
						this.arrayEntriesOutput.domAppend();
					});
				} else {
					output.printButton({ buttonText: "+" }, (ev: Event) => {
						var index = this.buildOne(null, null, true);
						this.renderOne(index, this.arrayEntriesOutput);
						this.arrayEntriesOutput.domAppend();
					});
				}
			});
		});

	}

	buildOne(index: number, kind: string, active: boolean): number {
		if (typeof index === "number") {
			var entry = this.data[index];
		} else {
			index = this.data.length;
			entry = this.evalContext.newInstance(this.entryType);
			if (kind && typeof entry == "object") (entry as VariantObject)._kind = kind;
			this.data.push(entry);
		}

		var entry = this.data[index];
		var id = this.evalContext.nextId("entry");

		var template = this.entryType.template;
		var label: string;
		if (template) {
			//TODO: evaluate expression...
			var parser = new Parser(this.evalContext);
			this.evalContext.globalVariables = entry;
			try {
				var expr = parser.parseTemplate(template);
				label = expr.getValue(this.evalContext);
			} catch (error) {
				label = error;
			}
		}
		else {
			label = "#" + (this.views.length + 1);
		}
		var view = new ArrayEntryView(this.evalContext, this, index, active);
		view.beforeBuild(entry, this.entryType, {});
		view.build();
		this.viewById[view.getId()] = view;
		this.views.push(view);

		return index;
	}

	renderOne(index: number, output: Output) {
		var arrayEntry: ArrayEntryView = this.views[index];
		arrayEntry.render(output);
	}

	getValue(): any {
		if (this.arrayEntriesOutput == null) return null;
		var container = this.arrayEntriesOutput.getOutputElt();
		var entryKeys = this.evalContext.theme.getArrayEntriesIndex(container);
		var result = [];
		for (var key of entryKeys) {
			var view = this.viewById[key];
			if (view) {
				var value = view.getValue();
				result.push(this.evalContext.fixValue(value));
			}
		}
		return result;
	}
}

View.registerViewFactory("array", () => new ArrayView<any>());

