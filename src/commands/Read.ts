import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "../Output";
import { View, AnyView, ViewParent } from "../View";
import { PrintArgs } from "../Theme";

export class Read extends Command {
	pageName: string;
	recordId: string;
	private innerView: AnyView;

	run(output: Output) {
		this.pageName = (this.pageName || "");
		this.recordId = (this.recordId || "").toLowerCase();

		output.printAsync("div", {}, "Reading " + this.pageName + " " + this.recordId + "...", (output) => {
			
			this.evalContext.getPageType(this.pageName, (type) => {
				if (type && !type._kind) type._kind = "object";

				this.evalContext.database.on("eval/" + this.pageName.toLowerCase()
					+ "/" + this.recordId.toLowerCase(),
					(data, error) => {
						this.innerView = this.evalContext.instantiate(this, "read::", data, type, false);
						this.innerView.render(output);
						output.printTag("a", { href: "#update " + this.pageName + " " + this.recordId }, "edit");
						output.domReplace();
					})
			});
		});

	}

	runTests(output: Output): void {

	}
}
Command.registerCommand("read",{
	getNew: () => new Read(),
	description: new CommandDescription()
			.addParameter("pageName", "stringOrVariableName")
			.addParameter("recordId", "stringOrVariableName")
});
