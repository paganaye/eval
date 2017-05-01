import { View } from "../View";
import { Output } from "../Output";
import { Type, ObjectType } from "../Types";
import { PrintArgs, ElementAttributes } from "../Theme";
import { ObjectView } from "../views/ObjectView";

interface IYoutube {
    video?: string;
    width?: number;
    height?: number;
}

export class YoutubeView extends ObjectView {
    printArgs: PrintArgs;

    build(): void {
        this.type.properties = [
            { name: "video", type: { _kind: "string" } }
        ]
        super.build()

        var data = (this.data || {}) as IYoutube;
    }

    onRender(output: Output): void {
        if (output.isEditMode()) {
            debugger;
            super.onRender(output)
            //output.printLabelAndView({ showLabel: true }, {}, youtubeType, this);
        } else {
            var data: IYoutube = this.data || {};
            var attributes = {
                frameBorder: "0",
                allowFullscreen: "true",
                width: (data.width || 560).toString(),
                height: (data.height || 315).toString(),
                src: "https://www.youtube.com/embed/" + data.video
            };
            output.printTag("iframe", attributes);
        }
    }

    getValue(): any {
        return super.getValue();
    }
}

