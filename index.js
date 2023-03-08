const starWarsApi = "https://swapi.dev/api"
let allPeopleData = []

class Character {
    constructor(name, gender, height, mass, hairColor, skinColor, eyeColor, movies, pictureUrl) {
        this.name = name,
        this.gender = gender,
        this.height = height,
        this.mass = mass,
        this.hairColor = hairColor,
        this.skinColor = skinColor,
        this.eyeColor = eyeColor,
        this.movies = movies,
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
    for (let i = 0; i < 20; i++) {
        if (i === 0 || allPeopleData.at(-1).next !== null) {
            const data = await apiGet(starWarsApi + (i === 0 ? `/people` : `/people?page=${i + 1}`))
            allPeopleData.push(await data)
            renderLists(data)
        } else {
            console.log(allPeopleData)
            break // Exits the for loop
        }
    }
}

const renderLists = (obj) => {
    let dropdown = document.querySelectorAll(".dropdown-content")    
    obj.results.forEach(person => {
        dropdown.forEach(dropdown => {
            dropdown.innerHTML += `<div class="dropdown-item">${person.name}</div>`
        })
    })    
}


//? Event listeners --------------------------------------------------------------------

document.querySelectorAll(".dropdown-trigger").forEach(async (button, index) => {
    button.addEventListener("click", e => {
    let dropdown = document.querySelector(`#dropdown-menu${index + 1}`)
        dropdown.classList.toggle("is-hidden")
    })
})

//? Running code -----------------------------------------------------------------------

getAllPeople() // Fetches all people and fills the dropdown

