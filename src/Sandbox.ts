import { ObjectType } from "./Types";

var x = {
      "_kind": "object",
      "properties": [{
            "name": "name",
            "type": {
                  "_kind": "string",
                  "type": {
                        "_kind": "string",
                        "editView": "string",
                        "htmlType": "text",
                        "printView": "string"
                  }
            }
      }, {
            "name": "holidaysUsed",
            "type": {
                  "_kind": "number",
                  "defaultValue": "0",
                  "type": {
                        "_kind": "number",
                        "editView": "number",
                        "htmlType": "text",
                        "printView": "number"
                  }
            }
      }, {
            "name": "holidaysPending",
            "type": {
                  "_kind": "number",
                  "defaultValue": "0",
                  "type": {
                        "_kind": "number",
                        "editView": "number",
                        "htmlType": "text",
                        "printView": "number"
                  }
            }
      }, {
            "name": "holidaysLeft",
            "type": {
                  "_kind": "number",
                  "defaultValue": "25",
                  "type": {
                        "_kind": "number",
                        "editView": "number",
                        "htmlType": "text",
                        "printView": "number"
                  }
            }
      }, {
            "name": "history",
            "type": {
                  "_kind": "array",
                  "entryType": [{
                        "name": "status",
                        "type": {
                              "_kind": "select",
                              "entries": [{
                                    "key": "requested"
                              }, {
                                    "key": "approved"
                              }, {
                                    "key": "rejected"
                              }],
                              "type": {
                                    "_kind": "select",
                                    "editView": "select",
                                    "printView": "select"
                              }
                        }
                  }, {
                        "name": "requestDate",
                        "type": {
                              "_kind": "datetime",
                              "type": {
                                    "_kind": "datetime",
                                    "editView": "datetime",
                                    "printView": "datetime"
                              }
                        }
                  }, {
                        "name": "days",
                        "type": {
                              "_kind": "number",
                              "defaultValue": "0",
                              "type": {
                                    "_kind": "number",
                                    "editView": "number",
                                    "htmlType": "text",
                                    "printView": "number"
                              }
                        }
                  }, {
                        "name": "dateFrom",
                        "type": {
                              "_kind": "date",
                              "type": {
                                    "_kind": "date",
                                    "editView": "date",
                                    "printView": "date"
                              }
                        }
                  }, {
                        "name": "dateTo",
                        "type": {
                              "_kind": "date",
                              "type": {
                                    "_kind": "date",
                                    "editView": "date",
                                    "printView": "date"
                              }
                        }
                  }, {
                        "name": "comments",
                        "type": {
                              "_kind": "string",
                              "type": {
                                    "_kind": "string",
                                    "editView": "string",
                                    "htmlType": "text",
                                    "printView": "string"
                              }
                        }
                  }],
                  "type": {
                        "_kind": "array",
                        "editView": "array",
                        "entryType": {
                              "_kind": "object"
                        },
                        "printView": "array"
                  }
            }
      }]
}

var y: ObjectType = {
  "_kind" : "object",
  "properties" : [ {
    "name" : "f1",
    "type" : {
      "_kind" : "string",
//      "type" : {
//        "_kind" : "string",
        "editView" : "string",
        "htmlType" : "text",
        "printView" : "string"
//      }
    }
  } ]
};