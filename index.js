let selects = document.querySelectorAll("select")

const starWarsApi = "https://swapi.dev/api"
const googleApi = "https://customsearch.googleapis.com/customsearch/v1"
let googleParams = new URLSearchParams({
    key: "AIzaSyAxw21qUiSOhWy4Nc4yrxn88It6Lb5f0mM", 
    cx: "648b92f1a63e44d8c", 
    searchType: "image"
})



let allPeopleData = []
let leftPerson = {name: "left"}
let rightPerson = {name: "right"}

class Character {
    constructor({name, gender, height, mass, hair_color, skin_color, eye_color, films, pictureUrl}) {
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


// Searches google for a picture of input string
const getPicture = async (str) => {
    googleParams.append("q", str)
    console.log(`${googleApi}?${googleParams}`)
    const data = await apiGet(`${googleApi}?${googleParams}`)
    googleParams.delete("q")
    console.log(data)
    return data.items[0].link
}

// Fetches all people and continuesly updates the lists
const getAllPeople = async () => {
    let data
    for (let i = 0; i < 20; i++) {
        if (i === 0 || data.next !== null) {
            data = await apiGet(starWarsApi + (i === 0 ? `/people` : `/people?page=${i + 1}`))
            data.results.forEach(person => allPeopleData.push(person))
            allPeopleData.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            renderDropdowns()
        } else {
            break // Exits the for loop when there are no more data to fetch
        }
    }
    console.log(allPeopleData)
}

const renderDropdowns = () => {
    selects.forEach(select => {
        const value = select.value
        if (value === "Välj en karaktär") {
            select.innerHTML = "<option disabled hidden selected>Välj en karaktär</option>"
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


//? Event listeners --------------------------------------------------------------------

// Dropdown
selects.forEach((select) => {
    select.addEventListener("change", async function() {
        if (this.id === "left-select") {
            allPeopleData.forEach(person => person.name === this.value&& (leftPerson = new Character(person)))
            document.querySelector("#left-container img").src = await getPicture(leftPerson.name)
            document.querySelector("#left-container h2").innerText = leftPerson.name
        } else {
            allPeopleData.forEach(person => person.name === this.value&& (rightPerson = new Character(person)))
            document.querySelector("#right-container img").src = await getPicture(rightPerson.name)
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

//? Running code -----------------------------------------------------------------------

getAllPeople() // Fetches all people and fills the dropdown

