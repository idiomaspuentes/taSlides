import jszip from "jszip"
import saveAs from "file-saver"

export default function createScorm(title, subtitle, path, version = "1.0", org = "unfoldingWord") {
    
    const url = `https://git.door43.org/unfoldingWord/en_ta/raw/branch/master/${path}/01.md`
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

            zip.generateAsync({type:"blob"}).then(function (blob) {
                const zipName = `${courseName}.sco.zip`
                saveAs(blob, zipName)
            })      
        })
} 
