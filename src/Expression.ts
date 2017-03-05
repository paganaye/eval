import { Context } from './Context';
import { EvalFunction, ParameterDefinition } from './EvalFunction';
import { TypeDefinition } from './Types';

export interface Subscriber {
   on(publisher: Publisher);
}

export interface Publisher {
   addSubscriber(subscriber: Subscriber): void;
   removeSubscriber(subscriber: Subscriber): void;
}

export abstract class Expression<T> implements Publisher, Subscriber {
   private subscribers: Subscriber[] = [];
   private modified: boolean = true;
   private calculatedValue: any;

   abstract calcValue(context: Context): T;

   getType(context: Context): TypeDefinition {
      var result: TypeDefinition;
      var value = this.getValue(context);
      if ((value as any).type) result = (value as any).type;
      if (typeof result == "string") result = context.types[result as string];
      if (!result) {
         result = context.types[typeof value] || context.objectType;
      }
      return result;
   }

   getValue(context: Context): T {
      if (this.modified) {
         this.calculatedValue = this.calcValue(context);
         this.modified = false;
      }
      return this.calculatedValue;
   }

   constructor(...publishers: Publisher[]) {
      publishers.forEach(p => p.addSubscriber(this));
   }

   addSubscriber(subscriber: Subscriber): void {
      if (this.subscribers.filter(s => s === subscriber).length > 0) return;
      this.subscribers.push(subscriber);
   }

   removeSubscriber(subscriber: Subscriber): void {
      this.subscribers = this.subscribers.filter(s => s != subscriber);
   }

   protected publish() {
      this.subscribers.forEach(s => s.on(this));
   }

   on(publisher: Publisher) {
      if (!this.modified) {
         this.modified = true;
         this.publish();
      }
   }
}

export class Const<T> extends Expression<T> {
   constructor(private value: T) {
      super();
   }
   calcValue(context: Context): any {
      return this.value;
   }
}

export class GetVariable extends Expression<any> {
   constructor(private variableName: any) {
      super();
   }

   getVariableName(): string { return this.variableName; }
   calcValue(context: Context): any {
      return context.getVariable(this.variableName);
   }
}

export class UnaryOp extends Expression<any> {
   constructor(private op1: Expression<any>, private operator: string) {
      super();
   }
   calcValue(context: Context): any {
      switch (this.operator) {
         case "+":
            return + this.op1.getValue(context);
         case "-":
            return - this.op1.getValue(context);
      }
   }
}

export class BinaryOp extends Expression<any> {
   constructor(private operator: string, private op1: Expression<any>, private op2: Expression<any>) {
      super();
   }
   calcValue(context: Context): any {
      switch (this.operator) {
         case "+":
            return this.op1.getValue(context) + this.op2.getValue(context);
         case "-":
            return this.op1.getValue(context) - this.op2.getValue(context);
         case "*":
            return this.op1.getValue(context) * this.op2.getValue(context);
         case "/":
            return this.op1.getValue(context) / this.op2.getValue(context);
         case "<":
            return this.op1.getValue(context) < this.op2.getValue(context);
         case "<=":
            return this.op1.getValue(context) <= this.op2.getValue(context);
         case "==":
            return this.op1.getValue(context) == this.op2.getValue(context);
         case ">=":
            return this.op1.getValue(context) >= this.op2.getValue(context);
         case ">":
            return this.op1.getValue(context) > this.op2.getValue(context);
         case "!=":
            return this.op1.getValue(context) != this.op2.getValue(context);
      }
   }
}

export class FunctionCall extends Expression<any> {
   private functionInstance: EvalFunction<any>;

   constructor(private context: Context, private functionName, private expressions: { [key: string]: Expression<any> }) {
      super();
      var getNew = this.context.functions[functionName.toLowerCase()];
      if (getNew) this.functionInstance = getNew(context);
      if (!this.functionInstance) {
         throw "Unknown function " + functionName;
      }
   }

   static applyParameters(context: Context, parameterDefinitions: ParameterDefinition[],
      expressions: any, target: any, targetName) {
      for (var idx in expressions) {
         var paramExpression = expressions[idx];
         var isNumber = /^[0-9]+$/.test(idx);
         var parameterDefinition: ParameterDefinition;
         if (isNumber) {
            parameterDefinition = parameterDefinitions[idx];
         } else {
            parameterDefinition = parameterDefinitions.filter(p => p.name === idx)[0];
         }
         if (!parameterDefinition) {
            throw "Parameter " + (isNumber ? (parseInt(idx) + 1).toString() : idx) + " does not exist in " + targetName + ".";
         }
         var actualValue = paramExpression.getValue(context);
         target[parameterDefinition.name] = actualValue;
      }
   }

   calcValue(context: Context): any {
      FunctionCall.applyParameters(context, this.functionInstance.getParameters(), this.expressions, this.functionInstance, "function " + this.functionName);
      var result = this.functionInstance.calcValue(context);
      return result;
   }
}

export class JsonObject extends Expression<object> {
   private members: { [key: string]: Expression<any> } = {};

   constructor() {
      super();
   }

   addMember(key: string, value: Expression<any>) {
      this.members[key] = value;
   }

   calcValue(context: Context): any {
      var result = {};
      for (var m in this.members) {
         var value = this.members[m].getValue(context);
         result[m] = value;
      }
      return result;
   }
}

export class JsonArray extends Expression<any[]> {
   private items: Expression<any>[] = [];

   constructor() {
      super();
   }

   addEntry(value: Expression<any>) {
      this.items.push(value);
   }

   calcValue(context: Context): any {
      var result = {};
      for (var m in this.items) {
         var value = this.items[m].getValue(context);
         result[m] = value;
      }
      return result;
   }
}