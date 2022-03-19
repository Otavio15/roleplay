import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'
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

  public async update({ request, response }: HttpContextContract) {
    const { email, password, avatar } = request.only(['email', 'username', 'password', 'avatar'])
    const id = request.param('id')
    const user = await User.findOrFail(id)

    user.email = email
    user.password = password
    if (user.avatar) user.avatar = avatar

    user.save()

    return response.ok({ user })
  }
}
