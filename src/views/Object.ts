import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition, ObjectDefinition } from "../Types";

export class ObjectView extends View<any> {
    render(data: any, type: TypeDefinition, output: Output): void {
        if (!type && data.type) {
            type = data.type;
        }
        debugger;
        output.printHTML("<pre>");
        output.printHTML("He\n");
        var properties = (type && (type as ObjectDefinition).properties) || {};
        for (var key in properties) {
            var value = data[key];
            output.printProperty(key, value, properties[key]);
        }
        // print orphans
        for (var key in data) {
            var value = data[key];
            if (properties[key]) continue;
            output.printProperty(key, value, null);
        }
        output.printHTML("</pre>");
    }
}
