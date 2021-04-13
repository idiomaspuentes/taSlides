import jszip from "jszip"
import saveAs from "file-saver"

export function createScorm(title, subtitle, path, org = "unfoldingWord", lang = "en", version = "1.0") {
    
    const url = `https://git.door43.org/${org}/${lang}_ta/raw/branch/master/${path}/01.md`
    const courseName = path.split('/').join('_')

    fetch('./src/scorm.zip')       // 1) fetch the url
        .then(function (response) {                       // 2) filter on 200 OK
            if (response.status === 200 || response.status === 0) {
                return Promise.resolve(response.blob());
            } else {
                return Promise.reject(new Error(response.statusText));
            }
        })
        .then(jszip.loadAsync)                            // 3) chain with the zip promise
        .then( async (zip) => {
            
            let index = await zip.file("index.html").async("string"); // 4) chain with the text content promise
            
            if(index){

                const newIndex = index.replace(/<title>(.*)<\/title>/gm, (match, p) => {
                    return `<title>${title}</title>`
                })
                .replace(/Course Title/gm, (match, p) => {
                    return title
                })
                .replace(/<p>Course subtitle<\/p>/gm, (match, p) => {
                    if(subtitle != '')
                        return `<p>${subtitle}</p>`
                    else
                        return ''
                })
                .replace(/markdown-src/gm, (match, p) => {
                        return `${url}`
                })
                
                zip.file("index.html", newIndex)
            }


            let manifest = await zip.file("imsmanifest.xml").async("string"); // 4) chain with the text content promise

            if(manifest) {

                const newManifest = manifest.replace(/<title>(.*)<\/title>/gm, (match, p) => {
                    return `<title>${title}</title>`
                })
                .replace(/CourseIDHere/gm, (match, p) => {
                    return courseName
                })
                .replace(/(?<!xml.+)version="([^"]*)"/gm, (match, p) => {
                    return `version="${version}"`
                })
                .replace(/course-code-here/gm, (match, p) => {
                    return org
                })

                zip.file("imsmanifest.xml", newManifest)
            }

            zip.generateAsync({type:"blob", compression: "DEFLATE", compressionOptions: { level: 9 }}).then(function (blob) {
                const zipName = `${courseName}.pif.zip`
                saveAs(blob, zipName)
            })      
        })
} 



function fileNameEncode(str){
    return str.toLowerCase().split(' ').join("-")
}


async function addSCOs(section, topic, manifest, html, zip, org, lang){
 

    if(section.hasOwnProperty('link')){

        let filePath = `resources/${topic}/${section.link}.html`
        let url = `https://git.door43.org/${org}/${lang}_ta/raw/branch/master/${topic}/${section.link}/`   

        let file = manifest.createElement('file')
            file.setAttribute('href', filePath)

        let resource =  manifest.createElement('resource')
            resource.setAttribute('identifier', `${section.link}-resource`)
            resource.setAttribute('type', 'webcontent')
            resource.setAttribute('adlcp:scormtype', 'sco')
            resource.setAttribute('href', filePath)
            resource.appendChild(file)

        let resources = manifest.getElementsByTagName('resources')[0]
            resources.appendChild(resource)

        let itemTitle = manifest.createElement('title')
            itemTitle.innerHTML = section.title

        let item = manifest.createElement('item')
            item.setAttribute('identifier', `${section.link}-item`)
            item.setAttribute('identifierref', `${section.link}-resource`)
            item.appendChild(itemTitle)
        

        let resourceFile = html.cloneNode(true)

            resourceFile.title = section.title

            resourceFile.querySelector('#cover h2').innerHTML = section.title
            resourceFile.querySelector('#cover p').innerHTML = await fetch(url + 'sub-title.md')
                .then(response => response.text())
                .catch( err => {throw err})
            
            resourceFile.querySelector('#content').setAttribute('data-markdown', url + '01.md')

        const htmlContent = resourceFile.documentElement.outerHTML

        zip.file(filePath, htmlContent)

        return item

    }else{

        let title = manifest.createElement('title')
            title.innerHTML = section.title

        let item = manifest.createElement('item')
            item.setAttribute('identifier', fileNameEncode(section.title))
            item.appendChild(title)
        
            const appendedItems = section.sections.map( section => addSCOs(section,topic,manifest,html,zip,org,lang))
            
        
        return await Promise.all(appendedItems).then( appendedItems => { 
            appendedItems.forEach( items => item.appendChild(items))
            return item
        })
    }
}


export function createMultiScorm(section, topic, org = "unfoldingWord", lang = "en", version = "1.0",){

    const courseName = fileNameEncode(section.title)
    console.log(section, topic, org, lang, courseName)
    fetch('./src/multi-sco.zip')       // 1) fetch the url
    .then(function (response) {                       // 2) filter on 200 OK
        if (response.status === 200 || response.status === 0) {
            return Promise.resolve(response.blob());
        } else {
            return Promise.reject(new Error(response.statusText));
        }
    })
    .then(jszip.loadAsync)                            // 3) chain with the zip promise
    .then( async (zip) => {
        
        var parser = new DOMParser();

        let index = await zip.file("shared/template.html").async("string"); // 4) chain with the text content promise   
        let parsedIndex = parser.parseFromString(index, "text/html")
        let manifest = await zip.file("imsmanifest.xml").async("string"); // 4) chain with the text content promise
        let parsedManifest = parser.parseFromString(manifest, "application/xml")

        let manifestTag = parsedManifest.getElementsByTagName('manifest')[0]
            manifestTag.setAttribute('identifier', courseName)
            manifestTag.setAttribute('version', version)
        
        let organizations = parsedManifest.getElementsByTagName('organizations')[0]
            organizations.setAttribute('default', courseName)

        let title = parsedManifest.createElement('title')
            title.innerHTML = section.title

        let organization = parsedManifest.getElementsByTagName('organization')[0]
            organization.setAttribute('identifier', courseName)
            organization.appendChild(title)


        const items =  section.sections.map( section  => addSCOs(section, topic, parsedManifest, parsedIndex, zip, org, lang) )
        Promise.all(items).then( item => {
            
            const finished = item.map( item =>{console.log(item); organization.appendChild(item)})
            if(finished){

                let finalManifest = parsedManifest.documentElement.outerHTML
                zip.file('imsmanifest.xml', finalManifest)
                zip.generateAsync({type:"blob", compression: "DEFLATE", compressionOptions: { level: 9 } })
                   .then(function (blob) {
                        const zipName = `${courseName}.pif.zip`
                        saveAs(blob, zipName)
                    }) 

            }
        })
        
    })
}