import { View, ValidationStatus } from '../View';
import { Type, StringType, NumberType, BooleanType } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { PrintArgs, InputPrintArgs } from "../Theme";

export class TextAreaView extends View<string, Type, InputPrintArgs> {
	kind: string;
	id: string;
	elt: HTMLTextAreaElement;

	onRender(output: Output): void {
		if (this.data == null) this.data = "" as any;
		if (typeof this.data == "object") JSON.stringify(this.data);

		if (output.isEditMode()) {
			this.kind = (this.type && this.type._kind) || "string";
			this.id = this.evalContext.nextId("textarea");
			this.setDescription(this.type.description);
			var dataType = this.type;
			output.printAsync("textarea", { id: this.id, class: "form-control" }, this.data, (output) => {
				this.elt = output.getOutputElt() as HTMLTextAreaElement;
				if (this.elt) {
					this.elt.oninput = (e) => this.onInput(e);
					this.valueChanged();
				}
				else {
					console.error("Cannot find input view control " + this.id);
				}
			});
		} else {
			output.printTag("textarea", { class: "form-control", readonly: "readonly" }, this.data);
		}
	}

	onInput(e: Event) {
		this.valueChanged();
	}

	getValue(): string {
		if (this.elt && this.elt instanceof HTMLTextAreaElement) {
			var value = this.elt.value;
			return value;
		} else {
			throw "HTML TextArea " + this.id + " not found.";
		}
	}

}

export class PreFormattedView extends TextAreaView {
	onRender(output: Output): void {
		if (output.isEditMode()) {
			super.onRender(output);
		} else {
			output.printTag("pre", {}, this.data);
		}
	}
}

View.registerViewFactory("textarea", () => new TextAreaView());
View.registerViewFactory("pre", () => new PreFormattedView());
