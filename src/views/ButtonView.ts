import { View } from "../View";
import { Output } from "../Output";
import { Type, ButtonType } from "../Types";
import { PrintArgs, ButtonPrintArgs } from "../Theme";

export class ButtonView extends View<boolean, ButtonType, ButtonPrintArgs> {
   data: any;
   text: string;

   build(): void {
   }

   onRender(output: Output): void {
      var printArgs = { buttonText: this.type.text };
      output.printButton(printArgs, (ev) => {
         console.log("Run process", this.type.process);
      });
   }

   getValue(): any {
      return null;
   }
}
