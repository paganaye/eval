import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "../Output";
import { View, AnyView } from "../View";
import { PrintArgs } from "../Theme";

export class Read extends Command {
	tableName: string;
	recordId: string;
	private innerView: AnyView;

	constructor(evalContext: Eval, public commandName: string) {
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

		output.printAsync("div", {}, this.commandName + " " + this.tableName + " " + this.recordId, (elt, output2) => {
			var parentView: AnyView = null;

			this.evalContext.getTableType(this.tableName, (type) => {
				if (type && !type._kind) type._kind = "object";

				this.evalContext.database.on("tables/" + this.tableName + "/" + this.recordId, (data, error) => {
					this.innerView = this.evalContext.instantiate(data, type, parentView, false);
					this.innerView.render(output2);
					output2.domReplace();
				})
			});
		});

	}

	runTests(output: Output): void {

	}
}
