const axios = require('axios')

console.log('It worked!')

const printInfo = function(info){
	console.log('********')
	console.log('Year: ', info.year)
	console.log('Winner: ', info.film)
	console.log('Budget: ', info.budget)
}

axios.get('http://oscars.yipitdata.com/')
.then(apiResult => {
	const yearList = apiResult.data.results
	const budgetList = []
	let budgetAmount = yearList.length
	yearList.forEach(year => {
		const infoObj = {year: year.year}
		year.films.forEach(film => {
			if (film.Winner) {
				infoObj.film = film.Film
				axios.get(film['Detail URL'])
				.then(detailsResult => {
					const details = detailsResult.data
					if (details.Budget){
						infoObj.budget = details.Budget
						budgetList.push(details.Budget)
					} else {
						infoObj.budget = 'No Budget in API'
						budgetAmount--
					}
					//printInfo(infoObj)
					if (budgetAmount === budgetList.length){
						console.log(budgetList)
						console.log('Done')
					}
				})
			}
		})
	})
})
