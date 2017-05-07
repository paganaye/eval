import { Output } from "./Output";
import { SelectEntry, Type, Visibility } from "./Types";
import { Eval } from "./Eval";
import { View, AnyView } from "./View";
import { ArrayView } from "./views/ArrayView";
import { ObjectView } from "./views/ObjectView";
import { Notification } from "./commands/Notification"

export abstract class Theme {
	constructor(public readonly evalContext: Eval) { }
	abstract initialize(output: Output): void;
	abstract prepareViewBeforeBuild(view: AnyView): void;

	abstract printPage(output: Output, printArgs: PagePrintArgs, printContent: (printArgs: PrintArgs) => void): void;
	abstract printGroup(output: Output, printArgs: GroupOptions, printContent: (printArgs: PrintArgs) => void): void;
	abstract printProperty(output: Output, printArgs: PropertyPrintArgs, view: AnyView): void;

	abstract printSection(output: Output, printArgs: SectionPrintArgs, printContent: (printArgs: PrintArgs) => void);

	abstract printArrayEntry(output: Output, arrayView: ArrayView<any>,
		printArgs: ArrayEntryPrintArgs, data: any, dataType: Type): AnyView;
	abstract getArrayEntriesIndex(element: HTMLElement): string[];

	abstract printInput(output: Output, printArgs: InputPrintArgs, data: any, dataType: Type, callback: (elt: HTMLInputElement) => void): void;
	abstract printSelect(output: Output, printArgs: SelectPrintArgs, data: string, dataType: Type, onChanged?: (string) => void): void;
	abstract printButton(output: Output, printArgs: ButtonPrintArgs, action: (ev: Event) => void): void;
	abstract printButtonGroup(output: Output, printArgs: ButtonGroupPrintArgs, action: (ev: Event, text: string) => void): void;
	abstract printNotification(output: Output, printArgs: NotificationPrintArgs, data: Notification, callback: (notification: Notification, id: string) => void): void;
	abstract refreshView(view: AnyView, refreshOptions: RefreshOptions): void;
}

export interface RefreshOptions {
	valueChanged?: boolean;
	validationStatusChanged?: boolean;
	validationTextChanged?: boolean;
	descriptionChanged?: boolean;
}

export type ElementAttributes = { [key: string]: string };

export class PrintArgs {
	addHeaderCallback?: (key: string, label: string) => void;
}

export class PropertyPrintArgs extends PrintArgs {
	printLabel?: ((output: Output, printArgs: PrintArgs) => void);
	label?: string;
	visibility: Visibility;
}

export class ArrayPrintArgs extends PrintArgs {
	deletable?: boolean;
	frozenDynamic?: boolean;
}

export class ArrayEntryPrintArgs extends PrintArgs {
	id: string;
	label: string;
	deletable: boolean;
	frozenDynamic: boolean;
	entriesElementId: string;
	active: boolean;
}

export class PagePrintArgs extends PrintArgs {
	title?: string;
}

export class GroupOptions extends PrintArgs {
	title?: string;
}

export class SectionPrintArgs extends PrintArgs {
	name: string;
	title?: string;
	orphans?: boolean;
	active?: boolean;
}

export class InputPrintArgs extends PrintArgs {
	id: string;
	//inputType: string;
}

export class SelectPrintArgs extends PrintArgs {
	entries: SelectEntry[];
	id: string;
}

export class CategoryPrintArgs extends PrintArgs {
	path: string;
	id: string;
	categoryName: string;
}

export class VariantPrintArgs extends PrintArgs {
	freezeType: boolean;
	entries: SelectEntry[];
	id: string;
}

export class ButtonPrintArgs extends PrintArgs {
	buttonText: string;
	class?: string;
}

export class ButtonGroupPrintArgs extends PrintArgs {
	buttonText: string;
	entries: SelectEntry[];
}

export class NotificationPrintArgs extends PrintArgs {

}

export class FormButton {
	text: string;
}