let selects = document.querySelectorAll("select")
let compareBtn = document.querySelector("#compare-button")
const leftUl = document.querySelector("#left-container ul")
const rightUl = document.querySelector("#right-container ul")
const result = document.querySelector("#compare-list")

const starWarsApi = "https://swapi.dev/api"

let allPeopleData = []
let allPeopleRawData = []
let leftPerson = {name: "left"}
let rightPerson = {name: "right"}


class Character {
    constructor({id, name, gender, height, mass, hair_color, skin_color, eye_color, films, pictureUrl}) {
        this.id = id
        this.name = name,
        this.gender = gender,
        this.height = height,
        this.mass = mass,
        this.hairColor = hair_color,
        this.skinColor = skin_color,
        this.eyeColor = eye_color,
        this.movies = films,
        this.pictureUrl = pictureUrl
    }
}


// Takes the string and fetches from that adress
const apiGet = async str => {
    const res = await fetch(str)
    const data = await res.json()
    return data
}


// Fetches all people and continuesly updates the lists
const getAllPeople = async () => {
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
            allPeopleData.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            renderDropdowns()
        } else {
            break // Exits the for loop when there are no more data to fetch
        }
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
        allPeopleData.forEach((person, index) => {
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
    if([leftNum, rightNum].includes(undefined)) {
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
        leftUl.innerHTML = ""
        rightUl.innerHTML = ""
        result.innerHTML = ""
        if (this.id === "left-select") {
            allPeopleData.forEach(person => person.name === this.value&& (leftPerson = new Character(person)))
            document.querySelector("#left-container img").src = leftPerson.pictureUrl
            document.querySelector("#left-container img").alt = `Picture of ${leftPerson.name}`
            document.querySelector("#left-container h2").innerText = leftPerson.name
        } else {
            allPeopleData.forEach(person => person.name === this.value&& (rightPerson = new Character(person)))
            document.querySelector("#right-container img").src = rightPerson.pictureUrl
            document.querySelector("#right-container img").alt = `Picture of ${rightPerson.name}`
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
                select.style.borderColor = "#dbdbdb"
            })
            document.querySelectorAll(".select-err").forEach(err => err.innerText = "")
        }

    })
})

// Compare button
compareBtn.addEventListener("click", () => {
    leftUl.innerHTML = ""
    rightUl.innerHTML = ""
    result.innerHTML = ""

    const tallest = compareHighest(leftPerson.length, rightPerson.length)
    const heaviest = compareHighest(leftPerson.mass, rightPerson.mass)
    const numberOfMovies = compareHighest(leftPerson.movies.length, rightPerson.movies.length)
    const sameGender = compareSame(leftPerson.gender, rightPerson.gender)
    const sameHairColor = compareSame(leftPerson.hairColor, rightPerson.hairColor)
    const sameSkinColor = compareSame(leftPerson.skinColor, rightPerson.skinColor)

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
        result.innerHTML = tallest.side === "same" ?
            `<li>Both ${leftPerson.name} and ${rightPerson.name} are the same length.</li>` :
            `<li>${tallest.name} on the ${tallest.side} side is the tallest.</li>`
    }
    if (heaviest !== undefined) {
        result.innerHTML += heaviest.side === "same" ?
            `<li>Both ${leftPerson.name} and ${rightPerson.name} weigh the same.</li>` :
            `<li>${heaviest.name} on the ${heaviest.side} side wheigh the most.</li>`
    }
    if (numberOfMovies !== undefined) {
        result.innerHTML += numberOfMovies.side === "same" ?
            `<li>They have both starred ${numberOfMovies} movies.</li>` :
            `<li>${numberOfMovies.name} on the ${numberOfMovies.side} side have played in the most movies.</li>`
    }
    result.innerHTML += sameGender ?
        `<li>They are both of the same gender.</li>` :
        `<li>They are not of the same gender.</li>`
    result.innerHTML += sameHairColor ?
        `<li>They both have the same haircolor.</li>` :
        `<li>They do not have the same haircolor.</li>`
    result.innerHTML += sameSkinColor ?
        `<li>They are both ${leftPerson.skinColor} skintone.</li>` :
        `<li>They are of different skintones.</li>`
})

//? Running code -----------------------------------------------------------------------

getAllPeople() // Fetches all people and fills the dropdown

