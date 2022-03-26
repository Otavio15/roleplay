import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Exception } from '@adonisjs/core/build/standalone'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new TokenExpiredException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class TokenExpiredException extends Exception {
  public code = 'TOKEN_EXPIRED'
  public status = 410

  constructor() {
    super('token has expired')
  }

  public async handle(error: this, ctx: HttpContextContract) {
    return ctx.response.status(error.status).send({
      code: error.code,
      message: error.message,
      status: error.status,
    })
  }
}
