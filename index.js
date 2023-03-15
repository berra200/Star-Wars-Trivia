const selects = document.querySelectorAll(".character-select")
const compareBtn = document.querySelector("#compare-button")
const extraInfo = document.querySelector("#extra-info")
const leftUl = document.querySelector("#left-container ul")
const rightUl = document.querySelector("#right-container ul")
let compareList = document.querySelector("#compare-list")

const starWarsApi = "https://swapi.dev/api"

let allPeopleData = []
let allPeopleRawData = []
let leftPerson = {name: "left"}
let rightPerson = {name: "right"}


class Character {
    constructor({id, name, gender, height, mass, hair_color, skin_color, eye_color, films, pictureUrl, homeworld, vehicles, starships}) {
        this.id = id
        this.name = name,
        this.gender = gender,
        this.height = height,
        this.mass = mass,
        this.hairColor = hair_color,
        this.skinColor = skin_color,
        this.eyeColor = eye_color,
        this.movies = films,
        this.pictureUrl = pictureUrl,
        this.homeworld = homeworld
        this.vehicles = vehicles
        this.starships = starships
    }

    // returns releasedate for the first movie
    async firstShownDate() {
        const data = await apiGet(this.movies[0])
        return data.release_date
    }

    // returns an array of movie names both attended to
    async moviesBothAttended() {
        const sameMovies = leftPerson.movies.filter(movie => rightPerson.movies.includes(movie))
        let promises = sameMovies.map(movie => apiGet(movie))
        let result = await Promise.all(promises)
        let movieNames = result.map(movie => movie.title)
        return movieNames
    }

    // returns an object containing information about the planets
    async compareHomePlanet() {
        let promises = []
        promises.push(apiGet(leftPerson.homeworld))
        promises.push(apiGet(rightPerson.homeworld))
        let result = await Promise.all(promises)
        let planetNames = result.map(planet => planet.name)
        planetNames = {left: planetNames[0], right: planetNames[1]}
        planetNames.left === planetNames.right ? planetNames.same = true : planetNames.same = false
        return planetNames
    }

    async mostExpensiveVehicle() {
        let promises = []
        this.vehicles.map(vehicle => promises.push(apiGet(vehicle)))
        this.starships.map(starship => promises.push(apiGet(starship)))
        let result = await Promise.all(promises)
        result = result.filter(obj => obj.cost_in_credits !== "unknown")
        result.sort((a, b) => (Number(a.cost_in_credits) > Number(b.cost_in_credits)) ? -1 : 0)
        return result.length > 0 ? {name: result[0].name, value: result[0].cost_in_credits} : false
    }
}

// Takes the string and fetches from that adress
const apiGet = async str => {
    const res = await fetch(str)
    const data = await res.json()
    return data
}


// Fetches all people and continuesly updates the lists
const oneByOne = false
const getAllPeople = async () => {
    if(oneByOne) {
        let data
        const pictureData = await apiGet(`https://rawcdn.githack.com/akabab/starwars-api/0.2.1/api/all.json`)
        for (let i = 0; i < 10; i++) {
            if (i === 0 || data.next !== null) {
                data = await apiGet(starWarsApi + (i === 0 ? `/people` : `/people?page=${i + 1}`))
                data.results.forEach(person => {
                    const id = allPeopleData.length + 1 > 16 ? allPeopleData.length + 2 : allPeopleData.length + 1
                    allPeopleData.push({
                        ...person,
                        id,
                        pictureUrl: pictureData[allPeopleData.length].image
                    })
                })
                allPeopleData.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
                renderDropdowns()
            } else {
                break // Exits the for loop when there are no more data to fetch
            }
        }
    }else {
        let promises = []
        let pictureData
        promises.push(apiGet(`https://rawcdn.githack.com/akabab/starwars-api/0.2.1/api/all.json`))
        for (let i = 0; i < 9; i++) {
            promises.push(apiGet(starWarsApi + (i === 0 ? `/people` : `/people?page=${i + 1}`)))
        }
        let result = await Promise.all(promises)
        let data = result.map((data, i) => {
            if (i === 0) {
                pictureData = data
            } else {
                data.results.forEach(person => {
                    const id = allPeopleData.length + 1 > 16 ? allPeopleData.length + 2 : allPeopleData.length + 1
                    allPeopleData.push({
                        ...person,
                        id,
                        pictureUrl: pictureData[allPeopleData.length].image
                    })
                })
            }
        })
        allPeopleData.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
        renderDropdowns()
    }
}

const renderDropdowns = () => {
    selects.forEach(select => {
        const value = select.value
        if (value === "Choose character!") {
            select.innerHTML = "<option disabled hidden selected>Choose character!</option>"
        } else {
            select.innerHTML = ""
        }
        allPeopleData.forEach((person) => {
            let option = document.createElement("option")
            option.innerText = person.name
            // remember its value if already changed before loading is done
            if (value === person.name) {
                option.selected = true
            }
            select.append(option)
        })
    })
}

const compareHighest = (leftNum, rightNum) => {
    if([leftNum, rightNum].includes("unknown") || [leftNum, rightNum].includes(undefined)) {
        return undefined
    } else if (leftNum > rightNum) {
        return {
            side: "left",
            name: leftPerson.name,
            value: leftNum,
        }
    } else if (rightNum > leftNum) {
        return {
            side: "right",
            name: rightPerson.name,
            value: rightNum,
        }
    } else {
        return {
            side: "same",
            value: leftNum,
        }
    }
}

const compareSame = (str1, str2) => {
    if (str1 === str2) {
        return true
    } else {
        return false
    }
}


//? Event listeners --------------------------------------------------------------------

// Dropdown
selects.forEach((select) => {
    select.addEventListener("change", async function() {
        let leftImg = document.querySelector("#left-container img")
        let rightImg = document.querySelector("#right-container img")
        leftUl.innerHTML = ""
        rightUl.innerHTML = ""
        extraInfo.innerHTML = ""
        compareList&& (compareList.innerHTML = "")
        if (this.id === "left-select") {
            allPeopleData.forEach(person => person.name === this.value&& (leftPerson = new Character(person)))
            leftImg.classList.remove("placeholder")
            leftImg.src = leftPerson.pictureUrl
            leftImg.alt = `Picture of ${leftPerson.name}`
            document.querySelector("#left-container h2").innerText = leftPerson.name
        } else {
            allPeopleData.forEach(person => person.name === this.value&& (rightPerson = new Character(person)))
            rightImg.classList.remove("placeholder")
            rightImg.src = rightPerson.pictureUrl
            rightImg.alt = `Picture of ${rightPerson.name}`
            document.querySelector("#right-container h2").innerText = rightPerson.name
        }

        // Error message if both select are the same
        if (leftPerson.name === rightPerson.name) {
            selects.forEach((select) => {
                select.style.borderColor = "red"
            })
            document.querySelectorAll(".select-err").forEach(err => err.innerText = "Du kan inte jämnföra samma person.")
        } else {
            selects.forEach((select) => {
                select.style.borderColor = "none"
            })
            document.querySelectorAll(".select-err").forEach(err => err.innerText = "")
        }

    })
})

// Compare button
compareBtn.addEventListener("click", () => {
    const tallest = compareHighest(leftPerson.length, rightPerson.length)
    const heaviest = compareHighest(leftPerson.mass, rightPerson.mass)
    const numberOfMovies = compareHighest(leftPerson.movies.length, rightPerson.movies.length)
    const sameGender = compareSame(leftPerson.gender, rightPerson.gender)
    const sameHairColor = compareSame(leftPerson.hairColor, rightPerson.hairColor)
    const sameSkinColor = compareSame(leftPerson.skinColor, rightPerson.skinColor)

    extraInfo.innerHTML = `
    <div class="left-container is-flex is-flex-direction-column">
        <select class="more-info">
        <option selected hidden disabled>More info</option>
        <option value="date">First shown</option>
        <option value="movies">Movies both attended in</option>
        <option value="homeplanet">Compare homeplanet</option>
        <option value="vehicle">Most valuble vehicle</option>
        </select>
        <p></p>
        <ul class="left-extra-ul"></ul>
    </div>
    <div class="info-container is-flex is-flex-direction-column mx-2">
        <ul id="compare-list"></ul>
    </div>
    <div class="right-container is-flex is-flex-direction-column">
        <select class="more-info">
            <option selected hidden disabled>More info</option>
            <option value="date">First shown</option>
            <option value="movies">Movies both attended in</option>
            <option value="homeplanet">Compare homeplanet</option>
            <option value="vehicle">Most valuble vehicle</option>
        </select>
        <p></p>
        <ul class="right-extra-ul"></ul>
    </div>`
    compareList = document.querySelector("#compare-list")

    addMoreInfoEventListeners()

    leftUl.innerHTML = ""
    rightUl.innerHTML = ""
    compareList.innerHTML = ""
    
    for (let i = 0; i < 2; i++) {
        let list = i === 0 ? leftUl : rightUl
        list.innerHTML = `
        <li><strong>Haircolor:</strong> ${i === 0 ? leftPerson.hairColor : rightPerson.hairColor}</li>
        <li><strong>Length:</strong> ${i === 0 ? leftPerson.length : rightPerson.length}</li>
        <li><strong>Weight:</strong> ${i === 0 ? leftPerson.mass : rightPerson.mass}</li>
        <li><strong>Gender:</strong> ${i === 0 ? leftPerson.gender : rightPerson.gender}</li>
        <li><strong>Skintone:</strong> ${i === 0 ? leftPerson.skinColor : rightPerson.skinColor}</li>
        <li><strong>Eyecolor:</strong> ${i === 0 ? leftPerson.eyeColor : rightPerson.eyeColor}</li>
        <li><strong>Number of movies:</strong> ${i === 0 ? leftPerson.movies.length : rightPerson.movies.length}</li>
        `
    }


    if (tallest !== undefined) {
        compareList.innerHTML = tallest.side === "same" ?
            `<li>Both ${leftPerson.name} and ${rightPerson.name} are the same length.</li>` :
            `<li>${tallest.name} on the ${tallest.side} side is the tallest.</li>`
    }
    if (heaviest !== undefined) {
        compareList.innerHTML += heaviest.side === "same" ?
            `<li>Both ${leftPerson.name} and ${rightPerson.name} weigh the same.</li>` :
            `<li>${heaviest.name} on the ${heaviest.side} side wheigh the most.</li>`
    }
    if (numberOfMovies !== undefined) {
        compareList.innerHTML += numberOfMovies.side === "same" ?
            `<li>They have both starred ${numberOfMovies.value} movie${numberOfMovies.value === 1 ? "" : "s"}.</li>` :
            `<li>${numberOfMovies.name} on the ${numberOfMovies.side} side have played in the most movies.</li>`
    }
    compareList.innerHTML += sameGender ?
        `<li>They are both of the same gender.</li>` :
        `<li>They are not of the same gender.</li>`
    compareList.innerHTML += sameHairColor ?
        `<li>They both have the same haircolor.</li>` :
        `<li>They do not have the same haircolor.</li>`
    compareList.innerHTML += sameSkinColor ?
        `<li>They are both ${leftPerson.skinColor} skintone.</li>` :
        `<li>They are of different skintones.</li>`
})

const addMoreInfoEventListeners = () => {
    let moreInfo = document.querySelectorAll(".more-info")
    moreInfo.forEach( (elem, i) => {
        elem.addEventListener("change", async function() {
            const left = this.parentElement.classList.contains("left-container")
            const name = left ? leftPerson.name : rightPerson.name
            const otherName = !left ? leftPerson.name : rightPerson.name
            let ul = left ? document.querySelector(".left-extra-ul") : document.querySelector(".right-extra-ul")
            ul.innerHTML = ""
            if (this.value === "date"){
                const date = left ? leftPerson.firstShownDate() : rightPerson.firstShownDate()
                this.nextElementSibling.innerText = `${name} was first shown in a movie ${await date}.`
            } else if (this.value === "movies") {
                const movies = left ? await leftPerson.moviesBothAttended() : await rightPerson.moviesBothAttended()
                if (movies.length > 0) {
                    this.nextElementSibling.innerText = `Movies that both attended are:`
                    movies.forEach(movie => {
                        let li = document.createElement("li")
                        li.innerText = `- ${movie}`
                        ul.append(li)
                    })
                } else {
                    this.nextElementSibling.innerText = `They did not play in any movie toghether with eachother.`
                }
            } else if (this.value === "homeplanet") {
                const homeplanet = left ? await leftPerson.compareHomePlanet() : await rightPerson.compareHomePlanet()
                if (homeplanet.same) {
                    this.nextElementSibling.innerText = `${name} share homeplanet named ${homeplanet.left} with ${otherName}.`
                } else {
                    this.nextElementSibling.innerText = 
                        `${name} homeplanet is ${left ? homeplanet.left : homeplanet.right} while ${otherName}s homeplanet is ${!left ? homeplanet.left : homeplanet.right}.`
                }
            } else if (this.value === "vehicle") {
                const vehicle = left ? await leftPerson.mostExpensiveVehicle() : await rightPerson.mostExpensiveVehicle()
                if (vehicle) {
                    this.nextElementSibling.innerText = `${name} most expensive vehicle are the ${await vehicle.name} worth a whoping ${vehicle.value}credits.`
                } else {
                    this.nextElementSibling.innerText = `${name} dont own any vehicles.`
                }
            }
        })
    });
}

//? Running code -----------------------------------------------------------------------

getAllPeople() // Fetches all people and fills the dropdown