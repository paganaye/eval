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

export interface NumberDefinition extends TypeDefinition<number> {
   type: "number";
   defaultValue?: number
   minimalValue?: number;
   maximalValue?: number;
   nbDecimals?: number;
}

export interface StringDefinition extends TypeDefinition<string> {
   type: "string";
   defaultValue?: string;
   minimalLength?: number;
   maximalLength?: number;
   regexp?: string;
   regexpMessage?: string;
   cols?: number;
   rows?: number;
}

export interface BooleanDefinition extends TypeDefinition<boolean> {
   type: "boolean";
   defaultValue?: boolean;
}

export interface Property {
   name: string;
   type: Type;
}
export interface ObjectDefinition extends TypeDefinition<object> {
   type: "object";
   properties: Property[];
}

export interface ArrayDefinition<T> extends TypeDefinition<T[]> {
   type: "array";
   entryType: Type;
   minimumCount?: number;
   maximumCount?: number;
   canAddOrDelete?: boolean;
   canReorder?: boolean;
}

export interface MapDefinition extends TypeDefinition<object> {
   type: "map";
   entryType: Type;
   key: StringDefinition | EnumDefinition;
}

export interface EnumDefinition extends TypeDefinition<string> {
   type: "select";
   defaultValue?: string;
   entries: EnumEntry[];
   multiple?: boolean;
}

export interface EnumEntry {
   group?: string;
   key: string
   label?: string
}

export interface DynamicDefinition extends TypeDefinition<any> {
   type: "dynamic";
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

export type Type = NumberDefinition | StringDefinition | BooleanDefinition
   | EnumDefinition | ObjectDefinition | ArrayDefinition<any> | MapDefinition | DynamicDefinition;

export type TypeOrString = Type | string;

// Removed those. They are now in string definitions
//  | ColorDefinition | DateDefinition | DatetimeLocalDefinition
//  | EmaiDefinition | MonthDefinition | RangeDefinition | TelDefinition
//  | TextDefinition | TimeDefinition
//  | UrlDefinition | WeekDefinition | ExternalDefinition

var x: Property[] =
   [
      { "name": "address", "type": { "rows": 4, "type": "string" } },
      { "name": "firstName", "type": { "type": "string" } },
      {
         "name": "history", "type": {
            "entryType": {
               "entries": [
                  {
                     "key": "order",
                     "label": "Order",
                     "type": {
                        "properties": [
                           { "name": "date", "type": { "type": "string" } },
                           {
                              "name": "lines", "type": {
                                 "entryType": {
                                    "properties": [
                                       { "name": "price", "type": { "type": "number" } },
                                       { "name": "product", "type": { "type": "string" } }
                                    ],
                                    "type": "object"
                                 },
                                 "type": "array"
                              }
                           },
                           { "name": "total", "type": { "type": "number" } }
                        ],
                        "type": "object"
                     }
                  },
                  {
                     "key": "message",
                     "label": "Message",
                     "type": {
                        "properties": [
                           { "name": "text", "type": { "type": "string" } }
                        ],
                        "type": "object"
                     }
                  }
               ],
               "type": "dynamic"
            },
            "type": "array"
         }
      },
      { "name": "lastName", "type": { "type": "string" } },

      {
         "name": "notes", "type": {
            "entryType": {
               "properties": [
                  { "name": "date", "type": { "type": "string" } },
                  { "name": "text", "type": { "type": "string" } }
               ],
               "type": "object"
            },
            "type": "array"
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
            "type": "select"
         }
      }
   ]
   ;
