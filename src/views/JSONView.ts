import { app } from '../App';
import { View } from '../View';
import { Output } from '../Output';
import { TypeDefinition } from '../Types';

export class JSONView extends View<any> {
   render(model: any, type: TypeDefinition, output: Output): void {
      var text = JSON.stringify(model);
      output.printText(text);
   }
}

//Docs.views["default"] = new DefaultView();