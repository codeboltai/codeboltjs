[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• **default**: ``"\n(\n  (comment)* @doc\n  .\n  [\n    (method\n      name: (_) @name.definition.method) @definition.method\n    (singleton_method\n      name: (_) @name.definition.method) @definition.method\n  ]\n  (#strip! @doc \"^#\\s*\")\n  (#select-adjacent! @doc @definition.method)\n)\n\n(alias\n  name: (_) @name.definition.method) @definition.method\n\n(\n  (comment)* @doc\n  .\n  [\n    (class\n      name: [\n        (constant) @name.definition.class\n        (scope_resolution\n          name: (_) @name.definition.class)\n      ]) @definition.class\n    (singleton_class\n      value: [\n        (constant) @name.definition.class\n        (scope_resolution\n          name: (_) @name.definition.class)\n      ]) @definition.class\n  ]\n  (#strip! @doc \"^#\\s*\")\n  (#select-adjacent! @doc @definition.class)\n)\n\n(\n  (module\n    name: [\n      (constant) @name.definition.module\n      (scope_resolution\n        name: (_) @name.definition.module)\n    ]) @definition.module\n)\n"``

#### Defined in

[ruby.ts:6](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/parse-source-code/queries/ruby.ts#L6)
