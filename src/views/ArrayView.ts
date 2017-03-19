import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition, ArrayDefinition } from "../Types";

export class ArrayView extends View<any, ArrayDefinition>
{
   attributes: { [key: string]: string };
   data: any[];
   views: View<any, any>[];
   entryType: TypeDefinition;
   indexById: { [key: string]: number };
   arrayEntriesOutput: Output;

   build(data: any, type: ArrayDefinition, attributes: { [key: string]: string }): void {
      this.attributes = attributes;
      if (Array.isArray(data)) {
         this.data = data;
      } else {
         this.data = [data];
      }
      this.views = [];
      this.indexById = {};
      this.entryType = type ? type.entryType : null
   }

   render(output: Output): void {
      output.printSection({ name: "array", attributes: this.attributes }, (attributes) => {
         this.arrayEntriesOutput = output.printDynamicSection({ name: "array-entries", attributes: attributes });
         if (Array.isArray(this.data)) {
            for (var index = 0; index < this.data.length; index++) {
               var entry = this.data[index];
               var view = this.arrayEntriesOutput.printArrayEntry(this, index, { class: "array-entry", deletable: true }, entry, this.entryType);
               this.indexById[view.getId()] = this.views.length;
               this.views.push(view);
            }
            this.arrayEntriesOutput.render();
         }

         output.printSection({ name: "array-buttons" }, () => {
            output.printButton({}, "+", () => {
               debugger;
               var index = this.data.length;
               var entry = {};
               this.data.push(entry);
               view = this.arrayEntriesOutput.printArrayEntry(this, index, { class: "array-entry", deletable: true }, entry, this.entryType);
               this.arrayEntriesOutput.append();

               this.indexById[view.getId()] = this.views.length;
               this.views.push(view);
            });
         });
      });
   }

   getValue(): any {
      var result = [];
      var container = this.arrayEntriesOutput.getOutputElt();
      var entryKeys = this.evalContext.theme.getArrayEntriesIndex(container);
      for (var key of entryKeys) {
         var index = this.indexById[key];
         var view = this.views[index];
         if (view) {
            result.push(view.getValue());
         } else result.push(this.data[index]);
      }
      return result;
   }
}

