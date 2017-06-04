import { View } from '../View';
import { Type, SelectEntry, SelectType } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectPrintArgs, PrintArgs } from "../Theme";

export class SelectView extends View<string, SelectType, SelectPrintArgs> {
	selectedOption: string;
	enumEntries: SelectEntry[];


	build(): void {
		if (typeof this.data !== 'string') this.data = JSON.stringify(this.data);
		this.selectedOption = this.data;
		this.buildEntries();
	}

	buildEntries() {
		var entries = this.type.entries;

		if (Array.isArray(entries)) {
			this.enumEntries = this.type.entries as SelectEntry[];
		} else {
			// this is hot... entries.path
			this.enumEntries = this.getData(entries.path.split("/"), "object[]") as SelectEntry[];
		}

		if (!Array.isArray(this.enumEntries)) this.enumEntries = [];
	}


	onFocus(elt: HTMLSelectElement) {
		this.buildEntries();
		var output = new Output(this.evalContext, elt);
		output.printSelectOptions(this.enumEntries, this.selectedOption);
		output.domReplace();
	}

	onRender(output: Output): void {

		this.selectedOption = this.evalContext.findEntry(this.enumEntries, this.data);

		if (output.isEditMode()) {
			output.printSelect(this,
				{ entries: this.enumEntries, id: this.getId() },
				this.selectedOption, this.type, (a) => {
					this.selectedOption = a;
				});
		} else {
			output.printInput(
				{ id: this.getId() },
				this.selectedOption, this.type, () => { });

		}
	}

	getValue(): any {
		return this.selectedOption;
	}
}
View.registerViewFactory("select", () => new SelectView());

