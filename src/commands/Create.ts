import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type, Visibility } from '../Types';
import { Output, RenderMode } from "../Output";
import { View, AnyView, ValidationStatus } from "../View";
import { PrintArgs } from "../Theme";
import { Update } from "../commands/Update";
import { StringInputView } from "../views/InputView";

export class Create extends Command {
	recordIdView: StringInputView;
	innerView: AnyView;
	pageName: string;
	recordId: string;
	path: string;
	saveButtonId: string;

	initialize(evalContext: Eval) {
		super.initialize(evalContext)
		this.saveButtonId = evalContext.nextId("save-btn");
	}

	valueChangedTimer: any;

	valueChanged(view: AnyView): void {
		switch (view.name) {
			case "pageName":
				this.onPageNameChanged();
				break;
		}
	}

	onPageNameChanged() {
		var saveBtn = document.getElementById(this.saveButtonId) as HTMLInputElement;

		if (!this.recordIdView) {
			return;
		}
		this.recordId = this.recordIdView.getValue() as string;
		this.path = null;
		if (this.valueChangedTimer) clearTimeout(this.valueChangedTimer);

		this.valueChangedTimer = setTimeout(() => {
			this.valueChangedTimer = null;
			if (!this.pageName) {
				this.recordIdView.addValidationMessage(ValidationStatus.danger, "Page type is mandatory");
			}
			else if (!this.recordId) {
				this.recordIdView.addValidationMessage(ValidationStatus.danger, "Page name is mandatory");
			} else {
				var path = "eval/" + this.pageName + "/" + this.recordId;
				this.evalContext.database.on(path, (data, error) => {
					if (data == null) {
						// not found
						this.path = path;
						if (saveBtn) saveBtn.disabled = false;
					} else {
						// page already exists						
						if (saveBtn) saveBtn.disabled = true;
						this.recordIdView.addValidationMessage(ValidationStatus.danger, "Page already exists");
					}
				});
			}
		}, 250);
	}

	run(output: Output) {
		this.pageName = (this.pageName || "").toLowerCase();

		output.printAsync("div", {}, "Creating " + this.pageName + " page...", (output) => {
			output.setRenderMode(RenderMode.Edit);
			this.recordIdView = <StringInputView>output.printProperty(this, { visibility: "visible", label: "pageName", description: "" }, "", { _kind: "string" });
			// output2.printInput({ id: "recordId" }, "", , (elt) => { });
			output.printHTML("<hr/>");

			this.evalContext.getPageType(this.pageName, (type) => {
				// 	output2.setEditMode(true);
				// 	var isNew: boolean = (data === null);
				// 	if (isNew) {
				var data = this.evalContext.newInstance(type);
				//isNew = true;
				// 	}
				this.innerView = this.evalContext.instantiate(this, "update::", data, type, RenderMode.Edit);
				this.innerView.render(output);
				output.printSection({ name: "update" }, (printArgs) => {
					output.printButton({ buttonText: "Cancel" }, () => {
						window.location.hash = "#" + this.pageName;
					});
					output.printHTML("&nbsp;");

					output.printButton({ id: this.saveButtonId, buttonText: "Save" }, () => {
						this.evalContext.saveRecord(this.pageName, this.recordId, this.innerView.getValue());
						window.location.hash = "#" + this.pageName;
					});
				});
				output.domReplace();
			});
		});

	}
}
Command.registerCommand("create", {
	getNew: () => new Create(),
	description: new CommandDescription()
		.addParameter("pageName", "stringOrVariableName")
		.addParameter("for", "string", { mustBeNamed: true })
});

