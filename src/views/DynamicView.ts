import { View, AnyView } from '../View';
import { Type, EnumEntry, EnumType, DynamicType, DynamicObject, DynamicKind } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectOptions, ViewOptions, DynamicObjectOptions, PropertyOptions } from "../Theme";

export class DynamicView extends View<DynamicObject, DynamicType, DynamicObjectOptions> {
    innertype: Type;
    kind: string;
    targetOutput: Output;
    entriesByKey: { [key: string]: DynamicKind } = {};
    view: AnyView

    build(): void {
        for (var e of this.type.kinds) {
            this.entriesByKey[e.key] = e;
        }
        var data = this.data || (this.data = {} as DynamicObject);
        if (!data._kind) data._kind = "object";
    }

    render(output: Output): void {
        var dynamicKinds: DynamicKind[] = this.type.kinds;
        //var selectOptions: SelectOptions = { entries: enumEntries, id: };

        // var viewId: string = null;
        output.printDynamicObject({},
            (output) => {
                if (this.options.freezeType) {
                    output.printText(this.data._kind);
                } else {
                    var id: string = this.evalContext.nextId("select-");
                    output.printSelect({ entries: dynamicKinds, id: id }, this.data._kind, this.type,
                        (kind) => this.selectionChanged(kind));
                }
            },
            {
                getId: () => this.getId(),
                render: (output) => {
                    output.printAsync("div", { id: this.getId(), class: "dynamic-object" }, "...", (elt, output) => {
                        this.targetOutput = output;
                        var kind = this.data._kind;
                        this.selectionChanged(kind);
                    });
                },
                getParentView: () => this
            });
    }

    selectionChanged(kind: string) {
        this.kind = kind;
        var entry = this.entriesByKey[kind];
        if (entry) {
            var innerView = this.evalContext.instantiateNewViewForExpr(this.data, entry.type, this, this.targetOutput.isEditMode(), {});
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
            (result as DynamicObject)._kind = this.kind;
        }
        return result;
    }
}
    