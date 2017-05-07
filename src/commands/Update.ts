import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "../Output";
import { View, AnyView } from "../View";
import { PrintArgs } from "../Theme";

export class Update extends Command {
	tableName: string;
	recordId: string;
	private innerView: AnyView;

	constructor(evalContext: Eval) {
		super(evalContext);
	}

	getDescription(): CommandDescription {
		return new CommandDescription()
			.addParameter("tableName", "stringOrVariableName")
			.addParameter("recordId", "stringOrVariableName");
	}

	run(output: Output) {
		this.tableName = (this.tableName || "").toLowerCase();
		this.recordId = (this.recordId || "").toLowerCase();

		output.printAsync("div", {}, "Update " + this.tableName + " " + this.recordId, (elt, output2) => {
			this.showForm(output2);
		});

	}

	runTests(output: Output): void {

	}

	showForm(output2: Output) {
		this.evalContext.getTableType(this.tableName, (type) => {
			var parentView: AnyView = null;
			if (type && !type._kind) type._kind = "object";

			if (type._kind == "const") {
				output2.printTag("div", {}, type.value);
				output2.domReplace();
			}
			else {
				var path = "tables/" + this.tableName + "/" + this.recordId;
				var indexBySizePath = "tables/" + this.tableName + "/_index/bySize/" + this.recordId;
				this.evalContext.database.on(path, (data, error) => {
					output2.setEditMode(true);
					var isNew: boolean = (data === null);

					if (isNew) {
						data = this.evalContext.newInstance(type);
						isNew = true;
					}
					this.innerView = this.evalContext.instantiate(data, type, parentView, true);
					this.innerView.render(output2);
					output2.printSection({ name: "crud-update" }, (printArgs) => {
						output2.printButton({ buttonText: "Save" }, () => {
							debugger;
							var data = this.innerView.getValue();
							this.evalContext.database.addUpdate(path, data);
							var json = JSON.stringify(data);
							this.evalContext.database.addUpdate(indexBySizePath, json.length);
							this.evalContext.database.runUpdates();
							console.log("eval", "save", this.tableName, this.recordId, json.length + " bytes", data, json);
							alert("saved " + JSON.stringify(data));
						});
					});
					output2.domReplace();
				})
			}
		});

	}
}
