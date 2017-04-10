import { Output } from "./Output";
import { Type, ConstType } from "./Types";
import { Expression } from './Expression';
import { Eval } from "./Eval";
import { ViewOptions, ElementAttributes } from "./Theme";

export abstract class View<TValue, TType extends Type, TViewOptions extends ViewOptions> {
    protected data: TValue; // stored data
    protected type: TType; // stored type
    public options: TViewOptions; // runtime extra stuff
    private readonly id: string;
    protected abstract internalRender(output: Output): void;
    abstract getValue(): TValue;
    private rendered = false

    private validationStatus: ValidationStatus = ValidationStatus.none;
    private validationText: string;
    private description: string;

    constructor(protected evalContext: Eval, private parentView: AnyView) {
        var prefix = ((this as object).constructor as any).name;
        this.id = evalContext.nextId(prefix);
    }

    public render(output: Output): void {
        this.internalRender(output);
        this.rendered = true;
    }

    beforeBuild(data: TValue, type: TType, options: TViewOptions): void {
        this.type = type || {} as TType;
        if (this.type._kind === "const" && !this.data) {
            data = (this.type as ConstType).value;
        }
        this.data = (data === undefined) ? null : data;
        this.options = options || {} as TViewOptions;
    }

    getParentView(): AnyView {
        return this.parentView;
    }

    getId(): string { return this.id; }
    build(): void { } // overridable

    getValidationStatus(): ValidationStatus {
        return this.validationStatus;
    }

    setValidationStatus(newStatus: ValidationStatus): void {
        if (this.validationStatus == newStatus) return;
        this.validationStatus = newStatus;
        if (this.rendered) {
            this.evalContext.theme.refreshView(this, { validationStatusChanged: true });
        }
    }

    getValidationText(): string {
        return this.validationText;
    }

    setValidationText(newValidationText: string): void {
        if (this.validationText == newValidationText) return;
        this.validationText = newValidationText;
        if (this.rendered) {
            this.evalContext.theme.refreshView(this, { validationTextChanged: true });
        }
    }

    getDescription(): string {
        return this.description;
    }

    setDescription(newDescription: string) {
        if (this.description == newDescription) return;
        this.description = newDescription;
        if (this.rendered) {
            this.evalContext.theme.refreshView(this, { descriptionChanged: true });
        }
    }
}

export const enum ValidationStatus {
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
