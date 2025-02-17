import Reveal from 'reveal.js'
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js'
import {createScorm, createMultiScorm} from './scorm-creator.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'
import './spectre.scss'
import YAML from 'yaml'
import autoComplete from '@tarekraafat/autocomplete.js'

const baseUrl = window.location.origin + window.location.pathname
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const category = urlParams.get('cat')
const module = urlParams.get('mod')
const hasOrg = urlParams.has('org')
const hasLang = urlParams.has('lang')
const org = hasOrg ? urlParams.get('org') : 'unfoldingWord'
const lang = hasLang ? urlParams.get('lang') : 'en'
const print = urlParams.has('print-pdf')

if(category && module){
    const input = document.getElementById('resource')
    const resource = `${category}/${module}`
    input.value = resource
    setPresentation(resource)
}else{
    showWelcome()
}

function setHome(){
    document.querySelector('#home a').href = baseUrl + `${hasOrg ? ('?org=' + org + '&') : ''}${hasLang ? ('lang=' + lang ) : ''}`
}
setHome()


function setShare(category = '', module = '', title = ''){
    let shareLink = baseUrl
    let message = '\n\nShared from translationAcademy Slides'

    if (title) message = `\n\n${title} | Slides Presentation ` + message

    if(category && module)
        shareLink += `?cat=${category}&mod=${module}`
        shareLink += `${hasOrg ? ('&org=' + org + '&') : ''}${hasLang ? ('lang=' + lang ) : ''}`
    
    let telegram = document.getElementById("telegram")
          telegram.href = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(message)}`

    let whatsapp = document.getElementById("whatsapp")  
          whatsapp.href = `whatsapp://send?text=${encodeURIComponent(shareLink)} ${encodeURIComponent(message)}`

    let copyLink = document.getElementById("copy-link")
          copyLink.href = `${shareLink}`
    
    copyLink.addEventListener("click", (e) => {
        e.preventDefault()
        navigator.clipboard.writeText(copyLink.href)
    })
    
}     
setShare()


function setResource(){
    const resource = document.getElementById('resource');
    resource.addEventListener('keyup', event => {
        
        if (event.key === 'Enter' || event.keyCode === 13) {
            setPresentation(resource.value)
        }
        resource.value = resource.value.toLowerCase()
    })
}
setResource()


function setDownload(title, subtitle, url){
    let download = document.getElementById('download')
        download.classList.toggle('hide')
    
    let pdf = document.getElementById('pdf')
        pdf.href = window.location.href + '&print-pdf'
        pdf.setAttribute("target", "_blank");
    
    let scorm = document.getElementById('scorm')
        scorm.addEventListener("click", event => {
            event.preventDefault()
            createScorm(title, subtitle, url, org, lang)
        })
}

function setProgressBar(count, percentage){
    let viewed = document.querySelector('#progress .viewed')
        viewed.innerHTML = count

    let progress = document.querySelector('#progress .percentage')
        progress.innerHTML = percentage
}

async function setPresentation(input){

    try{

        const title = await fetch(`https://git.door43.org/${org}/${lang}_ta/raw/branch/master/${input}/title.md`)
            .then(handleErrors)
            .then( response => response.text() )
            .catch( err => {throw err})

        const subtitle = await fetch(`https://git.door43.org/${org}/${lang}_ta/raw/branch/master/${input}/sub-title.md`)
            .then(handleErrors)
            .then(response => response.text())
            .catch( err => {throw err})

        const courseURL = `https://git.door43.org/${org}/${lang}_ta/raw/branch/master/${input}/01.md`

        const courseContent = await fetch(courseURL)
            .then(handleErrors)
            .then(response => response.text())
            .catch( err => {throw err})       
    
        if(title && subtitle && courseContent){

            const parts = input.split('/')
            const category = parts[0]
            const module = parts[1]
            
            setShare(category, module, title)

            let href = `?cat=${category}&mod=${module}`
                href += `${hasOrg ? ('&org=' + org + '&') : ''}${hasLang ? ('lang=' + lang ) : ''}`

            if (print) href += `&print-pdf`

            document.title = `${title} - translationAcademy slides`
            history.pushState({page:1}, document.title, href)

            setDownload(title, subtitle, input)

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
             let timer
             let checkMark = document.getElementById('viewed-mark')

             deck.initialize().then( e => {

                if(print){
                    hideElement(document.getElementById('menu'))
                    window.print()
                }
                totalSlides = deck.getTotalSlides()

                clearTimeout(timer)
            
                console.log("current slide:",e.indexh, e.indexv)
                console.log("total slides:",deck.getTotalSlides())
            
                const pos = `${e.indexh},${e.indexv}`

                if ( viewed.includes(pos) ) showElement(checkMark)
                else hideElement(checkMark)
            
                imer = setTimeout(() => {
                    if ( !viewed.includes(pos) ) viewed.push(pos)            
                    progress = Math.round((viewed.length/totalSlides)*100)
                    showElement(checkMark)
                    setProgressBar(`${viewed.length}/${totalSlides} slides viewed.`, progress)
                }, 1500);

             })
            
             deck.on( 'slidechanged', e => {

                clearTimeout(timer)

                console.log(e)

                console.log( deck.getProgress() )
                console.log('slide changed') 
            
                const pos = `${e.indexh},${e.indexv}`

                if ( viewed.includes(pos) ) showElement(checkMark)
                else hideElement(checkMark)

                timer = setTimeout(() => {
                    if ( !viewed.includes(pos) ) viewed.push(pos)            
                    progress = Math.round((viewed.length/totalSlides)*100)
                    showElement(checkMark)
                    setProgressBar(`${viewed.length}/${totalSlides} slides viewed.`, progress)
                }, 1500);
                                                            
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
        welcome.classList.remove('hide')
        welcome.classList.add("slide-in-bck-center")
}

function hideElement(el){
    el.classList.add('hide')
}

function showElement(el){
    el.classList.remove('hide')
}

function hideWelcome(){
    let welcome = document.getElementById('welcome')
        welcome.classList.add("slide-out-left")
        setTimeout( () => { 
            welcome.style.display = 'none'
        }, 1000)
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

async function parseYAML(url) {

    return await fetch(url).then(handleErrors).then(response => response.text()).then(response => YAML.parse(response))
}

async function getProjects(){ 
    
    let projects = await parseYAML(`https://git.door43.org/${org}/${lang}_ta/raw/branch/master/manifest.yaml`)
                        .then( response =>{
                            let projects = {}
                            response.projects.forEach(element => {
                                
                                projects[element.identifier] = 
                                {
                                    'title' : element.title,
                                    'sections' : []
                                }

                            })
                            return projects
                        })
                        .then( updateTopics )
                        .catch( err => {console.log(err)})

    return projects
}

async function updateTopics(topics) {

    for(const key in topics){

        topics[key].sections = await parseYAML(`https://git.door43.org/${org}/${lang}_ta/raw/branch/master/${key}/toc.yaml`)

        .then(toc => toc.sections)
        .catch(err => {
            console.log(err)
            return []
        })

    }
    return topics
}

function createSubMenu(subject, topic){

    if(subject.hasOwnProperty('link')){

        let linkElement = document.createElement('a')
            linkElement.href = `${baseUrl}?cat=${topic}&mod=${subject.link}`
            linkElement.href += `${hasOrg ? ('&org=' + org + '&') : ''}${hasLang ? ('lang=' + lang ) : ''}`
            linkElement.setAttribute('data-topic', topic)
            linkElement.setAttribute('data-module', subject.link)
            linkElement.innerHTML = subject.title

        let linkItem = document.createElement('li')
            linkItem.appendChild(linkElement)
            linkItem.classList.add('module')

        return linkItem

    }else{

        let title = document.createElement('span')
            title.classList.add('section-title')
            title.innerHTML = subject.title

        let element = document.createElement('li')
            element.appendChild(title)

        let list = document.createElement('ul')
            element.appendChild(list)

        subject.sections.forEach(section => {
            
            let childElement = createSubMenu(section, topic) 

                if(!element.classList.contains('batch-pack')){
                    element.classList.add('batch-pack')
                    let downloadButton = document.createElement('a')
                        downloadButton.classList.add('download-button')
                        downloadButton.innerHTML = '⭳'
                        downloadButton.addEventListener('click', () => {createMultiScorm(subject, topic, org, lang)})

                    title.append(downloadButton)
                }
                
                list.appendChild(childElement)
        })
        return(element)
    }

}

function createMenu(source){
    let menuList = document.createElement('ul')
        menuList.id = 'main-menu'

        console.log(source)
    for(const key in source){
    const menu = createSubMenu(source[key], key)  
            if (menu){
                menuList.appendChild(menu)
            }               
    }
    return menuList
}

getProjects()
.then(
    doc => {
        const menu = createMenu(doc)
        document.getElementById('sidebar').appendChild(menu)

        const getLinks = (cat, subject) => {
            if(subject.hasOwnProperty('link')){
                const link = [{
                    "title"         :   subject.title,
                    "identifier"    :   subject.link,
                    "project"       :   cat
                }]
                return link
            }else{
                let links = []
                subject.sections.forEach( section => { links = links.concat(getLinks(cat, section)) } )
                
                return links
            }
        }

        const getResourceList =  (documents) => {
            let links = []
            for(const section in documents){
                links = links.concat(getLinks(section, documents[section]))
            }
            return links
        }

        const autoCompleteJS = new autoComplete({
            selector: "#resource",
        
            placeHolder: "Search",
        
            data: {
                src: getResourceList(doc),
                key: ["title"]
            },

            trigger: {
                event: ["input", "click"], // Any valid event type name
            },
        
            resultsList: {
                render: true,
                element: "div",
                idName: "autoComplete_list",
                className: "autoComplete_list",
                position: "afterend",
                maxResults: 5,
                container: (element) => {
                    element.setAttribute("data-parent", "resource-list");
                },
                noResults: (list, query) => {
                    // Create no results element
                    const message = document.createElement("li");
                    message.setAttribute("class", "no_result");
                    message.setAttribute("tabindex", "1");
                    // Add text content
                    message.innerHTML = `<span style="display: flex; align-items: center; font-weight: 100; color: rgba(0,0,0,.2);">Found No Results for "${query}"</span>`;
                    // Append message to results list
                    list.appendChild(message);
                },
            },
            
            resultItem: {
                element: "a",
                highlight: { render: true },
                content: (item, element) => { 
                   
                    element.href = `${baseUrl}?cat=${item.value.project}&mod=${item.value.identifier}${hasOrg ? ('&org=' + org + '&') : ''}${hasLang ? ('lang=' + lang ) : ''}` 
                    
                    let identifier = document.createElement('span')
                        identifier.classList.add('res-identifier')
                        identifier.innerHTML = ' (' + item.value.identifier + ')'
        
                    element.appendChild(identifier)
                    
                    element.addEventListener('click', () => { window.location = element.href })
                }
        
            },
        
            feedback: (data) => {
                console.log(data);
            },
        });
    }
)

function showSideBar(){
    let sidebar = document.getElementById('sidebar')
        sidebar.classList.remove('hide')
        sidebar.classList.remove("slide-out-left")
        sidebar.classList.add('slide-in-left')
}

function hideSideBar(){
    let sidebar = document.getElementById('sidebar')
        sidebar.classList.remove('slide-in-left')     
        sidebar.classList.add("slide-out-left")
        setTimeout( () => { 
            sidebar.classList.add('hide')
        }, 500)
}

function setTOC(){
    let toc = document.getElementById('toc')
    toc.addEventListener('click', (event) => {
        event.preventDefault()
        showSideBar()
    })

    let exitToc = document.querySelector('#sidebar .exit')
    exitToc.addEventListener('click', event => {
        event.preventDefault()
        hideSideBar()
    })

    let sliderWrapper = document.getElementById("slider-wrapper")
    sliderWrapper.addEventListener('click', event => {
        event.preventDefault()
        hideSideBar()
    })

    let welcome = document.getElementById("welcome")
    welcome.addEventListener('click', event => {
        event.preventDefault()
        hideSideBar()
    })
}
setTOC()

