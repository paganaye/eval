import { Command, CommandParameter } from '../Command';
import { app } from '../App';
import { ParameterDefinition } from '../ParameterDefinition';
import { Type } from '../Types';
import { Context } from '../Context';

// class Print extends Command {

//    getName(): string { return "print"; }
//    getParameters(): ParameterDefinition[] {
//       return [
//          { name: "model", type: "any" },
//          { name: "type", type: "string", optional: true }
//       ];
//    }


//    do(context: Context, args: any) {
//       var model = context.getArg("model");
//       var type = context.getArg("type");
//       app.print(this.args)
//    }

// }


// export class Print extends Command {
//    model = new CommandParameter<any>(this);
//    type = new CommandParameter<Type>(this, { optional: true });

//    getName() { return "print"; }

//    getParameters() {
//       return { model: this.model, type: this.type };
//    }
//    run(context: Context) {
//       debugger;
//       var model = context.getParameter(this.model);
//       var type = context.getParameter(this.type);
//       app.print(model, type);
//    }
// }
class PrintParameters {
   model = new CommandParameter<any>();
   type = new CommandParameter<Type>();
}

export class Print extends Command<PrintParameters> {

   //    model = new CommandParameter<any>(this);
   //    type = new CommandParameter<Type>(this, { optional: true });

   getName() { return "print"; }

   createParameters() {
      return new PrintParameters();
   }

   run(context: Context, parameters: PrintParameters) {
      debugger;
      var model = parameters.model.getValue();
      var type = parameters.type.getValue();
      app.print(model, type);
   }
}

class ParametersBuilder {

}