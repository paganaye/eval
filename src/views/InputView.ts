import { View, ValidationStatus } from '../View';
import { Type, StringType, NumberType, BooleanType } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { ViewOptions, InputOptions } from "../Theme";

export abstract class BaseInputView<TValue, TType extends Type> extends View<TValue, TType, InputOptions> {
    kind: string;
    inputId: string;
    elt: HTMLInputElement;

    onRender(output: Output): void {
        if (this.data == null) this.data = "" as any;
        this.kind = (this.type && this.type._kind) || "string";
        this.inputId = this.evalContext.nextId(this.getTag());
        this.setDescription(this.type.description);
        var dataType = this.type;
        output.printInput({ id: this.inputId }, this.data, dataType, (elt) => {
            this.elt = document.getElementById(this.inputId) as HTMLInputElement;
            this.elt.oninput = (e) => this.onInput(e);
            this.validate();
        });
    }

    onInput(e: Event) {
        this.validate();
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
            return this.elt.value;
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

export class BooleanInputView extends BaseInputView<boolean, BooleanType> {
    getTag() { return "boolean-input"; }

    onValidate(value: boolean) {

    }

    getValue(): boolean {
        return !!(this.getValueString());
    }
}

export class TelInputView extends StringInputView {
    getTag() { return "tel-input"; }
}

export class UrlInputView extends StringInputView {
    getTag() { return "url-input"; }
}

export class DateTimeInputView extends StringInputView {
    getTag() { return "datetime-input"; }
}

export class DateInputView extends StringInputView {
    getTag() { return "date-input"; }
}

export class TimeInputView extends StringInputView {
    getTag() { return "time-input"; }
}

export class MonthInputView extends StringInputView {
    getTag() { return "month-input"; }
}

export class WeekInputView extends StringInputView {
    getTag() { return "week-input"; }
}

export class ColorInputView extends StringInputView {
    getTag() { return "color-input"; }
}

export class RangeInputView extends StringInputView {
    getTag() { return "range-input"; }
}

export class PasswordInputView extends StringInputView {
    getTag() { return "password-input"; }
}
