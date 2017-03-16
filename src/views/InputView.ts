import { View } from '../View';
import { TypeDefinition } from '../Types';
import { Output } from '../Output';
import { Type } from "typescript/lib/typescript";

export class InputView extends View<any> {
    attributes: any;
    data: any;
    type: TypeDefinition;
    id: string;

    build(data: any, type: TypeDefinition, attributes: { [key: string]: string }): void {
        if (data === undefined) data = "";
        if (typeof data !== 'string') data = JSON.stringify(data);
        if (!data) data = "";

        this.attributes = attributes;
        this.data = data;
        this.type = type;
    }

    render(output: Output): void {
        this.id = this.evalContext.nextId();
        output.printInput({ attributes: this.attributes, id: this.id }, this.data, this.type);
    }

    getValue(): any {
        var elt = document.getElementById(this.id);
        return (elt as HTMLInputElement).value;
    }
}
