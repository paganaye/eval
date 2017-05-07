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
		this.tableName = (this.tableName || ""); //.toLowerCase();

		output.printAsync("div", {}, "Loading " + this.tableName + " pages...", (elt, output) => {
			var parentView: AnyView = null;

			this.evalContext.getTableType(this.tableName, (type) => {
				if (type && !type._kind) type._kind = "object";

				this.evalContext.database.on("tables/" + this.tableName.toLowerCase() + "/_index", (data, error) => {
					output.printTag("h1", {}, this.tableName + " Pages");
					if (!data) data = {};
					if (data.byLength) data = data.byLength;
					var keys = Object.keys(data);
					if (keys.length == 0) {
						output.printTag("p", {}, "There are no " + this.tableName + " page yet.");
					} else {
						keys.sort();
						for (var key of keys) {
							output.printStartTag("div", {})
							output.printTag("a", { href: "#" + this.tableName + " " + key }, key)
							// size doesn't matter output.printTag("span", {}, data[key])
							output.printEndTag();
						}
					}
					output.printTag("a", { href: "#create " + this.tableName }, "Create new " + this.tableName + " page.");
					output.domReplace();
				})
			});
		});

	}

	runTests(output: Output): void {

	}
}
