import { View } from "../View";
import { Output } from "../Output";
import { Type, NumberType, ObjectType, SelectEntry } from "../Types";
import { PrintArgs } from "../Theme";
import { Eval } from "../Eval";


export class LinkView extends View<any, ObjectType, PrintArgs> {
	pageName: string = "dog";
	selectedOption: string;

	build(): void {
		this.selectedOption = this.data;
	}


	onRender(output: Output): void {
		//  for simplicity we make the id of the input element identical to the id of the view.
		output.printAsync("div", {}, "...", (output) => {

			var pageName = this.type.pageName;
			if (pageName) {
				this.evalContext.database.on("eval/" + pageName + "/_index/bySize",
					(data, error) => {
						if (data) {
							var entries: SelectEntry[] = [];
							for (var key in data) {
								entries.push({ key: key });
							}
							this.selectedOption = this.evalContext.findEntry(entries, this.data);
							entries.push({ key: "__new__", label: "new " + pageName, group: "More..." });

							output.printSelect(null,
								{ entries: entries, id: this.getId() },
								this.selectedOption, { _kind: "string" }, (a) => {
									if (a === "__new__") {
										//window.open('#create tableName:' + pageName + " for:\"movie 1234\"", '_blank');
										this.evalContext.openWindow("create", { pageName: pageName, for: location.hash });
									}
									else this.selectedOption = a;
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
View.registerViewFactory("link", () => new LinkView());
