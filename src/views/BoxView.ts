import { View } from "../View";
import { Output } from "../Output";
import { Type } from "../Types";
import { ElementAttributes } from "Theme";

export class BoxView extends View<any, Type, ElementAttributes> {

   build(): void {
   }

   render(output: Output): void {
      output.printStartTag("span", this.getCssAttributes());
      output.printText("Todo");
      output.printEndTag();

   }

   getValue(): any {
      return this.data;
   }
}
