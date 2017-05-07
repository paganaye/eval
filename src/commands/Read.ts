import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "../Output";
import { View, AnyView } from "../View";
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
		this.pageName = (this.pageName || "").toLowerCase();
		this.recordId = (this.recordId || "").toLowerCase();

		output.printAsync("div", {}, "Read " + this.pageName + " " + this.recordId, (elt, output2) => {
			var parentView: AnyView = null;

			this.evalContext.getTableType(this.pageName, (type) => {
				if (type && !type._kind) type._kind = "object";

				this.evalContext.database.on("eval/" + this.pageName + "/" + this.recordId, (data, error) => {
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
