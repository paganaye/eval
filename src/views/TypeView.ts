import { VariableBag } from '../Eval';
import { Output, RenderMode } from '../Output';
import { ElementAttributes, PrintArgs } from '../Theme';
import { ObjectType, Type, Visibility } from '../Types';
import { View } from '../View';
import { ObjectView } from '../views/ObjectView';
import { Parser } from "../Parser";


export class TypeView extends ObjectView {
	printArgs: PrintArgs;

	build(): void {
		var structName = this.type.pageName;
		this.evalContext.database.on("eval/type/" + structName, (data, error) => {
			debugger;
			if (data) {
				this.type = data;
				super.build();
			}
			if (this.customOutput) {
				this.renderView();
			}
		});
	}

	onRender(output: Output): void {
		output.printAsync("div", {}, "...5", (output) => {
			this.customOutput = output;
			this.renderView();
		});
	}
	customOutput: Output;

	renderView() {
		debugger;
		if (this.customOutput.getRenderMode() == RenderMode.Edit) {
			if (this.type.properties) {
				super.onRender(this.customOutput)
				this.customOutput.domReplace();
			}
		} else {
			var data = this.data || {};
			var template = this.type.template;
			var printText: (o: Output) => void;
			if (template) {
				//TODO: evaluate expression here...
				var parser = new Parser(this.evalContext);
				this.evalContext.globalVariables = this;
				try {
					var expr = parser.parseTemplate(this.customOutput, template);
					printText = expr.print;
				} catch (error) {
					printText = (o) => o.printText(error);
				}
			}
			else {
				printText = (o) => o.printText(JSON.stringify(data));
			}
			printText(this.customOutput);
			this.customOutput.domReplace();
		}
	}

	getValue(): any {
		return super.getValue();
	}
}

