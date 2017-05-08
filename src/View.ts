import { Output } from "./Output";
import { Type, ConstType } from "./Types";
import { Expression } from './Expression';
import { Eval } from "./Eval";
import { PrintArgs, ElementAttributes } from "./Theme";

export interface ViewParent {

}

export abstract class View<TValue, TType extends Type, TPrintArgs extends PrintArgs> {
	protected data: TValue;
	protected type: TType;
	public printArgs: TPrintArgs;

	private readonly id: string;
	protected abstract onRender(output: Output): void;
	abstract getValue(): TValue;
	private rendered = false;
	private validationStatus: ValidationStatus = ValidationStatus.none;
	private validationText: string;
	private description: string;

	constructor(protected evalContext: Eval, private parentView: ViewParent, name: string) {
		var prefix = ((this as object).constructor as any).name;
		this.id = evalContext.nextId(prefix);
	}

	public render(output: Output): void {
		this.onRender(output);
		this.rendered = true;
	}

	beforeBuild(data: TValue, type: TType, printArgs: TPrintArgs): void {
		this.type = type || {} as TType;
		if (this.type._kind === "const" && !this.data) {
			data = (this.type as ConstType).value;
		}
		this.data = (data === undefined) ? null : data;
		this.printArgs = printArgs || {} as TPrintArgs;
	}

	getParentView(): ViewParent {
		return this.parentView;
	}

	getId(): string {
		return this.id;
	}

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

	valueChanged() {
		//this.parentView.valueChanged();
	}
}

export const enum ValidationStatus {
	none,
	success,
	warning,
	danger
}

export class ViewFactory {

	constructor(private viewName: string, private viewConstructor: (parent: ViewParent, name: string) => AnyView) {

	}

	instantiateNewView(parent: ViewParent, name: string) {
		return this.viewConstructor(parent, name);
	}
}

export type AnyView = View<any, Type, PrintArgs>;
