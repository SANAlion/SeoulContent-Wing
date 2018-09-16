const request = require('request');
const jschardet = require('jschardet');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

module.exports.touristAttraction = function(category, pageCount, callbackFunction) {
	let data = [];
	let idOfData = 0;

	urlCategory = {
		'고궁' : 1111,
		'공원' : 1211,
		'유적지/문화재' : 1311,
		'박물관/미술관' : 1411
	};

	for(let i = 0; i < pageCount; i++) {
		request.get({uri : 'https://disability.seoul.go.kr/amenity/sights/sights.jsp?pagenum=' + (i + 1) + '&Depth=' + urlCategory[category] + '&fDepth=1&sDepth=2&sortName=1', encoding : null}, (error, response, body) => {
			if(error) {
				callbackFunction('Parsing tourist attraction error : ' + error, null);
			} else if(response.statusCode === 200) {
				let buffer = new Buffer(body);
				let decodedBody = iconv.decode(buffer, 'EUC-KR');
				let $ = cheerio.load(decodedBody);

				$('#cwrap > div.board > ul.travel-list > li').each((index, element) => {
					let name = $(element).find('li > dl > dt').children('a').first().text();
					let addressIndex = $(element).find('li > dl > dd > span.loc').text().lastIndexOf('주');
					let address = $(element).find('li > dl > dd > span.loc').text().substr(addressIndex).trim().replace(/\t|\n|\s+/g, " ");
					let categoryData = category;

					data[idOfData++] = {
						'category' : categoryData,
						'name' : name,
						'address' : address
					};
				});
			}

			if(i === pageCount - 1) {
				callbackFunction(null, data);
			}
		});
	}
};