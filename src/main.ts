import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.enableCors({
		origin: [process.env.CLIENT_URL],
		credentials: true,
		exposedHeaders: 'set-cookie'
	})
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	app.use(cookieParser())
	await app.listen(Number(process.env.PORT) || 3000)
}
void bootstrap()
