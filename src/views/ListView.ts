import { View } from "../View";
import { Output } from "../Output";
import { Type, NumberType, ObjectType } from "../Types";
import { ViewOptions } from "../Theme";


export class ListView extends View<any, ObjectType, ViewOptions> {
   tableName: string = "dog";

   render(output: Output): void {
      //  for simplicity we make the id of the input element identical to the id of the view.
      if (this.data == null) this.data = "";
      console.log("inputView::render", this.getId(), this.data, this.type);

      output.printStartTag("ul", {});

      this.evalContext.database.on("tables/" + this.tableName + "/" + this.tableName, (data, error) => {
         //this.innerView = this.evalContext.instantiateNewViewForExpr(data, type, parentView, false);
         //this.innerView.render(output2);
         //output2.render();
      })

      output.printTag("li", {}, "Item1");
      output.printTag("li", {}, "Item2");
      output.printTag("li", {}, "Item3");

      output.printEndTag();

   }

   getValue(): string {
      return null;
   }
}
