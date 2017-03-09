;(() => {
	const request = window.superagent
	let INDEX = 0
		, key = true

	new Vue({
		data() {
			return {
				images: []
			}
		},
		computed: {

		},
		methods: {
			_init() {
				const self = this

				const width = window.innerWidth
										|| document.documentElement.clientWidth
										|| document.body.clientWidth
				let imgs = document.querySelectorAll('.item')
				
				self.heights = [] 

				for (let i = 0, len = imgs.length; i < len; i++) {
					if (i < 5) {
						let height = imgs[i].offsetHeight
						self.heights.push(height)
					}
					else {
						const min = Math.min(...self.heights)
								, index = self.heights.findIndex(e => e === min)
								, height = imgs[i].offsetHeight

						// imgs[i].style = {
						// 	position: 'absolute',
						// 	top: `${ min }px`,
						// 	left: `${ 20 * index }%`
						// }
						imgs[i].style.position = 'absolute'
						imgs[i].style.top = `${ min }px`
						imgs[i].style.left = `${ 20 * index }%`

						self.heights[index] += height
					}
				}
			},
			_loadImage(img) {				
				return new Promise((resolve, reject) => {
						const image = new Image()
						
						img = img.querySelector('img')						
						image.onload = function () {
							img.src = this.src
							resolve()
						}
						image.src = img.dataset.src
						image.onerror = function () {
							reject(this)
						}
				})
			},
			_scroll() {
				const self = this
				const height = window.innerHeight
										|| document.documentElement.clientHeight
										|| document.body.clientHeight
						, scrollTop = document.body.scrollTop
						, min = Math.min(...self.heights)

				
				
				if (key) {
					if (scrollTop + height >= min) {
						key = false
						INDEX++
						request.get('/api/img')
							.query('num=40&no=7&skip=' + INDEX)
							.end((err, res) => {
								if (err) console.log(err)

								self.images = self.images.concat(res.body.imgs)
								self.$nextTick(() => {
									let promises = []
									let imgs = document.querySelectorAll('.item')

									for (let i = 0, len = imgs.length; i < len; i++) {
										promises.push(self._loadImage(imgs[i]))
									}
									
									Promise.all(promises)
										.then(() => {
											self._init()
										})
								})
								key = true
							})
					}
				}

			}
		},
		created() {
			const self = this

			request.get('/api/img')
				.query('num=40&no=7&skip=0')
				.end((err, res) => {
					if (err) console.log(err)
	
					self.images = res.body.imgs

					let promises = []
					
					self.$nextTick(() => {
						let imgs = document.querySelectorAll('.item')

						for (let i = 0, len = imgs.length; i < len; i++) {
							promises.push(self._loadImage(imgs[i]))
						}
						
						console.log(promises)
						Promise.all(promises)
							.then(() => {
								self._init()
								window.onresize = function () {
									self._init()
								}
								window.onscroll = self._scroll
							})
					})
				})
		}
	}).$mount('#app')

})()