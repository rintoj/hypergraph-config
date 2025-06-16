import * as dotenv from 'dotenv'
import { CleanedEnv, cleanEnv, str } from 'envalid'
import { resolve } from 'path'

const environmentMap = {
  prod: 'prod',
  production: 'prod',
  PRODUCTION: 'prod',
  PROD: 'prod',
  test: 'test',
  TEST: 'test',
  dev: 'dev',
  development: 'dev',
  DEVELOPMENT: 'dev',
  local: 'local',
  LOCAL: 'local',
}

export function nodeEnv(choices: string[] = Object.keys(environmentMap)) {
  return { NODE_ENV: str({ choices }) }
}

export interface ConfigOptions {
  baseDir?: string
  showEnvironmentFiles?: string
}

export function configure<S>(spec: S, options?: ConfigOptions): CleanedEnv<S> {
  const { baseDir = process.cwd(), showEnvironmentFiles } = options ?? {}
  const path = [(environmentMap as any)[process.env.NODE_ENV as string] as string, '.env']
    .filter(Boolean)
    .map(config => resolve(baseDir, config))
  if (showEnvironmentFiles) {
    console.log('Environment files:', path.join(', '))
  }
  dotenv.config({ path })
  return cleanEnv(process.env, {
    ...spec,
  })
}

export {
  bool,
  email,
  EnvError,
  EnvMissingError,
  host,
  json,
  makeValidator,
  num,
  port,
  str,
  testOnly,
  url,
} from 'envalid'
