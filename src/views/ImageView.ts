import { View } from "../View";
import { Output } from "../Output";
import { Type } from "../Types";
import { ViewOptions, ElementAttributes } from "../Theme";

interface ImageSource {
    src?: string;
    width?: number;
    height?: number;
}

export class ImageView extends View<ImageSource, any, ViewOptions> {

    build(): void {
        var data = this.data;
        var css: ElementAttributes = {};
        css.width = (data.width || 560).toString();
        css.height = (data.height || 315).toString();

        css.src = ((typeof data == "string")
            ? css.src = data
            : data.src);
    }

    internalRender(output: Output): void {
        output.printTag("img", {});
    }

    getValue(): any {
        return this.data;
    }
}

