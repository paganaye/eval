import { Output } from "./Output";
import { EnumEntry, Type } from "./Types";
import { Eval } from "./Eval";
import { View, AnyView } from "./View";
import { ArrayView } from "./views/ArrayView";
import { ObjectView } from "./views/ObjectView";


export abstract class Theme {
      constructor(public readonly evalContext: Eval) { }
      abstract initialize(output: Output): void;
      abstract prepareViewBeforeBuild(view: AnyView): void;

      abstract printForm(output: Output, options: FormOptions, printContent: (options: ViewOptions) => void): void;
      abstract printPage(output: Output, options: PageOptions, printContent: (options: ViewOptions) => void): void;
      abstract printGroup(output: Output, options: GroupOptions, printContent: (options: ViewOptions) => void): void;
      abstract printProperty(output: Output, options: PropertyOptions, view: AnyView): void;

      abstract printSection(output: Output, options: SectionOptions, printContent: (options: ViewOptions) => void);

      abstract printArrayEntry(output: Output, arrayView: ArrayView<any>,
            options: ArrayEntryOptions, data: any, type: Type): AnyView;
      abstract getArrayEntriesIndex(element: HTMLElement): string[];

      abstract printInput(output: Output, options: InputOptions, data: any, type: Type, callback: (elt: HTMLInputElement) => void): void;
      abstract printSelect(output: Output, options: SelectOptions, data: string, type: Type, onChanged?: (string) => void): void;
      abstract printButton(output: Output, options: ButtonOptions, action: (ev: Event) => void): void;
      abstract printButtonGroup(output: Output, options: ButtonGroupOptions, action: (ev: Event, text: string) => void): void;

      abstract refreshView(view: AnyView, refreshOptions: RefreshOptions): void;
}

export interface RefreshOptions {
      valueChanged?: boolean;
      validationStatusChanged?: boolean;
      validationTextChanged?: boolean;
      descriptionChanged?: boolean;
}

export type ElementAttributes = { [key: string]: string };

export class ViewOptions {
}

export class PropertyOptions extends ViewOptions {
      printLabel?: ((output: Output, options: ViewOptions) => void);
      label?: string;
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

export class MapEntryOptions extends ViewOptions {
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

export class GroupOptions extends ViewOptions {
      title?: string;
}

export class SectionOptions extends ViewOptions {
      name: string;
}

export class InputOptions extends ViewOptions {
      id: string;
      //inputType: string;
}

export class SelectOptions extends ViewOptions {
      entries: EnumEntry[];
      id: string;
}

export class CategoryOptions extends ViewOptions {
      path: string;
      id: string;
      categoryName: string;
}

export class ListOptions extends ViewOptions {
}

export class VariantObjectOptions extends ViewOptions {
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