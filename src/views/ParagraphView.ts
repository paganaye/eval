import { View } from "../View";
import { Output } from "../Output";
import { Type, NumberType } from "../Types";
import { PrintArgs } from "../Theme";
import { Eval } from "../Eval";


export interface IParagraph {
	title: string;
	text: string;
	children: IParagraph[];
}

export class ParagraphView extends View<IParagraph, Type, PrintArgs> {

	build(): void {
		if (typeof this.data != "object") {
			this.data = { text: this.data } as any;
		}

		if (typeof this.data.title === "undefined") {
			this.data.title = "Paragraph title";
		}
		if (typeof this.data.text === "undefined") {
			this.data.text = "The content of the paragraph. It can be as short or as long as you wish."
		}
	}

	onRender(output: Output): void {
		this.renderParagraph(output, this.data, 1, "");
	}

	renderParagraph(output: Output, p: IParagraph, level: number, prefix: string) {
		if (!p) return;
		if (p.title) output.printTag("h" + level, {}, (prefix ? prefix + " - " : "") + p.title);
		if (p.text) output.printTag("p", {}, p.text);
		if (prefix) prefix += ".";
		if (p.children) {
			for (var i = 0; i < p.children.length; i++) {
				this.renderParagraph(output, p.children[i], level + 1, prefix + (i + 1));
			}
		}
	}

	getValue(): any {
		return this.data;
	}
}
View.registerViewFactory("paragraph", () => new ParagraphView());
