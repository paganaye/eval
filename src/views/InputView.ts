import { View } from '../View';
import { Type } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { ViewOptions, InputOptions } from "Theme";

export class InputView extends View<any, any, InputOptions> {

    render(output: Output): void {
        // for simplicity we make the id of the input element identical to the id of the view.
        if (this.data == null) this.data = "";
        output.printInput({ id: this.getId() }, this.data, this.type);
    }

    getValue(): any {
        var elt = document.getElementById(this.getId());
        if (elt) {
            return (elt as HTMLInputElement).value;
        } else {
            return "HTML Element " + this.getId() + " not found.";
        }
    }
}
