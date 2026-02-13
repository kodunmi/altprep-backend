import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'password_resets' })
export class PasswordReset {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  email: string;

  @Column()
  token: string;

  @Column()
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
