[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [cQuery](modules.md#cquery)
- [cppQuery](modules.md#cppquery)
- [csharpQuery](modules.md#csharpquery)
- [goQuery](modules.md#goquery)
- [javaQuery](modules.md#javaquery)
- [javascriptQuery](modules.md#javascriptquery)
- [phpQuery](modules.md#phpquery)
- [pythonQuery](modules.md#pythonquery)
- [rubyQuery](modules.md#rubyquery)
- [rustQuery](modules.md#rustquery)
- [swiftQuery](modules.md#swiftquery)
- [typescriptQuery](modules.md#typescriptquery)

## Variables

### cQuery

• **cQuery**: ``"\n(struct_specifier name: (type_identifier) @name.definition.class body:(_)) @definition.class\n\n(declaration type: (union_specifier name: (type_identifier) @name.definition.class)) @definition.class\n\n(function_declarator declarator: (identifier) @name.definition.function) @definition.function\n\n(type_definition declarator: (type_identifier) @name.definition.type) @definition.type\n"``

#### Defined in

[c.ts:7](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/c.ts#L7)

___

### cppQuery

• **cppQuery**: ``"\n(struct_specifier name: (type_identifier) @name.definition.class body:(_)) @definition.class\n\n(declaration type: (union_specifier name: (type_identifier) @name.definition.class)) @definition.class\n\n(function_declarator declarator: (identifier) @name.definition.function) @definition.function\n\n(function_declarator declarator: (field_identifier) @name.definition.function) @definition.function\n\n(function_declarator declarator: (qualified_identifier scope: (namespace_identifier) @scope name: (identifier) @name.definition.method)) @definition.method\n\n(type_definition declarator: (type_identifier) @name.definition.type) @definition.type\n\n(class_specifier name: (type_identifier) @name.definition.class) @definition.class\n"``

#### Defined in

[cpp.ts:9](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/cpp.ts#L9)

___

### csharpQuery

• **csharpQuery**: ``"\n(class_declaration\n name: (identifier) @name.definition.class\n) @definition.class\n\n(interface_declaration\n name: (identifier) @name.definition.interface\n) @definition.interface\n\n(method_declaration\n name: (identifier) @name.definition.method\n) @definition.method\n\n(namespace_declaration\n name: (identifier) @name.definition.module\n) @definition.module\n"``

#### Defined in

[c-sharp.ts:7](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/c-sharp.ts#L7)

___

### goQuery

• **goQuery**: ``"\n(\n  (comment)* @doc\n  .\n  (function_declaration\n    name: (identifier) @name.definition.function) @definition.function\n  (#strip! @doc \"^//\\s*\")\n  (#set-adjacent! @doc @definition.function)\n)\n\n(\n  (comment)* @doc\n  .\n  (method_declaration\n    name: (field_identifier) @name.definition.method) @definition.method\n  (#strip! @doc \"^//\\s*\")\n  (#set-adjacent! @doc @definition.method)\n)\n\n(type_spec\n  name: (type_identifier) @name.definition.type) @definition.type\n"``

#### Defined in

[go.ts:6](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/go.ts#L6)

___

### javaQuery

• **javaQuery**: ``"\n(class_declaration\n  name: (identifier) @name.definition.class) @definition.class\n\n(method_declaration\n  name: (identifier) @name.definition.method) @definition.method\n\n(interface_declaration\n  name: (identifier) @name.definition.interface) @definition.interface\n"``

#### Defined in

[java.ts:6](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/java.ts#L6)

___

### javascriptQuery

• **javascriptQuery**: ``"\n(\n  (comment)* @doc\n  .\n  (method_definition\n    name: (property_identifier) @name) @definition.method\n  (#not-eq? @name \"constructor\")\n  (#strip! @doc \"^[\\s\\*/]+|^[\\s\\*/]$\")\n  (#select-adjacent! @doc @definition.method)\n)\n\n(\n  (comment)* @doc\n  .\n  [\n    (class\n      name: (_) @name)\n    (class_declaration\n      name: (_) @name)\n  ] @definition.class\n  (#strip! @doc \"^[\\s\\*/]+|^[\\s\\*/]$\")\n  (#select-adjacent! @doc @definition.class)\n)\n\n(\n  (comment)* @doc\n  .\n  [\n    (function_declaration\n      name: (identifier) @name)\n    (generator_function_declaration\n      name: (identifier) @name)\n  ] @definition.function\n  (#strip! @doc \"^[\\s\\*/]+|^[\\s\\*/]$\")\n  (#select-adjacent! @doc @definition.function)\n)\n\n(\n  (comment)* @doc\n  .\n  (lexical_declaration\n    (variable_declarator\n      name: (identifier) @name\n      value: [(arrow_function) (function_expression)]) @definition.function)\n  (#strip! @doc \"^[\\s\\*/]+|^[\\s\\*/]$\")\n  (#select-adjacent! @doc @definition.function)\n)\n\n(\n  (comment)* @doc\n  .\n  (variable_declaration\n    (variable_declarator\n      name: (identifier) @name\n      value: [(arrow_function) (function_expression)]) @definition.function)\n  (#strip! @doc \"^[\\s\\*/]+|^[\\s\\*/]$\")\n  (#select-adjacent! @doc @definition.function)\n)\n"``

#### Defined in

[javascript.ts:7](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/javascript.ts#L7)

___

### phpQuery

• **phpQuery**: ``"\n(class_declaration\n  name: (name) @name.definition.class) @definition.class\n\n(function_definition\n  name: (name) @name.definition.function) @definition.function\n\n(method_declaration\n  name: (name) @name.definition.function) @definition.function\n"``

#### Defined in

[php.ts:6](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/php.ts#L6)

___

### pythonQuery

• **pythonQuery**: ``"\n(class_definition\n  name: (identifier) @name.definition.class) @definition.class\n\n(function_definition\n  name: (identifier) @name.definition.function) @definition.function\n"``

#### Defined in

[python.ts:5](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/python.ts#L5)

___

### rubyQuery

• **rubyQuery**: ``"\n(\n  (comment)* @doc\n  .\n  [\n    (method\n      name: (_) @name.definition.method) @definition.method\n    (singleton_method\n      name: (_) @name.definition.method) @definition.method\n  ]\n  (#strip! @doc \"^#\\s*\")\n  (#select-adjacent! @doc @definition.method)\n)\n\n(alias\n  name: (_) @name.definition.method) @definition.method\n\n(\n  (comment)* @doc\n  .\n  [\n    (class\n      name: [\n        (constant) @name.definition.class\n        (scope_resolution\n          name: (_) @name.definition.class)\n      ]) @definition.class\n    (singleton_class\n      value: [\n        (constant) @name.definition.class\n        (scope_resolution\n          name: (_) @name.definition.class)\n      ]) @definition.class\n  ]\n  (#strip! @doc \"^#\\s*\")\n  (#select-adjacent! @doc @definition.class)\n)\n\n(\n  (module\n    name: [\n      (constant) @name.definition.module\n      (scope_resolution\n        name: (_) @name.definition.module)\n    ]) @definition.module\n)\n"``

#### Defined in

[ruby.ts:6](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/ruby.ts#L6)

___

### rustQuery

• **rustQuery**: ``"\n(struct_item\n    name: (type_identifier) @name.definition.class) @definition.class\n\n(declaration_list\n    (function_item\n        name: (identifier) @name.definition.method)) @definition.method\n\n(function_item\n    name: (identifier) @name.definition.function) @definition.function\n"``

#### Defined in

[rust.ts:6](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/rust.ts#L6)

___

### swiftQuery

• **swiftQuery**: ``"\n(class_declaration\n  name: (type_identifier) @name) @definition.class\n\n(protocol_declaration\n  name: (type_identifier) @name) @definition.interface\n\n(class_declaration\n    (class_body\n        [\n            (function_declaration\n                name: (simple_identifier) @name\n            )\n            (subscript_declaration\n                (parameter (simple_identifier) @name)\n            )\n            (init_declaration \"init\" @name)\n            (deinit_declaration \"deinit\" @name)\n        ]\n    )\n) @definition.method\n\n(class_declaration\n    (class_body\n        [\n            (property_declaration\n                (pattern (simple_identifier) @name)\n            )\n        ]\n    )\n) @definition.property\n\n(property_declaration\n    (pattern (simple_identifier) @name)\n) @definition.property\n\n(function_declaration\n    name: (simple_identifier) @name) @definition.function\n"``

#### Defined in

[swift.ts:7](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/swift.ts#L7)

___

### typescriptQuery

• **typescriptQuery**: ``"\n(function_signature\n  name: (identifier) @name.definition.function) @definition.function\n\n(method_signature\n  name: (property_identifier) @name.definition.method) @definition.method\n\n(abstract_method_signature\n  name: (property_identifier) @name.definition.method) @definition.method\n\n(abstract_class_declaration\n  name: (type_identifier) @name.definition.class) @definition.class\n\n(module\n  name: (identifier) @name.definition.module) @definition.module\n\n(function_declaration\n  name: (identifier) @name.definition.function) @definition.function\n\n(method_definition\n  name: (property_identifier) @name.definition.method) @definition.method\n\n(class_declaration\n  name: (type_identifier) @name.definition.class) @definition.class\n"``

#### Defined in

[typescript.ts:8](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/typescript.ts#L8)
