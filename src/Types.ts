import { View } from "./View";


export interface TypeDefinition<T> {
   validate?: (value: T) => ValidationResult;
   view?: string;
   inputView?: string;
   mandatory?: boolean;
}

export interface ValidationResult {
   valid: boolean;
   code?: string;
   message?: string;
}

export interface NumberType extends TypeDefinition<number> {
   kind: "number";
   defaultValue?: number
   minimalValue?: number;
   maximalValue?: number;
   nbDecimals?: number;
}

export interface StringType extends TypeDefinition<string> {
   kind: "string";
   defaultValue?: string;
   minimalLength?: number;
   maximalLength?: number;
   regexp?: string;
   regexpMessage?: string;
   cols?: number;
   rows?: number;
}

export interface BooleanType extends TypeDefinition<boolean> {
   kind: "boolean";
   defaultValue?: boolean;
}

export interface Property {
   name: string;
   type: Type;
}
export interface ObjectDefinition extends TypeDefinition<object> {
   kind: "object";
   properties: Property[];
}

export interface ArrayType<T> extends TypeDefinition<T[]> {
   kind: "array";
   entryType: Type;
   minimumCount?: number;
   maximumCount?: number;
   canAddOrDelete?: boolean;
   canReorder?: boolean;
}

export interface EnumType extends TypeDefinition<string> {
   kind: "enum";
   defaultValue?: string;
   entries: EnumEntry[];
   multiple?: boolean;
}

export interface EnumEntry {
   group?: string;
   key: string
   label?: string
}

export interface DynamicType extends TypeDefinition<any> {
   kind: "dynamic";
   entries: DynamicEntry[];
}

export interface DynamicEntry extends EnumEntry {
   // group?: string;
   // key: string
   // label?: string
   type: Type;
   name?: string;
}

export interface TypedObject {
   type: string;
   [otherFields: string]: any;
}

export type Type = NumberType | StringType | BooleanType
   | EnumType | ObjectDefinition | ArrayType<any> | DynamicType;

export type TypeOrString = Type | string;

// Removed those. They are now in string definitions
//  | ColorDefinition | DateDefinition | DatetimeLocalDefinition
//  | EmaiDefinition | MonthDefinition | RangeDefinition | TelDefinition
//  | TextDefinition | TimeDefinition 
//  | UrlDefinition | WeekDefinition | ExternalDefinition | MapType

var x: Property[] =
   [
      { "name": "address", "type": { "rows": 4, "kind": "string" } },
      { "name": "firstName", "type": { "kind": "string" } },
      {
         "name": "history", "type": {
            "entryType": {
               "entries": [
                  {
                     "key": "order",
                     "label": "Order",
                     "type": {
                        "properties": [
                           { "name": "date", "type": { "kind": "string" } },
                           {
                              "name": "lines", "type": {
                                 "entryType": {
                                    "properties": [
                                       { "name": "price", "type": { "kind": "number" } },
                                       { "name": "product", "type": { "kind": "string" } }
                                    ],
                                    "kind": "object"
                                 },
                                 "kind": "array"
                              }
                           },
                           { "name": "total", "type": { "kind": "number" } }
                        ],
                        "kind": "object"
                     }
                  },
                  {
                     "key": "message",
                     "label": "Message",
                     "type": {
                        "properties": [
                           { "name": "text", "type": { "kind": "string" } }
                        ],
                        "kind": "object"
                     }
                  }
               ],
               "kind": "dynamic"
            },
            "kind": "array"
         }
      },
      { "name": "lastName", "type": { "kind": "string" } },

      {
         "name": "notes", "type": {
            "entryType": {
               "properties": [
                  { "name": "date", "type": { "kind": "string" } },
                  { "name": "text", "type": { "kind": "string" } }
               ],
               "kind": "object"
            },
            "kind": "array"
         }
      },
      {
         "name": "status", "type": {
            "entries": [{
               "key": "Active"
            }, {
               "key": "Pending"
            }, {
               "key": "OnHold"
            }],
            "kind": "enum"
         }
      }
   ]
   ;
