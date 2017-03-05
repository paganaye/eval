import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition } from "../Types";

export class JSONView extends View<any> {
   render(expr: any, type: TypeDefinition, output: Output): void {
      var text = JSON.stringify(expr);
      output.printText(text);
   }
}

//Docs.views["default"] = new DefaultView();