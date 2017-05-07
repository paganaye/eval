import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "../Output";
import { View, AnyView } from "../View";
import { PrintArgs } from "../Theme";

export class Index extends Command {
	tableName: string;

	constructor(evalContext: Eval) {
		super(evalContext);
	}

	getDescription(): CommandDescription {
		return new CommandDescription()
			.addParameter("tableName", "stringOrVariableName")
	}

	run(output: Output) {
		this.tableName = (this.tableName || "").toLowerCase();

		output.printAsync("div", {}, "Index " + this.tableName, (elt, output2) => {
			var parentView: AnyView = null;

			this.evalContext.getTableType(this.tableName, (type) => {
				if (type && !type._kind) type._kind = "object";

				this.evalContext.database.on("tables/" + this.tableName + "/_index", (data, error) => {
					output2.printStartTag("pre", {});
					if (!data) data = {};
					output2.printHTML(JSON.stringify(data));
					output2.printEndTag();
					output2.domReplace();
				})
			});
		});

	}

	runTests(output: Output): void {

	}
}
