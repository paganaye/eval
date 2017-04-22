import { View, AnyView } from '../View';
import { Type, EnumEntry, EnumType, VariantType, VariantObject, VariantKind } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectOptions, ViewOptions, VariantObjectOptions, PropertyOptions } from "../Theme";

export class VariantView extends View<VariantObject, VariantType, VariantObjectOptions> {
    innertype: Type;
    kind: string;
    targetOutput: Output;
    entriesByKey: { [key: string]: VariantKind } = {};
    innerView: AnyView

    build(): void {
        for (var e of this.type.kinds) {
            this.entriesByKey[e.key] = e;
        }
        var data = this.data || (this.data = {} as VariantObject);
        if (!data._kind) data._kind = "string";
    }

    onRender(output: Output): void {
        var variantKinds: VariantKind[] = this.type.kinds;
        //var selectOptions: SelectOptions = { entries: enumEntries, id: };

        // var viewId: string = null;
        var options: PropertyOptions = {};

        // if (this.options.freezeType) {
        //     options.label = this.data._kind;
        // } else {
        //     options.printLabel = (output) => {
        //         var id: string = this.evalContext.nextId("select-");
        //         output.printSelect({ entries: variantKinds, id: id }, this.data._kind, this.type,
        //             (kind) => this.selectionChanged(kind));
        //     };
        // }
        var id: string = this.evalContext.nextId("select-");
        output.printSelect({ entries: variantKinds, id: id }, this.data._kind, this.type,
            (kind) => this.selectionChanged(kind));

        output.printAsync("div", {}, "...", (elt, output) => {
            this.targetOutput = output;
            this.selectionChanged(this.data._kind as string);
        });
    }

    selectionChanged(kind: string) {
        this.kind = kind;
        var entry = this.entriesByKey[kind];
        if (entry) {
            var innerView = this.evalContext.instantiate(this.data, entry.type, this, this.targetOutput.isEditMode(), {});
            innerView.render(this.targetOutput);
            this.innerView = innerView;
            this.targetOutput.domReplace();
        }
    }

    getValue(): any {
        var result = {};
        //var container = this.targetOutput.getOutputElt();
        result = this.innerView.getValue();
        if (typeof result === 'object') {
            (result as VariantObject)._kind = this.kind;
        }
        return result;
    }
}
