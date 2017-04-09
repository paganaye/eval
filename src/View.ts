import { Output } from "./Output";
import { Type, ConstType } from "./Types";
import { Expression } from './Expression';
import { Eval } from "./Eval";
import { ViewOptions, ElementAttributes } from "Theme";

export abstract class View<TValue, TType extends Type, TViewOptions extends ViewOptions> implements ViewOrElement {
    protected data: TValue; // stored data
    protected type: TType; // stored type
    public options: TViewOptions; // runtime extra stuff
    private readonly id: string;

    constructor(protected evalContext: Eval, private parentView: AnyView) {
        var prefix = ((this as object).constructor as any).name;
        this.id = evalContext.nextId(prefix);
    }

    beforeBuild(data: TValue, type: TType, options: TViewOptions): void {
        this.type = type || {} as TType;
        if (this.type._kind === "const" && !this.data) {
            data = (this.type as ConstType).value;
        }
        this.data = (data === undefined) ? null : data;
        this.options = options || {} as TViewOptions;
    }

    afterBuild(): void {
    }


    getId(): string { return this.id; }
    build(): void { } // overridable
    abstract render(output: Output): void;
    abstract getValue(): TValue;
    getParentView(): AnyView {
        return this.parentView;
    }

    getValidationStatus(): ValidationStatus {
        return ValidationStatus.success;
    }

    getValidationText(): string {
        return null;
    }

    getExampleText(): string {
        return null;
    }
}

const enum ValidationStatus {
    none,
    success,
    warning,
    danger
}

export class ViewFactory {

    constructor(private viewName: string, private viewConstructor: (parent: AnyView) => AnyView) {
    }

    instantiateNewView(parent: AnyView) {
        return this.viewConstructor(parent);
    }
}

export type AnyView = View<any, Type, ViewOptions>;

export interface ViewOrElement {
    getId(): string;
    render(output: Output): void;
    getParentView(): AnyView;
    getValidationStatus(): ValidationStatus;
}
