import { CommandParser } from './CommandParser';
import { Tests } from './Tests';
import { Context } from './Context';
import { CommandParameter } from './Command';
import { app } from './App';

export class EvalConsole {
   commandParser: CommandParser;
   originalConsole: Console;
   terminal: any;

   constructor(private context: Context) { }

   echo(msg: string): void {
      if (typeof msg !== "string") msg = JSON.stringify(msg);
      this.terminal.echo(msg);
   }
   error(msg: string): void {
      if (typeof msg !== "string") {
         if (msg instanceof Error) {
            msg = (msg as Error).name + " " + (msg as Error).message;
            this.originalConsole.error(msg)
            return;
         }
         msg = JSON.stringify(msg);
      }
      this.terminal.error(msg);
   }

   public initialize(): HTMLElement {
      var elt = document.createElement('div');
      this.terminal = ($(elt) as any).terminal(
         (cmd) => this.processCommand(cmd),
         {
            greetings: 'Eval v1.0',
            name: 'eval',
            prompt: '$ ',
            height: '180px'
         });
      this.commandParser = new CommandParser(this.context);
      this.originalConsole = (window as any).console;
      (window as any).console = this;
      return elt;

   }

   log(): void {
      for (var arg in arguments) {
         this.echo(arg + "> " + arguments[arg]);
      }
      this.originalConsole.log(arguments);
   }

   public processCommand(commandString: string) {
      try {
         var res = this.commandParser.parse(commandString)
         var command = res.getCommand();
         var givenParameters = res.getParameters();

         this.echo((command.constructor as any).name);
         this.echo(givenParameters)
         var parameters = command.createParameters();
         this.echo(parameters);
         var keys = Object.keys(parameters);
         for (var i in givenParameters) {
            var givenValue = givenParameters[i];
            if (/[0-9]+/.test(i)) {
               i = keys[i];
            }
            (parameters[i] as CommandParameter<any>).setValue(givenValue);
         }
         res.getCommand().run(this.context, parameters);

      } catch (error) {
         this.error(error);
      }
      app.renderOutput();      
   }
}