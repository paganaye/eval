import { View } from '../View';
import { Type, EnumEntry, EnumDefinition, DynamicDefinition, DynamicEntry, TypedObject } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectOptions, ViewOptions, DynamicObjectOptions, PropertyOptions } from "../Theme";

export class DynamicView extends View<TypedObject, DynamicDefinition, DynamicObjectOptions> {
    targetOutput: Output;
    entriesByKey: { [key: string]: DynamicEntry } = {};
    view: View<any, Type, ViewOptions>

    build(): void {
        for (var e of this.type.entries) {
            this.entriesByKey[e.key] = e;
        }
        var data = this.data || (this.data = { type: "object" });
        if (!data.type) data.type = "object";
    }

    render(output: Output): void {
        var enumEntries: DynamicEntry[] = this.type.entries;
        //var selectOptions: SelectOptions = { entries: enumEntries, id: };

        // var viewId: string = null;
        output.printDynamicObject({},
            (output) => {
                if (this.options.freezeType) {
                    output.printText(this.data.type);
                } else {
                    var id: string = this.evalContext.nextId("select-");
                    output.printSelect({ entries: enumEntries, id: id }, this.data.type, this.type,
                        (str) => this.selectionChanged(this.entriesByKey[str]));
                }
            },
            {
                getId: () => this.getId(),
                render: (output) => {
                    output.printAsync("div", { id: this.getId(), class: "dynamic-object" }, "...", (elt) => {
                        this.targetOutput = new Output(this.evalContext, elt, output);
                        var str = this.data.type;
                        this.selectionChanged(this.entriesByKey[str]);
                    });
                },
                getParentView: () => this
            });
    }


    selectionChanged(entry: DynamicEntry) {
        var innertype = (entry || this.type.entries[0]).type;
        var innerView = this.evalContext.getViewForExpr(this.data, innertype, this.targetOutput.isEditMode(), {});
        innerView.render(this.targetOutput);
        this.view = innerView;
        this.targetOutput.render();
    }

    getValue(): any {
        var result = {};
        var container = this.targetOutput.getOutputElt();
        result = this.view.getValue();
        return result;
    }
}
