import { View, AnyView } from '../View';
import { Type, SelectEntry, SelectType, VariantType, VariantObject, VariantKind, ObjectType, Visibility } from '../Types';
import { Output } from '../Output';
import { Eval } from "../Eval";
import { SelectPrintArgs, PrintArgs, VariantPrintArgs, PropertyPrintArgs } from "../Theme";

export class VariantView extends View<VariantObject, VariantType, VariantPrintArgs> {
	innertype: Type;
	kind: string;
	targetOutput: Output;
	entriesByKey: { [key: string]: VariantKind } = {};
	innerView: AnyView

	build(): void {
		for (var e of this.type.kinds) {
			this.entriesByKey[e.key] = e;
		}
		var data = this.data;
		if (data === null) data = { _kind: "object" };
		this.kind = (typeof data === "object" ? data._kind || "object" : typeof data);
	}

	onRender(output: Output): void {
		var variantKinds: VariantKind[] = this.type.kinds;
		var printArgs: PropertyPrintArgs = { visibility: "visible", description: "" };
		var id: string = this.evalContext.nextId("select");

		output.printSection({ name: "variant-select-container" }, (printArgs) => {
			if (this.type.fixedType) {
				output.printTag("div", {}, (this.data as ObjectType)._kind as string);
			}
			else {
				this.kind = this.evalContext.findEntry(variantKinds, this.kind);
				output.printSelect(null, { entries: variantKinds, id: id }, this.kind, this.type,
					(kind) => this.selectionChanged(kind));
			}
		});
		output.printAsync("div", {}, "...6", (output) => {
			this.targetOutput = output;
			this.selectionChanged(this.kind);
			// output.domReplace(); is done inside selectionChanged
		});
	}

	selectionChanged(kind: string) {
		this.kind = kind;
		var entry = this.entriesByKey[kind];
		if (entry) {
			var innerView = this.evalContext.instantiate(this,
				"variantInnerView",
				this.data,
				entry.type,
				this.targetOutput.getRenderMode(), {});
			innerView.render(this.targetOutput);
			this.innerView = innerView;
			this.targetOutput.domReplace();
		}
	}

	getValue(): any {
		var result = this.innerView.getValue();
		if (typeof result === 'object') {
			(result as VariantObject)._kind = this.kind;
		}
		return result;
	}
}
View.registerViewFactory("variant", () => new VariantView());
