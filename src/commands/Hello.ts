import { Command, CommandParameter } from '../Command';
import { Type } from '../Types';
import { Context } from '../Context';

class HelloParameters {
   who = new CommandParameter<string>();
}

export class Hello extends Command<HelloParameters> {

   //    model = new CommandParameter<any>(this);
   //    type = new CommandParameter<Type>(this, { optional: true });

   createParameters() {
      return new HelloParameters();
   }

   run(context: Context, parameters: HelloParameters) {
      var model = parameters.who.getValue(context);
      context.print(model);
   }
}

class ParametersBuilder {

}