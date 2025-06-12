import * as dotenv from 'dotenv'
import { CleanedEnv, cleanEnv, str } from 'envalid'

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

export function configure<S>(spec: S): CleanedEnv<S> {
  const path = [(environmentMap as any)[process.env.NODE_ENV as string] as string, '.env'].filter(
    Boolean,
  )
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
