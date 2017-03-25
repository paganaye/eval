import { View } from "../View";
import { Output } from "../Output";
import { Type, ObjectDefinition } from "../Types";
import { ElementAttributes } from "Theme";

export class ObjectView extends View<Object, ObjectDefinition, ElementAttributes> {
    keys: string[];
    properties: any;
    views: { [key: string]: View<any, Type, ElementAttributes> } = {};

    build(): void {
        this.properties = (this.type.properties) || {};
        this.keys = this.type.displayOrder || Object.keys(this.properties);
        if (!this.data) this.data = {};
    }

    render(output: Output): void {

        output.printSection({ name: "object-properties", cssAttributes: this.getCssAttributes() }, () => {
            output.printSection({ name: "object-known-properties" }, () => {
                for (var key of this.keys) {
                    var value = this.data[key];
                    this.views[key] = output.printLabelAndView(key, {}, value, this.properties[key]);
                }
            })
            output.printSection({ name: "object-orphans" }, () => {
                for (var key in this.data) {
                    var value = this.data[key];
                    if (this.properties[key] !== undefined) continue;
                    this.views[key] = output.printLabelAndView(key, {}, value, null);
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
