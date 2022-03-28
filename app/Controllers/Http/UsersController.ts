import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'
import Users from 'Database/migrations/1647460185064_users'

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    const userPayload = await request.validate(CreateUserValidator)

    const userEmail = await User.findBy('email', userPayload.email)
    const username = await User.findBy('username', userPayload.username)

    if (userEmail) {
      throw new BadRequestException('email already in use', 409)
    }

    if (username) {
      throw new BadRequestException('username already in use', 409)
    }

    const user = await User.create(userPayload)
    return response.created(user)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const { email, password, avatar } = await request.validate(UpdateUserValidator)
    const id = request.param('id')
    const user = await User.findOrFail(id)

    await bouncer.authorize('updatedUser', user)

    user.email = email
    user.password = password
    if (user.avatar) user.avatar = avatar

    await user.save()

    return response.ok({ user })
  }
}
