import { View } from "../View";
import { Output } from "../Output";
import { Type } from "../Types";
import { ViewOptions, ElementAttributes } from "Theme";

interface IYoutubeSource {
    video?: string;
    width?: number;
    height?: number;
}

export class YoutubeView extends View<any, Type, ViewOptions> {
    data: any;
    options: ViewOptions;
    attributes2: ElementAttributes;

    build(): void {
        var data = this.data;
        this.attributes2 = {
            frameBorder: "0",
            allowFullscreen: "true",
            width: ((data as IYoutubeSource).width || 560).toString(),
            height: ((data as IYoutubeSource).height || 315).toString(),
            src: "https://www.youtube.com/embed/" + ((typeof data == "string")
                ? (data as string)
                : (data as IYoutubeSource).video)
        };
    }

    render(output: Output): void {
        output.printTag("iframe", this.attributes2);
    }

    getValue(): any {
        return this.data;
    }
}

