/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserService } from 'src/user/user.service'
import { PassportStrategy } from '@nestjs/passport'
import { User } from '@prisma/client'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		private userService: UserService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.getOrThrow<string>('JWT_SECRET')
		})
	}

	async validate({ id }: { id: string }): Promise<User | null> {
		return this.userService.getById(id)
	}
}
