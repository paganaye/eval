import { View } from "../View";
import { Output } from "../Output";
import { Type } from "../Types";
import { ElementAttributes } from "Theme";

interface ImageSource {
    src?: string;
    width?: number;
    height?: number;
}

export class ImageView extends View<ImageSource, any, ElementAttributes> {

    build(): void {
        var cssAttributes = this.getCssAttributes();
        var data = this.data;
        cssAttributes.width = (data.width || 560).toString();
        cssAttributes.height = (data.height || 315).toString();

        cssAttributes.src = ((typeof data == "string")
            ? cssAttributes.src = data
            : data.src);
    }

    render(output: Output): void {
        output.printTag("img", this.attributes.cssAttributes);
    }

    getValue(): any {
        return this.data;
    }
}

