import { Eval, VariableBag } from '../Eval';
import { Output, RenderMode } from '../Output';
import { Parser } from '../Parser';
import { ArrayEntryPrintArgs, ArrayPrintArgs, ElementAttributes, PrintArgs } from '../Theme';
import { ArrayType, ObjectType, SelectEntry, Type, VariantObject, Visibility } from '../Types';
import { AnyView, View, ViewParent } from '../View';

export class ArrayEntryView extends View<any, Type, ArrayPrintArgs>
{
	innerView: AnyView;

	constructor(evalContext: Eval, private parentView: ArrayView<any>, private index: number, private active: boolean) {
		super()
		this.initialize(evalContext, parentView, "#" + index);
	}

	build() {
		this.innerView = this.evalContext.instantiate(this, "[" + this.index + ']', this.data, this.type, RenderMode.View, {});
	}

	getVariable(name: string): any {
		return this.data[name];
	}
	setVariable(name: string, value: any): void {
		this.data[name] = value;
	}

	protected onRender(output: Output): void {
		var template = this.type.template;
		var printLabel: (output) => void;
		if (template) {
			//TODO: evaluate expression here...
			var parser = new Parser(this.evalContext);
			this.evalContext.globalVariables = this;
			try {
				var expr = parser.parseTemplate(output, template);
				printLabel = expr.print;
			} catch (error) {
				printLabel = (o: Output) => o.printText(error);
			}
		}
		else {
			printLabel = (o: Output) => o.printText("#" + (this.getId()));
		}


		var printArgs: ArrayEntryPrintArgs = {
			id: this.getId(), deletable: true, printLabel: printLabel, frozenDynamic: false,
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
	}


	onRender(output: Output): void {
		output.printSection({ name: "array" }, (printArgs) => {
			if (Array.isArray(this.data)) {
				for (var index = 0; index < this.data.length; index++) {
					this.buildOne(output, index, null, index == 0);
				}
			}


			this.renderBody(output, (output) => {
				this.arrayEntriesOutput = output;
				for (var index = 0; index < this.data.length; index++) {
					this.renderOne(index, output);
				}
				this.arrayEntriesOutput.domReplace();

				// after dom replace
				this.makeSortable(output.getOutputElt());

			});


			if (output.getRenderMode() === RenderMode.Edit) {
				this.printBottomButtons(output);
			}
		});
	}

	printBottomButtons(output: Output) {
		output.printSection({ name: "array-buttons" }, (printArgs) => {
			// we won't use HTML tables because sorting does not work well on table.
			// we don't use the bootstrap pager because sorting is hard with a pager and it look crap on mobile
			if (this.addButtonEntries) {
				output.printButtonGroup({
					buttonText: "Add",
					entries: this.addButtonEntries
				}, (ev, str) => {
					var index = this.buildOne(output, null, str, true);
					this.renderOne(index, this.arrayEntriesOutput);
					this.arrayEntriesOutput.domAppend(this.getTemporaryParentTag());
				});
			} else {
				output.printButton({ buttonText: "+" }, (ev: Event) => {
					var index = this.buildOne(output, null, null, true);
					this.renderOne(index, this.arrayEntriesOutput);
					this.arrayEntriesOutput.domAppend(this.getTemporaryParentTag());
				});
			}
		});
	}

	getTemporaryParentTag(): string {
		return "div";
	}

	renderBody(output: Output, printContent: (output) => void) {
		debugger;
		output.printAsync("div", { class: "array-entries", id: this.entriesElementId }, "...7", printContent);
	}

	makeSortable(elt: HTMLElement) {
		if (elt) {
			var Sortable = (window as any).Sortable;
			var sortable = Sortable.create(elt, {
				animation: 200,
				handle: ".sort-handle"
			});
		}
	}

	buildOne(output: Output, index: number, kind: string, active: boolean): number {
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
		var printLabel: (o: Output) => void;
		if (template) {
			//TODO: evaluate expression...
			var parser = new Parser(this.evalContext);
			this.evalContext.globalVariables = this;
			try {
				var expr = parser.parseTemplate(output, template);
				printLabel = expr.print;
			} catch (error) {
				printLabel = (o) => o.printText(error);
			}
		}
		else {
			printLabel = (o) => o.printText("#" + (this.views.length + 1));
		}
		var view = this.createView(index, active) as ArrayEntryView;
		this.viewById[view.getId()] = view;
		this.views.push(view);

		return index;
	}

	createView(index: number, active: boolean): AnyView {
		var view = new ArrayEntryView(this.evalContext, this, index, active);
		view.beforeBuild(this.data[index], this.entryType, {});
		view.build();
		return view;
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

