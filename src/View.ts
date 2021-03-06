import { Eval, VariableBag } from './Eval';
import { Output } from './Output';
import { PrintArgs } from './Theme';
import { ConstType, Type } from './Types';


export interface ViewParent {
	valueChanged(view: AnyView): void;
}

export abstract class View<TValue, TType extends Type, TPrintArgs extends PrintArgs>
	implements VariableBag {
	static viewFactories: { [key: string]: ViewFactory } = {};
	protected data: TValue;
	protected type: TType;
	public printArgs: TPrintArgs;

	protected id: string;
	protected abstract onRender(output: Output): void;
	abstract getValue(): TValue;
	private rendered = false;
	private validationStatus: ValidationStatus = ValidationStatus.none;
	private validationText: string;
	private description: string;
	public evalContext: Eval;
	public viewParent: ViewParent;
	public name: string;
	public childViews: AnyView[] = [];

	initialize(evalContext: Eval, viewParent: ViewParent, name: string) {
		this.evalContext = evalContext;
		this.viewParent = viewParent;
		this.name = name;

		if (viewParent instanceof View) {
			viewParent.childViews.push(this);
		}

		var prefix = ((this as object).constructor as any).name;
		this.id = evalContext.nextId(prefix);
	}

	public render(output: Output): void {
		this.onRender(output);
		this.rendered = true;
	}

	getVariable(name: string): any {
		return this.data[name];
	}

	setVariable(name: string, value: any): void {
		this.data[name] = value;
	}

	getView(): AnyView {
		return this;
	}

	beforeBuild(data: TValue, type: TType, printArgs: TPrintArgs): void {
		this.type = type || {} as TType;
		if (this.type._kind === "const" && !this.data) {
			data = (this.type as ConstType).value;
		}
		this.data = (data === undefined) ? null : data;
		this.printArgs = printArgs || {} as TPrintArgs;
	}

	getViewParent(): ViewParent {
		return this.viewParent;
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

	valueChanged(view?: AnyView) {
		if (this.viewParent) {
			this.viewParent.valueChanged(view || this);
		}
	}

	public static registerViewFactory(viewName: string, viewConstructor: () => AnyView): ViewFactory {
		return (View.viewFactories[viewName] = new ViewFactory(viewName, viewConstructor));

	}

	public static getViewFactory(viewName: string): ViewFactory {
		return View.viewFactories[viewName];
	}

	getRootView(): AnyView {
		if (this.viewParent && this.viewParent instanceof View) {
			return this.viewParent.getRootView();
		}
		return this;
	}

	log(prefix = "") {
		console.log(prefix + this.name + " " + this.id);
		for (var c of this.childViews) {
			c.log(prefix + "   ");
		}
	}

	getData(path: string[], expectedType: string): any {
		if (path.length == 0) return this.getValue();

		var first = path[0];
		path.shift();
		switch (first) {
			case "..":
				var viewParent = this.getViewParent();
				while (viewParent != null) {
					if (viewParent instanceof View) {
						if (viewParent.hasProperties()) {
							return viewParent.getData(path, expectedType);
						}
						else viewParent = viewParent.getViewParent();
					}
					else return null;
				}
			default:
				var childView = this.getChildView(first);
				if (childView) {
					return childView.getData(path);
				} else return null;
		}
	}

	hasProperties(): boolean { return false; }
	getChildView(childName: string) {
		return null;
	}

	showDialog(tab: string) {
		if (this.viewParent instanceof View) {
			this.viewParent.showDialog(tab);
		}
		else alert("Tab " + tab + " not found");
	}

	toString() {
		return JSON.stringify(this.data);
	}


}

export const enum ValidationStatus {
	none,
	success,
	warning,
	danger
}

export class ViewFactory {

	constructor(private viewName: string, private viewConstructor: () => AnyView) {

	}

	instantiateNewView(evalContext: Eval, parent: ViewParent, name: string): AnyView {
		var result = this.viewConstructor();
		result.initialize(evalContext, parent, name);
		return result;
	}
}

export type AnyView = View<any, Type, PrintArgs>;


