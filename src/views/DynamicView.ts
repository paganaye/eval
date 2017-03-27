import { View, AnyView } from '../View';
import { Type, EnumEntry, EnumType, DynamicType, DynamicEntry, TypedObject } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectOptions, ViewOptions, DynamicObjectOptions, PropertyOptions } from "../Theme";

export class DynamicView extends View<TypedObject, DynamicType, DynamicObjectOptions> {
    innertype: Type;
    typeName: string;
    targetOutput: Output;
    entriesByKey: { [key: string]: DynamicEntry } = {};
    view: AnyView

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
                        (typeName) => this.selectionChanged(typeName));
                }
            },
            {
                getId: () => this.getId(),
                render: (output) => {
                    output.printAsync("div", { id: this.getId(), class: "dynamic-object" }, "...", (elt, output) => {
                        this.targetOutput = output;
                        var typeName = this.data.type;
                        this.selectionChanged(typeName);
                    });
                },
                getParentView: () => this
            });
    }

    selectionChanged(typeName: string) {
        this.typeName = typeName;
        var entry = this.entriesByKey[typeName];
        if (entry) {
            var innerView = this.evalContext.getViewForExpr(this.data, entry.type, this, this.targetOutput.isEditMode(), {});
            innerView.render(this.targetOutput);
            this.view = innerView;
            this.targetOutput.render();
        }
    }

    getValue(): any {
        var result = {};
        //var container = this.targetOutput.getOutputElt();
        result = this.view.getValue();
        if (typeof result === 'object') {
            (result as TypedObject).type = this.typeName;
        }
        return result;
    }
}
