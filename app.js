const Koa = require('koa')
		, mount = require('koa-mount')
		, static = require('koa-static2')
		, send = require('koa-send')
		, app = new Koa()

app.use(static('public', './beauties'))
app.use(static('static', './static'))

app
	.use(mount('/', async (ctx, next) => {
		await next()
		await send(ctx, './index.html')
	}))
app
	.use(mount('/api/k1', async (ctx, next) => {
		await next()

		ctx.body = { name: 'zfk' }
	}))

app.listen(3333, () => {
		console.log('listen on 3333')
	})
	.on('error', err => {
		console.log(err)
	})