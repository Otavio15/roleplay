import User from 'App/Models/User'
import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'

export default class Group extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  @column()
  public name: string
  @column()
  public description: string
  @column()
  public chronic: string
  @column()
  public schedule: string
  @column()
  public location: string
  @column()
  public master: number

  @belongsTo(() => User, {
    foreignKey: 'master',
  })
  public masterUser: BelongsTo<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'groups_users',
  })
  public players: ManyToMany<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
