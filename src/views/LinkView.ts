import { View } from "../View";
import { Output } from "../Output";
import { Type, NumberType, ObjectType, EnumEntry } from "../Types";
import { ViewOptions } from "../Theme";


export class LinkView extends View<any, ObjectType, ViewOptions> {
   tableName: string = "dog";
   selectedOption: string;

   build(): void {
      this.selectedOption = this.data;
   }


   onRender(output: Output): void {
      //  for simplicity we make the id of the input element identical to the id of the view.
      output.printAsync("div", {}, "...", (elt, output) => {
         var tableName = this.type.tableName;
         if (tableName) {
            this.evalContext.database.on("tables/" + tableName + "/_index",
               (data, error) => {
                  if (data) {
                     var entries: EnumEntry[] = [];
                     for (var key in data) {
                        entries.push({ key: key });
                     }

                     output.printSelect(
                        { entries: entries, id: this.getId() },
                        this.data, { _kind: "string" }, (a) => {
                           this.selectedOption = a;
                        });
                  }
                  output.domReplace();
               });
         } else {
            output.printTag("p", {}, "Link tableName is not set.")
            output.domReplace();
         }
      });
   }

   getValue(): string {
      return this.selectedOption;
   }
}


// import { View } from '../View';
// import { Type, EnumEntry, EnumType, CategoryType } from '../Types';
// import { Output } from '../Output';
// import { Eval } from "../Eval";
// import { CategoryOptions, ViewOptions } from "../Theme";

// export class CategoryView extends View<string, CategoryType, CategoryOptions> {
//     selectedOption: string;


//     build(): void {
//         if (typeof this.data !== 'string') this.data = JSON.stringify(this.data);
//         this.selectedOption = this.data;
//     }

//     onRender(output: Output): void {
//     }

//     getValue(): any {
//         return this.selectedOption;
//     }
// }
