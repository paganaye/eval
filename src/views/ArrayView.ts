import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition, ArrayDefinition } from "../Types";

export class ArrayView extends View<any>
{
   attributes: { [key: string]: string };
   data: any[];
   views: View<any>[];

   entryType: TypeDefinition;

   build(data: any, type: TypeDefinition, attributes: { [key: string]: string }): void {
      this.attributes = attributes;
      if (Array.isArray(data)) {
         this.data = data;
      } else {
         this.data = [data];
      }
      this.views = [];
      this.entryType = type ? (type as ArrayDefinition).entryType : null
   }

   render(output: Output): void {
      output.printSection({ name: "array", attributes: this.attributes }, (attributes) => {
         var output2 = output.printDynamicSection({ name: "array-entries", attributes: attributes });
         if (Array.isArray(this.data)) {
            for (var index = 0; index < this.data.length; index++) {
               var entry = this.data[index];
               output2.printArrayEntry(index, { class: "array-entry", deletable: true }, entry, this.entryType);

            }
            output2.render();
         }

         output.printSection({ name: "array-buttons" }, () => {
            output.printButton({}, "+", () => {
               var index = this.data.length;
               var entry = {};
               this.data.push(entry);
               output2.printArrayEntry(index, { class: "array-entry", deletable: true }, entry, this.entryType);
               output2.append();
            });
         });
      });
   }

   getValue(): any {
      var result = [];
      for (var i = 0; i < this.views.length; i++) {
         var view = this.views[i];
         if (view) {
            result.push(view.getValue());
         } else result.push(this.data[i]);
      }
      return result;
   }
}

