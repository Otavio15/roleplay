import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('/users', 'UsersController.store')
Route.put('/users/:id', 'UsersController.update').middleware('auth')

Route.post('/forgot-password', 'PasswordsController.forgotPassword')
Route.post('/reset-password', 'PasswordsController.resetPassword')

Route.post('/sessions', 'SessionsController.store')
Route.delete('/sessions', 'SessionsController.destroy')

Route.post('/groups', 'GroupsController.store').middleware('auth')

Route.get('/groups/:groupId/requests', 'GroupRequestsController.index') //.middleware('auth')
Route.post('/groups/:groupId/requests', 'GroupRequestsController.store').middleware('auth')

Route.post('/groups/:groupId/requests/:requestId/accept', 'GroupRequestsController.accept')
Route.delete('/groups/:groupId/requests/:requestId', 'GroupRequestsController.destroy')
