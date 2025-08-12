[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• **default**: ``"\n(class_declaration\n  name: (type_identifier) @name) @definition.class\n\n(protocol_declaration\n  name: (type_identifier) @name) @definition.interface\n\n(class_declaration\n    (class_body\n        [\n            (function_declaration\n                name: (simple_identifier) @name\n            )\n            (subscript_declaration\n                (parameter (simple_identifier) @name)\n            )\n            (init_declaration \"init\" @name)\n            (deinit_declaration \"deinit\" @name)\n        ]\n    )\n) @definition.method\n\n(class_declaration\n    (class_body\n        [\n            (property_declaration\n                (pattern (simple_identifier) @name)\n            )\n        ]\n    )\n) @definition.property\n\n(property_declaration\n    (pattern (simple_identifier) @name)\n) @definition.property\n\n(function_declaration\n    name: (simple_identifier) @name) @definition.function\n"``

#### Defined in

[swift.ts:7](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/swift.ts#L7)
