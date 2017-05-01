import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type } from "../Types";
import { PrintArgs } from "../Theme";

export class BoxView extends View<any, Type, PrintArgs> {

   build(): void {
   }

   onRender(output: Output): void {
      output.printStartTag("span", {});
      output.printText("Todo");
      output.printEndTag();

   }

   getValue(): any {
      return this.data;
   }
}
