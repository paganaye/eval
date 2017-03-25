import { View } from '../View';
import { Type, EnumEntry, EnumDefinition, DynamicDefinition, DynamicEntry, TypedObject } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectAttributes, ElementAttributes, DynamicObjectAttributes } from "../Theme";

export class DynamicView extends View<TypedObject, DynamicDefinition, DynamicObjectAttributes> {
    targetOutput: Output;
    entriesByKey: { [key: string]: DynamicEntry } = {};

    build(): void {
        for (var e of this.type.entries) {
            this.entriesByKey[e.key] = e;
        }
        var data = this.data || (this.data = { type: "ojbect" });
        if (!data.type) data.type = "object";
    }

    render(output: Output): void {
        output.printSection({ name: "dynamic-control", cssAttributes: this.getCssAttributes() }, () => {
            var enumEntries: DynamicEntry[] = this.type.entries;
            var selectOptions: SelectAttributes = { entries: enumEntries };

            // var viewId: string = null;
            output.printProperty({},
                (output) => {
                    if (this.attributes.freezeType) {
                        output.printText(this.data.type);
                    } else {
                        output.printSelect(selectOptions, this.data.type, this.type, (str) => this.selectionChanged(this.entriesByKey[str]));
                    }
                },
                {
                    getId: () => this.getId(),
                    render: () => {
                        output.printSectionAsync({ name: "dynamic", cssAttributes: this.getCssAttributes() },
                            (elt) => {
                                this.targetOutput = new Output(this.evalContext, elt, output);
                            });
                    }
                });

            setTimeout(() => { this.selectionChanged(this.entriesByKey[this.data.type]); });
        });
    }

    selectionChanged(entry: DynamicEntry) {
        var innertype = (entry || this.type.entries[0]).type;
        var innerView = this.evalContext.getViewForExpr(this.data, innertype, this.targetOutput.isEditMode(), {});
        innerView.render(this.targetOutput);
        //this.type.entries
        this.targetOutput.render();
    }

    getValue(): any {
        var elt = document.getElementById(this.attributes.cssAttributes.id);
        if (elt) {
            return (elt as HTMLSelectElement).value;
        } else {
            return this.attributes.cssAttributes.id + " not found.";
        }
    }
}
