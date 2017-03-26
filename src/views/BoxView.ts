import { View, AnyView } from "../View";
import { Output } from "../Output";
import { Type } from "../Types";
import { ViewOptions } from "Theme";

export class BoxView extends View<any, Type, ViewOptions> {

   build(): void {
   }

   render(output: Output): void {
      output.printStartTag("span", {});
      output.printText("Todo");
      output.printEndTag();

   }

   getValue(): any {
      return this.data;
   }
}
