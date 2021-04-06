import jszip from "jszip"

export async function createScorm(){

    let zip = new jszip();

    JSZipUtils.getBinaryContent('path/to/content.zip', function(err, data) {
        if(err) {
            throw err; // or handle err
        }
    
        JSZip.loadAsync(data).then(function () {
            // ...
        });
    });

    zip.file("")
} 
