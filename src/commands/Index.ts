import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "../Output";
import { View, AnyView, ViewParent } from "../View";
import { PrintArgs } from "../Theme";

export class Index extends Command {
	pageName: string;

	constructor(evalContext: Eval) {
		super(evalContext);
	}

	getDescription(): CommandDescription {
		return new CommandDescription()
			.addParameter("pageName", "stringOrVariableName")
	}

	run(output: Output) {
		this.pageName = (this.pageName || ""); //.toLowerCase();

		output.printAsync("div", {}, "Loading " + this.pageName + " pages...", (elt, output) => {
			var parentView: ViewParent = null;

			this.evalContext.getPageType(this.pageName, (type) => {
				if (type && !type._kind) type._kind = "object";

				this.evalContext.database.on("eval/" + this.pageName.toLowerCase() + "/_index", (data, error) => {
					output.printTag("h1", {}, this.pageName + " Pages");
					if (!data) data = {};
					if (data.bySize) data = data.bySize;
					var keys = Object.keys(data);
					if (keys.length == 0) {
						output.printTag("p", {}, "There are no " + this.pageName + " page yet.");
					} else {
						keys.sort();
						for (var key of keys) {
							output.printStartTag("div", {})
							output.printTag("a", { href: "#" + this.pageName + " " + key }, key)
							// size doesn't matter output.printTag("span", {}, data[key])
							output.printEndTag();
						}
					}
					output.printTag("a", { href: "#create " + this.pageName }, "Create new " + this.pageName + " page.");
					output.domReplace();
				})
			});
		});

	}

	runTests(output: Output): void {

	}
}
