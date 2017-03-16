import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition, ArrayDefinition } from "../Types";

export class ArrayView extends View<any>
{
   attributes: { [key: string]: string };
   data: any[];
   entryType: TypeDefinition;

   build(data: any, type: TypeDefinition, attributes: { [key: string]: string }): void {
      this.attributes = attributes;
      if (Array.isArray(data)) {
         this.data = data;
      } else {
         this.data = [data];
      }
      this.entryType = type ? (type as ArrayDefinition).entryType : null
   }

   render(output: Output): void {
      output.printSection({ name: "array", attributes: this.attributes }, (attributes) => {
         var output2 = output.printDynamicSection({ name: "array-entries", attributes: attributes });
         if (Array.isArray(this.data)) {
            for (var index = 0; index < this.data.length; index++) {
               var entry = this.data[index];
               output2.printArrayEntry(index, { class: "array-entry" }, entry, this.entryType);
            }
            output2.render();
         }

         output.printSection({ name: "array-buttons" }, () => {
            output.printButton({}, "+", () => {
               var index = this.data.length;
               var entry = {};
               this.data.push(entry);
               output2.printArrayEntry(index, { class: "array-entry" }, entry, this.entryType);
               output2.append();
            });
         });
      });
   }

   getValue(): any {
      return this.data;
   }
}

