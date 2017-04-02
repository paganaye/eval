import { View } from '../View';
import { Type, EnumEntry, EnumType } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { CategoryOptions, ViewOptions } from "../Theme";

export class CategoryView extends View<string, EnumType, CategoryOptions> {
    selectedOption: string;


    build(): void {
        if (typeof this.data !== 'string') this.data = JSON.stringify(this.data);
        this.selectedOption = this.data;
    }

    render(output: Output): void {
        output.printAsync("div", {}, "...", (elt, output) => {
            this.evalContext.database.on("tables/category/Country", (data, error) => {
                if (data.entries) {
                    output.printSelect(
                        { entries: data.entries, id: this.getId() },
                        this.data, this.type, (a) => {
                            this.selectedOption = a;
                        });
                }
                output.render();
            });
        });
    }

    getValue(): any {
        return this.selectedOption;
    }
}
