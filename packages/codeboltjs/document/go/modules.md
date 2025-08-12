[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• **default**: ``"\n(\n  (comment)* @doc\n  .\n  (function_declaration\n    name: (identifier) @name.definition.function) @definition.function\n  (#strip! @doc \"^//\\s*\")\n  (#set-adjacent! @doc @definition.function)\n)\n\n(\n  (comment)* @doc\n  .\n  (method_declaration\n    name: (field_identifier) @name.definition.method) @definition.method\n  (#strip! @doc \"^//\\s*\")\n  (#set-adjacent! @doc @definition.method)\n)\n\n(type_spec\n  name: (type_identifier) @name.definition.type) @definition.type\n"``

#### Defined in

[go.ts:6](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/go.ts#L6)
