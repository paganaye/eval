import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type, ObjectDefinition, MapDefinition, EnumEntry } from "../Types";
import { MapOptions, ViewOptions, ElementAttributes, MapEntryOptions } from "../Theme";

export class MapView extends View<Object, MapDefinition, MapOptions> {
    keys: string[];
    views: { [key: string]: AnyView } = {};
    data: any;
    entryType: Type;
    mapEntriesOutput: Output;

    build(): void {
        if (typeof this.data !== "object") {
            this.data = this.data == null ? {} : { value: this.data }
        }
        this.views = {};
        this.entryType = this.type.entryType
    }

    render(output: Output): void {
        output.printSection({ name: "map" }, (options) => {
            output.printAsync("div", { class: "map-entries" }, "...", (elt, output) => {
                //    printContent(output, { class: "gosh" });
                this.mapEntriesOutput = output;

                for (var index in this.data) {
                    this.addOne(index, null)
                }
                this.mapEntriesOutput.render();
            });
            output.printSection({ name: "map-buttons" }, (options) => {
                var inputView = this.evalContext.getViewForExpr("", { type: "string" }, this, true, {})
                output.printProperty({}, "New", inputView);
                output.printSelect
                if (this.entryType.type == "dynamic") {
                    var entries: EnumEntry[] = [];
                    for (var entry of this.entryType.entries) {
                        entries.push({ key: entry.key, label: entry.label || entry.key });
                    }
                    output.printButtonGroup({
                        buttonText: "Add",
                        entries: entries
                    }, (ev, str) => {
                        this.addOne(null, str);
                        this.mapEntriesOutput.append();
                    });
                } else {
                    output.printButton({ buttonText: "+" }, (ev: Event) => {
                        this.addOne(null, null);
                        this.mapEntriesOutput.append();
                    });
                }
            });
        });

    }

    addOne(index: string, type: String) {
        if (typeof index === "string") {
            var entry = this.data[index];
        } else {
            index = this.data.length;
            entry = {};
            if (type) (entry as any).type = type;
            this.data.push(entry);
        }
        var id = this.evalContext.nextId("entry-");
        var options: MapEntryOptions = { id: id, deletable: true, label: "#" + (Object.keys(this.views).length + 1), frozenDynamic: false };
        if (type) options.frozenDynamic = true;
        var view = this.mapEntriesOutput.printMapEntry(this, options, entry, this.entryType);

        this.views[id] = view;
    }

    getValue(): any {
        var result = [];

        var container = this.mapEntriesOutput.getOutputElt();
        var entryKeys = this.evalContext.theme.getMapEntriesIndex(container);
        for (var key of entryKeys) {
            var view = this.views[key];
            if (view) {
                result.push(view.getValue());
            } else result.push(this.data[key]);
        }
        return result;
    }
}


// export class MapView extends View<Object, MapDefinition, MapOptions> {
//     keys: string[];
//     views: { [key: string]: AnyView } = {};

//     build(): void {
//         var data = this.data || (this.data = {});
//         this.keys = Object.keys(data);
//     }

//     render(output: Output): void {
//         output.printSection({ name: "map-properties" }, (options) => {
//             for (var key of this.keys) {
//                 var value = this.data[key];
//                 this.views[key] = output.printLabelAndView(key, {}, value, this.type.entryType, this);
//             }
//         });

//     }

//     getValue(): any {
//         var result = {};
//         for (var key of this.keys) {
//             var view = this.views[key];
//             if (view) {
//                 result[key] = view.getValue();
//             } else result[key] = this.data[key];
//         }
//         return result;
//     }
// }
