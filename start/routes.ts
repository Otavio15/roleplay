import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('/users', 'UsersController.store')

Route.put('/users/:id', 'UsersController.update')

Route.post('/forgot-password', 'PasswordsController.forgotPassword')
