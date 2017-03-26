import { Output } from "./Output";
import { Type } from "./Types";
import { Expression } from './Expression';
import { Eval } from "./Eval";
import { ViewOptions, ElementAttributes } from "Theme";

export abstract class View<TValue, TType extends Type, TViewOptions extends ViewOptions> implements ViewOrElement {
    protected data: TValue; // stored data
    protected type: TType; // stored type
    public options: TViewOptions; // runtime extra stuff
    private readonly id: string;
    parentView: View<any, Type, ViewOptions>;

    beforeBuild(data: TValue, type: TType, options: TViewOptions): void {
        this.data = (data === undefined) ? null : data;
        this.type = type || {} as TType;
        this.options = options || {} as TViewOptions;
    }

    constructor(protected evalContext: Eval) {
        var prefix = ((this as object).constructor as any).name;
        this.id = evalContext.nextId(prefix);
    }

    getId(): string { return this.id; }
    build(): void { } // overridable
    abstract render(output: Output): void;
    abstract getValue(): TValue;
    getParentView(): View<any, Type, ViewOptions> {
        return this.parentView;
    }
}

export interface ViewOrElement {
    getId(): string;
    render(output: Output): void;
    getParentView(): View<any, Type, ViewOptions>;
}
