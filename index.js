const starWarsApi = "https://swapi.dev/api"
let allPeopleData = []
let leftPerson
let rightPerson

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
    let data
    for (let i = 0; i < 20; i++) {
        if (i === 0 || data.next !== null) {
            data = await apiGet(starWarsApi + (i === 0 ? `/people` : `/people?page=${i + 1}`))
            data.results.forEach(person => allPeopleData.push({...person, selected: false}))
            allPeopleData.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            renderDropdowns()
        } else {
            break // Exits the for loop when there are no more data to fetch
        }
    }
    console.log(allPeopleData)
}

const renderDropdowns = () => {
    let dropdowns = document.querySelectorAll(".dropdown-content")
    dropdowns.forEach(elem => elem.innerHTML = "")
    allPeopleData.forEach((person, index) => {
        dropdowns.forEach(dropdown => {
            let listItem = document.createElement("div")
            listItem.classList.add("dropdown-item", "is-clickable", person.selected&& "selected")
            listItem.innerText = person.name
            dropdown.append(listItem)
            
            listItem.addEventListener("mousedown", (() => {
                const left = dropdown.classList.contains("left")
                const header = document.querySelector(`#${left ? "left" : "right"}-container h2`)
                header.innerText = person.name
                left ? leftPerson = person : rightPerson = person
                allPeopleData[index].selected = true
                renderDropdowns()
            }))
        })
    })    
}


//? Event listeners --------------------------------------------------------------------

// Dropdown show/hide
document.querySelectorAll(".dropdown-trigger").forEach(async (button, index) => {
    button.addEventListener("click", () => { document.querySelector(`#dropdown-menu-${index === 0 ? "left" : "right"}`).classList.toggle("is-hidden")})
    button.addEventListener("focusout", () => { document.querySelector(`#dropdown-menu-${index === 0 ? "left" : "right"}`).classList.add("is-hidden")})
})

//? Running code -----------------------------------------------------------------------

getAllPeople() // Fetches all people and fills the dropdown
