import { View } from "../View";
import { Output } from "../Output";
import { Type } from "../Types";
import { ElementAttributes } from "Theme";

interface IYoutubeSource {
    video?: string;
    width?: number;
    height?: number;
}

export class YoutubeView extends View<any, Type, ElementAttributes> {
    data: any;
    attributes: ElementAttributes;

    build(): void {
        var data = this.data;
        var attributes = this.getCssAttributes();
        attributes.frameBorder = "0";
        attributes.allowFullscreen = "true";
        //};
        attributes.width = ((data as IYoutubeSource).width || 560).toString();
        attributes.height = ((data as IYoutubeSource).height || 315).toString();

        attributes.src = "https://www.youtube.com/embed/" + ((typeof data == "string")
            ? attributes.src = data
            : (data as IYoutubeSource).video);
    }

    render(output: Output): void {
        output.printTag("iframe", this.getCssAttributes());
    }

    getValue(): any {
        return this.data;
    }
}

