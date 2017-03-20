import { Output } from "./Output";
import { EnumEntry, Type } from "./Types";
import { Eval } from "./Eval";
import { View } from "./View";
import { ArrayView } from "./views/ArrayView";
import { ObjectView } from "./views/ObjectView";
import { MapView } from "./views/MapView";


export abstract class Theme {
      constructor(public readonly evalContext: Eval) { }
      abstract initialize(output: Output): void;
      abstract printProperty(output: Output, options: ContentOptions,
            printKey: string | ((output: Output, options: ContentOptions) => void),
            printData: ((output: Output, options: ContentOptions) => void)): void;

      abstract printArrayEntry(output: Output, arrayView: ArrayView, options: ArrayEntryOptions, key: number, data: any, type: Type): View<any, any>;
      abstract printForm(output: Output, options: FormOptions, printContent: (options: ContentOptions) => void);
      abstract printPage(output: Output, options: PageOptions, printContent: (options: ContentOptions) => void);
      abstract printSection(output: Output, options: SectionOptions, printContent: (options: ContentOptions) => void);
      abstract printDynamicSection(output: Output, options: SectionOptions): Output;
      abstract getArrayEntriesIndex(element: HTMLElement): string[];

      abstract printInput(output: Output, options: InputOptions, data: any, type: Type);
      abstract printSelect(output: Output, options: SelectOptions, data: string, type: Type, onChanged?: (string) => void);
      abstract printButton(output: Output, options: ButtonOptions, text: string, action: () => void);
      abstract printButtonGroup(output: Output, options: ButtonGroupOptions, text: string, action: (string) => void);

      /*
      <!-- Single button -->
<div class="btn-group">
  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    Action <span class="caret"></span>
  </button>
  <ul class="dropdown-menu">
    <li><a href="#">Action</a></li>
    <li><a href="#">Another action</a></li>
    <li><a href="#">Something else here</a></li>
    <li role="separator" class="divider"></li>
    <li><a href="#">Separated link</a></li>
  </ul>
</div>
 */
}

export interface ContentOptions {
      attributes?: { [key: string]: string };
      [key: string]: any;
}

export interface ArrayEntryOptions extends ContentOptions {
      deletable: boolean;
}

export interface FormOptions extends ContentOptions {
      buttons?: (FormButton | string)[];
}

export interface PageOptions extends ContentOptions {
      title?: string;
}

export interface SectionOptions extends ContentOptions {
      name: string;
}

export interface InputOptions extends ContentOptions {
}

export interface SelectOptions extends ContentOptions {
      entries: EnumEntry[];
}

export interface ButtonOptions extends ContentOptions {
}

export interface ButtonGroupOptions extends ContentOptions {
      entries: EnumEntry[];
}

export interface FormButton {
      text: string;
}