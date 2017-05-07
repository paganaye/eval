import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type, ObjectType, Visibility } from "../Types";
import { PrintArgs, ElementAttributes } from "../Theme";
import { ObjectView } from "../views/ObjectView";


export class FrameView extends View<Object, ObjectType, PrintArgs> {
	printArgs: PrintArgs;
	tableName: string;
	frameView: AnyView;
	frameType: Type;
	customOutput: Output;


	build(): void {
		this.tableName = this.type.tableName;
		this.type.visibility = Visibility.TitleInBox;
		this.evalContext.database.on("tables/table/" + this.tableName, (data, error) => {
			if (data) {
				this.frameType = data;
				this.frameView = this.evalContext.instantiate({}, this.frameType, this, true);
			}
			if (this.customOutput) {
				this.renderView();
			}
		})
	}

	onRender(output: Output): void {
		output.printSection({ name: "frame" }, (printArgs) => {
			output.printAsync("div", {}, "...", (elt, output2) => {
				this.customOutput = output2;
				output2.setEditMode(true);
				this.renderView();
			});
		});
	}

	renderView() {

		if (this.frameView) {
			this.frameView.render(this.customOutput);
			this.customOutput.printButton({ buttonText: "Add " + this.tableName }, (ev) => {
				var data = this.frameView.getValue();
				this.evalContext.database.pushData(this.tableName, data);

				this.customOutput.printTag("div", {}, "Thank you.");
				this.customOutput.domReplace();
			});
			this.customOutput.domReplace();
		}
	}

	getValue(): any {
		return null;
	}
}




