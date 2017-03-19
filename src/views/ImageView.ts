import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition } from "../Types";

interface ImageSource {
    src?: string;
    width?: number;
    height?: number;
}

export class ImageView extends View<ImageSource, any> {
    data: any;
    attributes: any;

    build(data: ImageSource, type: TypeDefinition, attributes: { [key: string]: string }): void {
        this.data = data;
        attributes.width = (data.width || 560).toString();
        attributes.height = (data.height || 315).toString();

        attributes.src = ((typeof data == "string")
            ? attributes.src = data
            : data.src);
        this.attributes = attributes;
    }

    render(output: Output): void {
        output.printTag("img", this.attributes);
    }

    getValue(): any {
        return this.data;
    }
}

