import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition, ObjectDefinition } from "../Types";

export class ObjectView extends View<any> {
    render(data: any, type: TypeDefinition, attributes: { [key: string]: string }, output: Output): void {
        if (!type && data && data.type) {
            type = data.type;
        }
        var objectId = this.evalContext.nextId();
        var properties = (type && (type as ObjectDefinition).properties) || {};


        output.printSection({ type: "div" }, () => {
            for (var key in properties) {
                var value = data[key];
                output.printProperty(key, value, properties[key]);
            }
        })
        output.printSection({ type: "div" }, () => {
            // print orphans
            for (var key in data) {
                var value = data[key];
                if (properties[key]) continue;
                output.printProperty(key, value, null);
            }
        });
    }
}
