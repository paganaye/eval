import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type, ObjectDefinition } from "../Types";
import { ViewOptions } from "Theme";

export class ObjectView extends View<Object, ObjectDefinition, ViewOptions> {
    keys: string[];
    properties: any;
    views: { [key: string]: AnyView } = {};

    build(): void {
        this.properties = (this.type.properties) || {};
        this.keys = this.type.displayOrder || Object.keys(this.properties);
        if (!this.data) this.data = {};
    }

    render(output: Output): void {

        output.printSection({ name: "object" }, (options) => {
            output.printSection({ name: "object-known-properties" }, (options) => {
                for (var key of this.keys) {
                    var value = this.data[key];
                    this.views[key] = output.printLabelAndView(key, {}, value, this.properties[key], this);
                }
            })
            output.printSection({ name: "object-orphans" }, (options) => {
                for (var key in this.data) {
                    var value = this.data[key];
                    if (this.properties[key] !== undefined) continue;
                    this.views[key] = output.printLabelAndView(key, {}, value, null, this);
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
