import { View } from '../View';
import { Type, SelectEntry, SelectType } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectPrintArgs, PrintArgs } from "../Theme";

export class SelectView extends View<string, SelectType, SelectPrintArgs> {
	selectedOption: string;
	enumEntries: SelectEntry[];


	build(): void {
		this.enumEntries = [];
		if (typeof this.data !== 'string') this.data = JSON.stringify(this.data);
		this.selectedOption = this.data;
		var entries = this.type.entries;

		if (Array.isArray(entries)) {
			this.enumEntries = this.type.entries as SelectEntry[];
		} else {
			// this is hot... entries.path
			debugger;
			this.enumEntries = this.getData(entries.path.split("/"), "object[]") as SelectEntry[];
		}

		if (!Array.isArray(this.enumEntries)) this.enumEntries = [];
	}


	onRender(output: Output): void {

		this.selectedOption = this.evalContext.findEntry(this.enumEntries, this.data);

		if (output.isEditMode()) {
			output.printSelect(
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

