const API_URL = `http://localhost:3000/api`
let API_KEY = ``
const COLORS = {
  primary: `#007049`,
  orange: `#FFC04B`,
  yellow: `#EBF348`,
  lightGreen: `#7CC444`,
  mediumGreen: `#1D9B42`
}

const main = async () => {
	try {
    if( API_KEY ) init(API_KEY)
    else {
      API_KEY = localStorage.getItem(`API_KEY`)
      if( API_KEY ) init(API_KEY)
      else {
        renderLogin()
      }
    }
	} catch(err) {
		console.error(err)
	}
}

const init = async apiKey => {
  document.getElementById(`public`).style.display = `none`
  document.getElementById(`private`).style.display = `block`
  document.getElementById(`logoutButton`).style.display = `block`

  const registrants = await fetchRegistrants(apiKey)
  const attendees = registrants.filter(({ checkedIn }) => checkedIn)

  document.getElementById(`checkedInNum`).innerText = attendees.length
  renderLevelChart(attendees)
  renderMajorChart(attendees)
  renderStatusChart(registrants)
}

const fetchRegistrants = apiKey => {
  return $.ajax({
    url: `${API_URL}/admin/registrants`,
    method: `GET`,
    headers: {
      'x-api-key': apiKey
    }
  })
}

const renderLevelChart = attendees => {
  const levels = attendees.reduce(( stats, { educationLevel } ) => {
    if( stats[ educationLevel ] )
      stats[ educationLevel ] += 1
    else
      stats[ educationLevel ] = 1
    return stats
  }, {})
  const labels = Object.keys(levels)
  const data = Object.values(levels)
  const el = document.getElementById(`levelChart`).getContext(`2d`)
  new Chart(el, {
    type: `pie`,
    data: {
      datasets: [{
        data,
        backgroundColor: [ COLORS.primary, COLORS.orange, COLORS.yellow ]
      }],
      labels
    }
  })
}

const renderMajorChart = attendees => {
  
  const stats = attendees.reduce(( stats, { major } ) => {
    stats[ major ] ? stats[ major ] += 1 : stats[ major ] = 1
    return stats
  }, {})
  const majors = Object.entries(stats).sort((a, b) => b[1] - a[1]).splice(0, 5)
  const labels = majors.map(([ major, count ]) => major)
  const data = majors.map(([ major, count ]) => count)
  const el = document.getElementById(`majorChart`).getContext(`2d`)
  new Chart(el, {
    type: `pie`,
    data: {
      datasets: [{
        data,
        backgroundColor: [ COLORS.primary, COLORS.orange, COLORS.yellow, COLORS.lightGreen, COLORS.mediumGreen ]
      }],
      labels
    }
  })
}

const renderStatusChart = registrants => {
  console.log(registrants)
  const confirmed = registrants.filter(({ confirmedAttendance1 }) => confirmedAttendance1)
  const greenBand = registrants.filter(({ confirmedAttendance1, checkedIn }) => confirmedAttendance1 && checkedIn)
  const blueBand = registrants.filter(({ confirmedAttendance1, checkedIn }) => !confirmedAttendance1 && checkedIn)
  const none = registrants.filter(({ confirmedAttendance1, checkedIn }) => !confirmedAttendance1 && !checkedIn)
  const stats = {
    'Confirmed and checked in': greenBand.length,
    'No confirmation and checked in': blueBand.length,
    'Confirmed and no show': (confirmed.length - greenBand.length),
    'No confirmation and no show': none.length
  }
  const labels = Object.keys(stats)
  const data = Object.values(stats)
  const el = document.getElementById(`statusChart`).getContext(`2d`)
  new Chart(el, {
    type: `pie`,
    data: {
      datasets: [{
        data,
        backgroundColor: [ COLORS.primary, COLORS.orange, COLORS.yellow, COLORS.lightGreen, COLORS.mediumGreen ]
      }],
      labels
    },
    options: {
      legend: {
        position: `bottom`
      }
    }
  })
}

const renderLogin = () => {
  document.getElementById(`private`).style.display = `none`
  document.getElementById(`logoutButton`).style.display = `none`
  document.getElementById(`public`).style.display = `block`
  document.getElementById(`loginForm`).onsubmit = e => {
    e.preventDefault()
    const apiKey = e.target[`API_KEY`].value
    if( !apiKey ) return alert(`Please enter an api key`)
    localStorage.setItem(`API_KEY`, apiKey)
    init(apiKey)
  }
}

const logout = () => {
  localStorage.removeItem(`API_KEY`)
  renderLogin()
}

(function($) {
	main($)
})(jQuery)