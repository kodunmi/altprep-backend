import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm'
  import { User } from './User'
import { Course } from './Course'
  
  @Entity({ name: 'tracks' })
  export class Track {
  
    @PrimaryGeneratedColumn('increment')
    id: number
  
    @Column()
    name: string
  
    @Column()
    description?: string
  
    @CreateDateColumn()
    created_at: Date
  
    @UpdateDateColumn()
    updated_at: Date
  
    /* --------------------  RELATIONSHIPS  -------------------- */
  
    @OneToMany(() => User, (user) => user.track)
    users: User[]

    @OneToMany(() => Course, (course) => course.track)
    courses: Course[]
  }
  