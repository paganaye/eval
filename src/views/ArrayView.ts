import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type, ArrayType, EnumEntry, VariantObject } from "../Types";
import { ArrayOptions, ViewOptions, ElementAttributes, ArrayEntryOptions } from "../Theme";

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
               for (var index = 0; index < this.data.length; index++) {
                  this.addOne(index, null)
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

            // output.printHTML('<nav aria-label="Page navigation">');
            // output.printHTML('  <ul class="pagination">');
            // output.printHTML('    <li class="page-item"><a class="page-link" href="#">Previous</a></li>');
            // output.printHTML('    <li class="page-item"><a class="page-link" href="#">1</a></li>');
            // output.printHTML('    <li class="page-item"><a class="page-link" href="#">2</a></li>');
            // output.printHTML('    <li class="page-item"><a class="page-link" href="#">3</a></li>');
            // output.printHTML('    <li class="page-item"><a class="page-link" href="#">4</a></li>');
            // output.printHTML('    <li class="page-item"><a class="page-link" href="#">5</a></li>');
            // output.printHTML('    <li class="page-item"><a class="page-link" href="#">Next</a></li>');
            // output.printHTML('  </ul>');
            // output.printHTML('</nav>');
            // output.printHTML('<table class="table">');
            // output.printHTML('  <thead>');
            // output.printHTML('    <tr>');
            // output.printHTML('      <th>#</th>');
            // output.printHTML('      <th>First Name</th>');
            // output.printHTML('      <th>Last Name</th>');
            // output.printHTML('      <th>Username</th>');
            // output.printHTML('    </tr>');
            // output.printHTML('  </thead>');
            // output.printHTML('  <tbody>');
            // output.printHTML('    <tr>');
            // output.printHTML('      <th scope="row">1</th>');
            // output.printHTML('      <td>Mark</td>');
            // output.printHTML('      <td>Otto</td>');
            // output.printHTML('      <td>@mdo</td>');
            // output.printHTML('    </tr>');
            // output.printHTML('    <tr>');
            // output.printHTML('      <th scope="row">2</th>');
            // output.printHTML('      <td>Jacob</td>');
            // output.printHTML('      <td>Thornton</td>');
            // output.printHTML('      <td>@fat</td>');
            // output.printHTML('    </tr>');
            // output.printHTML('    <tr>');
            // output.printHTML('      <th scope="row">3</th>');
            // output.printHTML('      <td>Larry</td>');
            // output.printHTML('      <td>the Bird</td>');
            // output.printHTML('      <td>@twitter</td>');
            // output.printHTML('    </tr>');
            // output.printHTML('  </tbody>');
            // output.printHTML('</table>');


            if (this.entryType._kind == "variant") {
               var entries: EnumEntry[] = [];
               for (var entry of this.entryType.kinds) {
                  entries.push({ key: entry.key, label: entry.label || entry.key });
               }
               output.printButtonGroup({
                  buttonText: "Add",
                  entries: entries
               }, (ev, str) => {
                  this.addOne(null, str);
                  this.arrayEntriesOutput.domAppend();
               });
            } else {
               output.printButton({ buttonText: "+" }, (ev: Event) => {
                  this.addOne(null, null);
                  this.arrayEntriesOutput.domAppend();
               });
            }
         });
      });

   }

   addOne(index: number, kind: string) {
      if (typeof index === "number") {
         var entry = this.data[index];
      } else {
         index = this.data.length;
         entry = {} as T;
         if (kind) (entry as VariantObject)._kind = kind;
         this.data.push(entry);
      }
      var id = this.evalContext.nextId("entry-");
      var options: ArrayEntryOptions = {
         id: id, deletable: true, label: "#" + (this.views.length + 1), frozenDynamic: false,
         entriesElementId: this.entriesElementId
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
         if (view) {
            result.push(view.getValue());
         } else result.push(this.data[index]);
      }
      return result;
   }
}

