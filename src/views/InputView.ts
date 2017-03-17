import { View } from '../View';
import { TypeDefinition } from '../Types';
import { Output } from '../Output';
import { Type } from "typescript/lib/typescript";
import { Eval } from "../Eval";

export class InputView extends View<any> {
    attributes: any;
    data: any;
    type: TypeDefinition;

    build(data: any, type: TypeDefinition, attributes: { [key: string]: string }): void {
        if (data === undefined) data = "";
        if (typeof data !== 'string') data = JSON.stringify(data);
        if (!data) data = "";

        this.attributes = attributes || {};
        this.data = data;
        this.type = type;
    }

    render(output: Output): void {
        output.printInput({ attributes: this.attributes, id: this.attributes.id }, this.data, this.type);
    }

    getValue(): any {
        var elt = document.getElementById(this.attributes.id);
        if (elt) {
            return (elt as HTMLInputElement).value;
        } else {
            return this.attributes.id + " not found.";
        }
    }
}
