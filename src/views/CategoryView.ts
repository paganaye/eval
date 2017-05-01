import { View } from '../View';
import { Type, EnumEntry, EnumType, CategoryType } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { CategoryPrintArgs, PrintArgs } from "../Theme";

export class CategoryView extends View<string, CategoryType, CategoryPrintArgs> {
	selectedOption: string;


	build(): void {
		if (typeof this.data !== 'string') this.data = JSON.stringify(this.data);
	}

	onRender(output: Output): void {
		output.printAsync("div", {}, "...", (elt, output) => {
			this.evalContext.database.on("tables/category/" + (this.type as CategoryType).categoryName,
				(data, error) => {
					if (data && data.entries) {
						this.selectedOption = this.evalContext.findEntry(data.entries, this.data);
						output.printSelect(
							{ entries: data.entries, id: this.getId() },
							this.data, this.type, (a) => {
								this.selectedOption = a;
							});
					}
					output.domReplace();
				});
		});
	}

	getValue(): any {
		return this.selectedOption;
	}
}
