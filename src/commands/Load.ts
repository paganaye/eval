import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { Output } from "../Output";
import { CommandDescription } from "../EvalFunction";

export class Load extends Command {
	path: string;
	type: string;

	run(output: Output) {
		// output.printAsync("div", {}, "Loading...", (output) => {
		//       var res = this.evalContext.database.on(this.path, (data, error) => {
		//             output.printText(error || data);
		//       });
		//       this.evalContext.afterClear(() => {
		//             res.off();
		//       })
		// });
	}

	runTests(output: Output): void {

	}
}
Command.registerCommand("load",{
	getNew: () => new Load(),
	getDescription: () => new CommandDescription()
			.addParameter("path", "string")
			.addParameter("type", "string")
});
