const axios = require('axios')

console.log('It worked!')

const printInfo = function(info){
	console.log('********')
	console.log('Year: ', info.year)
	console.log('Winner: ', info.film)
	console.log('Budget: ', info.budget)
}

const budgetToNumber = function(budgetArray){
	const result = []
	budgetArray.forEach(budget => {
		if (!budget.includes('$')){
			//Including non US$ budgets by converting using current £ -> $ rates.
			//Currently £1.00 = $1.40
			const exchangeRate = 1.40
			if (budget.includes('million')){
				const value = budget.split('£')[1].split(' ')[0]
				result.push(Number(value) * 1000000 * exchangeRate)
			} else {
				const value = budget.split(',').join('').split('£')[1].split(' ')[0]
				result.push(Number(value) * exchangeRate)
			}
		//All cases where million is spelled out
		} else if (budget.includes('million')){
				const value = budget.split('million')[0].split('$')[1]
				//If it is between two values, just taking average of the two
				if (value.includes('-')){
					const twoVals = value.split('-')
					result.push(((Number(twoVals[0]) + Number(twoVals[1])) / 2) * 1000000)
				//Something envolving a different dash (- vs –)
				//I was a little confused at what the difference is
				} else if (value.includes('–')){
					const twoVals = value.split('–')
					result.push(((Number(twoVals[0]) + Number(twoVals[1])) / 2) * 1000000)
				} else {
					//Math.round() to deal with 8.2 turning into 8.1999999...
					result.push(Math.round(Number(value) * 1000000))
				}
		//All cases where commas are used in the number
		} else if (budget.includes(',')) {
			//Removes commas, removes $ from front, and removes anything after a space from the back
			const value = budget.split(',').join('').split('$')[1].split(' ')[0]
			result.push(Number(value))
		} else {
			//This is acting as error handleing
			//If there is some case not accounted for when parsing the budget
			console.log('FIX:', budget)
		}
	})
	return result
}

const averageArray = function(array){
	const sum = array.reduce((accumulator, value) => accumulator + value, 0)
	return Math.round(sum / array.length)
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
					printInfo(infoObj)
					//This if evaluates true if all years have been evaluated
					//Meaning we can no calculate the average budget
					if (budgetAmount === budgetList.length){
						const numberArray = budgetToNumber(budgetList)
						console.log('*********************************')
						console.log('Average budget: $' + averageArray(numberArray))
						console.log('Done')
					}
				})
			}
		})
	})
})
