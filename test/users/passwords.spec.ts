import { DateTime, Duration } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { UserFactory } from './../../database/factories/index'
import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'
import Mail from '@ioc:Adonis/Addons/Mail'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Password', (group) => {
  test('it should send and email with forgot password instructions', async (assert) => {
    const user = await UserFactory.create()
    Mail.trap((message) => {
      assert.deepEqual(message.to, [{ address: user.email }])
      assert.deepEqual(message.from, { address: 'no-reply@roleplay.com' })
      assert.equal(message.subject, 'Roleplay: recuperação de senha')
      assert.include(message.html!, user.username)
    })
    await supertest(BASE_URL)
      .post('/forgot-password')
      .send({
        email: user.email,
        resetPasswordUrl: 'url',
      })
      .expect(204)
    Mail.restore()
  }).timeout(0)

  test('it should create a reset password token', async (assert) => {
    const user = await UserFactory.create()
    await supertest(BASE_URL)
      .post('/forgot-password')
      .send({
        email: user.email,
        resetPasswordUrl: 'url',
      })
      .expect(204)

    const tokens = await user.related('tokens').query()
    console.log({ tokens })
    assert.isNotEmpty(tokens)
  }).timeout(0)

  test('It should return 422 when required data is not provided or data is invalid', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/forgot-password').send({}).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('It should be able to reset password', async (assert) => {
    const user = await UserFactory.create()
    const { token } = await user.related('tokens').create({ token: 'token' })
    await supertest(BASE_URL)
      .post('/reset-password')
      .send({ token, password: '123456' })
      .expect(204)

    await user.refresh()
    const chechPassword = await Hash.verify(user.password, '123456')
    assert.isTrue(chechPassword)
  })

  test('It should return 422 when required data is not provided or data is invalid', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/reset-password').send({}).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 404 when using the same token twice', async (assert) => {
    const user = await UserFactory.create()
    const { token } = await user.related('tokens').create({ token: 'token' })
    await supertest(BASE_URL)
      .post('/reset-password')
      .send({ token, password: '123456' })
      .expect(204)
    const { body } = await supertest(BASE_URL)
      .post('/reset-password')
      .send({ token, password: '123456' })
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('It cannot reset password when token is expired after 2 hours', async (assert) => {
    const user = await UserFactory.create()
    const date = DateTime.now().minus(Duration.fromISOTime('02:01'))
    const { token } = await user.related('tokens').create({ token: 'token', createdAt: date })
    const { body } = await supertest(BASE_URL)
      .post('/reset-password')
      .send({ token, password: '123456' })
      .expect(410)
    assert.equal(body.code, 'TOKEN_EXPIRED')
    assert.equal(body.status, 410)
    assert.equal(body.message, 'token has expired')
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
