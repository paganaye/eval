import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition, ObjectDefinition } from "../Types";

export class ObjectView extends View<any> {
    attributes: { [key: string]: string };
    data: any;
    keys: string[];
    properties: any;

    build(data: any, type: TypeDefinition, attributes: { [key: string]: string }): void {
        this.attributes = attributes;
        this.data = data;
        if (data == null) data = {};

        if (!type && data && data.type) {
            type = data.type;
        }
        this.properties = (type && (type as ObjectDefinition).properties) || {};
        this.keys = (type as ObjectDefinition).displayOrder || Object.keys(this.properties);
    }

    render(output: Output): void {
        output.printSection({ name: "object-properties", attributes: this.attributes }, () => {
            var objectId = this.evalContext.nextId();
            output.printSection({ name: "object-known-properties" }, () => {
                for (var key of this.keys) {
                    var value = this.data[key];
                    output.printProperty(key, {}, value, this.properties[key]);
                }
            })
            output.printSection({ name: "object-orphans" }, () => {
                for (var key in this.data) {
                    var value = this.data[key];
                    if (this.properties[key] !== undefined) continue;
                    output.printProperty(key, {}, value, null);
                }
            });
        });
    }



}
