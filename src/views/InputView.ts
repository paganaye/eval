import { View } from '../View';
import { TypeDefinition } from '../Types';
import { Output } from '../Output';
import { Type } from "typescript/lib/typescript";

export class InputView extends View<any> {
    attributes: any;
    data: any;
    type: TypeDefinition;
    
    build(data: any, type: TypeDefinition, attributes: { [key: string]: string }): void {
        if (data === undefined) data = "";
        if (typeof data !== 'string') data = JSON.stringify(data);
        if (!data) data = "";

        this.attributes = attributes;
        this.data = data;
        this.type = type;
    }

    render(output: Output): void {
        output.printInput({ attributes: this.attributes }, this.data, this.type);
    }
}
