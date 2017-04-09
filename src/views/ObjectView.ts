import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type, ObjectType, Property } from "../Types";
import { ViewOptions } from "../Theme";

export class ObjectView extends View<Object, ObjectType, ViewOptions> {
    keys: string[];
    properties: Property[];
    views: { [key: string]: AnyView } = {};
    typeByName: { [key: string]: Type } = {};
    groupByName: { [key: string]: string[] };
    groups: string[];
    build(): void {
        this.properties = (this.type.properties) || [];
        this.keys = [];
        this.groupByName = {};
        this.groups = [];
        this.typeByName = {};
        for (var p of this.properties) {
            this.keys.push(p.name);
            var groupName = p.group || "";
            var group = this.groupByName[group];
            if (!group) {
                group = [];
                this.groupByName[groupName] = group;
                this.groups.push(group);
            }
            group.push(p.name);
            this.typeByName[p.name] = p.type;
        }
        if (!this.data) this.data = {};
    }

    internalRender(output: Output): void {

        output.printSection({ name: "object" }, (options) => {
            output.printSection({ name: "object-known-properties" }, (options) => {
                for (var group of this.groups) {
                    output.printSection({ name: "object-group" }, (options) => {
                        for (var key of group) {
                            var value = this.data[key];

                            this.views[key] = output.printLabelAndView({ label: key }, value, this.typeByName[key], this);
                        }
                    });
                }
            })
            output.printSection({ name: "object-orphans" }, (options) => {
                for (var key in this.data) {
                    if (key === "_kind") continue;
                    var value = this.data[key];
                    if (this.typeByName[key] !== undefined) continue;
                    this.views[key] = output.printLabelAndView({ label: key }, value, null, this);
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
