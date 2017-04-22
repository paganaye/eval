import { View } from '../View';
import { Type, EnumEntry, EnumType } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectOptions, ViewOptions } from "../Theme";

export class SelectView extends View<string, EnumType, SelectOptions> {
    selectedOption: string;


    build(): void {
        if (typeof this.data !== 'string') this.data = JSON.stringify(this.data);
        this.selectedOption = this.data;
    }

    onRender(output: Output): void {
        var enumEntries: EnumEntry[] = this.type.entries;

        output.printSelect(
            { entries: enumEntries, id: this.getId() },
            this.data, this.type, (a) => {
                this.selectedOption = a;
            });
    }

    getValue(): any {
        return this.selectedOption;
    }
}
