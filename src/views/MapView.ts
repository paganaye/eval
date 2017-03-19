import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition, ObjectDefinition, MapDefinition } from "../Types";

export class MapView extends View<Object, MapDefinition> {
    attributes: { [key: string]: string };
    data: any;
    keys: string[];
    views: { [key: string]: View<any, any> } = {};
    type: MapDefinition;

    build(data: Object, type: MapDefinition, attributes: { [key: string]: string }): void {
        this.attributes = attributes;
        if (data == null) data = {};
        this.data = data;
        this.type = type as MapDefinition;

        this.keys = Object.keys(this.data);
    }

    render(output: Output): void {

        output.printSection({ name: "map-properties", attributes: this.attributes }, () => {
            for (var key of this.keys) {
                var value = this.data[key];
                this.views[key] = output.printProperty(this, key, {}, value, this.type.entryType);
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
