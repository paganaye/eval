import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type, Visibility } from '../Types';
import { Output } from "../Output";
import { View, AnyView } from "../View";
import { PrintArgs } from "../Theme";
import { Update } from "../commands/Update";

export class Create extends Command {
	recordIdView: AnyView;
	pageName: string;
	recordId: string;

	constructor(evalContext: Eval) {
		super(evalContext);
	}

	valueChangedTimer: NodeJS.Timer;

	valueChanged(view: AnyView): void {
		if (!this.recordIdView) return;
		this.recordId = this.recordIdView.getValue() as string;

		if (this.valueChangedTimer) clearTimeout(this.valueChangedTimer);
		this.valueChangedTimer = setTimeout(() => {
			this.valueChangedTimer = null;
			if (this.pageName) {
				var path = "eval/" + this.pageName + "/" + this.recordId;
				this.evalContext.database.on(path, (data, error) => {
					if (data == null) {
						// not found
					} else {
						// page already exists
					}
				});
			}
		}, 500);
	}

	getDescription(): CommandDescription {
		return new CommandDescription()
			.addParameter("pageName", "stringOrVariableName");
	}

	run(output: Output) {
		this.pageName = (this.pageName || "").toLowerCase();

		output.printAsync("div", {}, "Creating " + this.pageName + " page...", (elt, output2) => {
			output2.setEditMode(true);
			this.recordIdView = output2.printProperty(this, { visibility: Visibility.Shown, label: "Page Name" }, "", { _kind: "string" });
			// output2.printInput({ id: "recordId" }, "", , (elt) => { });
			output2.printHTML("<hr/>");

			this.evalContext.getPageType(this.pageName, (type) => {
				// var indexBySizePath = "eval/" + this.pageName + "/_index/bySize/" + this.recordId;
				// 	output2.setEditMode(true);
				// 	var isNew: boolean = (data === null);
				// 	if (isNew) {
				var data = this.evalContext.newInstance(type);
				//isNew = true;
				// 	}
				// 	this.innerView = this.evalContext.instantiate(viewParent, "update::", data, type, true);
				// 	this.innerView.render(output2);
				// 	output2.printSection({ name: "crud-update" }, (printArgs) => {
				// 		output2.printButton({ buttonText: "Cancel" }, () => {
				// 			window.location.hash = "#" + this.pageName + " " + this.recordId;
				// 		});
				// 		output2.printHTML("&nbsp;");
				// 		output2.printButton({ buttonText: "Save" }, () => {
				// 			var data = this.innerView.getValue();
				// 			this.evalContext.database.addUpdate(path, data);
				// 			var json = JSON.stringify(data);
				// 			this.evalContext.database.addUpdate(indexBySizePath, json.length);
				// 			this.evalContext.database.runUpdates();
				// 			console.log("eval", "save", this.pageName, this.recordId, json.length + " bytes", data, json);
				// 			alert("saved " + JSON.stringify(data));
				// 			window.location.hash = "#" + this.pageName + " " + this.recordId;
				// 		});
				// 	});
				//		output2.domReplace();
				// });
				output2.domReplace();
			});
		});

	}
}