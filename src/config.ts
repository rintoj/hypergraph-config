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

dotenv.config({
  path: [(environmentMap as any)[process.env.NODE_ENV as string] as string, '.env'].filter(Boolean),
})

export function configureConfig<S>(spec: S): CleanedEnv<S> {
  return cleanEnv(process.env, {
    NODE_ENV: str({ choices: Object.keys(environmentMap) }),
    ...spec,
  })
}

export {
  bool,
  email,
  host,
  json,
  num,
  port,
  str,
  url,
  testOnly,
  makeValidator,
  EnvError,
  EnvMissingError,
} from 'envalid'
