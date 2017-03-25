import { View } from "../View";
import { Output } from "../Output";
import { Type, ArrayDefinition, EnumEntry } from "../Types";
import { ArrayAttributes, ElementAttributes, CssAttributes } from "../Theme";

export class ArrayView<T> extends View<any, ArrayDefinition<T>, ArrayAttributes>
{
   data: any[];
   views: View<any, Type, ElementAttributes>[];
   entryType: Type;
   indexById: { [key: string]: number };
   arrayEntriesOutput: Output;

   build(): void {
      if (!Array.isArray(this.data)) {
         this.data = [this.data];
      }
      this.views = [];
      this.indexById = {};
      this.entryType = this.type.entryType
   }

   render(output: Output): void {
      output.printSection({ name: "array", cssAttributes: this.getCssAttributes() }, (attributes) => {
         var cssAttributes: CssAttributes = attributes.cssAttributes || {};
         output.printSectionAsync({ name: "array-entries", cssAttributes: cssAttributes }, (elt) => {
            this.arrayEntriesOutput = new Output(this.evalContext, elt, output);
            if (Array.isArray(this.data)) {
               for (var index = 0; index < this.data.length; index++) {
                  var entry = this.data[index];
                  var view = this.arrayEntriesOutput.printArrayEntry(this, index, { cssAttributes: { class: "array-entry" }, deletable: true }, entry, this.entryType);
                  this.indexById[view.getId()] = this.views.length;
                  this.views.push(view);
               }
            }
            this.arrayEntriesOutput.render();
         });

         output.printSection({ name: "array-buttons" }, () => {
            if (this.entryType.type == "dynamic") {
               var entries: EnumEntry[] = [];
               for (var entry of this.entryType.entries) {
                  //var entry = this.entryType.entries[entryKey];
                  entries.push({ key: entry.key, label: entry.label || entry.key });
               }
               output.printButtonGroup({
                  buttonText: "Add",
                  entries: entries
               }, (ev, str) => {
                  this.addOne(str);
               });
            } else {
               output.printButton({ buttonText: "+" }, (ev: Event) => {
                  this.addOne(null);
               });
            }
         });
      });
   }

   addOne(type: String) {
      var index = this.data.length;
      var entry: T = null;
      if (type) entry = { type: type } as any as T;

      this.data.push(entry);
      var attributes: ArrayAttributes = { cssAttributes: { class: "array-entry" }, deletable: true };
      if (type) attributes.frozenDynamic = true;
      var view = this.arrayEntriesOutput.printArrayEntry(this, index, attributes, entry, this.entryType);

      this.indexById[view.getId()] = this.views.length;
      this.views.push(view);

      this.arrayEntriesOutput.append();
   }

   getValue(): any {
      var result = [];
      //var container = this.arrayEntriesOutput.getOutputElt();
      //var entryKeys = this.evalContext.theme.getArrayEntriesIndex(container);
      // for (var key of entryKeys) {
      //    var index = this.indexById[key];
      //    var view = this.views[index];
      //    if (view) {
      //       result.push(view.getValue());
      //    } else result.push(this.data[index]);
      // }
      return result;
   }
}

