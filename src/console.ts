// expor
export class Console {
   echo: (message: string) => void;

   public render(): Node {
      var elt = document.createElement('div');
      var terminal = ($(elt) as any).terminal(
         this.processCommand,
         {
            greetings: 'Eval v3.2',
            name: 'eval',
            prompt: '$ ',
            height: '75%'
         });
      this.echo = terminal.echo;
      (window as any).console = this;

      
      return elt;
   }

   log(): void {
      for (var arg in arguments) {
         this.echo(arg + "> " + arguments[arg]);
      }
   }

   public processCommand(command: string) {
      this.echo("hi " + command);
   }

}

