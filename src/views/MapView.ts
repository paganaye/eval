import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition, ObjectDefinition, MapDefinition } from "../Types";

export class MapView extends View<any> {
    attributes: { [key: string]: string };
    data: any;
    keys: string[];
    views: { [key: string]: View<any> } = {};
    type: MapDefinition;

    build(data: any, type: TypeDefinition, attributes: { [key: string]: string }): void {
        this.attributes = attributes;
        if (data == null) data = {};
        this.data = data;
        this.type = type as MapDefinition;
        if (!type && data && data.type) {
            type = data.type;
        }
    }

    render(output: Output): void {

        output.printSection({ name: "map-properties", attributes: this.attributes }, () => {
            for (var key in this.data) {
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
