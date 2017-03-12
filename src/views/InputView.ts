import { View } from '../View';
import { TypeDefinition } from '../Types';
import { Output } from '../Output';
import { Type } from "typescript/lib/typescript";

export class InputView extends View<any> {
    render(data: any, type: TypeDefinition, attributes: { [key: string]: string }, output: Output): void {
        if (data === undefined) data = "";
        if (typeof data !== 'string') data = JSON.stringify(data);        
        if (!data) data = "";
        output.printInput({ attributes: attributes }, data, type);
    }
}
