import { View } from '../View';
import { Type, EnumEntry, EnumDefinition } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectOptions, ViewOptions } from "../Theme";

export class SelectView extends View<string, EnumDefinition, SelectOptions> {

    build(): void {
        if (typeof this.data !== 'string') this.data = JSON.stringify(this.data);
    }

    render(output: Output): void {
        var enumEntries: EnumEntry[] = this.type.entries;

        output.printSelect(
            { entries: enumEntries, id: this.getId() },
            this.data, this.type, (a) => {
                alert("value changed" + a)
            });
    }

    getValue(): any {
        var elt = document.getElementById(this.getId());
        if (elt) {
            return (elt as HTMLSelectElement).value;
        } else {
            return "HTML Element " + this.getId() + " not found.";
        }
    }
}
