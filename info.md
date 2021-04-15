# Working on

## Issues to solve

-

## Features to add

- Using organizations in *imsmanifest.xml* for every learning path needed.

  - Create plugins (for some of the main open lms platforms) to search and navigate easily through learning paths.

- Scaling the app to support other unfoldingWord translation tools and be able to export learning paths that contain lessons from different tools.

- Add support (hack) to be able to connect SCOs to each other if they are part of the same learning path. This is a feature that is not supported by SCORM 1.2 but there are ways to hack this feature in. (maybe using [window.opener.document](https://moodle.org/mod/forum/discuss.php?d=159769))

- Create plugins (for some of the main open lms platforms) to autoupdate manifests and learning paths.

- Maybe not to include SCOs files inside of the PIF ([package interchange file]('https://scorm.com/scorm-explained/technical-scorm/content-packaging/')) but rather reference them inside the *imsmanifest.xml* with a link like: https://scorm.door43.org/1.2/sco?res=ta&path=translate_figs-metaphor (this could work for an lms that only works online, and could help keep the PIF size as small as possible)

- Parse the _config.yaml_ from the translation tools in the _DCS_ to add dependencies and suggestions and maybe creating other learning paths.

- Creating a custom Markdown plugin for reveal.js to have more flexibility on how to divide content into slides, better handle image scaling, and support custom syntax that can be converted into quizzes or videos.

- Create plugin to create this learing paths from within the LMS

- Add support to *obsidian* as source