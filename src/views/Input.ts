import { View } from '../View';
import { TypeDefinition } from '../Types';
import { Output } from '../Output';

export class InputView extends View<any> {
    render(data: any, type: TypeDefinition, attributes: { [key: string]: string }, output: Output): void {
        if (data === undefined) data = "";
        if (typeof data !== 'string') data = JSON.stringify(data);
        attributes.type = "text";
        if (!data) data = "";
        attributes.value = data;
        output.printTag("input", attributes, null);
    }
}

// /// <reference path="../docs.ts" />

// interface IInput {
//     value?: string;
//     type?: TypeDefinition;
//     label?: string;
//     defaultValue?: string;
// }

// class InputView extends Docs.View<IInput> {
//     public options = {
//     };

//     renderButton(container: HTMLElement, label: string, callback: () => void): HTMLButtonElement {
//         var btn = document.createElement("button");
//         btn.innerText = label;
//         btn.onclick = callback;
//         container.appendChild(btn);
//         return btn;
//     }

//     renderArrayEntry(ol: HTMLElement, nextSibling: HTMLElement | null, arr: any[], i: number, type: ArrayDefinition): HTMLLIElement {
//         var li = document.createElement("li");
//         ol.insertBefore(li, nextSibling);
//         var childContainer = this.renderField((n) => li.appendChild(n), undefined, type.entryType, arr[i]);
//         if (type.canReorder) {
//             this.renderButton(childContainer, "Up", () => {
//                 var previousSibling = li.previousSibling;
//                 if (previousSibling) {
//                     var index = this.getIndex(li);
//                     var swap = arr[index - 1];
//                     arr[index - 1] = arr[index];
//                     arr[index] = swap;
//                     console.log("Moved up", index, arr);

//                     $(li).slideUp("fast", () => {
//                         ol.insertBefore(li, previousSibling);
//                         $(li).slideDown("fast");
//                     });
//                 }
//             });
//             this.renderButton(childContainer, "Down", () => {
//                 var nextSibling = li.nextSibling;
//                 if (nextSibling) {
//                     var index = this.getIndex(li);
//                     var swap = arr[index + 1];
//                     arr[index + 1] = arr[index];
//                     arr[index] = swap;
//                     console.log("Moved down", index, arr);

//                     nextSibling = nextSibling.nextSibling;
//                     $(li).slideUp("fast", () => {
//                         ol.insertBefore(li, nextSibling);
//                         $(li).slideDown("fast");
//                     });
//                 }
//             });
//         }
//         if (type.canAddOrDelete) {
//             this.renderButton(childContainer, "Delete", () => {
//                 if (type.minimumCount && arr.length <= type.minimumCount) {
//                     alert("Minimum count of " + type.minimumCount + " reached")
//                     return;
//                 }
//                 var index = this.getIndex(li);
//                 arr.splice(index, 1);
//                 console.log("Removed inde", index, arr);
//                 $(li).slideUp("fast", () => {
//                     ol.removeChild(li);
//                 });
//             });
//         }
//         return li;
//     }

//     getIndex(li: Node): number {
//         var index = 0;
//         var elt = li;
//         while (elt = elt.previousSibling) index++;
//         return index;
//     }

//     renderField(appendChild: (Node) => void, label: string | undefined, type: TypeDefinition | undefined, value: any): HTMLElement {
//         var container: HTMLDivElement = document.createElement("div");
//         container.classList.add("doc-input");
//         appendChild(container);

//         var labelElt: HTMLLabelElement;
//         if (label) {
//             var labelElt = document.createElement("label");
//             labelElt.textContent = label;
//             container.appendChild(labelElt);
//         }
//         if (type == null) {
//             switch (typeof value) {
//                 case "string":
//                     var stringDefinition: StringDefinition = { type: "string", mandatory: false };
//                     type = stringDefinition;
//                     break;
//                 case "number":
//                     var numberDefinition: NumberDefinition = { type: "number", mandatory: false };
//                     type = numberDefinition;
//                     break;
//                 case "boolean":
//                     var booleanDefinition: BooleanDefinition = { type: "boolean", mandatory: false };
//                     type = booleanDefinition;
//                     break;
//                 default:
//                     if (Array.isArray(value)) {
//                         var arrayDefinition: ArrayDefinition = { type: "array", entryType: { type: "object" } };
//               renderField          type = arrayDefinition;
//                     } else {
//                         var objectDefinition: ObjectDefinition = { type: "object", properties: [] };
//                         type = objectDefinition;
//                     }
//                     break;
//             }
//         }
//         container.classList.add("doc-type-" + type.type);
//         this.renderControl(container, value, type);
//         return container;
//     }

//     renderControl(container: HTMLDivElement, value: any, type: TypeDefinition): void {
//         switch (type.type) {
//             case "external":
//                 var typeDoc = Docs.getDoc(type.src, (newType) => {
//                     this.renderControl(container, value, newType);
//                 });
//                 break;
//             case "object":
//                 if (typeof value !== "object") {
//                     if (value == null) value = {};
//                     else value = { value: value };
//                 }
//                 var seen = {};

//                 for (var field of type.properties) {
//                     this.renderField((n) => container.appendChild(n), field.name, field.objectType, value[field.name]);
//                     seen[field.name] = true;
//                 }
//                 this.renderOrphans(container, value, seen);
//                 break;
//             case "array":
//                 var text = document.createTextNode(JSON.stringify(type));
//                 var arr: any[];
//                 if (typeof value === "object" && Array.isArray(value)) {
//                     arr = <any[]>value;
//                 } else {
//                     if (value == null) {
//                         arr = [];
//                     } else {
//                         arr = [value];
//                     }
//                 }
//                 var ol = document.createElement("ol");
//                 container.appendChild(ol);

//                 for (var i = 0; i < arr.length; i++) {
//                     this.renderArrayEntry(ol, null, arr, i, type);
//                 }

//                 if (type.canAddOrDelete) {
//                     var addBtn = this.renderButton(container, "Add", () => {
//                         if (type.maximumCount && arr.length >= type.maximumCount) {
//                             alert("Maximum count of " + type.maximumCount + " reached")
//                             return;
//                         }
//                         var newInstance = undefined;
//                         arr.push(newInstance);
//                         var li = this.renderArrayEntry(ol, null, arr, arr.length - 1, type);
//                         $(li).hide().slideDown("fast");
//                     });
//                 }
//                 break;
//             case "enum":
//                 if (value == null) value = "";
//                 else if (typeof value !== "string") value = JSON.stringify(value);

//                 this.renderSelect(container, value, type);
//                 break;

//             case "color":	// Defines a color picker
//             case "date":	//	Defines a date control (year, month and day (no time))
//             case "email":	//	Defines a field for an e-mail address
//             case "month":	//	Defines a month and year control (no time zone)
//             case "range":	//	Defines a control for entering a number whose exact value is not important (like a slider control)
//             case "tel":	    //	Defines a field for entering a telephone number
//             case "time":	//	Defines a control for entering a time (no time zone)
//             case "url":	    //	Defines a field for entering a URL
//             case "week":	//	Defines a week and year control (no time zone)
//             case "datetime-local":	//	Defines a date and time control (year, month, day, hour, minute, second, and fraction of a second (no time zone)
//             case "text":	//	Default. Defines a single-line text field (default width is 20 characters)
//                 if (value == null) value = "";
//                 else if (typeof value !== "string") value = JSON.stringify(value);
//                 this.renderInput(container, value, type.type);
//                 break;
//             // case "reset":	//	Defines a reset button (resets all form values to default values)
//             // case "search":	//	Defines a text field for entering a search string
//             // case "submit":	//	Defines a submit button
//             // case "file":  	//	Defines a file-select field and a "Browse..." button (for file uploads)
//             // case "hidden":	//	Defines a hidden input field
//             // case "image":	//	Defines an image as the submit button
//             // case "password":	//	Defines a password field (characters are masked)
//             // case "radio":	//	Defines a radio button
//             default:
//                 if (value == null) value = "";
//                 else if (typeof value !== "string") value = JSON.stringify(value);
//                 this.renderInput(container, value, "text");
//                 break;
//         }
//     }

//     renderSelect(container: HTMLElement, value: string, type: EnumDefinition) {
//         console.log("renderSelect", type);
//         var select = document.createElement("select");
//         container.appendChild(select);
//         var found = false;
//         for (var entry of type.entries) {
//             var option = document.createElement("option");
//             option.value = entry.key;
//             option.innerText = entry.label || entry.key;
//             if (!found && entry.key === value) {
//                 option.selected = true;
//                 found = true;
//             }
//             select.appendChild(option);
//         }
//         if (!found) {
//             var option = document.createElement("option");
//             option.value = value;
//             option.innerText = value;
//             option.selected = true;
//             select.insertBefore(option, select.firstChild);
//         }
//         if (!type.mandatory && value !== "") {
//             var option = document.createElement("option");
//             option.value = "";
//             option.innerText = "";
//             select.insertBefore(option, select.firstChild);
//         }

//     }

//     renderOrphans(container: HTMLElement, value: any, seen: any) {
//         // collect orphans
//         for (var fieldName of Object.keys(value)) {
//             if (seen[fieldName]) continue;
//             var fieldValue = value[fieldName];
//             this.renderField(n => container.appendChild(n), "*" + fieldName, undefined, fieldValue);
//         }

//     }

//     renderInput(container: HTMLDivElement, value: any, inputType?: string) {
//         var input = document.createElement("input");
//         if (!inputType) {
//             switch (typeof value) {
//                 case "number":
//                     inputType = "number";
//                     break;
//                 case "boolean":
//                     inputType = "checkbox";
//                     break;
//                 default:
//                     inputType = "text";
//                     break;
//             }
//         }
//         input.type = inputType;
//         container.classList.add("doc-type-" + inputType);

//         if (inputType === "checkbox") {
//             input.checked = !!value;
//         } else {
//             if (value !== undefined) input.defaultValue = value.toString();
//         }

//         container.appendChild(input);
//     }

//     renderJson(data: IInput): Node[] {
//         var result: Node[] = [];
//         this.renderField((n) => result.push(n), data.label, data.type, data.value || data)

//         return result;
//     }
// }

// Docs.views["input"] = new InputView();