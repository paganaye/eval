import { Action, ShowMessageAction } from '../Action';
import { View, AnyView } from "../View";
import { Output, RenderMode } from "../Output";
import { Type, ButtonType } from "../Types";
import { PrintArgs, ButtonPrintArgs } from "../Theme";
import { Parser } from "../Parser";
import { ObjectView } from "../views/ObjectView";
import { FrameView } from "../views/FrameView";
import { Eval } from "../Eval";

export class ButtonView extends View<boolean, ButtonType, ButtonPrintArgs> {
	data: any;
	text: string;
	contentOutput: Output;
	frameView: AnyView;
	stepNo: number;
	steps: Action[];
	running: boolean
	build(): void {
	}

	onRender(output: Output): void {
		var printArgs = { buttonText: this.type.text };
		output.printAsync("div", {}, "...2", (output) => {
			this.contentOutput = output;
			this.renderButton();
			output.domReplace();
		});
	}

	runNextStep() {
		this.stepNo += 1;
		this.running = false;
		var step = this.steps[this.stepNo];
		if (step == null) {
			//this.finished =true;
			return;
		}
		switch (step._kind) {
			case "alert":
				setTimeout(() => {
					alert((step as ShowMessageAction).text);
					this.runNextStep();
				})
				this.contentOutput.printText(step.text);
				break;
			case "showMessage":
				this.contentOutput.printTag("div", {}, step.text);
				this.contentOutput.printButton({ buttonText: "next" },
					(ev) => {
						this.contentOutput.domReplace();
						this.runNextStep();
					});
				this.contentOutput.domReplace();
				break;
			case "addRecord":
				var structName = step.pageName;
				this.evalContext.database.on("eval/type/" + structName, (data, error) => {
					this.renderTypeView(data);
				});
				this.running = true;
				break;
			default:
				throw "unknown command " + (step as any)._kind;
		}
	}

	renderButton() {
		this.contentOutput.printButton({ buttonText: this.type.text },
			(ev) => {
				this.steps = this.type.onclick;
				this.stepNo = -1;
				this.runNextStep();
			});
		this.contentOutput.domReplace();
	}

	renderTypeView(structType: Type) {
		var data = {};
		this.frameView = this.evalContext.instantiate(this, "[type]", {}, structType, RenderMode.Edit);
		this.frameView.render(this.contentOutput);

		this.contentOutput.printButton({ buttonText: "next" },
			(ev) => {
				this.contentOutput.printText("Thank you");
				this.contentOutput.domReplace();
				this.runNextStep();
			});
		this.contentOutput.domReplace();
	}

	getValue(): any {
		return null;
	}
}

View.registerViewFactory("button", () => new ButtonView());
