import "jquery";
import { EvalConsole } from "./EvalConsole";
import { Database } from "./Database";
import { View } from "./View";
import { Output } from "./Output";
import { TypeDefinition, Type } from "./Types";
import { Tests } from "./Tests";
import { Context } from "./Context";
import { RomanView } from "./views/Roman";
import { YoutubeView } from "./views/Youtube";

class App {
	evalConsole: EvalConsole;
	database: Database;
	output: Output;
	output1: HTMLDivElement;
	reload: number;
	context: Context;


	initialize() {
		this.incrementReload();
		this.initEval();
		this.initConsole();
		//this.initDatabase();

		this.tests();
		this.renderOutput();
	}

	incrementReload() {
		var reloadString = document.body.getAttribute("data-reload");
		this.reload = (typeof reloadString === "string") ? parseInt(reloadString) + 1 : 0;
		document.body.setAttribute("data-reload", this.reload.toString());
	}

	initDatabase() {
		this.database = new Database(this.reload);
	}

	initEval() {
		this.context = new Context();

		this.context.registerType("roman", { type: "object", view: new RomanView() });
		this.context.registerType("youtube", { type: "object", view: new YoutubeView() });


		this.output = new Output(this.context);
		this.output1 = document.getElementById("output1") as HTMLDivElement;
		this.output1.innerHTML = "";
	}

	renderOutput() {
		var html = this.output.toString();
		this.output1.innerHTML = html;
		this.output.clear();
	}

	initConsole() {
		var consoleElt = document.getElementById("console1") as HTMLElement;
		if (consoleElt) {
			consoleElt.remove();
		}
		// console is first to display the rest of the initializations
		this.evalConsole = new EvalConsole(this.context);
		consoleElt = this.evalConsole.initialize();
		consoleElt.id = "console1";
		consoleElt.style.display = "block";
		document.body.appendChild(consoleElt);


		$(document).keyup(function (e) {
			if (e.keyCode == 27) { // escape key maps to keycode `27`
				$(consoleElt).toggle();
			}
		});
	}

	tests() {
		var tests = new Tests(this.evalConsole);

		//this.testOutput();
		//this.database.test();
		try {
			tests.selfTests();
		} catch (e) {
			this.evalConsole.error(e.toString());
		}

	}

	testOutput() {
		this.output.print({
			x: "ABC",
			y2: { video: "YBJFirHSS5Q", width: 100, height: 100, type: "youtube" },
			y: "7Iweue-OcMo", z: 1111
		},
			{ type: "object", properties: { y: "youtube", z: "roman" } });
	}

	print(model: any, type?: Type) {
		this.output.print(model, type);
	}

	stringify(model: any, type?: Type) {
		return JSON.stringify(model);
	}
	
}

export var app: App;

$(function () {
	app = new App();
	app.initialize();
});
