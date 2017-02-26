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
         this.assert("myCommand", commandCall.getName())
         this.assert({ "0": 1, "1": true, "2": "A", "n1": "C D", "n2": {} }, commandCall.getParameters());
      }
      catch (e) {
         this.console.error(JSON.stringify(e));
      }
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