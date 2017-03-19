import { View } from '../View';
import { TypeDefinition, EnumEntry, EnumDefinition, DynamicDefinition } from '../Types';
import { Output } from '../Output';
import { Type } from "typescript/lib/typescript";
import { Eval } from "../Eval";
import { SelectOptions } from "../Theme";

export class DynamicView extends View<object, DynamicDefinition> {
    attributes: any;
    data: any;
    type: EnumDefinition;

    build(data: any, type: TypeDefinition, attributes: { [key: string]: string }): void {
        if (data === undefined) data = "";
        if (typeof data !== 'string') data = JSON.stringify(data);
        if (!data) data = "";

        this.attributes = attributes || {};
        this.data = data;
        this.type = type as EnumDefinition;

    }

    render(output: Output): void {
        var enumEntries: EnumEntry[] = this.type.entries;
        var selectOptions: SelectOptions = { entries: enumEntries, attributes: this.attributes, id: this.attributes.id };
        output.printSelect(selectOptions, this.data, this.type);
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
