const superagent = require('superagent')
		, install = require('superagent-charset')
		, cheerio = require('cheerio')
		, fs = require('fs')
		, path = require('path')
		, request = install(superagent)

class Crawer {
	constructor() {
		this._base = 'http://www.iyi8.com/' 
		this.entries = {}
		
	}

	getHtml(url) {
		let key = true
			, unkey = true
			
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (key) {
					unkey = false
					reject('timeout')
				}
			}, 20000)
			console.log(`正在爬取${ url }...`)
			request.get(url)
				.end((err, res) => {
					key = false
					if (unkey) {
						if (err) reject(err)
						resolve(res.text)
					}
				})
		})
	}
	
	start() {

		this._init()	
	}

	_init() {
		const self = this
		this.getHtml(this._base)
			.then(html => self.addEntries(html))
			.then(() => self._crawerData())
			.catch(err => console.log(err))
	}

	addEntries(html) {
		const self = this
		const $ = cheerio.load(html)
			
		let entries = $('#indexNav .indexWrap ul')
			.find('li:not(:first-of-type)')

		entries.each((i, v) => {
			let enter = $(v).find('a')
				, title = enter.text()
				, href = enter.attr('href')
			
			self.entries[title] = href
		})
	}

	async	_crawerData() {
		const self = this
		let unpicked = new Set()
		
		fs.mkdirSync(path.join(__dirname, '/beauties'))
		
		for (let key of Object.keys(self.entries)) {
			fs.mkdirSync(path.join(__dirname, '/beauties', `/${ key }`))
			try {
				let html = await self.getHtml(self.entries[key])
				await self._crawerPage(html, key)
			} catch (e) {}
		}
	}

	async _crawerPage(html, key) {
		const self = this
		const $ = cheerio.load(html)
				, urls = $('#main .item')

		let urlSet = new Set()

		urls.each((i, v) => {
			urlSet.add($(v)
				.find('a')
				.attr('href'))
			
		})
		
		for (let url of urlSet) {
			try {
				const html = await self.getHtml(url)
						, len = self._allPages(html)
				
				url = url.replace(/.html/, '')

				for (let i = 2; i < len; i++) {
					try {
						const html = await self.getHtml(`${ url }_${ i }.html`)
						await self._anlynaHtml(html, key) 
					} catch(e) {}
				}

			} catch(e) {}
		}
	}
	
	_allPages(html) {
		const self = this
				, $ = cheerio.load(html)
				, pages = $('#Subcon > .page > a').length
			
		return pages
		
	}

	_anlynaHtml(html, key) {
		const self = this
				, $ = cheerio.load(html)

		return new Promise((resolve, reject) => {
			const img = $('#Subcon > div:nth-child(2)')
				.find('a > img')
				.attr('src')
			
			console.log(`正在爬取${ img }`)
			request.get(img)
				.end((err, res) => {
					if (err) reject(err)

					fs.writeFile(path.join(__dirname, '/beauties') + `/${ key }/${ img.match(/\w+.(jpg|png|gif)/)[0] }`, res.body, err => {
						if (err) reject(err)

						resolve()
					})
				})
		})
	}

}

module.exports = Crawer

;(async () => {
	const crawer = new Crawer()
	
	crawer.start()
})()

