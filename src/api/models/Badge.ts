import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm'
  import { User } from './User'
  
  @Entity({ name: 'badges' })
  export class Badge {
  
    @PrimaryGeneratedColumn('increment')
    id: number
  
    @Column({ type: 'varchar', length: 191 })
    name: string
  
    @Column({ type: 'text', nullable: true })
    description?: string
  
    @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
    iconUrl?: string
  
    @Column({ type: 'varchar', length: 50, nullable: true })
    level?: string
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
  
    /* --------------------  RELATIONSHIPS  -------------------- */
  
    @OneToMany(() => User, (user) => user.badge)
    users: User[]
  }
  