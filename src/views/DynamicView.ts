import { View } from '../View';
import { Type, EnumEntry, EnumDefinition, DynamicDefinition, DynamicEntry } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectOptions } from "../Theme";

export class DynamicView extends View<object, DynamicDefinition> {
    attributes: any;
    data: any;
    type: DynamicDefinition;
    targetOutput: Output;
    entriesByKey: { [key: string]: DynamicEntry } = {};
    contentId: string;

    build(data: any, type: DynamicDefinition, attributes: { [key: string]: string }): void {
        if (data === undefined) data = {};
        if (typeof data !== 'object') data = { value: data };

        this.attributes = attributes || {};
        this.data = data;
        this.type = type;
        this.contentId = this.evalContext.nextId();

        for (var e of type.entries) {
            this.entriesByKey[e.key] = e;
        }
    }

    render(output: Output): void {
        output.printSection({ name: "dynamic-control", attributes: this.attributes }, () => {
            var enumEntries: DynamicEntry[] = this.type.entries;
            var selectOptions: SelectOptions = { entries: enumEntries };

            output.printRawProperty({}, (output) => {
                output.printSelect(selectOptions, this.data.type, this.type, (str) => this.selectionChanged(this.entriesByKey[str]));
            }, (output, options) => {
                this.targetOutput = output.printDynamicSection({ name: "dynamic", attributes: options.attributes });
            });

            setTimeout(() => { this.selectionChanged(this.entriesByKey[this.data]); });
        });
    }

    selectionChanged(entry: DynamicEntry) {
        var innertype = (entry || this.type.entries[0]).type;
        var innerView = this.evalContext.getViewForExpr(this.data, innertype, this.targetOutput.isEditMode(), {});
        innerView.render(this.targetOutput);
        this.type.entries
        this.targetOutput.render();
    }

    getValue(): any {
        var elt = document.getElementById(this.attributes.id);
        if (elt) {
            return (elt as HTMLSelectElement).value;
        } else {
            return this.attributes.id + " not found.";
        }
    }
}
