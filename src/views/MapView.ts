import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type, ObjectDefinition, MapDefinition } from "../Types";
import { ViewOptions, MapOptions } from "Theme";

export class MapView extends View<Object, MapDefinition, MapOptions> {
    keys: string[];
    views: { [key: string]: AnyView } = {};

    build(): void {
        var data = this.data || (this.data = {});
        this.keys = Object.keys(data);
    }

    render(output: Output): void {
        output.printSection({ name: "map-properties" }, (options) => {
            for (var key of this.keys) {
                var value = this.data[key];
                this.views[key] = output.printLabelAndView(key, {}, value, this.type.entryType, this);
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
