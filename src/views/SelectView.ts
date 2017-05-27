import { View } from '../View';
import { Type, SelectEntry, SelectType } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectPrintArgs, PrintArgs } from "../Theme";

export class SelectView extends View<string, SelectType, SelectPrintArgs> {
	selectedOption: string;


	build(): void {
		if (typeof this.data !== 'string') this.data = JSON.stringify(this.data);
		this.selectedOption = this.data;
	}

	onRender(output: Output): void {
		var enumEntries: SelectEntry[] = this.type.entries;

		this.selectedOption = this.evalContext.findEntry(enumEntries, this.data);

		if (output.isEditMode()) {
			output.printSelect(
				{ entries: enumEntries, id: this.getId() },
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

