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
var config = require( './config.json' );


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
var SCRIPTS_STACK = [];
var VENDOR_STACK = [];

// lang
//const LANG_DEST_PATH = '.' + RESOURCES_PATH + '/lang';
//const JS_LANG_DEST_FILE = './resources/lang/Languages.js';

// copy files
// special file destinations used by filesStackPrepare() according to types (e.g. 'font', 'template', 'template-part')
const FONTS_DEST_FOLDER = config.fontsDestFolder;
const TEMPLATE_DEST_FOLDER = config.templateDestFolder;
const TEMPLATE_PARTS_DEST_FOLDER = config.templatePartsDestFolder;
const IMG_DEST_FOLDER = config.imgDestFolder;
const EXAMPLE_IMG_DEST_FOLDER = config.exampleImgDestFolder;
// copy files stack
var FILE_STACK = [];

// php classes
var PHP_CLASSES_FILES_STACK = [];
var PHP_CLASSES_LIST = [];

// plugin data
//const PLUGIN_DATA_PATH = './config.json';
//const PLUGIN_DATA = JSON.parse( fs.readFileSync( PLUGIN_DATA_PATH ) );
const PROJECT_NAME = config.projectName;

// template files path (to replace plugin name or include atf style)
const TEMPLATE_DATA_PATH = checkAdDotBefore( config.templateSrcFolder );
const REPLACE_PROJECT_NAME_PATTERN = /###PROJECT_NAME###/g;
// prepare include atf style
const INCLUDE_COMPRESSED_ATF_STYLE_PATTERN = /###COMPRESSED_ATF_STYLE###/g;
const INCLUDE_ATF_STYLE_PATTERN = /###ATF_STYLE###/g;

// log for testing (LOG_FILE_PATH)
var LOG = '';
var LOG_FILE_PATH = './resources/log.txt';


// FUNCTIONS
function checkAdDotBefore( path ) {
    path = ( path.indexOf( '.' ) != 0 ) ? '.' + path :  path;
    return path;
}
function splitFilePath( path ) {
    var fileName = ''; 
    var filePath;
    var pathSegments = path.split( PATH_SEPARATOR );
    if ( pathSegments[ pathSegments.length - 1 ].indexOf( FILE_EXTENSION_SEPARATOR ) > -1 ) {
        fileName = pathSegments.pop();
    }
    filePath = pathSegments.join( PATH_SEPARATOR ) + ( fileName != '' ? PATH_SEPARATOR : '' );
    return [ filePath, fileName ];
}
function splitFileName( path ) {
    var fileName = null;
    var fileNameTrunk = '';
    var fileExtension;
    var pathSegments = path.split( PATH_SEPARATOR );
    if ( pathSegments[ pathSegments.length - 1 ].indexOf( FILE_EXTENSION_SEPARATOR ) > -1 ) {
        fileName = pathSegments.pop();
    }
    var fileNameSegments = fileName.split( FILE_EXTENSION_SEPARATOR );
    fileExtension = fileNameSegments.pop();
    fileNameTrunk = fileNameSegments.join( FILE_EXTENSION_SEPARATOR );
    return [ fileNameTrunk, fileExtension ];
}
function merge( obj_1, obj_2 ) {
    var merged = {};
    for ( var key in obj_1 ) {
        merged[ key ] = obj_1[ key ];
    }
    for ( var key in obj_2 ) {
        merged[ key ] = obj_2[ key ];
    }
    return merged;
}
function htmlEntities( str ) {
    return String( str ).replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /"/g, '&quot;' );
}
function insertTagsByChar( str, char, tag_0, tag_1 ) {
    var strExplode = str.split( char );
    var strRebuilt = '';
    var tagOpen = false;
    for ( var i = 0; i < strExplode.length; i++ ) {
        if ( i < strExplode.length - 1 ) {
            // check escape (char before is not “\”)
            if ( ! strExplode[ i ].match( /\\$/ ) ) {
                // inset tags
                if ( ! tagOpen ) {
                    // open
                    strRebuilt += strExplode[ i ] + tag_0;
                }
                else {
                    // close
                    strRebuilt += strExplode[ i ] + tag_1;
                }
                tagOpen = ! tagOpen;
            }
            else {
                // do not insert tags
                strRebuilt += strExplode[ i ] + char;
            }
        }
        else {
            strRebuilt += strExplode[ i ]
        }
    }
    // close if still open (in case of error)
    if ( tagOpen ) {
        // close
        strRebuilt += strExplode[ i ] + tag_1;
    }
    return strRebuilt;
}
function parseMarkdown( str ) {
    var strRebuilt = str;
    strRebuilt = insertTagsByChar( strRebuilt, '**', '<strong>', '</strong>' );
    strRebuilt = insertTagsByChar( strRebuilt, '*', '<em>', '</em>' );
    strRebuilt = insertTagsByChar( strRebuilt, '`', '<code class="kbd">', '</code>' );
    // TODO: should `\\` remain as `\`?
    // remove all backslashes
    strRebuilt = strRebuilt.replace( /\\/g, '' );
    return strRebuilt;
}



// GULP 4 RESTRUCTURED

function filesStackPrepare( cb ) {

    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );

    for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
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
                            CURRENT_FILE_DEST_FOLDER = FONTS_DEST_FOLDER;
                            break;
                        case 'template':
                            CURRENT_FILE_DEST_FOLDER = TEMPLATE_DEST_FOLDER;
                            break;
                        case 'template-parts':
                            CURRENT_FILE_DEST_FOLDER = TEMPLATE_PARTS_DEST_FOLDER;
                            break;
                        case 'img':
                            CURRENT_FILE_DEST_FOLDER = IMG_DEST_FOLDER;
                            break;
                        case 'example-img':
                            CURRENT_FILE_DEST_FOLDER = EXAMPLE_IMG_DEST_FOLDER;
                            break;
                    } 
                }

                var CURRENT_FILE_SRC = CURRENT_FILE_STACK[ j ].src;
                var CURRENT_FILE_DEST = CURRENT_FILE_STACK[ j ].dest;

                var ADAPTED_FILE_SRC = CURRENT_COMPONENT_SRC_PLUGIN_PATH + ( ( CURRENT_FILE_SRC.indexOf( '/node_modules' ) == 0 || CURRENT_FILE_SRC.indexOf( RESOURCES_PATH ) == 0 ) ? '' : RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + CURRENT_FILE_SRC;
                //var ADAPTED_FILE_DEST = ( ( CURRENT_FILE_DEST.indexOf( RESOURCES_PATH ) == 0 || CURRENT_FILE_DEST.indexOf( ASSETS_PATH ) == 0 || CURRENT_FILE_DEST_FOLDER != '' ) ? '.' + CURRENT_FILE_DEST_FOLDER : RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + CURRENT_FILE_DEST;
                var ADAPTED_FILE_DEST = checkAdDotBefore( CURRENT_FILE_DEST_FOLDER ) + CURRENT_FILE_DEST;
                
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
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
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

    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );

    var FILE_CONTENT = '<?php \n';

    var PHP_CLASSES_DEST_FILE = checkAdDotBefore( config.phpClassesDestFile );

    for ( var i = 0; i < PHP_CLASSES_LIST.length; i++ ) {

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

    var PROJECT_NAME_FILE_STACK = [
        {
            PATH: TEMPLATE_DATA_PATH,
            FILES: '/**/*.php'
        }
    ];

    var stream;
    for ( var i = 0; i < PROJECT_NAME_FILE_STACK.length; i++ ) {
        stream = gulp.src( PROJECT_NAME_FILE_STACK[ i ].PATH + PROJECT_NAME_FILE_STACK[ i ].FILES )
            .pipe( replace( REPLACE_PROJECT_NAME_PATTERN, PROJECT_NAME ) )
            .pipe( gulp.dest( PROJECT_NAME_FILE_STACK[ i ].PATH ) )
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
            var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
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
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
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
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
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

    // TODO replace ###ATF_STYLE###

    /*
        - read atf.css
        - read atf.min.css
        - replace INCLUDE_ATF_STYLE_PATTERN
        - replace INCLUDE_COMPRESSED_ATF_STYLE_PATTERN
    */

    var ATF_STYLE_FILE_STACK = [
        {
            PATH: TEMPLATE_DATA_PATH,
            FILES: '/**/*.php'
        }
    ];

    // TODO: read atf style files (SCSS_ATF_DEST_FILE, SCSS_ATF_DEST_FILE.replace( '.css', '.min.css' ) ), include content

    var COMPRESSED_ATF_STYLE = fs.readFileSync( CSS_DEST_PATH + '/atf.min.css' );
    var ATF_STYLE = fs.readFileSync( CSS_DEST_PATH + '/atf.css' );

    //LOG += COMPRESSED_ATF_STYLE + '\n';
    //LOG += ATF_STYLE + '\n';
    //fs.writeFileSync( LOG_FILE_PATH, LOG );

    var stream;
    for ( var i = 0; i < ATF_STYLE_FILE_STACK.length; i++ ) {
        stream = gulp.src( ATF_STYLE_FILE_STACK[ i ].PATH + ATF_STYLE_FILE_STACK[ i ].FILES )
            .pipe( replace( INCLUDE_COMPRESSED_ATF_STYLE_PATTERN, COMPRESSED_ATF_STYLE ) )
            .pipe( replace( INCLUDE_ATF_STYLE_PATTERN, ATF_STYLE ) )
            .pipe( gulp.dest( ATF_STYLE_FILE_STACK[ i ].PATH ) )
        ;
    }

    return stream;

    cb();
}

function publish( cb ) {

    // TODO copy adapted php files

    cb();
}

exports.build = series(
    filesStackPrepare,
    filesCopy,
    phpClassesStackPrepare,
    phpClassesCopy,
    phpClassesInclude,
    projectNameReplace,
    parallel( cssFolderClean, jsFolderClean ),
    scssConcat,
    parallel(
        scssToCss,
        series( jsVendorStackPrepare, vendorJsConcat ),
        series( jsStackPrepare, jsConcat )
    ),
    parallel( cssCleanAndMinify, jsMinify ),
    atfCssInclude,
    publish
);

exports.files_copy = series(
    filesStackPrepare,
    filesCopy
);

exports.php = series(
    phpClassesStackPrepare,
    phpClassesCopy,
    phpClassesInclude
);

exports.css = series(
    filesStackPrepare,
    filesCopy,
    projectNameReplace,
    cssFolderClean,
    scssConcat,
    scssToCss,
    cssCleanAndMinify,
    atfCssInclude,
    publish
);


