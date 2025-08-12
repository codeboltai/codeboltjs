[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• **default**: ``"\n(struct_specifier name: (type_identifier) @name.definition.class body:(_)) @definition.class\n\n(declaration type: (union_specifier name: (type_identifier) @name.definition.class)) @definition.class\n\n(function_declarator declarator: (identifier) @name.definition.function) @definition.function\n\n(function_declarator declarator: (field_identifier) @name.definition.function) @definition.function\n\n(function_declarator declarator: (qualified_identifier scope: (namespace_identifier) @scope name: (identifier) @name.definition.method)) @definition.method\n\n(type_definition declarator: (type_identifier) @name.definition.type) @definition.type\n\n(class_specifier name: (type_identifier) @name.definition.class) @definition.class\n"``

#### Defined in

[cpp.ts:9](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/cpp.ts#L9)
