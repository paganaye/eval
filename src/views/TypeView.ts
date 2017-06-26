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
			var text: string;
			if (template) {
				//TODO: evaluate expression here...
				var parser = new Parser(this.evalContext);
				this.evalContext.globalVariables = this;
				try {
					var expr = parser.parseTemplate(this.customOutput, template);
					text = expr.getValue();
				} catch (error) {
					text = error;
				}
			}
			else {
				text = JSON.stringify(data);
			}
			this.customOutput.printHTML(text);
			this.customOutput.domReplace();
		}
	}

	getValue(): any {
		return super.getValue();
	}
}

