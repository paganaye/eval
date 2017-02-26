import { CommandParser } from './CommandParser';
import { Tests } from './Tests';
import { Commands } from './Commands'

export class EvalConsole {
   commandParser: CommandParser;
   commands: Commands;
   originalConsole: any;
   terminal: any;

   echo(msg: string): void {
      if (typeof msg !== "string") msg = JSON.stringify(msg);
      this.terminal.echo(msg);
   }
   error(msg: string): void {
      if (typeof msg !== "string") msg = JSON.stringify(msg);
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
      this.commands = new Commands();
      this.commandParser = new CommandParser(this.commands);

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

   public processCommand(command: string) {
      try {
         var res = this.commandParser.parse(command)
         this.echo(res.getName());
         this.echo(res.getParameters())
      } catch (error) {
         this.error(error);
      }
   }
}