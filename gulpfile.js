// TODO: update old js
// TODO: clean

const gulp          = require( 'gulp' );
const { series, parallel } = require( 'gulp' );
//const { src, dest } = require( 'gulp' );
const sourcemaps    = require( 'gulp-sourcemaps' );
const sass          = require( 'gulp-sass' );
const autoprefixer  = require( 'gulp-autoprefixer' );
const rename        = require( 'gulp-rename' );
const cleanCSS      = require( 'gulp-clean-css' );
const clean         = require( 'gulp-clean' );
const concat        = require( 'gulp-concat' );
const watch         = require( 'gulp-watch' );
//const minify        = require( 'gulp-minify' );
const replace       = require( 'gulp-string-replace' );
const fs            = require( 'fs' );
const uglify        = require( 'gulp-uglify' );
const pipeline      = require( 'readable-stream' ).pipeline;


// include config file
/* 
    related packages: 
        0 -> basic style package
        1 -> this package
        ... -> other packages
*/
const config = require( './config.json' );

// NOTE: within `src` all (1..n) non-negative globs must be followed by (0..n) only negative globs
const defaultPublish = {
    "src": [
        "**/*",
        "!**/node_modules",
        "!**/node_modules/**", 
    ],
    "base": ".",
    "folderName": config.projectName
};
const mergedPublish = Object.assign( {}, defaultPublish, config.publish );
 // NOTE: take care at this path since you’re deleting files outside your project
const mergedPublishDestFullPath = mergedPublish.dest + '/' + mergedPublish.folderName;


// general
const RESOURCES_PATH = '/resources';
const COMPONENTS_PATH = '/components';
const COMPONENTS_CONFIG_FILE_PATH = '.' + RESOURCES_PATH + '/components.json';
const SINGLE_CONFIG_FILE_NAME = '/config.json';

const PATH_SEPARATOR = '/';
const FILE_EXTENSION_SEPARATOR = '.';

// scss
const SCSS_SRC_PATH = './resources/scss';
const CSS_DEST_PATH = checkAdDotBefore( config.cssDestPath );

// js
const JS_DEST_PATH = checkAdDotBefore( config.jsDestPath );
const VENDOR_FILE_NAME  = 'vendor.js';
const SCRIPTS_FILE_NAME = 'scripts.js';
// script files stack
const SCRIPTS_STACK = [];
const VENDOR_STACK = [];

// TODO: lang
//const LANG_DEST_PATH = '.' + RESOURCES_PATH + '/lang';
//const JS_LANG_DEST_FILE = './resources/lang/Languages.js';

// copy files stack
const FILE_STACK = [];

// php classes
const PHP_CLASSES_FILES_STACK = [];
const PHP_CLASSES_LIST = [];

// project name
const PROJECT_NAME = config.projectName;

// replace project specific patters
const REPLACE_PROJECT_NAME_PATTERN = /###PROJECT_NAME###/g;
// prepare include atf style
const INCLUDE_COMPRESSED_ATF_STYLE_PATTERN = /###COMPRESSED_ATF_STYLE###/g;
const INCLUDE_ATF_STYLE_PATTERN = /###ATF_STYLE###/g;
// include logo as inline svg and path
const INLINE_LOGO_PATTERN = /###INLINE_LOGO###/g;
//const LOGO_PATH_PATTERN = /###LOGO_PATH###/g;

// log for testing (LOG_FILE_PATH)
let LOG = '';
const LOG_FILE_PATH = './resources/log.txt';


// basic functions

function checkAdDotBefore( path ) {
    return ( path.indexOf( '.' ) != 0 ) ? '.' + path :  path;
}
function splitFilePath( path ) {
    let fileName = ''; 
    let filePath;
    const pathSegments = path.split( PATH_SEPARATOR );
    if ( pathSegments[ pathSegments.length - 1 ].indexOf( FILE_EXTENSION_SEPARATOR ) > -1 ) {
        fileName = pathSegments.pop();
    }
    filePath = pathSegments.join( PATH_SEPARATOR ) + ( fileName != '' ? PATH_SEPARATOR : '' );
    return [ filePath, fileName ];
}
function merge( obj_1, obj_2 ) {
    const merged = {};
    for ( let key in obj_1 ) {
        merged[ key ] = obj_1[ key ];
    }
    for ( let key in obj_2 ) {
        merged[ key ] = obj_2[ key ];
    }
    return merged;
}


// task functions

function filesStackPrepare( cb ) {

    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );

    for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].package || 0;
        var CURRENT_PLUGIN_PATH = config.relatedPackages[ CURRENT_COMPONENT_PLUGIN ].path;
        var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

        // get each components config
        var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
        if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
            CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
        }

        // get files src plugin path
        var CURRENT_COMPONENT_SRC_PLUGIN = ( CURRENT_COMPONENT_CONFIG.srcPlugin === undefined || CURRENT_COMPONENT_CONFIG.srcPlugin === null ) ? CURRENT_COMPONENT_PLUGIN : CURRENT_COMPONENT_CONFIG.srcPlugin;
        var CURRENT_COMPONENT_SRC_PLUGIN_PATH = config.relatedPackages[ CURRENT_COMPONENT_SRC_PLUGIN ].path;

        if ( !! CURRENT_COMPONENT_CONFIG.copyFiles && CURRENT_COMPONENT_CONFIG.copyFiles !== null ) {
            var CURRENT_FILE_STACK = CURRENT_COMPONENT_CONFIG.copyFiles;
            for ( var j = 0; j < CURRENT_FILE_STACK.length; j++ ) {

                // TODO: check if type key
                var CURRENT_FILE_DEST_FOLDER = '';
                var CURRENT_FILE_SRC = CURRENT_FILE_STACK[ j ].type;
                if ( CURRENT_FILE_STACK[ j ].type && CURRENT_FILE_STACK[ j ].type !== null ) {

                    // type is set, chose what to do
                    switch( CURRENT_FILE_SRC ) {
                        case 'font':
                            CURRENT_FILE_DEST_FOLDER = checkAdDotBefore( config.fontsDestFolder );
                            break;
                        case 'template':
                            CURRENT_FILE_DEST_FOLDER = checkAdDotBefore( config.templateDestFolder );
                            break;
                        case 'template-parts':
                            CURRENT_FILE_DEST_FOLDER = checkAdDotBefore( config.templatePartsDestFolder );
                            break;
                        case 'img':
                            CURRENT_FILE_DEST_FOLDER = checkAdDotBefore( config.imgDestFolder );
                            break;
                        case 'example-img':
                            CURRENT_FILE_DEST_FOLDER = checkAdDotBefore( config.exampleImgDestFolder );
                            break;
                    } 
                }

                var CURRENT_FILE_SRC = CURRENT_FILE_STACK[ j ].src;
                var CURRENT_FILE_DEST = CURRENT_FILE_STACK[ j ].dest;

                var ADAPTED_FILE_SRC = CURRENT_COMPONENT_SRC_PLUGIN_PATH + ( ( CURRENT_FILE_SRC.indexOf( '/node_modules' ) == 0 || CURRENT_FILE_SRC.indexOf( RESOURCES_PATH ) == 0 ) ? '' : RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + CURRENT_FILE_SRC;
                var ADAPTED_FILE_DEST = CURRENT_FILE_DEST_FOLDER + CURRENT_FILE_DEST;
                
                FILE_STACK.push( {
                    src: ADAPTED_FILE_SRC,
                    dest: ADAPTED_FILE_DEST
                } );

                //LOG += ADAPTED_FILE_SRC + '\n';
                //LOG += ADAPTED_FILE_DEST + '\n\n';
            }
        }
    }

    //fs.writeFileSync( LOG_FILE_PATH, LOG );

    cb();
}

function filesCopy( cb ) {

    var stream;
    for ( var i = 0; i < FILE_STACK.length; i++ ) {
        var srcFileName = splitFilePath( FILE_STACK[ i ].src )[ 1 ];
        var srcFilePath = splitFilePath( FILE_STACK[ i ].src )[ 0 ];
        var destFileName = splitFilePath( FILE_STACK[ i ].dest )[ 1 ];
        var destFilePath = splitFilePath( FILE_STACK[ i ].dest )[ 0 ];

        if ( srcFileName == '' ) {
            // is folder, check slash, add asterisk
            if ( srcFilePath.substr( srcFilePath.length - 1 ) != '/' ) {
                srcFilePath += '/';
            }
            srcFilePath += '*';
        }

        // src
        if ( srcFileName == '' ) {
            // is folder
            stream = gulp.src( srcFilePath );
        }
        else {
            // is file
            stream = gulp.src( FILE_STACK[ i ].src );
        }

        // dest
        if ( srcFileName != '' && destFileName != '' ) {
            // rename
            stream = stream
                .pipe( rename( destFileName ) )
                .pipe( gulp.dest( destFilePath ) )
            ;
        }
        else {
            // do not rename
            stream = stream.pipe( gulp.dest( destFilePath ) );
        }

        //LOG += srcFilePath + ' – ' + srcFileName + ' ––> ' + destFilePath + ' – ' + destFileName + '\n';
    }

    //fs.writeFileSync( LOG_FILE_PATH, LOG );

    return stream;

    cb();
}

function phpClassesStackPrepare( cb ) {

    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );

    for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].package || 0;
        var CURRENT_PLUGIN_PATH = config.relatedPackages[ CURRENT_COMPONENT_PLUGIN ].path;
        var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

        // get each components config
        var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
        if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
            CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
        }

        // get files src plugin path
        var CURRENT_COMPONENT_SRC_PLUGIN = ( CURRENT_COMPONENT_CONFIG.srcPlugin === undefined || CURRENT_COMPONENT_CONFIG.srcPlugin === null ) ? CURRENT_COMPONENT_PLUGIN : CURRENT_COMPONENT_CONFIG.srcPlugin;
        var CURRENT_COMPONENT_SRC_PLUGIN_PATH = config.relatedPackages[ CURRENT_COMPONENT_SRC_PLUGIN ].path;

        if ( !! CURRENT_COMPONENT_CONFIG.php && CURRENT_COMPONENT_CONFIG.php !== null && !! CURRENT_COMPONENT_CONFIG.php.classes && CURRENT_COMPONENT_CONFIG.php.classes !== null ) {

            var CURRENT_PHP_CLASSES_FILES_STACK = CURRENT_COMPONENT_CONFIG.php.classes;
            for ( var j = 0; j < CURRENT_PHP_CLASSES_FILES_STACK.length; j++ ) {

                var CURRENT_FILE_SRC = CURRENT_PHP_CLASSES_FILES_STACK[ j ].key;

                // file name and extension (without path)
                var CURRENT_FILE_NAME = splitFilePath( CURRENT_FILE_SRC )[ 1 ];

                // remember class file name
                PHP_CLASSES_LIST.push( CURRENT_FILE_NAME );

                var PHP_CLASSES_DEST_FOLDER = config.phpClassesDestFolder;

                var ADAPTED_FILE_SRC = CURRENT_COMPONENT_SRC_PLUGIN_PATH + ( ( CURRENT_FILE_SRC.indexOf( '/node_modules' ) == 0 || CURRENT_FILE_SRC.indexOf( RESOURCES_PATH ) == 0 ) ? '' : RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + CURRENT_FILE_SRC;
                var ADAPTED_FILE_DEST = checkAdDotBefore( PHP_CLASSES_DEST_FOLDER ) + '/' + CURRENT_FILE_NAME;
                
                // remember src & dest
                PHP_CLASSES_FILES_STACK.push( {
                    src: ADAPTED_FILE_SRC,
                    dest: ADAPTED_FILE_DEST
                } );

                //LOG += CURRENT_FILE_NAME + '\n';
                //LOG += ADAPTED_FILE_SRC + '\n';
                //LOG += ADAPTED_FILE_DEST + '\n\n';
            }

        }
    }

    //fs.writeFileSync( LOG_FILE_PATH, LOG );


    cb();
}

function phpClassesCopy( cb ) {

    var stream;
    for ( var i = 0; i < PHP_CLASSES_FILES_STACK.length; i++ ) {
        var srcFileName = splitFilePath( PHP_CLASSES_FILES_STACK[ i ].src )[ 1 ];
        var srcFilePath = splitFilePath( PHP_CLASSES_FILES_STACK[ i ].src )[ 0 ];
        var destFileName = splitFilePath( PHP_CLASSES_FILES_STACK[ i ].dest )[ 1 ];
        var destFilePath = splitFilePath( PHP_CLASSES_FILES_STACK[ i ].dest )[ 0 ];

        if ( srcFileName == '' ) {
            // is folder, check slash, add asterisk
            if ( srcFilePath.substr( srcFilePath.length - 1 ) != '/' ) {
                srcFilePath += '/';
            }
            srcFilePath += '*';
        }

        // src
        if ( srcFileName == '' ) {
            // is folder
            stream = gulp.src( srcFilePath );
        }
        else {
            // is file
            stream = gulp.src( PHP_CLASSES_FILES_STACK[ i ].src );
        }

        // dest
        if ( srcFileName != '' && destFileName != '' ) {
            // rename
            stream = stream
                .pipe( rename( destFileName ) )
                .pipe( gulp.dest( destFilePath ) )
            ;
        }
        else {
            // do not rename
            stream = stream.pipe( gulp.dest( destFilePath ) );
        }

        //LOG += srcFilePath + ' – ' + srcFileName + ' ––> ' + destFilePath + ' – ' + destFileName + '\n';
    }

    //fs.writeFileSync( LOG_FILE_PATH, LOG );

    return stream;

    cb();
}

function phpClassesInclude( cb ) {

    // include all php classes files within one file

    const COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );

    let FILE_CONTENT = '<?php \n';

    const PHP_CLASSES_DEST_FILE = checkAdDotBefore( config.phpClassesDestFile );

    for ( let i = 0; i < PHP_CLASSES_LIST.length; i++ ) {

        FILE_CONTENT += 'include \'' + PHP_CLASSES_LIST[ i ] + '\';\n';

    }

    //LOG += PHP_CLASSES_DEST_FILE + '\n';
    //LOG += FILE_CONTENT + '\n\n';

    //fs.writeFileSync( LOG_FILE_PATH, LOG );

    // write file
    fs.writeFileSync( PHP_CLASSES_DEST_FILE, FILE_CONTENT );

    cb();
}

function projectNameReplace( cb ) {

    const PROJECT_NAME_FILE_STACK = [
        {
            PATH: checkAdDotBefore( config.templatePartsDestFolder ),
            FILES: '/**/*.php'
        }
    ];

    let stream;
    for ( let i = 0; i < PROJECT_NAME_FILE_STACK.length; i++ ) {
        stream = gulp.src( PROJECT_NAME_FILE_STACK[ i ].PATH + PROJECT_NAME_FILE_STACK[ i ].FILES )
            .pipe( replace( REPLACE_PROJECT_NAME_PATTERN, PROJECT_NAME ) )
            .pipe( gulp.dest( PROJECT_NAME_FILE_STACK[ i ].PATH ) )
        ;
    }

    return stream;

    cb();
}

function logoReplace( cb ) {

    const LOGO_FILE_STACK = [
        {
            PATH: checkAdDotBefore( config.templatePartsDestFolder ),
            FILES: '/**/*.php'
        },
        {
            PATH: checkAdDotBefore( config.phpClassesDestFolder ),
            FILES: '/**/*.php'
        }
    ];

    const INLINE_LOGO = fs.readFileSync( checkAdDotBefore( config.logoPath ) );

    let stream;
    for ( let i = 0; i < LOGO_FILE_STACK.length; i++ ) {
        stream = gulp.src( LOGO_FILE_STACK[ i ].PATH + LOGO_FILE_STACK[ i ].FILES )
            .pipe( replace( INLINE_LOGO_PATTERN, INLINE_LOGO ) )
            .pipe( gulp.dest( LOGO_FILE_STACK[ i ].PATH ) )
        ;
    }

    return stream;

    cb();
}

function cssFolderClean( cb ) {

    return gulp.src( CSS_DEST_PATH, { read: false, allowEmpty: true } )
        .pipe( clean() )
    ;

    cb();
}

function jsFolderClean( cb ) {

    return gulp.src( JS_DEST_PATH, { read: false, allowEmpty: true } )
        .pipe( clean() )
    ;

    cb();
}

function scssConcat( cb ) {

    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );

    // prepare variables file src to include

    var SCSS_ADD_VARIABLES_STRING = '// this file was generated by gulpfile.js\n\n';
    var SCSS_ATF_STRING = '// this file was generated by gulpfile.js\n\n';
    var SCSS_STRING = '// this file was generated by gulpfile.js\n\n';

    var THEMES_DATA = {};

    if ( !! COMPONENTS_JSON && !! COMPONENTS_JSON.use ) {

        for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
            var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].package || 0;
            var CURRENT_PLUGIN_PATH = config.relatedPackages[ CURRENT_COMPONENT_PLUGIN ].path;
            var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

            // get each components config
            var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
            if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
                CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
            }

            // get scss path from src plugin path
            var CURRENT_COMPONENT_SRC_PLUGIN = ( CURRENT_COMPONENT_CONFIG.srcPlugin === undefined || CURRENT_COMPONENT_CONFIG.srcPlugin === null ) ? CURRENT_COMPONENT_PLUGIN : CURRENT_COMPONENT_CONFIG.srcPlugin;
            var CURRENT_SCSS_PATH = config.relatedPackages[ CURRENT_COMPONENT_SRC_PLUGIN ].scssPath;

            // scss file
            if ( !! CURRENT_COMPONENT_CONFIG && !! CURRENT_COMPONENT_CONFIG.scss && !! CURRENT_COMPONENT_CONFIG.scss !== null ) {
                // standard scss (key: "use")

                // make scss import rules from config scss object
                function buildScssImportFromConfigParam( configParam ) {
                    var LIST = '';
                    if ( !! configParam && configParam !== null ) {
                        var STACK = configParam;
                        for ( var j = 0; j < STACK.length; j++ ) {
                            var FILE = STACK[ j ].key;

                            // check plugin path (include resources path if current component plugin != 1), check if '/node_modules'
                            var PATH = FILE.indexOf( '/' ) !== 0 ? FILE.replace( '/_', '/' ).replace( '.scss', '' ) : CURRENT_SCSS_PATH + ( FILE.indexOf( '/node_modules' ) == 0 ? '' : ( CURRENT_COMPONENT_PLUGIN != 1 ? RESOURCES_PATH : '' ) + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + FILE.replace( '/_', '/' ).replace( '.scss', '' );
                            //var PATH = FILE.indexOf( '/' ) !== 0 ? FILE.replace( '/_', '/' ).replace( '.scss', '' ) : CURRENT_SCSS_PATH + ( FILE.indexOf( '/node_modules' ) == 0 ? '' : ( CURRENT_COMPONENT_PLUGIN == 0 ? RESOURCES_PATH : '' ) + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + FILE.replace( '/_', '/' ).replace( '.scss', '' );

                            LIST += '@import "' + PATH + '";\n';
                        }
                    }
                    return LIST;
                }

                SCSS_STRING += buildScssImportFromConfigParam( CURRENT_COMPONENT_CONFIG.scss.use );

                SCSS_ATF_STRING += buildScssImportFromConfigParam( CURRENT_COMPONENT_CONFIG.scss.atf );

                SCSS_ADD_VARIABLES_STRING += buildScssImportFromConfigParam( CURRENT_COMPONENT_CONFIG.scss.addVariables );


                if ( !! CURRENT_COMPONENT_CONFIG.scss.themes && CURRENT_COMPONENT_CONFIG.scss.themes !== null ) {

                    for ( var key in CURRENT_COMPONENT_CONFIG.scss.themes ) {

                        if ( THEMES_DATA[ key ] === undefined ) {
                            // key doesn't exist, create key

                            THEMES_DATA[ key ] = {
                                SCSS_IMPORT: '',
                                SCSS_ATF_IMPORT: '',
                            }
                        }
                        else {
                            // key already exists
                        }

                        //LOG += key + '\n';

                    }
                }

            }

        }
        //fs.writeFileSync( LOG_FILE_PATH, LOG );
    }

    // write additional scss variables
    var SCSS_ADD_VARIABLES_DEST_FILE = checkAdDotBefore( config.scssAddVariablesDestFile );
    fs.writeFileSync( SCSS_ADD_VARIABLES_DEST_FILE, SCSS_ADD_VARIABLES_STRING );

    // write atf scss (above the fold)
    var SCSS_ATF_DEST_FILE = checkAdDotBefore( config.scssAtfDestFile );
    fs.writeFileSync( SCSS_ATF_DEST_FILE, SCSS_ATF_STRING );

    // write scss
    var SCSS_DEST_FILE = checkAdDotBefore( config.scssDestFile );
    fs.writeFileSync( SCSS_DEST_FILE, SCSS_STRING );

    //var FILE_CONTENT = JSON.stringify( COMPONENTS_JSON.use, false, 2 );

    //fs.writeFileSync( LOG_FILE_PATH, LOG );

    cb();
}

function scssToCss( cb ) {

    return gulp.src( SCSS_SRC_PATH + '/**/*.scss' )
        .pipe( sourcemaps.init() )
        .pipe( sass().on( 'error', sass.logError ) )
        .pipe( autoprefixer( {
            browsers: [ 'last 8 versions' ],
            cascade: false
        } ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( CSS_DEST_PATH ) )
    ;

    cb();
}

function cssCleanAndMinify( cb ) {

    return gulp.src( CSS_DEST_PATH + '/**/*.css' )
        .pipe( cleanCSS( { debug: true }, function( details ) {
            console.log( details.name + ': ' + details.stats.originalSize );
            console.log( details.name + ': ' + details.stats.minifiedSize );
        } ) )
        .pipe( rename( function( path ) {
            path.basename += '.min';
        } ) )
        .pipe( gulp.dest( CSS_DEST_PATH ) )
    ;

    cb();
}

function jsLangPrepare( cb ) {

    // TODO
    
    cb();
}

function jsStackPrepare( cb ) {

    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );

    for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].package || 0;
        var CURRENT_PLUGIN_PATH = config.relatedPackages[ CURRENT_COMPONENT_PLUGIN ].path;
        var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

        // get each components config
        var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
        if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
            CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
        }

        // get files src plugin path
        var CURRENT_COMPONENT_SRC_PLUGIN = ( CURRENT_COMPONENT_CONFIG.srcPlugin === undefined || CURRENT_COMPONENT_CONFIG.srcPlugin === null ) ? CURRENT_COMPONENT_PLUGIN : CURRENT_COMPONENT_CONFIG.srcPlugin;
        var CURRENT_COMPONENT_SRC_PLUGIN_PATH = config.relatedPackages[ CURRENT_COMPONENT_SRC_PLUGIN ].path;

        if ( !! CURRENT_COMPONENT_CONFIG.js && CURRENT_COMPONENT_CONFIG.js !== null && !! CURRENT_COMPONENT_CONFIG.js.use && CURRENT_COMPONENT_CONFIG.js.use !== null ) {
            var CURRENT_SCRIPTS_STACK = CURRENT_COMPONENT_CONFIG.js.use;
            for ( var j = 0; j < CURRENT_SCRIPTS_STACK.length; j++ ) {
                var CURRENT_SCRIPTS_FILE = CURRENT_SCRIPTS_STACK[ j ].key;

                var FULL_SCRIPTS_PATH = CURRENT_COMPONENT_SRC_PLUGIN_PATH + ( ( CURRENT_SCRIPTS_FILE.indexOf( '/node_modules' ) == 0 || CURRENT_SCRIPTS_FILE.indexOf( '/resources' ) == 0 ) ? '' : RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + CURRENT_SCRIPTS_FILE;

                SCRIPTS_STACK.push( FULL_SCRIPTS_PATH );

                //LOG += FULL_SCRIPTS_PATH + '\n';
            }
        }
    }
    //fs.writeFileSync( LOG_FILE_PATH, LOG );

    cb();
}

function jsConcat( cb ) {

    return gulp.src( SCRIPTS_STACK )
        .pipe( sourcemaps.init() )
        .pipe( concat( SCRIPTS_FILE_NAME ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( JS_DEST_PATH + '/' ) )
    ;

    cb();
}

function jsVendorStackPrepare( cb ) {

    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );

    for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].package || 0;
        var CURRENT_PLUGIN_PATH = config.relatedPackages[ CURRENT_COMPONENT_PLUGIN ].path;
        var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

        // get each components config
        var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
        if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
            CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
        }

        // get files src plugin path
        var CURRENT_COMPONENT_SRC_PLUGIN = ( CURRENT_COMPONENT_CONFIG.srcPlugin === undefined || CURRENT_COMPONENT_CONFIG.srcPlugin === null ) ? CURRENT_COMPONENT_PLUGIN : CURRENT_COMPONENT_CONFIG.srcPlugin;
        var CURRENT_COMPONENT_SRC_PLUGIN_PATH = config.relatedPackages[ CURRENT_COMPONENT_SRC_PLUGIN ].path;

        if ( !! CURRENT_COMPONENT_CONFIG.js && CURRENT_COMPONENT_CONFIG.js !== null && !! CURRENT_COMPONENT_CONFIG.js.addVendor && CURRENT_COMPONENT_CONFIG.js.addVendor !== null ) {
            var CURRENT_VENDOR_STACK = CURRENT_COMPONENT_CONFIG.js.addVendor;
            for ( var j = 0; j < CURRENT_VENDOR_STACK.length; j++ ) {
                var CURRENT_VENDOR_FILE = CURRENT_VENDOR_STACK[ j ].key;

                var FULL_VENDOR_PATH = CURRENT_COMPONENT_SRC_PLUGIN_PATH + ( CURRENT_VENDOR_FILE.indexOf( '/node_modules' ) == 0 ? '' : RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + CURRENT_VENDOR_FILE;

                VENDOR_STACK.push( FULL_VENDOR_PATH );

                //LOG += FULL_VENDOR_PATH + '\n';
            }
        }
    }

    //fs.writeFileSync( LOG_FILE_PATH, LOG );

    cb();
}

function vendorJsConcat( cb ) {
    // TODO: seems to have error
/*
    return gulp.src( VENDOR_STACK )
        .pipe( concat( VENDOR_FILE_NAME ) )
        .pipe( minify( {
            ext: {
                src:'.js',
                min:'.min.js'
            },
            exclude: [],
            ignoreFiles: [ SCRIPTS_FILE_NAME, '.min.js' ]
        } ) )
        .pipe( gulp.dest( JS_DEST_PATH + '/' ) )
    ;
*/

    return gulp.src( VENDOR_STACK )
        .pipe( sourcemaps.init() )
        .pipe( concat( VENDOR_FILE_NAME ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( JS_DEST_PATH + '/' ) )
    ;

    cb();
}

function jsMinify( cb ) {
/*
    return gulp.src( JS_DEST_PATH + '/*.js' )
        .pipe( minify( {
            ext: {
                src:'.js',
                min:'.min.js'
            }
        } ) )
        .pipe( gulp.dest( JS_DEST_PATH + '/' ) )
    ;
*/
/*
    LOG += JS_DEST_PATH + '/' + '\n';
    fs.writeFileSync( LOG_FILE_PATH, LOG );

    return gulp.src( JS_DEST_PATH + '/*.js' )
        .pipe( minify() )
        .pipe( gulp.dest( JS_DEST_PATH + '/' ) )
    ;
*/
/*
    return src( JS_DEST_PATH + '/*.js', { allowEmpty: true } ) 
        .pipe( minify() )
        .pipe( dest( JS_DEST_PATH + '/' ) )
    ;
*/
    return pipeline(
        gulp.src( JS_DEST_PATH + '/*.js' ),
        uglify(),
        rename( { suffix: '.min' } ),
        gulp.dest( JS_DEST_PATH + '/' )
    );

    cb();
}

function atfCssInclude( cb ) {

    const ATF_STYLE_FILE_STACK = [
        {
            PATH: checkAdDotBefore( config.templatePartsDestFolder ),
            FILES: '/**/*.php'
        }
    ];

    // TODO: read atf style files (SCSS_ATF_DEST_FILE, SCSS_ATF_DEST_FILE.replace( '.css', '.min.css' ) ), include content

    const COMPRESSED_ATF_STYLE = fs.readFileSync( CSS_DEST_PATH + '/atf.min.css' );
    const ATF_STYLE = fs.readFileSync( CSS_DEST_PATH + '/atf.css' );

    //LOG += COMPRESSED_ATF_STYLE + '\n';
    //LOG += ATF_STYLE + '\n';
    //fs.writeFileSync( LOG_FILE_PATH, LOG );

    let stream;
    for ( let i = 0; i < ATF_STYLE_FILE_STACK.length; i++ ) {
        stream = gulp.src( ATF_STYLE_FILE_STACK[ i ].PATH + ATF_STYLE_FILE_STACK[ i ].FILES )
            .pipe( replace( INCLUDE_COMPRESSED_ATF_STYLE_PATTERN, COMPRESSED_ATF_STYLE ) )
            .pipe( replace( INCLUDE_ATF_STYLE_PATTERN, ATF_STYLE ) )
            .pipe( gulp.dest( ATF_STYLE_FILE_STACK[ i ].PATH ) )
        ;
    }

    return stream;

    cb();
}

function publishFolderDelete( cb ) {

    if ( !! mergedPublish.dest && !! mergedPublish.folderName ) {
        return gulp.src( mergedPublishDestFullPath, { read: false, allowEmpty: true } )
            .pipe( clean( { force: true } ) ) // NOTE: take care at this command since you’re deleting files outside your project
        ;
    }
    else {
        // do nothing
    }

    cb();
}

function publishFolderCreate( cb ) {

    if ( !! mergedPublish.dest && !! mergedPublish.folderName ) {
        return gulp.src( mergedPublish.src, { base: mergedPublish.base } )
            .pipe( gulp.dest( mergedPublishDestFullPath ) )
        ;
    }
    else {
        // log note, do nothing
        console.log( 'Note: No publishing done since publish configuration empty.' );
    }

    cb();
}

// search pattern – include `@font-face` followed by letters, numbers, minus, underscore, dot, colon, double quote, single quote, semicolon, slash, ... ,line break, tab
const CSS_FONTS_REPLACE_PATTERN = /@font-face+([a-zA-Z0-9-/-_.:;,"'/(){ ?=#&\n\t])*/g;
const REPLACE_PRELOADS_PATTERN = /###FONTS_PRELOADS###/; // replace only first occurance, do not use `/g`

const preloadFontsReplace = ( cb ) => {

    // this function needs to be executed after css has been built

    // TODO: How to get file name? From config or from .scss file?
    const cssFileContent = String( fs.readFileSync( CSS_DEST_PATH + '/style.min.css' ) );

    const allowedFormats = [ 'woff2' ]; //, 'woff'

    const fontsList = [];

    const fontsSnippets = cssFileContent.match( CSS_FONTS_REPLACE_PATTERN );

    // TEST – TODO: remove
    fontsSnippets.forEach( ( fontSnippet, index ) => {

        //console.log( index + ': ' + fontSnippet );

        // extract font sources – get content between `src:` and `;`
        const fontSrcList = fontSnippet.split( 'src:' );
        const lastFontSrc = fontSrcList[ fontSrcList.length - 1 ].split( ';' )[ 0 ];

        const singleFontExplode = lastFontSrc.split( ',' );

        for ( let j = 0; j < singleFontExplode.length; j++ ) {
            // extract each font’s url and format

            const urlFormatExplode = singleFontExplode[ j ].split( ' ' );

            let url = urlFormatExplode[ 0 ].replace( 'url(', '' ).replace( ')', '' ).replace( '../', '' );

            // TODO: How to manage path in case of further changes?

            // remove duplicate path segments
            /*
            const fontsPathSegments = config.fontsDestFolder.split( '/' );
            for ( let k = fontsPathSegments.length - 1; k >= 0; k-- ) {

                //console.log( fontsPathSegments[ k ] );

                if ( url.indexOf( fontsPathSegments[ k ] ) == 0 ) {
                    url = url.substring( fontsPathSegments[ k ].length + 1 ); // remove slash too
                }
                else break;
            }
            */

            const format = urlFormatExplode[ 1 ].replace( 'format("', '' ).replace( '")', '' );

            //console.log( i + ': \nurl: ' + url + ' \nformat: ' + format );

            // check if allowed format, then push to list

            if ( allowedFormats.indexOf( format ) != -1 ) {
                fontsList.push(
                    {
                        url: url,
                        format: format,
                    }
                );
            } 
        }

    } ); 

    // remove duplicates (caused by different css font names for same font file)
    const uniqueFontsList = [ ...new Map( fontsList.map( item => [ item[ 'url' ], item ] ) ).values() ];

    // TEST – TODO: remove
    uniqueFontsList.forEach( ( item, index ) => {
        //console.log( index + ': ' + item.url + ' ' + item.format );
    } ); 

    // do replace

    const REPLACE_PRELOADS_FILE_STACK = [
        {
            PATH: checkAdDotBefore( config.templatePartsDestFolder ),
            FILES: '/**/*.php'
        }
    ];

    let stream;
    for ( let i = 0; i < REPLACE_PRELOADS_FILE_STACK.length; i++ ) {
        stream = gulp.src( REPLACE_PRELOADS_FILE_STACK[ i ].PATH + REPLACE_PRELOADS_FILE_STACK[ i ].FILES )
            .pipe( replace( REPLACE_PRELOADS_PATTERN, ( match, position, content ) => {
                // get template from file content, insert data

                //console.log( 'found ' + match + ' with param ' + position + ' in file content: ' + content + '(end of file content)' );

                const template = content.split( '###TEMPLATE_BEGIN###' )[ 1 ].split( '###TEMPLATE_END###' )[ 0 ];

                //console.log( 'template: ' + template );

                let filledTemplate = '';
                uniqueFontsList.forEach( ( item, index ) => {
                    filledTemplate += template.replace( '###HREF###', item.url ).replace( '###TYPE###', item.format ) + '\n';
                } ); 

                return filledTemplate; 
            } ) )
            .pipe( gulp.dest( REPLACE_PRELOADS_FILE_STACK[ i ].PATH ) )
        ;
    }

    return stream;

    cb();
}

//const CSS_FONTS_REPLACE_PATTERN = /@font-face+([a-zA-Z0-9-/-_.:;,"'/(){ ?=#&\n\t])*/g;
const CSS_FONTS_REPLACE_PATTERN_CHECK = 'font-display:';
const CSS_FONTS_REPLACE_PATTERN_ADD = ' \n  font-display: fallback; ';

const cssFontsOptimize = ( cb ) => {

    const CSS_FONTS_REPLACE_FILE_STACK = [
        {
            PATH: checkAdDotBefore( config.cssDestPath ),
            FILES: '/**/*.css'
        }
    ];

    let stream;
    for ( let i = 0; i < CSS_FONTS_REPLACE_FILE_STACK.length; i++ ) {

        stream = gulp.src( CSS_FONTS_REPLACE_FILE_STACK[ i ].PATH + CSS_FONTS_REPLACE_FILE_STACK[ i ].FILES )
            .pipe( replace( CSS_FONTS_REPLACE_PATTERN, ( match ) => {

                //console.log( 'found ' + match );

                if ( match.indexOf( CSS_FONTS_REPLACE_PATTERN_CHECK ) == -1 ) {

                    //console.log( 'replaced to: ' + match + CSS_FONTS_REPLACE_PATTERN_ADD );

                    return match + CSS_FONTS_REPLACE_PATTERN_ADD;
                }
                else {

                    //console.log( 'do nothing' );

                    return match;
                }
                
            } ) )
            .pipe( gulp.dest( CSS_FONTS_REPLACE_FILE_STACK[ i ].PATH ) )
        ;
    }

    return stream;

    cb();

}


// tasks

const files = series(
    filesStackPrepare,
    filesCopy,
);

const php = series(
    phpClassesStackPrepare,
    phpClassesCopy,
    phpClassesInclude,
);

const js = series(
    jsFolderClean,
    parallel(
        series( jsVendorStackPrepare, vendorJsConcat ),
        series( jsStackPrepare, jsConcat )
    ),
    jsMinify,
);

const css = series(
    files,
    projectNameReplace,
    logoReplace,
    cssFolderClean,
    scssConcat,
    scssToCss,
    cssCleanAndMinify,
    cssFontsOptimize,
    atfCssInclude,
    preloadFontsReplace,
);

const publish = series(
    // copy all project but `node_modules` to configured dest
    publishFolderDelete,
    publishFolderCreate,
);


// exports

exports.build = series(
    files,
    php,
    projectNameReplace,
    logoReplace,
    parallel( cssFolderClean, jsFolderClean ),
    scssConcat,
    parallel(
        scssToCss,
        series( jsVendorStackPrepare, vendorJsConcat ),
        series( jsStackPrepare, jsConcat )
    ),
    parallel( cssCleanAndMinify, jsMinify ),
    cssFontsOptimize,
    atfCssInclude,
    preloadFontsReplace,
    publish,
);

exports.files = series(
    files,
    publish,
);

exports.logo = series(
    logoReplace,
    publish,
);

exports.preloads = series(
    preloadFontsReplace,
);

exports.css_fonts_optimize = series(
    cssFontsOptimize,
);

exports.php = series(
    php,
    publish,
);

exports.css = series(
    css,
    publish,
);

exports.js = series(
    js,
    publish,
);

exports.publish = publish;


