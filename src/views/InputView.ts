import { View } from '../View';
import { Type } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { ViewOptions, InputOptions } from "Theme";

export class InputView extends View<any, any, InputOptions> {
    kind: string;

    render(output: Output): void {
        // for simplicity we make the id of the input element identical to the id of the view.
        if (this.data == null) this.data = "";
        console.log("inputView::render", this.getId(), this.data, this.type);
        this.kind = (this.type && this.type._kind) || "string";

        switch (this.kind) {
            case "const":
                output.printText(JSON.stringify(this.type.value));
                break;
            default:
                output.printInput({ id: this.getId() }, this.data, this.type);
                break;
        }

    }

    getValue(): any {
        switch (this.kind) {
            case "const":
                return this.type.value;
            default:
                var elt = document.getElementById(this.getId());
                if (elt) {
                    return (elt as HTMLInputElement).value;
                } else {
                    return "HTML Element " + this.getId() + " not found.";
                }
        }
    }
}
