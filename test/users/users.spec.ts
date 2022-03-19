import Hash from '@ioc:Adonis/Core/Hash'
import { UserFactory } from './../../database/factories/index'
import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import { Assert } from 'japa/build/src/Assert'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('User', (group) => {
  test('It should create an user', async (assert) => {
    const userPayload = {
      email: 'test@test.com.br',
      username: 'test',
      password: 'test',
      avatar: 'https://image.placeholder.com/',
    }
    const { body } = await supertest(BASE_URL).post('/users').send(userPayload).expect(201)
    assert.exists(body, 'Body undefined')
    assert.exists(body.username, 'User undefined')
    assert.exists(body.id, 'Id undefined')
    assert.equal(body.email, userPayload.email)
    assert.equal(body.username, userPayload.username)
    assert.notExists(body.password, 'Password defined')
  })

  test('It should return 409 when email is already in use', async (assert) => {
    const { email } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        username: 'teste',
        email: email,
        password: 'test',
      })
      .expect(409)

    assert.exists(body.message)
    assert.exists(body.code)
    assert.exists(body.status)
    assert.include(body.message, 'email')
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('It should return 409 when username is already in use', async (assert) => {
    const { username } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        username: username,
        email: 'email@teste.com.br',
        password: 'test',
      })
      .expect(409)

    assert.exists(body.message)
    assert.exists(body.code)
    assert.exists(body.status)
    assert.include(body.message, 'username')
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('It shoud return 422 when required data is not provided', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/users').send({}).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('It shoud return 422 when providing an invalid email', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email: 'test@',
        username: 'Otavio',
        password: '12345',
      })
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('It shoud return 422 when providing an invalid password', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email: 'test@gmail.com',
        username: 'Otavio',
        password: '123',
      })
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('It should update an user', async (assert) => {
    const { id, password } = await UserFactory.create()
    const email = 'test@test.com'
    const avatar = 'http://github.com/otavio15'

    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .send({
        email: email,
        avatar: avatar,
        password: password,
      })
      .expect(200)

    assert.exists(body.user, 'User undefined')
    assert.equal(body.user.email, email)
    assert.equal(body.user.avatar, avatar)
    assert.equal(body.user.id, id)
  })

  test.only('It should update the password of the user', async (assert) => {
    const user = await UserFactory.create()
    const password = 'test'

    const { body } = await supertest(BASE_URL)
      .put(`/users/${user.id}`)
      .send({
        email: user.email,
        avatar: user.avatar,
        password,
      })
      .expect(200)

    assert.exists(body.user, 'User undefined')
    assert.equal(body.user.id, user.id)
    await user.refresh()
    assert.isTrue(await Hash.verify(user.password, password))
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
