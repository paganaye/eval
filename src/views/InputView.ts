import { View } from '../View';
import { Type } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { ViewOptions, InputOptions } from "../Theme";

export class InputView extends View<any, any, InputOptions> {
    kind: string;
    inputId: string;
    elt: HTMLInputElement;

    internalRender(output: Output): void {
        if (this.data == null) this.data = "";
        console.log("inputView::render", this.getId(), this.data, this.type);
        this.kind = (this.type && this.type._kind) || "string";
        this.inputId = this.evalContext.nextId("input");
        this.setDescription(this.type.description);
        output.printInput({ id: this.inputId }, this.data, this.type, (elt) => {
            this.elt = document.getElementById(this.inputId) as HTMLInputElement;
            this.elt.onchange = (e) => this.onChange(e);
            this.elt.onkeypress = (e) => this.onChange(e);
        });
    }


    onChange(e: Event) {
        this.validate(this.getValue());
    }

    validate(value: any) {
        this.setValidationText(new Date().toString());
    }

    getValue(): any {
        if (this.elt && this.elt instanceof HTMLInputElement) {
            return this.elt.value;
        } else {
            return "HTML Input " + this.inputId + " not found.";
        }
    }
}
