import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition, ObjectDefinition } from "../Types";

export class ObjectView extends View<any> {
    render(data: any, type: TypeDefinition, attributes: { [key: string]: string }, output: Output): void {
        if (data == null) data = {};

        if (!type && data && data.type) {
            type = data.type;
        }
        var objectId = this.evalContext.nextId();
        var properties = (type && (type as ObjectDefinition).properties) || {};

        var keys: string[] = (type as ObjectDefinition).displayOrder || Object.keys(properties);
        output.printSection({ name: "object-properties" }, () => {
            for (var key of keys) {
                var value = data[key];
                output.printProperty(key, value, properties[key]);
            }
        })
        output.printSection({ name: "object-orphans" }, () => {
            for (var key in data) {
                var value = data[key];
                if (properties[key] !== undefined) continue;
                output.printProperty(key, value, null);
            }
        });
    }
}
