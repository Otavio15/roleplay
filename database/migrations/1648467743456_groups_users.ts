import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class GroupsUsers extends BaseSchema {
  protected tableName = 'groups_users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.primary(['user_id', 'group_id'])
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('group_id').unsigned().references('id').inTable('groups').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
