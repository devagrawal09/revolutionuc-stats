const API_URL = `http://localhost:3000/api`
const API_KEY = `testapikey`

const main = async () => {
	try {
		const stats = await $.ajax({
			url: `${API_URL}/admin/stats`,
			method: `GET`,
			headers: {
				'x-api-key': API_KEY
			}
		})
		console.log(xhr)
	} catch(err) {
		console.error(err);
	}
}

(function($) {
	main($)
})(jQuery)