import Reveal from 'reveal.js'
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'
import './spectre.scss'

const baseUrl = window.location.href
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const category = urlParams.get('cat')
const module = urlParams.get('mod')

setShare()

if(category && module){
    const input = document.getElementById('resource')
    const resource = `${category}/${module}`
    input.value = resource
    setPresentation(resource)
}else{
    showWelcome()
}

document.getElementById('submit').addEventListener('click', async () => {
    const input = document.getElementById('resource').value.toLowerCase()
    setPresentation(input)
})


async function setPresentation(input){

    try{

        const title = await fetch(`https://git.door43.org/unfoldingWord/en_ta/raw/branch/master/${input}/title.md`)
            .then(handleErrors)
            .then( response => response.text() )
            .catch( err => {throw err})

        const subtitle = await fetch(`https://git.door43.org/unfoldingWord/en_ta/raw/branch/master/${input}/sub-title.md`)
            .then(handleErrors)
            .then(response => response.text())
            .catch( err => {throw err})

        const courseURL = `https://git.door43.org/unfoldingWord/en_ta/raw/branch/master/${input}/01.md`

        const courseContent = await fetch(courseURL)
            .then(handleErrors)
            .then(response => response.text())
            .catch( err => {throw err})       
    
        if(title && subtitle && courseContent){

            const parts = input.split('/')
            const category = parts[0]
            const module = parts[1]
            setShare(category, module)
            document.title = `${title} - translationAcademy slides`
            history.pushState({page:1}, document.title, `?cat=${category}&mod=${module}`)

            hideWelcome()

            document.getElementById('course-title').innerHTML = title
            document.getElementById('course-subtitle').innerHTML = subtitle
            document.getElementById('markdown-section').setAttribute("data-markdown", courseURL);
            document.getElementById('slider-wrapper').classList.remove('hide')
    
            let deck = new Reveal({
                plugins: [ Markdown ]
             })
            
             let viewed = []
             let totalSlides = 0
             let progress = 0
            
             deck.initialize().then( e => {
                totalSlides = deck.getTotalSlides()
            
                console.log("current slide:",e.indexh, e.indexv)
                console.log("total slides:",deck.getTotalSlides())
            
                const pos = `${e.indexh},${e.indexv}`
            
                if ( !viewed.includes(pos) ) viewed.push(pos)
            
                progress = Math.round((viewed.length/totalSlides)*100)
            
                console.log(`${viewed.length}/${totalSlides} slides viewed. (${progress}%)`)
             })
            
             deck.on( 'slidetransitionend', e => {
            
                console.log( deck.getProgress() )
                console.log('slide changed') 
            
                const pos = `${e.indexh},${e.indexv}`
                
                if ( !viewed.includes(pos) ) viewed.push(pos)
            
                progress = Math.round((viewed.length/totalSlides)*100)
            
                console.log(`${viewed.length}/${totalSlides} slides viewed. (${progress}%)`)
            });
            
    
        }else{

            showWelcome()
            showError()
            console.error('resource not found')
    
        }

    }catch(err){

        showWelcome()
        showError()
        console.log('fuera')
        console.error(err)
        return

    }

}

function showWelcome(){
    let welcome = document.getElementById('welcome')
        welcome.classList.toggle('hide')
        welcome.classList.add("slide-in-bck-center")
}

function hideWelcome(){
    let welcome = document.getElementById('welcome')
        welcome.classList.add("slide-out-left")
        setTimeout( () => { 
            welcome.style.display = 'none'
        }, 1000)
}

function setShare(category = '', module = ''){
    let shareLink = baseUrl

    if(category && module)
        shareLink += `?cat=${category}&mod=${module}`
    
    let telegram = document.getElementById("telegram")
          telegram.href = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=Shared from translationAcademy Slides`

    let whatsapp = document.getElementById("whatsapp")  
          whatsapp.href = `whatsapp://send?text=${encodeURIComponent(shareLink)} ${encodeURIComponent(' \n\nShared from translationAcademy Slides')}`

    let copyLink = document.getElementById("copy-link")
          copyLink.href = `${shareLink}`
    
    copyLink.addEventListener("click", (e) => {
        e.preventDefault()
        navigator.clipboard.writeText(copyLink.href)
    })
    
}     

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

function showError(){
    let error = document.getElementById('error-message')
        error.classList.toggle('hide')
        error.classList.add('slide-in-bck-center')

    document.getElementById('resource').classList.add('error')
}