import { View } from "../View";
import { Output } from "../Output";
import { Type, ObjectDefinition } from "../Types";

export class ObjectView extends View<Object, ObjectDefinition> {
    attributes: { [key: string]: string };
    data: any;
    keys: string[];
    properties: any;
    views: { [key: string]: View<any, any> } = {};

    build(data: any, type: ObjectDefinition, attributes: { [key: string]: string }): void {
        this.attributes = attributes;
        if (data == null) data = {};
        this.data = data;

        if (!type && data && data.type) {
            type = data.type;
        }
        this.properties = (type && type.properties) || {};
        this.keys = type.displayOrder || Object.keys(this.properties);
    }

    render(output: Output): void {

        output.printSection({ name: "object-properties", attributes: this.attributes }, () => {
            output.printSection({ name: "object-known-properties" }, () => {
                for (var key of this.keys) {
                    var value = this.data[key];
                    this.views[key] = output.printPropertyAndView(key, {}, value, this.properties[key]);
                }
            })
            output.printSection({ name: "object-orphans" }, () => {
                for (var key in this.data) {
                    var value = this.data[key];
                    if (this.properties[key] !== undefined) continue;
                    this.views[key] = output.printPropertyAndView(key, {}, value, null);
                }
            });
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
