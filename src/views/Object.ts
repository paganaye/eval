import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition, ObjectDefinition } from "../Types";

export class ObjectView extends View<any> {
    render(data: any, type: TypeDefinition, output: Output): void {
        if (!type && data.type) {
            type = data.type;
        }
        output.printHTML("<pre>");
        var properties = (type && (type as ObjectDefinition).properties) || {};
        for (var key in data) {
            output.printProperty(key, data[key], properties[key] as TypeDefinition);
        }
        output.printHTML("</pre>");
    }
}
