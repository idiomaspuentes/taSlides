# Working on

## Issues to solve

-

## Features to add

- Using organizations in *imsmanifest.xml* for every learning path needed.

  - Create plugins (for some of the main open lms platforms) to search and navigate easily through learning paths.

- Scaling the app to support other unfoldingWord translation tools and be able to export learning paths that contain lessons from different tools.

- Add support (hack) to be able to connect SCOs to each other if they are part of the same learning path. This is a feature that is not supported by scorm 1.2 but there are ways to hack this feature in. (maybe using [window.opener.document](https://moodle.org/mod/forum/discuss.php?d=159769))

- Create plugins (for some of the main open lms platforms) to autoupdate manifests and learning paths.

- Maybe not to include SCOs files inside of the PIF ([package interchange file]('https://scorm.com/scorm-explained/technical-scorm/content-packaging/')) but rather reference them inside the *imsmanifest.xml* with a link like: https://scorm.door43.org/1.2/sco?res=ta&path=translate_figs-metaphor

- Parse the _config.yaml_ from the translation tools in the _DCS_ to add dependencies and suggestions and maybe creating other learning paths.
