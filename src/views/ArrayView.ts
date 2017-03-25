import { View } from "../View";
import { Output } from "../Output";
import { Type, ArrayDefinition, EnumEntry } from "../Types";
import { ArrayAttributes, ElementAttributes, CssAttributes, ArrayEntryAttributes } from "../Theme";

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
                  this.addOne(index, null)
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
                  this.addOne(null, str);
               });
            } else {
               output.printButton({ buttonText: "+" }, (ev: Event) => {
                  this.addOne(null, null);
               });
            }
         });
      });
   }

   addOne(index: number, type: String) {
      if (typeof index === "number") {
         var entry = this.data[index];
      } else {
         index = this.data.length;
         entry = {} as T;
         if (type) (entry as any).type = type;
         this.data.push(entry);
      }
      var id = this.evalContext.nextId("entry-");
      var attributes: ArrayEntryAttributes = { id: id, cssAttributes: { class: "array-entry" }, deletable: true, label: "#" + (this.views.length + 1), frozenDynamic: false };
      if (type) attributes.frozenDynamic = true;
      var view = this.arrayEntriesOutput.printArrayEntry(this, attributes, entry, this.entryType);

      this.indexById[id] = this.views.length;
      this.views.push(view);

      this.arrayEntriesOutput.append();
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

