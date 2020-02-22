import { targetPath, readFile, getJSON, writeFile, mkdir } from './helpers'

/**
 * Swagger Schema Type Definition
 */

const enum SchemaType {
  integer = 'integer',
  number = 'number',
  boolean = 'boolean',
  string = 'string',
  object = 'object',
  array = 'array',
}

const enum IntegerFormat {
  int32 = 'int32',
  int64 = 'int64',
}

interface ISchemaRef {
  $ref: string
}

interface ISchemaBasic {
  type: SchemaType
  allOf?: ISchemaRef[]
  description?: string
}

interface ISchemaInteger extends ISchemaBasic {
  type: SchemaType.integer
  format: IntegerFormat
  enum?: number[]
}

interface ISchemaNumber extends ISchemaBasic {
  type: SchemaType.number
}

interface ISchemaBoolean extends ISchemaBasic {
  type: SchemaType.boolean
}

interface ISchemaString extends ISchemaBasic {
  type: SchemaType.string
}

interface ISchemaObject extends ISchemaBasic {
  type: SchemaType.object
  properties: Record<string, ISchema>
}

interface ISchemaArray extends ISchemaBasic {
  type: SchemaType.array
  items: ISchema | ISchemaRef
}

type ISchema = ISchemaInteger | ISchemaNumber | ISchemaBoolean | ISchemaString | ISchemaObject | ISchemaArray

/**
 * Swagger to typescript
 */

export async function swagger2ts(source: string, outDir: string) {
  const isNetSource = /^https?:\/\//.test(source)

  const sourceContent = isNetSource
    ? await getJSON(source)
    : await readFile(targetPath(source), {
        encoding: 'utf8',
      })

  const swagger = JSON.parse(sourceContent)

  if (!('openapi' in swagger)) {
    console.error('Source must be an openAPI json')
    return
  }

  const schemas = swagger.components.schemas

  const typeFileContent = parseSchemas(schemas)

  try {
    await writeFile(targetPath(outDir, 'types.ts'), typeFileContent, { mode: 0o644 })
  } catch (error) {
    await mkdir(targetPath(outDir), { recursive: true, mode: 0o755 })
    await writeFile(targetPath(outDir, 'types.ts'), typeFileContent, { mode: 0o644 })
  }

  console.log('TypeScript file has been generated, have a good time~')
}

function parseSchemas(schemas: Record<string, ISchema>) {
  const typesData: string[] = []

  for (const [key, val] of Object.entries(schemas)) {
    typesData.push(
      parseComment(val) +
        (val.type === SchemaType.object
          ? `export interface ${key} ${parseSchema(val)}`
          : `export type ${key} = ${parseSchema(val)}`)
    )
  }

  return typesData.join('\n\n')
}

function parseComment(schema: ISchema) {
  return schema.description ? `\n/** ${schema.description} */` : ''
}

function parseSchema(schema: ISchema) {
  if (schema.allOf) {
    return schema.allOf.map(({ $ref }) => parseRef($ref)).join(' & ')
  }

  switch (schema.type) {
    case SchemaType.integer:
      return parseSchemaInteger(schema)

    case SchemaType.number:
      return parseSchemaNumber(schema)

    case SchemaType.string:
      return parseSchemaString(schema)

    case SchemaType.boolean:
      return parseSchemaBoolean(schema)

    case SchemaType.object:
      return parseSchemaObject(schema)

    case SchemaType.array:
      return parseSchemaArray(schema)

    default:
      console.log('Unknown schema type:\n' + JSON.stringify(schema, null, 2) + '\n')
  }
}

function parseRef(ref: string) {
  // "#/components/schemas/".length as 21
  return ref.slice(21)
}

function parseSchemaInteger(schema: ISchemaInteger) {
  return schema.format === IntegerFormat.int64 ? `string` : schema.enum ? schema.enum.join(' | ') : `number`
}

function parseSchemaNumber(schema: ISchemaNumber) {
  return `number`
}

function parseSchemaBoolean(schema: ISchemaBoolean) {
  return `boolean`
}

function parseSchemaString(schema: ISchemaString) {
  return `string`
}

function parseSchemaObject(schema: ISchemaObject): string {
  return `{${Object.entries(schema.properties).reduce(
    (acc, [key, val]) => (acc += `${parseComment(val)}${key}: ${parseSchema(val)}; `),
    ''
  )}}`
}

function parseSchemaArray(schema: ISchemaArray): string {
  if ('$ref' in schema.items) {
    return `${parseRef(schema.items.$ref)}[]`
  }

  return `${parseSchema(schema.items)}[]`
}
