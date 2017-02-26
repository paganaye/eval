import 'jquery';
import { EvalConsole } from './EvalConsole';
import { Database } from './Database';
import { View } from './View';
import { Output } from './Output';
import { TypeDefinition } from './Types';
import { Tests } from './Tests';
import { Commands } from './Commands';
import { Runtime } from './Runtime';
import { RomanView } from './views/Roman';
import { YoutubeView } from './views/Youtube';

class App {
	evalConsole: EvalConsole;
	database: Database;
	output: Output;
	output1: HTMLDivElement;
	reload: number;
	runtime: Runtime;

	initialize() {
		this.incrementReload();
		this.initConsole();
		this.initOutput();
		//this.initDatabase();

		//this.testOutput();
		//this.database.test();
		this.testCommand();
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

	initOutput() {
		this.runtime = new Runtime();

		this.runtime.registerType("roman", { type: "object", view: new RomanView() });
		this.runtime.registerType("youtube", { type: "object", view: new YoutubeView() });

		this.output = new Output(this.runtime);
		this.output1 = document.getElementById('output1') as HTMLDivElement;
		this.output1.innerHTML = "";
	}

	renderOutput() {
		var html = this.output.toString();
		this.output1.innerHTML = html;
	}

	initConsole() {
		var consoleElt = document.getElementById('console1') as HTMLElement;
		if (consoleElt) {
			consoleElt.innerHTML = "";
		} else {
			// console is first to display the rest of the initializations
			this.evalConsole = new EvalConsole();
			consoleElt = this.evalConsole.initialize();
			consoleElt.id = "console1";
			consoleElt.style.display = "none";
			document.body.appendChild(consoleElt);

		}

		$(document).keyup(function (e) {
			if (e.keyCode == 27) { // escape key maps to keycode `27`
				$(consoleElt).toggle();
			}
		});
	}

	testCommand() {
		var tests = new Tests(this.evalConsole);
		tests.selfTests();

	}

	testOutput() {
		this.output.print({
			x: "ABC",
			y2: { video: "YBJFirHSS5Q", width: 100, height: 100, type: "youtube" },
			y: "7Iweue-OcMo", z: 1111
		},
			{ type: "object", properties: { y: "youtube", z: "roman" } });
	}

	print(model: any, type?: TypeDefinition) {
		this.output.print(model, type);
	}
}

export var app: App;

$(function () {
	app = new App();
	app.initialize();
});
