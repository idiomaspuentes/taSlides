import Reveal from 'reveal.js'
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

function showError(){
    let error = document.getElementById('error-message')
        error.style.display = 'block'
        error.classList.add('slide-in-bck-center')

    document.getElementById('resource').classList.add('error')
}

document.getElementById('submit').addEventListener('click', async () => {
    const input = document.getElementById('resource').value

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

            document.getElementById('course-title').innerHTML = title
            document.getElementById('course-subtitle').innerHTML = subtitle
            document.getElementById('markdown-section').setAttribute("data-markdown", courseURL);
            document.getElementById('slider-wrapper').classList.remove('hide')
    
            let welcome = document.getElementById('welcome')
            welcome.classList.add("slide-out-left")
            setTimeout( () => { 
    
                welcome.style.display = 'none'
    
            }, 1000)

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

            showError()
            console.error('resource not found')
    
        }

    }catch(err){

        showError()
        console.log('fuera')
        console.error(err)
        return

    }

    
    
    
})

