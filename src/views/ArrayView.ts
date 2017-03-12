import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition, ArrayDefinition } from "../Types";

export class ArrayView extends View<any> {
   render(data: any, type: TypeDefinition, attributes: { [key: string]: string }, output: Output): void {
      output.printSection({ name: "array", attributes: attributes }, (attributes) => {
         output.printSection({ name: "array-entries", attributes: attributes }, (attributes) => {
            if (Array.isArray(data)) {
               for (var index in data) {
                  output.printSection({ name: "array-entry", entryNo: index, attributes: attributes }, () => {
                     var entry = data[index];
                     output.printProperty(index, {}, entry, type ? (type as ArrayDefinition).entryType : null);
                  });
               }
            }
         });
         output.printSection({ name: "array-buttons" }, () => {
            output.printText("Buttons go here");
         });
      });
   }
}

