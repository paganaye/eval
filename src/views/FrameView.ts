import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type, ObjectType, Visibility } from "../Types";
import { PrintArgs, ElementAttributes } from "../Theme";
import { ObjectView } from "../views/ObjectView";


export class FrameView extends View<Object, ObjectType, PrintArgs> {
	printArgs: PrintArgs;
	pageName: string;
	frameView: AnyView;
	frameType: Type;
	customOutput: Output;


	build(): void {
		this.pageName = this.type.pageName;
		this.type.visibility = Visibility.TitleInBox;
		this.evalContext.database.on("eval/page/" + this.pageName, (data, error) => {
			if (data) {
				this.frameType = data;
				this.frameView = this.evalContext.instantiate(this, "[::frame]", {}, this.frameType, true);
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
			this.customOutput.printButton({ buttonText: "Add " + this.pageName }, (ev) => {
				var data = this.frameView.getValue();
				this.evalContext.database.pushData(this.pageName, data);

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



