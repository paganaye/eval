import { View, ValidationStatus } from '../View';
import { Type, StringType, NumberType, BooleanType } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { PrintArgs, InputPrintArgs } from "../Theme";

export abstract class BaseInputView<TValue, TType extends Type> extends View<TValue, TType, InputPrintArgs> {
	kind: string;
	inputId: string;
	elt: HTMLInputElement;

	onRender(output: Output): void {
		if (this.data == null) this.data = "" as any;
		if (typeof this.data == "object") JSON.stringify(this.data);
		this.kind = (this.type && this.type._kind) || "string";
		this.inputId = this.evalContext.nextId(this.getTag());
		//this.setDescription(this.type.description);
		var dataType = this.type;
		output.printInput({ id: this.inputId }, this.data, dataType, (elt) => {
			this.elt = document.getElementById(this.inputId) as HTMLInputElement;
			if (this.elt) {
				this.elt.oninput = (e) => this.onInput(e);
				this.validate();
				this.valueChanged();
			}
			else {
				console.error("Cannot find input view control " + this.inputId);
			}
		});
	}

	onInput(e: Event) {
		this.validate();
		this.valueChanged();
	}

	protected abstract onValidate(value: TValue);

	protected validate() {
		var value: TValue = this.getValue();
		this.setValidationText(null)
		this.setValidationStatus(ValidationStatus.none);
		this.onValidate(value);
	}

	abstract getTag(): string;

	addValidationMessage(status: ValidationStatus, message: string) {
		var text = this.getValidationText();
		if (text) {
			text += "\n" + message;
		} else text = message;

		if (text) {
			this.setValidationStatus(ValidationStatus.warning);
			this.setValidationText(text);
		}
	}

	getValueString(): string {
		if (this.elt && this.elt instanceof HTMLInputElement) {
			var value = this.elt.value;
			return value;
		} else {
			throw "HTML Input " + this.inputId + " not found.";
		}
	}

	abstract getValue(): TValue;
}

export class StringInputView extends BaseInputView<string, StringType> {
	getTag() { return "string-input"; }

	onValidate(value: string) {
		if (this.type.validation) {
			for (var v of this.type.validation) {
				try {
					var reg = new RegExp(v.regexp);
					var res = reg.exec(value);
					if (!res || res[0] != value) {
						this.addValidationMessage(ValidationStatus.danger, v.message);
					}
				} catch (e) {
					console.error("Invalid Regex:", v, e);
				}
			}
		}
	}

	getValue(): string {
		return this.getValueString();
	}
}
View.registerViewFactory("string", () => new StringInputView());

export class NumberInputView extends BaseInputView<number, NumberType> {
	getTag() { return "number-input"; }

	onValidate(value: number) {
		if (typeof this.type.minimum === 'number' && typeof this.type.maximum === 'number') {
			if (value < this.type.minimum || value > this.type.maximum) {
				this.addValidationMessage(ValidationStatus.danger, "Should be between " + this.type.minimum + " and " + this.type.maximum);
			}
		}
		else if (typeof this.type.minimum === 'number') {
			if (value < this.type.minimum) {
				this.addValidationMessage(ValidationStatus.danger, "Should be bigger or equal to " + this.type.minimum);
			}
		}
		else if (typeof this.type.maximum === 'number') {
			if (value < this.type.minimum || value > this.type.maximum) {
				this.addValidationMessage(ValidationStatus.danger, "Should be less or equal to " + this.type.maximum);
			}
		}
	}

	getValue(): number {
		return parseInt(this.getValueString(), 10);
	}
}
View.registerViewFactory("number", () => new NumberInputView());


export class BooleanInputView extends BaseInputView<boolean, BooleanType> {
	getTag() { return "boolean-input"; }

	onValidate(value: boolean) {

	}

	getValue(): boolean {
		if (this.elt && this.elt instanceof HTMLInputElement) {
			var value = this.elt.checked;
			return value;
		} else {
			throw "HTML Checkbox " + this.inputId + " not found.";
		}
	}
}
View.registerViewFactory("boolean", () => new BooleanInputView());

export class TelInputView extends StringInputView {
	getTag() { return "tel-input"; }
}
View.registerViewFactory("tel", () => new TelInputView());

export class UrlInputView extends StringInputView {
	getTag() { return "url-input"; }
}
View.registerViewFactory("url", () => new UrlInputView());

export class DateTimeInputView extends StringInputView {
	getTag() { return "datetime-input"; }
}
View.registerViewFactory("datetime", () => new DateTimeInputView());

export class DateInputView extends StringInputView {
	getTag() { return "date-input"; }
}
View.registerViewFactory("date", () => new DateInputView());

export class TimeInputView extends StringInputView {
	getTag() { return "time-input"; }
}
View.registerViewFactory("time", () => new TimeInputView());

export class MonthInputView extends StringInputView {
	getTag() { return "month-input"; }
}
View.registerViewFactory("month", () => new MonthInputView());

export class WeekInputView extends StringInputView {
	getTag() { return "week-input"; }
}
View.registerViewFactory("Week", () => new WeekInputView());

export class ColorInputView extends StringInputView {
	getTag() { return "color-input"; }
}
View.registerViewFactory("color", () => new ColorInputView());

export class RangeInputView extends StringInputView {
	getTag() { return "range-input"; }
}
View.registerViewFactory("range", () => new RangeInputView());

export class PasswordInputView extends StringInputView {
	getTag() { return "password-input"; }
}
View.registerViewFactory("password", () => new PasswordInputView());
