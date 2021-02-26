const conditionImg = document.getElementById('condition-img')
const city = document.getElementById('city')
const country = document.getElementById('country')
const weatherCondition = document.getElementById('weather-condition')
const weatherDescription = document.getElementById('weather-description')
const temperature = document.getElementById('temperature')
const pressure = document.getElementById('pressure')
const humidity = document.getElementById('humidity')
const cityInput = document.getElementById('city-input')
const matchCityList = document.getElementById('match-city-list')
const historyEml = document.getElementById('history')
const masterHistory = document.getElementById('master-history')
const API_KEY = '2af02de7afba3096c217e360c9d3610f'
const BASE_URL = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}`
const ICON_URL = 'https://openweathermap.org/img/w'
const defaultCity = "cox's bazar,bd"

window.addEventListener('load', function () {
    // for ask user for know user's location
    navigator.geolocation.getCurrentPosition(
        (s) => {
            // if permitted
            getWeatherData(null, s.coords)
        },
        (e) => {
            // if denied
            getWeatherData(defaultCity)
        }
    )
    axios
        .get('/history')
        .then(({ data }) => {
            if (data.length > 0) {
                updateHistory(data)
            } else {
                historyEml.innerHTML = 'There is no History'
            }
        })
        .catch((e) => {
            alert('Error Occurred')
            console.error(e)
        })
    cityInput.addEventListener('input', async function (e) {
        const response = await fetch('../json/cities.json')
        const cities = await response.json()
        let matches = cities.filter((city) => {
            const regex = new RegExp(`^${e.target.value}`, 'gi')
            return city.name.match(regex)
        })
        if (e.target.value.length === 0) {
            matches = []
            matchCityList.innerHTML = ''
        }
        let matchesIndex = matches.length - 1
        matches.splice(5, matchesIndex)
        autocompleteOutputHTML(matches)
    })
    matchCityList.addEventListener('click', function (e) {
        cityInput.value = e.target.innerText
        updateWeatherData(e.target.innerText)
    })
    cityInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            if (e.target.value) {
                updateWeatherData(e.target.value)
            } else {
                alert('Please Enter a valid City Name')
            }
        }
    })
})

function getWeatherData(city, coords, cb) {
    let url = BASE_URL
    city === null
        ? (url = `${url}&lat=${coords.latitude}&lon=${coords.longitude}`)
        : (url = `${url}&q=${city}`)

    axios
        .get(url)
        .then(({ data }) => {
            // destructuring data
            let weather = {
                icon: data.weather[0].icon,
                name: data.name,
                main: data.weather[0].main,
                country: data.sys.country,
                description: data.weather[0].description,
                temp: data.main.temp,
                pressure: data.main.pressure,
                humidity: data.main.humidity,
            }
            setWeather(weather)
            if (cb) cb(weather)
        })
        .catch((err) => {
            alert('City not Found')
            resetInputMatchList()
        })
}

// for set weather data in HTML
function setWeather(weather) {
    let tempInCelsius = (weather.temp - 273.15).toFixed(1) // toFixed(fixed_value) take fixed_value after dot(.)

    conditionImg.src = `${ICON_URL}/${weather.icon}.png`
    city.innerHTML = weather.name
    weatherCondition.innerHTML = weather.main
    country.innerHTML = weather.country
    weatherDescription.innerHTML = weather.description
    temperature.innerHTML = `${tempInCelsius}&deg; C`
    pressure.innerHTML = `${weather.pressure} Pa`
    humidity.innerHTML = `${weather.humidity} %`
    resetInputMatchList()
}

// for update weather data
function updateWeatherData(target) {
    getWeatherData(target, null, (weather) => {
        target = ''
        axios
            .post('/history', weather)
            .then(({ data }) => {
                updateHistory(data)
            })
            .catch((e) => {
                console.error(e)
            })
    })
}

// for update history in database
function updateHistory(history) {
    document.getElementById('margin').classList.remove('margin')
    historyEml.innerHTML = ''
    history = history.reverse()
    history.splice(3, history.length - 1)

    history.forEach((h) => {
        let tempHistory = masterHistory.cloneNode(true)
        tempHistory.classList.remove('d-none')

        tempHistory.getElementsByClassName(
            'history-img'
        )[0].src = `${ICON_URL}/${h.icon}.png`
        tempHistory.getElementsByClassName('city')[0].innerHTML = h.name
        tempHistory.getElementsByClassName('country')[0].innerHTML = h.country
        tempHistory.getElementsByClassName('weather-condition')[0].innerHTML =
            h.main
        tempHistory.getElementsByClassName('weather-description')[0].innerHTML =
            h.description
        tempHistory.getElementsByClassName('temperature')[0].innerHTML = `${(
            h.temp - 273.15
        ).toFixed(1)}&deg; C`
        tempHistory.getElementsByClassName(
            'pressure'
        )[0].innerHTML = `${h.pressure} Pa`
        tempHistory.getElementsByClassName(
            'humidity'
        )[0].innerHTML = `${h.humidity} %`

        historyEml.appendChild(tempHistory)
    })
}

// autocomplete output in HTML
function autocompleteOutputHTML(matches) {
    if (matches.length === 6) return
    if (matches.length > 0) {
        const autocomplete = matches
            .map(
                (match) =>
                    `
            <li class="list-group-item matched-city-list">${match.name}, ${match.country}</li>
            `
            )
            .join('')
        matchCityList.innerHTML = autocomplete
    }
}
function resetInputMatchList() {
    cityInput.value = ''
    matchCityList.innerHTML = ''
}