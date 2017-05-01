import { View } from '../View';
import { Type, EnumEntry, EnumType } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectPrintArgs, PrintArgs } from "../Theme";

export class SelectView extends View<string, EnumType, SelectPrintArgs> {
    selectedOption: string;


    build(): void {
        if (typeof this.data !== 'string') this.data = JSON.stringify(this.data);
        this.selectedOption = this.data;
    }

    onRender(output: Output): void {
        var enumEntries: EnumEntry[] = this.type.entries;

        this.selectedOption = this.evalContext.findEntry(enumEntries, this.data);
        output.printSelect(
            { entries: enumEntries, id: this.getId() },
            this.selectedOption, this.type, (a) => {
                this.selectedOption = a;
            });
    }

    getValue(): any {
        return this.selectedOption;
    }
}
