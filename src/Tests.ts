import { EvalConsole } from './EvalConsole';

export class Tests {
   constructor(private console: EvalConsole) { }

   public selfTests() {
      try {
         this.console.echo("Running tests...");
         this.assert(3, () => 1 + 2, "1 + 2");

         var commandParser = this.console.commandParser;
         var commandCall = commandParser.parse("myCommand 1 true 'A' n1:\"C D\" \"n2\":{}");
         this.console.echo(commandCall.getSource());
         this.assert("myCommand", commandCall.getCommand().getName())

         this.assertCommandParser("cmd1", { 0: 1, 1: true, 2: "A", 3: "B" },
            "cmd1 1 true 'A' \"B\"");
         this.assertCommandParser("cmd2", { "n1": "C D", "n2": {} },
            "cmd2 n1:\"C D\" \"n2\":{}");
         this.assertCommandParser("cmd3", { 0: "<p>Hello World</p>" },
            "cmd3 <p>Hello World</p>");

      }
      catch (e) {
         this.console.error(JSON.stringify(e));
      }
   }

   public assertCommandParser(expectedName: string, expectedParameters: any, line: string) {
      var commandParser = this.console.commandParser;
      var commandCall = commandParser.parse(line);
      this.assert({ name: expectedName, parameters: expectedParameters },
         { name: commandCall.getCommand().getName(), parameters: commandCall.getParameters() },
         line);
   }
   public assert(expected, actual, message?: string) {
      if (!message) message = "";
      var expectedJSON = JSON.stringify(expected);
      if (typeof actual == 'function') {
         try {
            actual = actual(message);
         } catch (e) {
            actual = e;
         }
      }
      var actualJSON = JSON.stringify(actual);
      if (actualJSON == expectedJSON) {
         this.console.echo("[Pass] " + message + " => " + actualJSON);
      } else {
         this.console.error("[Fail] " + message);
         this.console.echo("  expected: " + expectedJSON);
         this.console.echo("  actual: " + actualJSON);
      }
   }
}