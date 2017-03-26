import { Output } from "./Output";
import { EnumEntry, Type } from "./Types";
import { Eval } from "./Eval";
import { View, ViewOrElement } from "./View";
import { ArrayView } from "./views/ArrayView";
import { ObjectView } from "./views/ObjectView";
import { MapView } from "./views/MapView";


export abstract class Theme {
      constructor(public readonly evalContext: Eval) { }
      abstract initialize(output: Output): void;
      abstract prepareViewBeforeBuild(view: View<any, Type, ViewOptions>): void;

      abstract printForm(output: Output, options: FormOptions, printContent: (options: ViewOptions) => void);
      abstract printPage(output: Output, options: PageOptions, printContent: (options: ViewOptions) => void);
      abstract printProperty(output: Output, options: PropertyOptions,
            printKey: string | ((output: Output, options: PropertyOptions) => void), view: ViewOrElement);
      abstract printDynamicObject(output: Output, options: PropertyOptions,
            printKey: string | ((output: Output, options: PropertyOptions) => void), view: ViewOrElement);

      abstract printSection(output: Output, options: SectionOptions, printContent: (options: ViewOptions) => void);

      abstract printArrayEntry(output: Output, arrayView: ArrayView<any>,
            options: ArrayEntryOptions, data: any, type: Type): View<any, Type, ViewOptions>;
      abstract getArrayEntriesIndex(element: HTMLElement): string[];

      abstract printInput(output: Output, options: InputOptions, data: any, type: Type);
      abstract printSelect(output: Output, options: SelectOptions, data: string, type: Type, onChanged?: (string) => void);
      abstract printButton(output: Output, options: ButtonOptions, action: (ev: Event) => void);
      abstract printButtonGroup(output: Output, options: ButtonGroupOptions, action: (ev: Event, text: string) => void);
}

export type ElementAttributes = { [key: string]: string };

export class ViewOptions {
      //id?: string;
      //css?: CssAttributes;
}

export class PropertyOptions extends ViewOptions {
      //labelCssAttributes?: CssAttributes;
}

export class ArrayOptions extends ViewOptions {
      deletable?: boolean;
      frozenDynamic?: boolean;
}

export class ArrayEntryOptions extends ViewOptions {
      id: string;
      label: string;
      deletable: boolean;
      frozenDynamic: boolean;
}

export class MapOptions extends ViewOptions {
      deletable?: boolean;
      frozenDynamic?: boolean;
}

export class FormOptions extends ViewOptions {
      buttons?: (FormButton | string)[];
}

export class PageOptions extends ViewOptions {
      title?: string;
}

export class SectionOptions extends ViewOptions {
      name: string;
}

export class InputOptions extends ViewOptions {
      id: string;
}

export class SelectOptions extends ViewOptions {
      entries: EnumEntry[];
      id: string;
}

export class DynamicObjectOptions extends ViewOptions {
      freezeType: boolean;
      entries: EnumEntry[];
      id: string;
}

export class ButtonOptions extends ViewOptions {
      buttonText: string;
      class?: string;
}

export class ButtonGroupOptions extends ViewOptions {
      buttonText: string;
      entries: EnumEntry[];
}

export class FormButton {
      text: string;
}