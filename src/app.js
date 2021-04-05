import Reveal from 'reveal.js'
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'

document.getElementById('submit').addEventListener('click', () => {
    const input = document.getElementById('resource').value
    fetch(`https://git.door43.org/unfoldingWord/en_ta/raw/branch/master/${input}/title.md`)
        .then(response => response.text())
        .then(data => document.getElementById('course-title').innerHTML = response)
        .catch( err => console.error(err))
    
})

