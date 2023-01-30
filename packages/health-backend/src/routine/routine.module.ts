import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from 'src/auth/auth.module'

import { Routine } from './entities/routines.entity'
import { RoutineController } from './routine.controller'
import { RoutineService } from './routine.service'

@Module({
  imports: [TypeOrmModule.forFeature([Routine]), AuthModule],
  providers: [RoutineService],
  controllers: [RoutineController],
})
export class RoutineModule {}