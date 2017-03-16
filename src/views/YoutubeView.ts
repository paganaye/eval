import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition } from "../Types";

interface IYoutubeSource {
    video?: string;
    width?: number;
    height?: number;
}

export class YoutubeView extends View<any> {
    attributes: any;

    build(data: any, type: TypeDefinition, attributes: { [key: string]: string }): void {
        //var attributes: any = {
        attributes.frameBorder = "0";
        attributes.allowFullscreen = "true";
        //};
        attributes.width = ((data as IYoutubeSource).width || 560).toString();
        attributes.height = ((data as IYoutubeSource).height || 315).toString();

        attributes.src = "https://www.youtube.com/embed/" + ((typeof data == "string")
            ? attributes.src = data
            : (data as IYoutubeSource).video);
        this.attributes = attributes;
    }

    render(output: Output): void {
        output.printTag("iframe", this.attributes);
    }
}

