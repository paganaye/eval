import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition } from "../Types";

interface IYoutubeSource {
    video?: string;
    width?: number;
    height?: number;
}

export class YoutubeView extends View<any> {
    render(data: any, type: TypeDefinition, output: Output): void {
        var attributes: any = {
            frameBorder: "0",
            allowFullscreen: true
        };
        attributes.width = (data as IYoutubeSource).width || 560;
        attributes.height = (data as IYoutubeSource).height || 315;

        attributes.src = "https://www.youtube.com/embed/" + ((typeof data == "string")
            ? attributes.src = data
            : (data as IYoutubeSource).video);

        output.printTag("iframe", attributes);
    }
}

