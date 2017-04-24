import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type, ObjectType, Property } from "../Types";
import { ViewOptions } from "../Theme";

export class ObjectView extends View<Object, ObjectType, ViewOptions> {
    allKeys: string[];
    typedKeys: string[];
    untypedKeys: string[];
    properties: Property[];
    views: { [key: string]: AnyView } = {};
    typeByName: { [key: string]: Type } = {};
    groupByName: { [key: string]: string[] };
    groupNames: string[];
    mainProperties: string[];

    build(): void {
        this.properties = (this.type.properties) || [];
        this.allKeys = [];
        this.typedKeys = [];
        this.untypedKeys = [];
        this.groupByName = {};
        this.groupNames = [];
        this.typeByName = {};
        this.mainProperties = [];

        for (var p of this.properties) {
            this.allKeys.push(p.name);
            this.typedKeys.push(p.name);
            var groupName = p.type.tab;
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

        for (var key in this.data) {
            if (key === "_kind") continue;
            if (this.typeByName[key] !== undefined) continue;
            this.allKeys.push(key);
            this.untypedKeys.push(key);
        }
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
            if (this.groupNames.length || this.untypedKeys.length) {
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
                    if (this.untypedKeys.length) {
                        output.printSection({ name: "property-group", orphans: true }, (options) => {
                            for (var key of this.untypedKeys) {
                                var value = this.data[key];
                                this.views[key] = output.printLabelAndView({ label: key }, value, null, this);
                            }
                        });
                    }
                });
            }
        });
    }

    getValue(): any {
        var result = {};
        var value: any;
        for (var key of this.allKeys) {
            // and we overwrite with whatever was edited.
            var view = this.views[key];
            if (view) {
                value = view.getValue();
            } else value = this.data[key];
            result[key] = this.evalContext.fixValue(value);
        }
        return result;
    }
}
