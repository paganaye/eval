import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition, ArrayDefinition } from "../Types";

export class ArrayView extends View<any> {
   render(data: any, type: TypeDefinition, attributes: { [key: string]: string }, output: Output): void {
      output.printSection({ name: "array", attributes: attributes }, (attributes) => {

         var output2 = output.printDynamicSection({ name: "array-entries", attributes: attributes });
         
         if (Array.isArray(data)) {
            for (var index = 0; index < data.length; index++) {
               var entry = data[index];
               output2.printArrayEntry(index, { class: "array-entry" }, entry, type ? (type as ArrayDefinition).entryType : null);
            }
            output2.render();
         }
         
         output.printSection({ name: "array-buttons" }, () => {
            output.printButton({}, "+", () => {
               var index = data.length;
               var entry = {};
               data.push(entry);
               output2.printArrayEntry(index, { class: "array-entry" }, entry, type ? (type as ArrayDefinition).entryType : null);
               output2.append();
            });
         });
      });
   }
}

