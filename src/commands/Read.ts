import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output, RenderMode } from "../Output";
import { View, AnyView, ViewParent } from "../View";
import { PrintArgs } from "../Theme";

export class Read extends Command {
	pageName: string;
	recordId: string;
	private innerView: AnyView;

	run(output: Output) {
		this.pageName = (this.pageName || "");
		this.recordId = (this.recordId || "").toLowerCase();

		output.printAsync("div", {}, "Reading " + this.pageName + " " + this.recordId + "...11", (output) => {

			this.evalContext.getPageType(this.pageName, (type) => {
				if (type && !type._kind) type._kind = "object";

				this.evalContext.database.on("eval/" + this.pageName.toLowerCase()
					+ "/" + this.recordId.toLowerCase(),
					(data, error) => {
						this.innerView = this.evalContext.instantiate(this, "read::", data, type, RenderMode.View);
						this.innerView.render(output);
						if (this.recordId) {
							output.printTag("a", { href: "#" + this.pageName }, "list " + this.pageName);
							output.printHTML(" | ");
						}
						output.printTag("a", { href: "#update " + this.pageName + " " + this.recordId }, "edit " + this.pageName + " " + this.recordId);
						if (this.pageName === "pagetemplate") {
							output.printHTML(" | ");
							output.printTag("a", { href: "#" + this.recordId }, "list " + this.recordId);
							output.printHTML(" | ");
							output.printTag("a", { href: "#" + this.pageName }, "list " + this.pageName);
						}
						else {
							output.printHTML(" | ");
							output.printTag("a", { href: "#update pagetemplate " + this.pageName }, "update " + this.pageName + " template");
						}
						output.domReplace();
					})
			});
		});

	}

	runTests(output: Output): void {

	}
}
Command.registerCommand("read", {
	getNew: () => new Read(),
	description: new CommandDescription()
		.addParameter("pageName", "stringOrVariableName")
		.addParameter("recordId", "stringOrVariableName")
});
