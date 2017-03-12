import { View } from '../View';
import { TypeDefinition } from '../Types';
import { Output } from '../Output';

export class InputView extends View<any> {
    render(data: any, type: TypeDefinition, attributes: { [key: string]: string }, output: Output): void {
        if (data === undefined) data = "";
        if (typeof data !== 'string') data = JSON.stringify(data);
        attributes.type = "text";
        if (!data) data = "";
        attributes.value = data;
        output.printTag("input", attributes, null);
    }
}
