import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcryptjs from 'bcryptjs'
import { Repository } from 'typeorm'

import { AuthCredentialDto } from './dto/auth.credential.dto'
import { User } from './entities/user.entity'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly authRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signIn({ username, password }: AuthCredentialDto) {
    const user = await this.authRepository.findOne({
      where: {
        username,
      },
    })

    // TODO: compare 할 땐 salt를 모르는데 어떻게 비교를해서 맞는지 아닌지 확인하는거지
    const isPasswordMatched = await bcryptjs.compare(password, user.password)

    if (user && isPasswordMatched) {
      // 유저 토큰 생성 (Secret + Payload)

      const payload = {
        username,
      }

      const accessToken = this.jwtService.sign(payload)

      return {
        accessToken,
      }
    }

    throw new UnauthorizedException('비밀버호 정보가 맞지 않습니다.')
  }

  async signUp({ username, password }: AuthCredentialDto) {
    const salt = await bcryptjs.genSalt()
    const hasgedPassword = await bcryptjs.hash(password, salt)

    const user = this.authRepository.create({
      username,
      password: hasgedPassword,
    })

    if (!user) {
      throw new BadRequestException('12312321')
    }

    try {
      await this.authRepository.save(user)
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Existing username')
      } else {
        throw new InternalServerErrorException()
      }
    }

    return user
  }
}
