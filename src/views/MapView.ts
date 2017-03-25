import { View } from "../View";
import { Output } from "../Output";
import { Type, ObjectDefinition, MapDefinition } from "../Types";
import { ElementAttributes, MapAttributes } from "Theme";

export class MapView extends View<Object, MapDefinition, MapAttributes> {
    keys: string[];
    views: { [key: string]: View<any, Type, ElementAttributes> } = {};

    build(): void {
        this.keys = Object.keys(this.data);
    }

    render(output: Output): void {
        output.printSection({ name: "map-properties", cssAttributes: this.getCssAttributes() }, () => {
            for (var key of this.keys) {
                var value = this.data[key];
                this.views[key] = output.printPropertyAndView(key, {}, value, this.type.entryType);
            }
        });
    }

    getValue(): any {
        var result = {};
        for (var key of this.keys) {
            var view = this.views[key];
            if (view) {
                result[key] = view.getValue();
            } else result[key] = this.data[key];
        }
        return result;
    }
}
