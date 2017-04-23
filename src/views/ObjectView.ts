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
    groupNames: string[];
    mainProperties: string[];

    build(): void {
        this.properties = (this.type.properties) || [];
        this.keys = [];
        this.groupByName = {};
        this.groupNames = [];
        this.typeByName = {};
        this.mainProperties = [];

        for (var p of this.properties) {
            this.keys.push(p.name);
            var groupName = p.group;
            if (groupName) {
                var group = this.groupByName[groupName];
                if (!group) {
                    group = [];
                    this.groupByName[groupName] = group;
                    this.groupNames.push(groupName);
                }
                group.push(p.name);
            } else {
                this.mainProperties.push(p.name);
            }
            this.typeByName[p.name] = p.type;
        }
        if (!this.data) this.data = {};
    }

    onRender(output: Output): void {

        output.printSection({ name: "object" }, (options) => {
            if (this.mainProperties.length) {
                output.printSection({ addHeaderCallback: options.addHeaderCallback, name: "object-properties" }, (options) => {
                    for (var key of this.mainProperties) {
                        var value = this.data[key];
                        this.views[key] = output.printLabelAndView({ label: key }, value, this.typeByName[key], this);
                    }
                });
            }
            var orphans = [];
            for (var key in this.data) {
                if (key === "_kind") continue;
                if (this.typeByName[key] !== undefined) continue;
                orphans.push[key];
            }
            output.printSection({ name: "property-groups" }, (options) => {
                var first = true;
                for (var groupName of this.groupNames) {
                    var group = this.groupByName[groupName];
                    output.printSection({
                        addHeaderCallback: options.addHeaderCallback, name: "property-group",
                        active: first, title: groupName
                    }, (options) => {
                        for (var key of group) {
                            var value = this.data[key];
                            this.views[key] = output.printLabelAndView({ label: key }, value, this.typeByName[key], this);
                        }
                    });
                    if (first) first = false;
                }
                if (orphans.length) {
                    output.printSection({ name: "property-group", orphans: true }, (options) => {
                        for (var key of orphans) {
                            var value = this.data[key];
                            this.views[key] = output.printLabelAndView({ label: key }, value, null, this);
                        }
                    });
                }
            });
        });
    }

    getValue(): any {
        var result = {};
        var value: any;
        for (var key of this.keys) {
            var view = this.views[key];
            if (view) {
                value = view.getValue();
            } else value = this.data[key];
            result[key] = this.evalContext.fixValue(value);
        }
        return result;
    }
}
