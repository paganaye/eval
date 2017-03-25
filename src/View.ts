import { Output } from "./Output";
import { Type } from "./Types";
import { Expression } from './Expression';
import { Eval } from "./Eval";
import { ElementAttributes, CssAttributes } from "Theme";

export abstract class View<TValue, TType extends Type, TElementAttributes extends ElementAttributes> implements ViewOrElement {
    protected data: TValue; // stored data
    protected type: TType; // stored type
    public attributes: TElementAttributes; // runtime extra stuff
    private readonly id: string;

    beforeBuild(data: TValue, type: TType, attributes: TElementAttributes): void {
        this.data = (data === undefined) ? null : data;
        this.type = type || {} as TType;
        this.attributes = attributes || {} as TElementAttributes;
        if (!this.attributes.cssAttributes) this.attributes.cssAttributes = {};
    }

    getCssAttributes(): CssAttributes {
        return this.attributes.cssAttributes || (this.attributes.cssAttributes = {});

    }

    constructor(protected evalContext: Eval) {
        var prefix = ((this as object).constructor as any).name;
        this.id = evalContext.nextId(prefix);
    }

    getId(): string { return this.id; }
    build(): void { } // overridable
    abstract render(output: Output): void;
    abstract getValue(): TValue;
}

export interface ViewOrElement {
    getId(): string;
    render(output: Output): void;
}
