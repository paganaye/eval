export class CommandCall {

   constructor(private source: string, private name: string, private parameters: any) {

   }

   getSource() {
      return this.source;
   }

   getName() {
      return this.name;
   }

   getParameters(): any {
      return this.parameters;
   }
}
