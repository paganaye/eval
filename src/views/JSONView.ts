import { View } from "../View";
import { Output } from "../Output";
import { Type } from "../Types";
import { PrintArgs } from "../Theme";

export class JSONView extends View<any, any, PrintArgs> {
	data: any;
	text: string;

	build(): void {

		try {
			this.text = JSON.stringify(this.data);
		} catch (e) {
			this.text = e;
		}
	}

	onRender(output: Output): void {
		output.printStartTag("span", {});
		output.printText(this.text);
		output.printEndTag();

	}

	getValue(): any {
		return this.data;
	}
}
