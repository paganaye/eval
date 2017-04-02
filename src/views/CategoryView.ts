import { View } from '../View';
import { Type, EnumEntry, EnumType, CategoryType } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { CategoryOptions, ViewOptions } from "../Theme";

export class CategoryView extends View<string, CategoryType, CategoryOptions> {
    selectedOption: string;


    build(): void {
        if (typeof this.data !== 'string') this.data = JSON.stringify(this.data);
        this.selectedOption = this.data;
    }

    render(output: Output): void {
        output.printAsync("div", {}, "...", (elt, output) => {
            this.evalContext.database.on("tables/category/" + (this.type as CategoryType).categoryName,
                (data, error) => {
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
