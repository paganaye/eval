import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "../Output";
import { View, AnyView } from "../View";
import { PrintArgs } from "../Theme";
import { Update } from "../commands/Update";

export class Create extends Update {
	constructor(evalContext: Eval) {
		super(evalContext);
	}

	getDescription(): CommandDescription {
		return new CommandDescription()
			.addParameter("tableName", "stringOrVariableName");
	}

	run(output: Output) {
		this.tableName = (this.tableName || "").toLowerCase();
		this.recordId = (this.recordId || "").toLowerCase();

		output.printAsync("div", {}, "Update " + this.tableName + " " + this.recordId, (elt, output2) => {
			output2.printInput({ id: "recordId" }, "", { _kind: "string" }, (elt) => { });
			this.showForm(output2);
		});

	}
}