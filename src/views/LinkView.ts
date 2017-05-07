import { View } from "../View";
import { Output } from "../Output";
import { Type, NumberType, ObjectType, SelectEntry } from "../Types";
import { PrintArgs } from "../Theme";


export class LinkView extends View<any, ObjectType, PrintArgs> {
	pageName: string = "dog";
	selectedOption: string;

	build(): void {
		this.selectedOption = this.data;
	}


	onRender(output: Output): void {
		//  for simplicity we make the id of the input element identical to the id of the view.
		output.printAsync("div", {}, "...", (elt, output) => {
			var pageName = this.type.pageName;
			if (pageName) {
				this.evalContext.database.on("eval/" + pageName + "/_index",
					(data, error) => {
						if (data) {
							var entries: SelectEntry[] = [];
							for (var key in data) {
								entries.push({ key: key });
							}
							this.selectedOption = this.evalContext.findEntry(entries, this.data);

							output.printSelect(
								{ entries: entries, id: this.getId() },
								this.selectedOption, { _kind: "string" }, (a) => {
									this.selectedOption = a;
								});
						}
						output.domReplace();
					});
			} else {
				output.printTag("p", {}, "Link pageName is not set.")
				output.domReplace();
			}
		});
	}

	getValue(): string {
		return this.selectedOption;
	}
}
