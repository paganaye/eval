import { Console } from './console';
import { Database } from './database';
import 'jquery';


class App {
	console: Console;
	database: Database;

	initialize() {
		// console is first to display the rest of the initializations
		this.console = new Console();
		document.body.appendChild(this.console.render());

		this.database = new Database();
		this.database.initialize();

	}
}

var app: App;

//firebase.initializeApp({});

$(function () {
	app = new App();
	app.initialize();
});
