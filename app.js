const Koa = require('koa')
		, Router = require('koa-router')
		, static = require('koa-static2')
		, send = require('koa-send')
		, views = require('koa-views')
		, fs = require('fs')
		, path = require('path')
		, app = new Koa()
		, router = new Router()
	
app.use(views(__dirname + '/views', {
	map: {
		html: 'pug'
	},
	extension: 'pug'
}))
app.use(static('public', './beauties'))
app.use(static('static', './static'))

router
	.get('/', async ctx => {
		await send(ctx, './index.html')
	})
	.get('/api/k1', async ctx => {
		ctx.body = { name: 'zfk' }
	})
	.get('/api/img', async ctx => {
		const query = ctx.request.query
				, skip = query.skip - 0
				, no = query.no - 1
				, skipNum = skip * 20
				, dirs = await fs.readdirSync('./beauties')
				, logs = await fs.readdirSync('./beauties/' + dirs[no])

		try {
			let imgs = logs.slice(skipNum, skipNum + 20)
			
			for (let i = 0, len = imgs.length; i < len; i++) {
				imgs[i] = `/public/${ dirs[no] }/${ imgs[i] }`
			}

			ctx.body = { imgs }
		} catch (e) {}
	})

app
	.use(router.routes())
	.use(router.allowedMethods())

app.listen(3333, () => {
		console.log('listen on 3333')
	})
	.on('error', err => {
		console.log(err)
	})

