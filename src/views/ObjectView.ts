import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type, ObjectType, Property, Visibility } from "../Types";
import { PrintArgs } from "../Theme";

export class ObjectView extends View<Object, ObjectType, PrintArgs> {
    allKeys: string[];
    typedKeys: string[];
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
        this.groupByName = {};
        this.groupNames = [];
        this.typeByName = {};
        this.mainProperties = [];

        for (var p of this.properties) {
            this.addKey(p.name, p.type.tab);
            this.typeByName[p.name] = p.type;
        }
        if (!this.data) this.data = {};

        for (var key in this.data) {
            if (key === "_kind") continue;
            if (this.typeByName[key] !== undefined) continue;
            this.addKey(key, "orphans");
        }
    }

    addKey(name: string, tab: string) {
        this.allKeys.push(name);
        this.typedKeys.push(name);
        var groupName = tab;
        if (groupName) {
            var group = this.groupByName[groupName];
            if (!group) {
                group = [];
                this.groupByName[groupName] = group;
                this.groupNames.push(groupName);
            }
            group.push(name);
        } else {
            this.mainProperties.push(name);
        }
    }

    onRender(output: Output): void {

        output.printSection({ name: "object" }, (printArgs) => {
            if (this.mainProperties.length) {
                output.printSection({ addHeaderCallback: printArgs.addHeaderCallback, name: "object-properties" }, (printArgs) => {
                    for (var key of this.mainProperties) {
                        this.printProperty(key, output);
                    }
                });
            }
            if (this.groupNames.length) {
                output.printSection({ name: "property-groups" }, (printArgs) => {
                    var first = true;
                    for (var groupName of this.groupNames) {
                        var group = this.groupByName[groupName];
                        output.printSection({
                            addHeaderCallback: printArgs.addHeaderCallback, name: "property-group",
                            active: first, title: groupName, orphans: (groupName == "orphans")
                        }, (printArgs) => {
                            for (var key of group) {
                                this.printProperty(key, output);
                            }
                        });
                        if (first) first = false;
                    }
                });
            }
        });
    }

    printProperty(key: string, output: Output) {
        var value = this.data[key];
        var type = this.typeByName[key] || {} as Type;
        var visibility = type.visibility || Visibility.Shown;
        if (visibility != Visibility.Hidden) {
            this.views[key] = output.printLabelAndView({ label: key, showLabel: visibility == Visibility.Shown }, value, type, this);
        }
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
