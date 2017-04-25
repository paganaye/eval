import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type, ArrayType, EnumEntry, VariantObject, ObjectType } from "../Types";
import { ArrayOptions, ViewOptions, ElementAttributes, ArrayEntryOptions } from "../Theme";
import { Parser } from "../Parser";

export class ArrayView<T> extends View<any, ArrayType<T>, ArrayOptions>
{
   data: any[];
   views: AnyView[];
   entryType: Type;
   indexById: { [key: string]: number };
   arrayEntriesOutput: Output;
   entriesElementId: string;

   build(): void {
      if (!Array.isArray(this.data)) {
         this.data = this.data == null ? [] : [this.data];
      }
      this.views = [];
      this.indexById = {};
      this.entryType = this.type.entryType
      this.entriesElementId = this.evalContext.nextId("entries");

   }

   onRender(output: Output): void {
      output.printSection({ name: "array" }, (options) => {


         output.printAsync("div", { class: "array-entries", id: this.entriesElementId }, "...", (elt, output) => {
            //    printContent(output, { class: "gosh" });
            this.arrayEntriesOutput = output;

            if (Array.isArray(this.data)) {
               var firstActive = true;
               for (var index = 0; index < this.data.length; index++) {
                  this.addOne(index, null, firstActive);
                  firstActive = false;
               }
            }

            this.arrayEntriesOutput.domReplace();


            var Sortable = (window as any).Sortable;
            var sortable = Sortable.create(elt, {
               animation: 200,
               handle: ".sort-handle"
            });
         });
         output.printSection({ name: "array-buttons" }, (options) => {
            // we won't use HTML tables because sorting does not work well on table.
            // we don't use the bootstrap pager because sorting is hard with a pager and it look crap on mobile

            if (this.entryType._kind == "variant") {
               var entries: EnumEntry[] = [];
               for (var entry of this.entryType.kinds) {
                  entries.push({ key: entry.key, label: entry.label || entry.key });
               }
               output.printButtonGroup({
                  buttonText: "Add",
                  entries: entries
               }, (ev, str) => {
                  this.addOne(null, str, true);
                  this.arrayEntriesOutput.domAppend();
               });
            } else {
               output.printButton({ buttonText: "+" }, (ev: Event) => {
                  this.addOne(null, null, true);
                  this.arrayEntriesOutput.domAppend();
               });
            }
         });
      });

   }

   addOne(index: number, kind: string, active: boolean) {
      if (typeof index === "number") {
         var entry = this.data[index];
      } else {
         index = this.data.length;
         entry = this.evalContext.newInstance(this.entryType);
         if (kind) (entry as VariantObject)._kind = kind;
         this.data.push(entry);
      }
      var id = this.evalContext.nextId("entry");

      var label = this.entryType.template;
      if (label) {
         //TODO: evaluate expression here...
         var parser = new Parser(this.evalContext);
         this.evalContext.globalVariables = entry;
         var expr = parser.parseTemplate(label);
         label = expr.getValue(this.evalContext);
      }
      else {
         label = "#" + (this.views.length + 1);
      }


      var options: ArrayEntryOptions = {
         id: id, deletable: true, label: label, frozenDynamic: false,
         entriesElementId: this.entriesElementId,
         active: active
      };
      if (kind) options.frozenDynamic = true;
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
         var value: any;
         if (view) {
            value = view.getValue();
         } else value = this.data[index];
         result.push(this.evalContext.fixValue(value));
      }
      return result;
   }
}

