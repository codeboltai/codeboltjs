[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• **default**: ``"\n(\n  (comment)* @doc\n  .\n  (method_definition\n    name: (property_identifier) @name) @definition.method\n  (#not-eq? @name \"constructor\")\n  (#strip! @doc \"^[\\s\\*/]+|^[\\s\\*/]$\")\n  (#select-adjacent! @doc @definition.method)\n)\n\n(\n  (comment)* @doc\n  .\n  [\n    (class\n      name: (_) @name)\n    (class_declaration\n      name: (_) @name)\n  ] @definition.class\n  (#strip! @doc \"^[\\s\\*/]+|^[\\s\\*/]$\")\n  (#select-adjacent! @doc @definition.class)\n)\n\n(\n  (comment)* @doc\n  .\n  [\n    (function_declaration\n      name: (identifier) @name)\n    (generator_function_declaration\n      name: (identifier) @name)\n  ] @definition.function\n  (#strip! @doc \"^[\\s\\*/]+|^[\\s\\*/]$\")\n  (#select-adjacent! @doc @definition.function)\n)\n\n(\n  (comment)* @doc\n  .\n  (lexical_declaration\n    (variable_declarator\n      name: (identifier) @name\n      value: [(arrow_function) (function_expression)]) @definition.function)\n  (#strip! @doc \"^[\\s\\*/]+|^[\\s\\*/]$\")\n  (#select-adjacent! @doc @definition.function)\n)\n\n(\n  (comment)* @doc\n  .\n  (variable_declaration\n    (variable_declarator\n      name: (identifier) @name\n      value: [(arrow_function) (function_expression)]) @definition.function)\n  (#strip! @doc \"^[\\s\\*/]+|^[\\s\\*/]$\")\n  (#select-adjacent! @doc @definition.function)\n)\n"``

#### Defined in

[javascript.ts:7](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/javascript.ts#L7)
