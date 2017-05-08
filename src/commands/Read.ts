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

	constructor(evalContext: Eval) {
		super(evalContext);
	}

	getDescription(): CommandDescription {
		return new CommandDescription()
			.addParameter("pageName", "stringOrVariableName")
			.addParameter("recordId", "stringOrVariableName");
	}

	run(output: Output) {
		this.pageName = (this.pageName || "");
		this.recordId = (this.recordId || "").toLowerCase();

		output.printAsync("div", {}, "Reading " + this.pageName + " " + this.recordId + "...", (elt, output2) => {
		
			this.evalContext.getPageType(this.pageName, (type) => {
				if (type && !type._kind) type._kind = "object";

				this.evalContext.database.on("eval/" + this.pageName.toLowerCase()
					+ "/" + this.recordId.toLowerCase(),
					(data, error) => {
						this.innerView = this.evalContext.instantiate(this, "read::", data, type, false);
						this.innerView.render(output2);
						output2.printTag("a", { href: "#update " + this.pageName + " " + this.recordId }, "edit");
						output2.domReplace();
					})
			});
		});

	}

	runTests(output: Output): void {

	}
}
