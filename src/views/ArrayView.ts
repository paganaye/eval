import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type, ArrayDefinition, EnumEntry } from "../Types";
import { ArrayOptions, ViewOptions, ElementAttributes, ArrayEntryOptions } from "../Theme";

export class ArrayView<T> extends View<any, ArrayDefinition<T>, ArrayOptions>
{
   data: any[];
   views: AnyView[];
   entryType: Type;
   indexById: { [key: string]: number };
   arrayEntriesOutput: Output;

   build(): void {
      if (!Array.isArray(this.data)) {
         this.data = this.data == null ? [] : [this.data];
      }
      this.views = [];
      this.indexById = {};
      this.entryType = this.type.entryType
   }

   render(output: Output): void {
      output.printSection({ name: "array" }, (options) => {
         output.printAsync("div", { class: "array-entries" }, "...", (elt, output) => {
            //    printContent(output, { class: "gosh" });
            this.arrayEntriesOutput = output;

            if (Array.isArray(this.data)) {
               for (var index = 0; index < this.data.length; index++) {
                  this.addOne(index, null)
               }
            }

            this.arrayEntriesOutput.render();


            var Sortable = (window as any).Sortable;
            var sortable = Sortable.create(elt, {
               animation: 200
            });
         });
         output.printSection({ name: "array-buttons" }, (options) => {
            if (this.entryType.type == "dynamic") {
               var entries: EnumEntry[] = [];
               for (var entry of this.entryType.entries) {
                  entries.push({ key: entry.key, label: entry.label || entry.key });
               }
               output.printButtonGroup({
                  buttonText: "Add",
                  entries: entries
               }, (ev, str) => {
                  this.addOne(null, str);
                  this.arrayEntriesOutput.append();
               });
            } else {
               output.printButton({ buttonText: "+" }, (ev: Event) => {
                  this.addOne(null, null);
                  this.arrayEntriesOutput.append();
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
      var options: ArrayEntryOptions = { id: id, deletable: true, label: "#" + (this.views.length + 1), frozenDynamic: false };
      if (type) options.frozenDynamic = true;
      var view = this.arrayEntriesOutput.printArrayEntry(this, options, entry, this.entryType);

      this.indexById[id] = this.views.length;
      this.views.push(view);
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

