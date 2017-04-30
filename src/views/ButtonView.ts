import { View } from "../View";
import { Output } from "../Output";
import { Type, ButtonType } from "../Types";
import { ViewOptions, ButtonOptions } from "../Theme";

export class ButtonView extends View<boolean, ButtonType, ButtonOptions> {
   data: any;
   text: string;

   build(): void {
   }

   onRender(output: Output): void {
      var options = { buttonText: this.type.text };
      output.printButton(options, (ev) => {
         console.log("Run process", this.type.process);
      });
   }

   getValue(): any {
      return null;
   }
}
