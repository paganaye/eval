import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "../Output";
import { View, AnyView, ViewParent } from "../View";
import { PrintArgs } from "../Theme";

export class Update extends Command {
	pageName: string;
	recordId: string;
	private innerView: AnyView;

	constructor(evalContext: Eval) {
		super(evalContext);
	}

	getDescription(): CommandDescription {
		return new CommandDescription()
			.addParameter("pageName", "stringOrVariableName")
			.addParameter("recordId", "stringOrVariableName");
	}

	run(output: Output) {
		this.pageName = (this.pageName || "").toLowerCase();
		this.recordId = (this.recordId || "").toLowerCase();

		output.printAsync("div", {}, "Updating " + this.pageName + " " + this.recordId + "...", (elt, output2) => {
			this.showForm(output2);
		});

	}

	runTests(output: Output): void {

	}

	showForm(output2: Output) {
		this.evalContext.getPageType(this.pageName, (type) => {
			var parentView: ViewParent = null;
			if (type && !type._kind) type._kind = "object";

			if (type._kind == "const") {
				output2.printTag("div", {}, type.value);
				output2.domReplace();
			}
			else {
				var path = "eval/" + this.pageName + "/" + this.recordId;
				var indexBySizePath = "eval/" + this.pageName + "/_index/bySize/" + this.recordId;
				this.evalContext.database.on(path, (data, error) => {
					output2.setEditMode(true);
					var isNew: boolean = (data === null);

					if (isNew) {
						data = this.evalContext.newInstance(type);
						isNew = true;
					}
					this.innerView = this.evalContext.instantiate(parentView, "update::", data, type, true);
					this.innerView.render(output2);
					output2.printSection({ name: "crud-update" }, (printArgs) => {
						output2.printButton({ buttonText: "Cancel" }, () => {
							window.location.hash = "#" + this.pageName + " " + this.recordId;
						});
						output2.printHTML("&nbsp;");
						output2.printButton({ buttonText: "Save" }, () => {
							var data = this.innerView.getValue();
							this.evalContext.database.addUpdate(path, data);
							var json = JSON.stringify(data);
							this.evalContext.database.addUpdate(indexBySizePath, json.length);
							this.evalContext.database.runUpdates();
							console.log("eval", "save", this.pageName, this.recordId, json.length + " bytes", data, json);
							alert("saved " + JSON.stringify(data));
							window.location.hash = "#" + this.pageName + " " + this.recordId;
						});
					});
					output2.domReplace();
				});
			}
		});

	}
}