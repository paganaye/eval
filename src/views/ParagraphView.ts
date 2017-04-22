import { View } from "../View";
import { Output } from "../Output";
import { Type, NumberType } from "../Types";
import { ViewOptions } from "../Theme";


export interface IParagraph {
    title: string;
    content: string;
    children: IParagraph[];
}

export class ParagraphView extends View<IParagraph, Type, ViewOptions> {

    build(): void {
        if (!this.data) this.data = {} as IParagraph;
        if (typeof this.data.title === "undefined") {
            this.data.title = "Paragraph title";
        }
        if (typeof this.data.content === "undefined") {
            this.data.content = "The content of the paragraph. It can be as short or as long as you wish."
        }
    }

    onRender(output: Output): void {
        this.renderParagraph(output, this.data, 1);
    }

    renderParagraph(output: Output, p: IParagraph, level: number) {
        if (!p) return;
        if (p.title) output.printTag("h" + level, {}, p.title);
        if (p.content) output.printTag("p", {}, p.content);
        if (p.children) {
            for (var i = 0; i < p.children.length; i++) {
                this.renderParagraph(output, p.children[i], level + 1);
            }
        }
    }

    getValue(): any {
        return this.data;
    }
}
