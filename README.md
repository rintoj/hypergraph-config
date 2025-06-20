# Hypergraph Config (`@hgraph/config`)

**A robust, type-safe, and flexible solution for managing environment-based configurations in your
NodeJS projects.**

`@hgraph/config` simplifies the process of defining and validating configuration variables for your
application. It provides a clean, declarative API to ensure that your application starts with a
valid and predictable configuration, whether in development, testing, or production. By parsing and
validating environment variables against a defined schema, it helps prevent common configuration
errors at runtime.

## Features

- **Type-safe Configurations:** Define the expected data type for each environment variable (e.g.,
  `port`, `string`, `boolean`, `url`).
- **Built-in `NODE_ENV` Handling:** Quickly configure the standard `NODE_ENV` variable using
  `nodeEnv()` with sensible defaults (`development`, `production`, `test`).
- **Built-in Validators:** Ensures variables are in the correct format (e.g., `email`, `host`,
  `json`).
- **Environment-aware Defaults:** Easily set different default values for development
  (`devDefault`), testing (`testOnly`), and production environments.
- **Extensible:** Create your own custom validators for specific needs.
- **Customizable Error Reporting:** Override the default error handling to integrate with your
  logging or notification systems.
- **Clear and Concise:** A declarative API that makes your configuration file easy to read and
  maintain.

## Installation

Install the package using your favorite package manager:

```bash
npm install @hgraph/config
```

or

```bash
yarn add @hgraph/config
```

## Getting Started

Create a `config.ts` (or `config.js`) file in your project's source directory to define your
application's configuration.

**`src/config.ts`**

```typescript
import { configure, str, bool, port, num, email, url, json, nodeEnv } from '@hgraph/config'
import { resolve } from 'path'

export const config = configure(
  {
    // Standard NodeJS environment
    ...nodeEnv(),

    // Network and Server
    PORT: port({ devDefault: 3000, desc: 'The port the application will listen on.' }),
    SERVER_URL: url({ default: 'https://api.yourapp.com', example: 'https://api.yourapp.com' }),

    // Database Configuration
    DATABASE_URL: str({ docs: 'https://your-docs.com/db-config' }),
    DATABASE_TYPE: str({ choices: ['postgres', 'mysql', 'sqlite'], default: 'postgres' }),
    DB_SYNCHRONIZE: bool({ default: false, devDefault: true }),

    // Application Settings
    RETRY_COUNT: num({ default: 3, desc: 'Number of times to retry a failed operation.' }),
    WEBSITE_URL: str({ default: 'https://yourapp.com' }),
    GRAPHQL_PLAYGROUND: bool({ default: false, devDefault: true }),

    // Security (use environment variables for these sensitive values)
    JWT_SECRET: str({ devDefault: 'local-secret-for-development' }),
    JWT_EXPIRY: str({ default: '15m' }),

    // Third-Party Services
    SUPPORT_EMAIL: email(),
    FIREBASE_CONFIG: json({ desc: 'Firebase service account configuration.' }),
  },
  {
    baseDir: resolve(__dirname, '..'),
    showEnvironmentFiles: false,
  },
)
```

Now you can import the `config` object throughout your application to access your configuration
variables.

## How it Works

The `configure` function reads your environment variables from `process.env`. For each key you
define, it will:

1.  Look for a corresponding variable in `process.env`.
2.  If not found, it will check for an environment-specific default (`devDefault` if `NODE_ENV` is
    'development', or a value from `testOnly` if `NODE_ENV` is 'test').
3.  If still not found, it will use the generic `default` value.
4.  If no value is found and the field is not optional, it will throw an error and exit the process.
5.  It will then validate and parse the value according to the specified validator function.

## API Reference

### Validator Types

Node's `process.env` only stores strings. These functions validate and transform the raw string
values into the correct types.

| Function      | Description                                                             | Parsing Rules                                                                 |
| :------------ | :---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **`str()`**   | Ensures a string value is present. An empty string is considered valid. | `my-api-key`                                                                  |
| **`bool()`**  | Parses the input into a boolean.                                        | `"true"`, `"1"`, `"t"` become `true`. `"false"`, `"0"`, `"f"` become `false`. |
| **`num()`**   | Parses the input into a JavaScript `Number`.                            | `"42"`, `"0.23"`, `"1e5"`                                                     |
| **`port()`**  | Ensures the value is a valid TCP port.                                  | A number between 1 and 65535.                                                 |
| **`host()`**  | Ensures the value is a domain name or an IP address (v4 or v6).         | `"example.com"`, `"127.0.0.1"`, `"::1"`                                       |
| **`email()`** | Ensures the value is a valid email address format.                      | `"user@example.com"`                                                          |
| **`url()`**   | Ensures the value is a URL with a protocol and hostname.                | `"https://api.example.com"`                                                   |
| **`json()`**  | Parses the input string using `JSON.parse`.                             | `'{"key": "value"}'`                                                          |

### Validator Options

Each validator function accepts an optional options object with the following properties:

| Option           | Type            | Description                                                                                                          |
| :--------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------- |
| **`default`**    | `any`           | A fallback value to use if the env var is not set. Makes the var optional. _Note: Default values are not validated._ |
| **`devDefault`** | `any`           | A fallback value used only when `NODE_ENV` is **not** `'production'`.                                                |
| **`choices`**    | `Array<string>` | An array of allowed _parsed_ values for the variable.                                                                |
| **`desc`**       | `string`        | A description of the environment variable.                                                                           |
| **`example`**    | `string`        | An example value for the env var.                                                                                    |
| **`docs`**       | `string`        | A URL that links to more detailed documentation.                                                                     |

### Helper Functions

#### `nodeEnv(options?)`

A convenience function that provides a standard configuration for `NODE_ENV`. It should be spread
into your `configure` object.

```typescript
import { configure, nodeEnv } from '@hgraph/config'

export const config = configure({
  ...nodeEnv(),
  // ... other variables
})
```

By default, this is equivalent to:

```typescript
{
  NODE_ENV: str({
    choices: ['development', 'production', 'test'],
    default: 'development',
    desc: 'The environment the application is running in.',
  })
}
```

You can pass an options object to customize its behavior, for example, to allow more environments:

```typescript
...nodeEnv({
  choices: ['development', 'production', 'test', 'staging']
})
```

### Custom Validators

You can easily create your own validator functions for custom logic using `makeValidator()`. A
validator should either return a cleaned value or throw an error for invalid input.

```typescript
import { makeValidator } from '@hgraph/config'

// Custom integer validator
const int = makeValidator<number>((input: string) => {
  const coerced = parseInt(input, 10)
  if (Number.isNaN(coerced)) {
    throw new Error(`Invalid integer input: "${input}"`)
  }
  return coerced
})

export const config = configure({
  RETRY: int(),
})
```

## Custom Validators

For TypeScript users, `makeValidator<T>` allows you to create validators with specific output types.

```typescript
import { makeValidator } from '@hgraph/config'

const twoChars = makeValidator<string>(({ input }) => {
  if (/^[A-Za-z]{2}$/.test(input))) {
    return input.toUpperCase()
  }
  throw new Error('Expected two letters')
})

export const config = configure({
  INITIALS: twoChars({ example: 'AB' }),
})
```

## Error Reporting

By default, if any required environment variables are missing or invalid, the library will log an
error message and call `process.exit(1)`. You can override this behavior by providing a custom
`reporter` function.

This is useful for sending errors to a monitoring service or for custom logging formats.

```typescript
import { configure } from '@hgraph/config'

export const config = configure(
  {
    API_KEY: str(),
    DB_HOST: str(),
  },
  {
    reporter: ({ errors, env }) => {
      // Custom error handling logic
      console.error(
        `Configuration Error: Invalid environment variables: ${Object.keys(errors).join(', ')}`,
      )

      for (const [envVar, err] of Object.entries(errors)) {
        if (err instanceof EnvMissingError) {
          console.error(`Missing required variable: ${envVar}`)
        } else if (err instanceof EnvError) {
          console.error(`Invalid value for ${envVar}: ${err.message}`)
        }
      }
      // To prevent the application from starting with invalid config
      process.exit(1)
    },
  },
)
```

## Changelog

### v1.0.9

- Downgrade version to 1.0.9.

```bash
npm version patch
```
