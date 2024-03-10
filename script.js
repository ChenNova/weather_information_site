/*fetch data from weather api*/
const lat = 61.28
const lon = 23.46
let programStartedFlag = true

fetchData()
weatherPageData()

setInterval(() => {
  updateScreenTime()
}, 1000)

setInterval(() => {
  const currentTime = document.getElementById('hour-time-1').innerText
  const tampereTime = getCurrentTimeInTampere()
  const differenceInMinutes = calculateTimeDifference(currentTime, tampereTime)
  if (differenceInMinutes >= 0) {
    weatherPageData()
  }
}, 1000)

function updateScreenTime() {
  const hour = document.getElementById('current-time')
  const tampereTime = getCurrentTimeInTampere()
  hour.innerHTML = tampereTime
}

async function fetchData() {
  try {
    apiUrl = ` https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Fetch error:', error)
  }
}

/*fetch all the detail data that are showing in the web page.*/
async function weatherPageData() {
  try {
    const data = await fetchData()

    /*fetch temperature */
    const currentAirTemperature =
      data.properties.timeseries[0].data.instant.details.air_temperature
    const temperatureElement = document.getElementById('temperature')
    temperatureElement.innerHTML = currentAirTemperature + '°C'

    /*fetch temperature icon*/
    const currentTemperatureIcon =
      data.properties.timeseries[0].data.next_1_hours.summary.symbol_code
    const temperatureIcon = document.getElementById('icon')
    temperatureIcon.src = `images/${currentTemperatureIcon}.png`

    /*fetch time*/
    const currentTime = data.properties.timeseries[0].time
    const formattedCurrentTime = formatTime(currentTime)
    const time = document.getElementById('current-date')
    const hour = document.getElementById('current-time')
    const tampereTime = getCurrentTimeInTampere()
    time.innerHTML = formattedCurrentTime.split(' ')[0]
    hour.innerHTML = tampereTime

    /*fetch humidity*/
    const currentHumidity =
      data.properties.timeseries[0].data.instant.details.relative_humidity
    const humidity = document.getElementById('humidity')
    humidity.innerHTML = 'Humidity: ' + currentHumidity + ' %'

    /*fetch wind*/
    const currentWindSpeed =
      data.properties.timeseries[0].data.instant.details.wind_speed
    const windSpeed = document.getElementById('wind-speed')
    windSpeed.innerHTML = 'Wind Speed: ' + currentWindSpeed + ' m/s'

    const bottomContainer = document.getElementById('bottom-container')

    /*fetch the time,icon, temperature for the next 6 hour by a for loop */
    if (programStartedFlag == true) {
      for (let n = 1; n <= 6; n++) {
        // Create elements for time, icon, and temperature
        const hourInfoContainer0 = document.createElement('div')
        hourInfoContainer0.classList.add('hour-container')
        hourInfoContainer0.id = `hour-container-${n}`
        const timeDiv0 = document.createElement('div')
        timeDiv0.classList.add('hour-time')
        timeDiv0.id = `hour-time-${n}`
        const iconDiv0 = document.createElement('img')
        iconDiv0.classList.add('hour-icon')
        iconDiv0.id = `hour-icon-${n}`
        const temperatureDiv0 = document.createElement('div')
        temperatureDiv0.classList.add('hour-temperature')
        temperatureDiv0.id = `our-temperature-${n}`
        // Append elements to the container
        hourInfoContainer0.appendChild(timeDiv0)
        hourInfoContainer0.appendChild(iconDiv0)
        hourInfoContainer0.appendChild(temperatureDiv0)
        bottomContainer.appendChild(hourInfoContainer0)
      }
      programStartedFlag = false
    }

    for (let n = 1; n <= 6; n++) {
      const timeNextHour = data.properties.timeseries[n].time
      const formattedTimeNextHour = formatTime(timeNextHour)

      const iconNextHour =
        data.properties.timeseries[n].data.next_1_hours.summary.symbol_code

      const temperatureNextHour =
        data.properties.timeseries[n].data.instant.details.air_temperature

      const timeDiv = document.getElementById(`hour-time-${n}`)
      const iconDiv = document.getElementById(`hour-icon-${n}`)
      const temperatureDiv = document.getElementById(`our-temperature-${n}`)
      timeDiv.innerText = formattedTimeNextHour.split(' ')[1]
      iconDiv.src = `images/${iconNextHour}.png`
      temperatureDiv.textContent = `${temperatureNextHour}°C`
    }
  } catch (error) {
    console.error('Error', error)
  }
}

function formatTime(inputTime) {
  const dateTime = new Date(inputTime)

  // Adjust the time to UTC
  const utcHours = dateTime.getUTCHours() + 2
  const utcMinutes = dateTime.getUTCMinutes()

  const year = dateTime.getFullYear()
  const month = (dateTime.getMonth() + 1).toString().padStart(2, '0')
  const day = dateTime.getDate().toString().padStart(2, '0')
  const hours = utcHours.toString().padStart(2, '0')
  const minutes = utcMinutes.toString().padStart(2, '0')

  const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}`
  return formattedTime
}

function getCurrentTimeInTampere() {
  const tampereTimeZone = 'Europe/Helsinki'
  const currentTime = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tampereTimeZone,
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
  })
  const formattedTime = formatter.format(currentTime)
  return formattedTime
}

function calculateTimeDifference(startTime, endTime) {
  const start = parseTimeString(startTime)
  const end = parseTimeString(endTime)
  const timeDifference = end - start
  const minutesDifference = timeDifference / (1000 * 60)
  return minutesDifference
}

function parseTimeString(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number)
  const currentDate = new Date()
  currentDate.setHours(hours, minutes, 0, 0)
  return currentDate
}
