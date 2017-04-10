import { View, ValidationStatus } from '../View';
import { Type, StringType, NumberType, BooleanType } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { ViewOptions, InputOptions } from "../Theme";

export abstract class BaseInputView<TValue, TType extends Type> extends View<TValue, TType, InputOptions> {
    kind: string;
    inputId: string;
    elt: HTMLInputElement;

    internalRender(output: Output): void {
        if (this.data == null) this.data = "" as any;
        console.log("inputView::render", this.getId(), this.data, this.type);
        this.kind = (this.type && this.type._kind) || "string";
        this.inputId = this.evalContext.nextId(this.getTag());
        this.setDescription(this.type.description);
        output.printInput({ id: this.inputId }, this.data, this.type, (elt) => {
            this.elt = document.getElementById(this.inputId) as HTMLInputElement;
            this.elt.oninput = (e) => this.onInput(e);
        });
    }

    onInput(e: Event) {
        this.validate(this.getValue());
    }

    protected abstract onValidate(value: TValue);

    protected validate(value: TValue) {
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

    getValue(): TValue {
        if (this.elt && this.elt instanceof HTMLInputElement) {
            return this.elt.value as any as TValue;
        } else {
            throw "HTML Input " + this.inputId + " not found.";
        }
    }
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
}

export class NumberInputView extends BaseInputView<number, NumberType> {
    getTag() { return "number-input"; }

    onValidate(value: number) {
        if (typeof this.type.minimalValue === 'number' && typeof this.type.maximalValue === 'number') {
            if (value < this.type.minimalValue || value > this.type.maximalValue) {
                this.addValidationMessage(ValidationStatus.danger, "Should be between " + this.type.minimalValue + " and " + this.type.maximalValue);
            }
        }
        else if (typeof this.type.minimalValue === 'number') {
            if (value < this.type.minimalValue) {
                this.addValidationMessage(ValidationStatus.danger, "Should be bigger or equal to " + this.type.minimalValue);
            }
        }
        else if (typeof this.type.maximalValue === 'number') {
            if (value < this.type.minimalValue || value > this.type.maximalValue) {
                this.addValidationMessage(ValidationStatus.danger, "Should be less or equal to " + this.type.maximalValue);
            }
        }
    }
}

export class BooleanInputView extends BaseInputView<boolean, BooleanType> {
    getTag() { return "boolean-input"; }

    onValidate(value: boolean) {

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
