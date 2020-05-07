const gulp          = require( 'gulp' );
const { series }    = require( 'gulp' );
const sourcemaps    = require( 'gulp-sourcemaps' );
const sass          = require( 'gulp-sass' );
const autoprefixer  = require( 'gulp-autoprefixer' );
const rename        = require( 'gulp-rename' );
const cleanCSS      = require( 'gulp-clean-css' );
const clean         = require( 'gulp-clean' );
const concat        = require( 'gulp-concat' );
const watch         = require( 'gulp-watch' );
const minify        = require( 'gulp-minify' );
const replace       = require( 'gulp-string-replace' );
const fs            = require( 'fs' );

// plugins (0 -> basic style plugin, 1 -> this plugin, ... -> other plugins)
const PLUGIN_PATHS = [
    './../bsx-basic-style',
    '.'
];

// scss sources relative to scss file
const SCSS_SRC_PATHS = [
    '../../../bsx-basic-style',
    '..'
];

// general
const RESOURCES_PATH = '/resources';
const COMPONENTS_PATH = '/components';
const SRC_PATH = '/src';
const COMPONENTS_CONFIG_FILE_PATH = '.' + RESOURCES_PATH + '/components.json';
const DOCUMENTATION_CONFIG_FILE_PATH = '.' + RESOURCES_PATH + '/documentation.json';
const SINGLE_CONFIG_FILE_NAME = '/config.json';
const PATH_SEPARATOR = '/';
const FILE_EXTENSION_SEPARATOR = '.';

// scss
const SCSS_SRC_PATH = './resources/scss';
const CSS_DEST_PATH = './assets/css';
//const SCSS_DEST_FILE = './resources/scss/style.scss';
const SCSS_DEST_FILE_FALLBACK = './resources/scss/style.scss';
const SCSS_ATF_DEST_FILE_FALLBACK = './resources/scss/atf.scss';
// TODO: rename to `_style-variables.scss` to relate to `style.scss`?
const SCSS_ADD_VARIABLES_DEST_FILE_FALLBACK = './resources/scss/_components-variables.scss';

// js
const JS_DEST_PATH = './assets/js';
const VENDOR_FILE_NAME  = 'vendor.js';
const SCRIPTS_FILE_NAME = 'scripts.js';

// view
const VIEW_COMPONENTS_DEST_FILE_FALLBACK = './resources/views/Macros/Components.twig';

// lang
const LANG_DEST_PATH = '.' + RESOURCES_PATH + '/lang';

// js lang
//const JS_LANG_DEST_FILE = './resources/lang/Languages.js';
const JS_LANG_DEST_FILE_FALLBACK = './resources/lang/Languages.js';

// documentation
const DOCUMENTATION_DEST_FILE_FALLBACK = './resources/views/Macros/Documentation.twig';
const DOCUMENTATION_NAV_DEST_FILE_FALLBACK = './resources/views/Macros/DocumentationNav.twig';


// plugin data
const PLUGIN_DATA_PATH = './config.json';
const PLUGIN_DATA = JSON.parse( fs.readFileSync( PLUGIN_DATA_PATH ) );
const PLUGIN_NAME = PLUGIN_DATA.pluginName;
const SRC_DATA_PATH = './src';

// twig files path (to replace plugin name)
const TWIG_DATA_PATH = '.' + RESOURCES_PATH + '/views';
const REPLACE_PLUGIN_NAME_PATTERN = /###PLUGIN_NAME###/g;


// TODO: include atf style: (1.) read file, (2.) wrap file content (minified and non minified, dependant on param) with style element and include into header (before css files)
const INCLUDE_COMPRESSED_ATF_STYLE_PATTERN = /###COMPRESSED_ATF_STYLE###/g;
const INCLUDE_ATF_STYLE_PATTERN = /###ATF_STYLE###/g;


// log for testing ('./resources/log.txt')
var LOG = '';


// FUNCTIONS
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


// BUILD SCSS FILE

// write scss file using each components scss

function plugin_scss() {

    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );

    // prepare variables file src to include

    var SCSS_ADD_VARIABLES_STRING = '// this file was generated by gulpfile.js\n\n';
    var SCSS_ATF_STRING = '// this file was generated by gulpfile.js\n\n';
    var SCSS_STRING = '// this file was generated by gulpfile.js\n\n';

    var THEMES_DATA = {};

    if ( !! COMPONENTS_JSON && !! COMPONENTS_JSON.use ) {

        for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
            var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
            var CURRENT_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_PLUGIN ];
            //var CURRENT_SCSS_PATH = SCSS_SRC_PATHS[ CURRENT_COMPONENT_PLUGIN ];
            var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

            // get each components config
            var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
            if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
                CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
            }

            // get scss path from src plugin path
            var CURRENT_COMPONENT_SRC_PLUGIN = ( CURRENT_COMPONENT_CONFIG.srcPlugin === undefined || CURRENT_COMPONENT_CONFIG.srcPlugin === null ) ? CURRENT_COMPONENT_PLUGIN : CURRENT_COMPONENT_CONFIG.srcPlugin;
            var CURRENT_SCSS_PATH = SCSS_SRC_PATHS[ CURRENT_COMPONENT_SRC_PLUGIN ];

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

                            // check plugin path, check if '/node_modules'
                            var PATH = FILE.indexOf( '/' ) !== 0 ? FILE.replace( '/_', '/' ).replace( '.scss', '' ) : CURRENT_SCSS_PATH + ( FILE.indexOf( '/node_modules' ) == 0 ? '' : ( CURRENT_COMPONENT_PLUGIN == 0 ? RESOURCES_PATH : '' ) + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + FILE.replace( '/_', '/' ).replace( '.scss', '' );

                            LIST += '@import "' + PATH + '";\n';
                        }
                    }
                    return LIST;
                }


                SCSS_STRING += buildScssImportFromConfigParam( CURRENT_COMPONENT_CONFIG.scss.use );
                
                /*
                if ( !! CURRENT_COMPONENT_CONFIG.scss.use && CURRENT_COMPONENT_CONFIG.scss.use !== null ) {
                    var SCSS_STACK = CURRENT_COMPONENT_CONFIG.scss.use;
                    for ( var j = 0; j < SCSS_STACK.length; j++ ) {
                        var COMPONENT_SCSS_FILE = SCSS_STACK[ j ].key;

                        // check plugin path, check if '/node_modules'
                        var FULL_SCSS_PATH = COMPONENT_SCSS_FILE.indexOf( '/' ) !== 0 ? COMPONENT_SCSS_FILE.replace( '/_', '/' ).replace( '.scss', '' ) : CURRENT_SCSS_PATH + ( COMPONENT_SCSS_FILE.indexOf( '/node_modules' ) == 0 ? '' : ( CURRENT_COMPONENT_PLUGIN == 0 ? RESOURCES_PATH : '' ) + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + COMPONENT_SCSS_FILE.replace( '/_', '/' ).replace( '.scss', '' );

                        var SCSS_IMPORT = '@import "' + FULL_SCSS_PATH + '";';
                        // TODO: sort stack
                        SCSS_STRING += SCSS_IMPORT + '\n';
                    }
                }
                */

                // atf scss (key: "atf")
                /*
                if ( !! CURRENT_COMPONENT_CONFIG.scss.atf && CURRENT_COMPONENT_CONFIG.scss.atf !== null ) {
                    var SCSS_ATF_STACK = CURRENT_COMPONENT_CONFIG.scss.atf;
                    for ( var j = 0; j < SCSS_ATF_STACK.length; j++ ) {
                        var COMPONENT_SCSS_FILE = SCSS_ATF_STACK[ j ].key;

                        // check plugin path, check if '/node_modules'
                        var FULL_ATF_SCSS_PATH = COMPONENT_SCSS_FILE.indexOf( '/' ) !== 0 ? COMPONENT_SCSS_FILE.replace( '/_', '/' ).replace( '.scss', '' ) : CURRENT_SCSS_PATH + ( COMPONENT_SCSS_FILE.indexOf( '/node_modules' ) == 0 ? '' : ( CURRENT_COMPONENT_PLUGIN == 0 ? RESOURCES_PATH : '' ) + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + COMPONENT_SCSS_FILE.replace( '/_', '/' ).replace( '.scss', '' );

                        var SCSS_ATF_IMPORT = '@import "' + FULL_ATF_SCSS_PATH + '";';
                        // TODO: sort stack
                        SCSS_ATF_STRING += SCSS_ATF_IMPORT + '\n';
                    }
                }
                */

                SCSS_ATF_STRING += buildScssImportFromConfigParam( CURRENT_COMPONENT_CONFIG.scss.atf );

                // variables scss (key: "addVariables")
                /*
                if ( !! CURRENT_COMPONENT_CONFIG.scss.addVariables && CURRENT_COMPONENT_CONFIG.scss.addVariables !== null ) {
                    var SCSS_STACK = CURRENT_COMPONENT_CONFIG.scss.addVariables;
                    for ( var j = 0; j < SCSS_STACK.length; j++ ) {
                        var COMPONENT_SCSS_FILE = SCSS_STACK[ j ].key;

                        // TODO: read file, concat content
                        
                        //var SCSS_COMPONENT_VARIABLES_PATH = CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + COMPONENT_SCSS_FILE;
                        var SCSS_COMPONENT_VARIABLES_PATH = CURRENT_PLUGIN_PATH + ( COMPONENT_SCSS_FILE.indexOf( '/node_modules' ) == 0 ? '' : RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + COMPONENT_SCSS_FILE;

                        var SCSS_COMPONENT_VARIABLES_FILE = fs.readFileSync( SCSS_COMPONENT_VARIABLES_PATH );

                        SCSS_ADD_VARIABLES_STRING += '// ' + i + ' – COMPONENT "' + SCSS_COMPONENT_VARIABLES_PATH + '"\n\n';
                        SCSS_ADD_VARIABLES_STRING += SCSS_COMPONENT_VARIABLES_FILE + '\n\n';
                    }
                }
                */

                SCSS_ADD_VARIABLES_STRING += buildScssImportFromConfigParam( CURRENT_COMPONENT_CONFIG.scss.addVariables );


                // TODO: check if .themes, get key name, store in dada object, get & collect .addVariables, .use, .atf


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





                        LOG += key + '\n';


                    }


                }



            }

        }

        fs.writeFileSync( './resources/log.txt', LOG );

    }

    // write additional scss variables
    var SCSS_ADD_VARIABLES_DEST_FILE = SCSS_ADD_VARIABLES_DEST_FILE_FALLBACK;
    if ( !! COMPONENTS_JSON.config && COMPONENTS_JSON.config !== null && !! COMPONENTS_JSON.config.scssAddVariablesDestFile && COMPONENTS_JSON.config.scssAddVariablesDestFile !== null ) {
        SCSS_ADD_VARIABLES_DEST_FILE = '.' + COMPONENTS_JSON.config.scssAddVariablesDestFile;
    }
    fs.writeFileSync( SCSS_ADD_VARIABLES_DEST_FILE, SCSS_ADD_VARIABLES_STRING );

    // write atf scss (above the fold)
    var SCSS_ATF_DEST_FILE = SCSS_ATF_DEST_FILE_FALLBACK;
    if ( !! COMPONENTS_JSON.config && COMPONENTS_JSON.config !== null && !! COMPONENTS_JSON.config.scssAtfDestFile && COMPONENTS_JSON.config.scssAtfDestFile !== null ) {
        SCSS_ATF_DEST_FILE = '.' + COMPONENTS_JSON.config.scssAtfDestFile;
    }
    fs.writeFileSync( SCSS_ATF_DEST_FILE, SCSS_ATF_STRING );

    // write scss
    var SCSS_DEST_FILE = SCSS_DEST_FILE_FALLBACK;
    if ( !! COMPONENTS_JSON.config && COMPONENTS_JSON.config !== null && !! COMPONENTS_JSON.config.scssDestFile && COMPONENTS_JSON.config.scssDestFile !== null ) {
        SCSS_DEST_FILE = '.' + COMPONENTS_JSON.config.scssDestFile;
    }
    fs.writeFileSync( SCSS_DEST_FILE, SCSS_STRING );

    //var FILE_CONTENT = JSON.stringify( COMPONENTS_JSON.use, false, 2 );

    //fs.writeFileSync( './resources/log.txt', LOG );
}


// BUILD COMPONENTS VIEW

// write Components.twig file using each components twig files
gulp.task( 'plugin:components', function() {
    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );
    var VIEW_STRING = '{# this file was generated by gulpfile.js #}\n\n';

    for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
        var CURRENT_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_PLUGIN ];
        var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

        // get each components config
        var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
        if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
            CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
        }

        // twig file
        if ( !! CURRENT_COMPONENT_CONFIG.view && CURRENT_COMPONENT_CONFIG.view !== null && !! CURRENT_COMPONENT_CONFIG.view.use ) {
            var VIEW_STACK = CURRENT_COMPONENT_CONFIG.view.use;
            for ( var j = 0; j < VIEW_STACK.length; j++ ) {

                // TODO: allow VIEW_STACK[ j ].key === null ?

                if ( !! VIEW_STACK[ j ].key && VIEW_STACK[ j ].key !== null ) {

                    var COMPONENT_VIEW_FILE = VIEW_STACK[ j ].key;
                    var VIEW_COMPONENT = fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + COMPONENT_VIEW_FILE );
                    // TODO: sort stack
                    VIEW_STRING += VIEW_COMPONENT + '\n\n';

                }

            }
        }
    }

    // write
    var VIEW_COMPONENTS_DEST_FILE = VIEW_COMPONENTS_DEST_FILE_FALLBACK;
    if ( !! COMPONENTS_JSON.config && COMPONENTS_JSON.config !== null && !! COMPONENTS_JSON.config.viewComponentsDestFile && COMPONENTS_JSON.config.viewComponentsDestFile !== null ) {
        VIEW_COMPONENTS_DEST_FILE = '.' + COMPONENTS_JSON.config.viewComponentsDestFile;
    }
    fs.writeFileSync( VIEW_COMPONENTS_DEST_FILE, VIEW_STRING );
} );


// BUILD DOCUMENTATION

// write Components.twig file using each components twig files
gulp.task( 'plugin:documentation', function() {

    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );
    var DOCUMENTATION_JSON = JSON.parse( fs.readFileSync( DOCUMENTATION_CONFIG_FILE_PATH ) );

    var DOCS_STRING = '{# this file was generated by gulpfile.js #}\n\n';
    var DOCS_NAV_STRING = '{# this file was generated by gulpfile.js #}\n\n';
    var DOCS_EXAMPLE_STRING = '{# this file was generated by gulpfile.js #}\n\n';

    var DOCS_NAV_ITEM_GROUP = '';
    var DOCS_NAV_ITEM = '';

    // get wrapper elements
    var TWIG_CONTENT_WRAP;
    var ALL_WRAP;
    var VIEW_CODE_WRAP;
    var EXAMPLE_ITEM_WRAP;
    var EXAMPLE_WRAP;

    var TWIG_NAV_WRAP;
    var NAV_WRAP;
    var NAV_ITEM_GROUP_WRAP;
    var NAV_ITEM_WRAP;
    var NAV_ITEM_DEVIDER;

    var EXAMPLE_TWIG_CONTENT_WRAP;
    var EXAMPLE_GET_PARAM;
    /*
    var EXAMPLE_HTML_CODE_WRAP;
                "exampleHtmlCode": [
                    "<div class=\"cmp-html-code\"><pre class=\"mb-1\"><code>",
                    "</code></pre></div>"
                ],
    */
    var EXAMPLE_CODE_WRAP;
    if ( !! DOCUMENTATION_JSON.documentation && DOCUMENTATION_JSON.documentation !== null ) {
        // twig wrap
        if ( !! DOCUMENTATION_JSON.documentation.twigWrap && DOCUMENTATION_JSON.documentation.twigWrap !== null ) {
            // content
            if ( !! DOCUMENTATION_JSON.documentation.twigWrap.content && DOCUMENTATION_JSON.documentation.twigWrap.content !== null ) {
                TWIG_CONTENT_WRAP = DOCUMENTATION_JSON.documentation.twigWrap.content;
            }

            // nav
            if ( !! DOCUMENTATION_JSON.documentation.navTwigWrap.content && DOCUMENTATION_JSON.documentation.navTwigWrap.content !== null ) {
                TWIG_NAV_WRAP = DOCUMENTATION_JSON.documentation.navTwigWrap.content;
            }
        }
        // html wrap
        if ( !! DOCUMENTATION_JSON.documentation.htmlWrap && DOCUMENTATION_JSON.documentation.htmlWrap !== null ) {
            // all
            if ( !! DOCUMENTATION_JSON.documentation.htmlWrap.all && DOCUMENTATION_JSON.documentation.htmlWrap.all !== null ) {
                ALL_WRAP = DOCUMENTATION_JSON.documentation.htmlWrap.all;
            }
            // view code
            if ( !! DOCUMENTATION_JSON.documentation.htmlWrap.viewCode && DOCUMENTATION_JSON.documentation.htmlWrap.viewCode !== null ) {
                VIEW_CODE_WRAP = DOCUMENTATION_JSON.documentation.htmlWrap.viewCode;
            }
            // example item
            if ( !! DOCUMENTATION_JSON.documentation.htmlWrap.exampleItem && DOCUMENTATION_JSON.documentation.htmlWrap.exampleItem !== null ) {
                EXAMPLE_ITEM_WRAP = DOCUMENTATION_JSON.documentation.htmlWrap.exampleItem;
            }
            // example
            if ( !! DOCUMENTATION_JSON.documentation.htmlWrap.example && DOCUMENTATION_JSON.documentation.htmlWrap.example !== null ) {
                EXAMPLE_WRAP = DOCUMENTATION_JSON.documentation.htmlWrap.example;
            }
            /*
            // example html code
            if ( !! DOCUMENTATION_JSON.documentation.htmlWrap.exampleHtmlCode && DOCUMENTATION_JSON.documentation.htmlWrap.exampleHtmlCode !== null ) {
                EXAMPLE_HTML_CODE_WRAP = DOCUMENTATION_JSON.documentation.htmlWrap.exampleHtmlCode;
            }
            */
            // example code
            if ( !! DOCUMENTATION_JSON.documentation.htmlWrap.exampleCode && DOCUMENTATION_JSON.documentation.htmlWrap.exampleCode !== null ) {
                EXAMPLE_CODE_WRAP = DOCUMENTATION_JSON.documentation.htmlWrap.exampleCode;
            }

            // nav all
            if ( !! DOCUMENTATION_JSON.documentation.navHtmlWrap.all && DOCUMENTATION_JSON.documentation.navHtmlWrap.all !== null ) {
                NAV_WRAP = DOCUMENTATION_JSON.documentation.navHtmlWrap.all;
            }
            // nav item group
            if ( !! DOCUMENTATION_JSON.documentation.navHtmlWrap.itemGroup && DOCUMENTATION_JSON.documentation.navHtmlWrap.itemGroup !== null ) {
                NAV_ITEM_GROUP_WRAP = DOCUMENTATION_JSON.documentation.navHtmlWrap.itemGroup;
            }
            // nav item
            if ( !! DOCUMENTATION_JSON.documentation.navHtmlWrap.item && DOCUMENTATION_JSON.documentation.navHtmlWrap.item !== null ) {
                NAV_ITEM_WRAP = DOCUMENTATION_JSON.documentation.navHtmlWrap.item;
            }
            // nav item devider
            if ( !! DOCUMENTATION_JSON.documentation.navHtmlWrap.itemDevider && DOCUMENTATION_JSON.documentation.navHtmlWrap.itemDevider !== null ) {
                NAV_ITEM_DEVIDER = DOCUMENTATION_JSON.documentation.navHtmlWrap.itemDevider;
            }
        }
    }
    if ( !! DOCUMENTATION_JSON.example && DOCUMENTATION_JSON.example !== null ) {
        // twig wrap
        if ( !! DOCUMENTATION_JSON.example.twigWrap && DOCUMENTATION_JSON.example.twigWrap !== null ) {
            // content
            if ( !! DOCUMENTATION_JSON.example.twigWrap.content && DOCUMENTATION_JSON.example.twigWrap.content !== null ) {
                EXAMPLE_TWIG_CONTENT_WRAP = DOCUMENTATION_JSON.example.twigWrap.content;
            }
            // get param
            if ( !! DOCUMENTATION_JSON.example.getParam && DOCUMENTATION_JSON.example.getParam !== null ) {
                EXAMPLE_GET_PARAM = DOCUMENTATION_JSON.example.getParam;
            }
        }
    }

    // wrap content (open)
    if ( !! TWIG_CONTENT_WRAP[ 0 ] ) {
        DOCS_STRING += TWIG_CONTENT_WRAP[ 0 ];
    }
    if ( !! ALL_WRAP[ 0 ] ) {
        DOCS_STRING += ALL_WRAP[ 0 ];
    }

    // wrap nav (open)
    if ( !! TWIG_NAV_WRAP[ 0 ] ) {
        DOCS_NAV_STRING += TWIG_NAV_WRAP[ 0 ];
    }
    if ( !! NAV_WRAP[ 0 ] ) {
        DOCS_NAV_STRING += NAV_WRAP[ 0 ];
    }

    // example wrap content (open)
    if ( !! EXAMPLE_TWIG_CONTENT_WRAP[ 0 ] ) {
        DOCS_EXAMPLE_STRING += EXAMPLE_TWIG_CONTENT_WRAP[ 0 ];
    }

    for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
        var CURRENT_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_PLUGIN ];
        var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

        // get each components config
        var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
        if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
            CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
        }

        // example content
        if ( !! CURRENT_COMPONENT_CONFIG.view && CURRENT_COMPONENT_CONFIG.view !== null && !! CURRENT_COMPONENT_CONFIG.view.use ) {

            // components files
            var VIEW_STACK = CURRENT_COMPONENT_CONFIG.view.use;
            for ( var j = 0; j < VIEW_STACK.length; j++ ) {

                // TODO: allow VIEW_STACK[ j ].key === null ?

                if ( !! VIEW_STACK[ j ].key && VIEW_STACK[ j ].key !== null ) {

                    // add full component code
                    var COMPONENT_VIEW_FILE = VIEW_STACK[ j ].key;

                    // add heading
                    // TODO: if multiple templates add template names (or add names in any case)
                    var COMPONENT_NAME = splitFileName( splitFilePath( COMPONENT_VIEW_FILE )[ 1 ] )[ 0 ];
                    UPPERCASE_COMPONENT_NAME = COMPONENT_NAME.charAt( 0 ).toUpperCase() + COMPONENT_NAME.slice( 1 );

                    var COMPONENT_FULL_PATH = CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + COMPONENT_VIEW_FILE;

                    // write heading
                    DOCS_STRING += '<h2 class="cmp-heading" id="' + COMPONENT_NAME + '" title="' + COMPONENT_FULL_PATH + '">' + UPPERCASE_COMPONENT_NAME + '</h2>';

                    // nav item group
                    var CURRENT_COMPONENT_PATH_SEGMENTS = CURRENT_COMPONENT_PATH.split( PATH_SEPARATOR );
                    var CURRENT_ITEM_GROUP_NAME = CURRENT_COMPONENT_PATH_SEGMENTS[ 2 ];
                    var DOCS_NAV_ITEM_GROUP_CHANGED = false;

                    if ( DOCS_NAV_ITEM_GROUP !== CURRENT_ITEM_GROUP_NAME ) {
                        // ressource path has changed

                        DOCS_NAV_ITEM_GROUP_CHANGED = true;

                        DOCS_NAV_ITEM_GROUP = CURRENT_ITEM_GROUP_NAME;

                        // write item group
                        DOCS_NAV_STRING += NAV_ITEM_GROUP_WRAP.open + CURRENT_ITEM_GROUP_NAME + NAV_ITEM_GROUP_WRAP.close;
                    }

                    // nav item devider
                    var CURRENT_ITEM_NAME = CURRENT_COMPONENT_PATH_SEGMENTS[ CURRENT_COMPONENT_PATH_SEGMENTS.length - 1 ];

                    if ( DOCS_NAV_ITEM !== CURRENT_ITEM_NAME ) {
                        // item has changed

                        DOCS_NAV_ITEM = CURRENT_ITEM_NAME;

                        if ( ! DOCS_NAV_ITEM_GROUP_CHANGED ) {
                            // write item devider
                            DOCS_NAV_STRING += NAV_ITEM_DEVIDER;
                        }
                    }

                    // write nav item & link
                    if ( !! NAV_ITEM_WRAP.open && NAV_ITEM_WRAP.open != null && !! NAV_ITEM_WRAP.close && NAV_ITEM_WRAP.close != null && NAV_ITEM_WRAP.open.length > 1 ) {
                        DOCS_NAV_STRING += NAV_ITEM_WRAP.open[ 0 ] + '#' + COMPONENT_NAME + NAV_ITEM_WRAP.open[ 1 ] + UPPERCASE_COMPONENT_NAME + NAV_ITEM_WRAP.close;
                    }

                    var VIEW_COMPONENT = fs.readFileSync( COMPONENT_FULL_PATH );
                    DOCS_VIEW_CODE = ( !! VIEW_CODE_WRAP[ 0 ] ? VIEW_CODE_WRAP[ 0 ] : '' ) + '{% set tmpHtml = "' + String( VIEW_COMPONENT ).replace( /"/g, '\\"' ) + '" %}\n{{ tmpHtml }}\n' + ( !! VIEW_CODE_WRAP[ 1 ] ? VIEW_CODE_WRAP[ 1 ] : '' );

                    //DOCS_STRING += ( !! EXAMPLE_ITEM_WRAP[ 0 ] ? EXAMPLE_ITEM_WRAP[ 0 ] : '' ) + DOCS_VIEW_CODE + '\n\n' + ( !! EXAMPLE_ITEM_WRAP[ 1 ] ? EXAMPLE_ITEM_WRAP[ 1 ] : '' );

                    var ACCORDION_OPEN = '<div data-fn="slidetoggle">';
                    var ACCORDION_TRIGGER = '<button class="btn btn-secondary w-100" id="accordion-1-trigger-' + i + '' + j + '" data-g-tg="slidetoggle-trigger" aria-controls="accordion-1-target-' + i + '' + j + '" aria-expanded="false"><i class="fa fa-code" aria-hidden="true"></i><span>Show component source</span></button>';
                    var ACCORDION_CONTENT = '<div id="accordion-1-target-' + i + '' + j + '" data-g-tg="slidetoggle-target" aria-labelledby="accordion-1-trigger-' + i + '' + j + '" style="display: none;">' + DOCS_VIEW_CODE + '</div>';
                    var ACCORDION_CLOSE = '</div>';

                    DOCS_STRING += ( !! EXAMPLE_ITEM_WRAP[ 0 ] ? EXAMPLE_ITEM_WRAP[ 0 ] : '' ) + ACCORDION_OPEN + ACCORDION_TRIGGER + ACCORDION_CONTENT + ACCORDION_CLOSE + '\n\n' + ( !! EXAMPLE_ITEM_WRAP[ 1 ] ? EXAMPLE_ITEM_WRAP[ 1 ] : '' );

                }

                // add examples
                if ( VIEW_STACK[ j ].example && VIEW_STACK[ j ].example !== null ) {

                    var DOCS_FILE_STACK = VIEW_STACK[ j ].example;

                    // iterate examples stack each component file
                    for ( var k = 0; k < DOCS_FILE_STACK.length; k++ ) {
                        var DOCS_EXAMPLE_FILE_PATH = DOCS_FILE_STACK[ k ].key;
                        var DOCS_EXAMPLE_TEXT = DOCS_FILE_STACK[ k ].doc;

                        // text
                        var TEXT_TEMPLATE = [
                            '<p>',
                            '</p>'
                        ];
                        var ALERT_TEMPLATE = [
                            '<div class="alert ',
                            '"  role="alert">',
                            '</div>'
                        ];
                        if ( !! DOCS_EXAMPLE_TEXT && DOCS_EXAMPLE_TEXT !== null ) {
                            for ( var l = 0; l < DOCS_EXAMPLE_TEXT.length; l++ ) {

                                var EXAMPLE_TEXT_STRING = '';
                                var TEXT;
                                var TYPE = '';

                                // read text nodes
                                if ( !! DOCS_EXAMPLE_TEXT[ l ].key && DOCS_EXAMPLE_TEXT[ l ].key !== null ) {
                                    TEXT = DOCS_EXAMPLE_TEXT[ l ].key;

                                    // parse markdown
                                    TEXT = parseMarkdown( TEXT );
                                }
                                if ( !! DOCS_EXAMPLE_TEXT[ l ].type && DOCS_EXAMPLE_TEXT[ l ].type !== null ) {
                                    TYPE = DOCS_EXAMPLE_TEXT[ l ].type;
                                }

                                // check type
                                if ( TEXT ) {
                                    if ( !! TYPE && TYPE.indexOf( 'alert-' ) == 0 ) {
                                        // alert
                                        EXAMPLE_TEXT_STRING += ALERT_TEMPLATE[ 0 ] + TYPE + ALERT_TEMPLATE[ 1 ] + TEXT + ALERT_TEMPLATE[ 2 ];
                                    }
                                    else if ( !! TYPE && TYPE === 'raw' ) {
                                        // alert
                                        EXAMPLE_TEXT_STRING += TEXT;
                                    }
                                    else {
                                        // default text
                                        EXAMPLE_TEXT_STRING += TEXT_TEMPLATE[ 0 ] + TEXT + TEXT_TEMPLATE[ 1 ];
                                    }
                                }

                                // write
                                DOCS_STRING += EXAMPLE_TEXT_STRING;

                            }
                        }

                        // example
                        var DOCS_EXAMPLE = fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + DOCS_EXAMPLE_FILE_PATH );


                        // write (single) example
                        var EXAMPLE_ID = encodeURI( CURRENT_COMPONENT_PATH + DOCS_EXAMPLE_FILE_PATH );

                        // open if
                        if ( k == 0 ) {
                            // first item
                            DOCS_EXAMPLE_STRING += '{% if ' + EXAMPLE_GET_PARAM + ' == \'' + EXAMPLE_ID + '\' %}';
                        }
                        else {
                            // item
                            DOCS_EXAMPLE_STRING += '{% elseif ' + EXAMPLE_GET_PARAM + ' == \'' + EXAMPLE_ID + '\' %}';
                        }

                        // add twig content
                        DOCS_EXAMPLE_STRING += DOCS_EXAMPLE;

                        // close if
                        if ( k == DOCS_FILE_STACK.length - 1 ) {
                            // last item
                            DOCS_EXAMPLE_STRING += '{% endif %}';
                        }
                        // /write (single) example


                        // link to (single) example
                        var DOCS_EXAMPLE_HTML = '<div class="mb-2"><a class="btn btn-secondary btn-sm" href="{{- services.category.getURLById( config( \'' + PLUGIN_NAME + '.global.example_cat_id\' ) ) -}}?' + EXAMPLE_GET_PARAM + '=' + EXAMPLE_ID + ( DOCS_EXAMPLE.indexOf( 'belowNavbar: true' ) != -1 ? '&belowNavbar=true' : '' ) + '" target="_blank"><i class="fa fa-eye" aria-hidden="true"></i><span>Preview example</span></a></div>';

                        // example html
                        DOCS_EXAMPLE_HTML += ( !! EXAMPLE_WRAP[ 0 ] ? EXAMPLE_WRAP[ 0 ] : '' ) + DOCS_EXAMPLE + ( !! EXAMPLE_WRAP[ 1 ] ? EXAMPLE_WRAP[ 1 ] : '' );

                        // example html output code

                        // TEST – TODO: cleanup
                        /*
                        var RENDERED_TWIG_CODE = 
                            '{% set tmpHtml = "' + String( DOCS_EXAMPLE ).replace( /"/g, '\\"' ) + '" %}'
                            + '<script>html = "{{ tmpHtml | replace( { \'"\': \'\\"\' } ) }}";</script>'
                        ;

                        //DOCS_EXAMPLE_HTML_CODE = ( !! EXAMPLE_HTML_CODE_WRAP[ 0 ] ? EXAMPLE_HTML_CODE_WRAP[ 0 ] : '' ) + '{% set tmpHtml = "' + String( DOCS_EXAMPLE ).replace( /"/g, '\\"' ) + '" %}\n<script>document.write( \'{{ tmpHtml | replace( { "\'": "' + "\'" + '" } ) }}\' );</script>\n' + ( !! EXAMPLE_HTML_CODE_WRAP[ 1 ] ? EXAMPLE_HTML_CODE_WRAP[ 1 ] : '' );
                        //DOCS_EXAMPLE_HTML_CODE =  '<script>document.write( \'' + ( !! EXAMPLE_HTML_CODE_WRAP[ 0 ] ? EXAMPLE_HTML_CODE_WRAP[ 0 ] : '' ) + '\' + ' + 'String( \'' + DOCS_EXAMPLE + '\' ).replace( /&/g, \'&amp;\' ).replace( /</g, \'&lt;\' ).replace( />/g, \'&gt;\' ).replace( /"/g, \'&quot;\' )' + ' + \'' + ( !! EXAMPLE_HTML_CODE_WRAP[ 1 ] ? EXAMPLE_HTML_CODE_WRAP[ 1 ] : '' ) + '\');</script>" %}{{ tmpHtml }}\n';
                        DOCS_EXAMPLE_HTML_CODE = RENDERED_TWIG_CODE;
                        */

                        // example codeDOCS_EXAMPLE
                        DOCS_EXAMPLE_CODE = ( !! EXAMPLE_CODE_WRAP[ 0 ] ? EXAMPLE_CODE_WRAP[ 0 ] : '' ) + '{% set tmpHtml = "' + String( DOCS_EXAMPLE ).replace( /"/g, '\\"' ) + '" %}\n{{ tmpHtml }}\n' + ( !! EXAMPLE_CODE_WRAP[ 1 ] ? EXAMPLE_CODE_WRAP[ 1 ] : '' );

                        // TODO: add ast html & as code
                        // TODO: wrap
                        DOCS_STRING += ( !! EXAMPLE_ITEM_WRAP[ 0 ] ? EXAMPLE_ITEM_WRAP[ 0 ] : '' ) + DOCS_EXAMPLE_HTML  + '\n\n' + DOCS_EXAMPLE_CODE + '\n\n' + ( !! EXAMPLE_ITEM_WRAP[ 1 ] ? EXAMPLE_ITEM_WRAP[ 1 ] : '' );
                    }

                }

                // add hr
                if ( j == VIEW_STACK.length - 1 ) {
                    DOCS_STRING += '<hr>';
                }

            }
        }
    }

    // wrap content (close)
    if ( ALL_WRAP.length > 0 ) {
        DOCS_STRING += ALL_WRAP[ 1 ];
    }
    if ( TWIG_CONTENT_WRAP.length > 0 ) {
        DOCS_STRING += TWIG_CONTENT_WRAP[ 1 ];
    }

    // wrap nav (close)
    if ( !! NAV_WRAP[ 1 ] ) {
        DOCS_NAV_STRING += NAV_WRAP[ 1 ];
    }
    if ( !! TWIG_NAV_WRAP[ 1 ] ) {
        DOCS_NAV_STRING += TWIG_NAV_WRAP[ 1 ];
    }

    // example wrap content (close)
    if ( !! EXAMPLE_TWIG_CONTENT_WRAP[ 1 ] ) {
        DOCS_EXAMPLE_STRING += EXAMPLE_TWIG_CONTENT_WRAP[ 1 ];
    }

    // write components & example
    var DOCUMENTATION_DEST_FILE = DOCUMENTATION_DEST_FILE_FALLBACK;
    if ( !! COMPONENTS_JSON.config && COMPONENTS_JSON.config !== null && !! COMPONENTS_JSON.config.documentationDestFile && COMPONENTS_JSON.config.documentationDestFile !== null ) {
        DOCUMENTATION_DEST_FILE = '.' + COMPONENTS_JSON.config.documentationDestFile;
    }
    fs.writeFileSync( DOCUMENTATION_DEST_FILE, DOCS_STRING + DOCS_EXAMPLE_STRING );

    // write nav
    var DOCUMENTATION_NAV_DEST_FILE = DOCUMENTATION_NAV_DEST_FILE_FALLBACK;
    if ( !! COMPONENTS_JSON.config && COMPONENTS_JSON.config !== null && !! COMPONENTS_JSON.config.documentationNavDestFile && COMPONENTS_JSON.config.documentationNavDestFile !== null ) {
        DOCUMENTATION_NAV_DEST_FILE = '.' + COMPONENTS_JSON.config.documentationNavDestFile;
    }
    fs.writeFileSync( DOCUMENTATION_NAV_DEST_FILE, DOCS_NAV_STRING );
} );


// BUILD JS VENDOR

var VENDOR_STACK = [];

gulp.task( 'js:vendor_stack', function() {
    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );

    for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
        var CURRENT_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_PLUGIN ];
        var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

        // get each components config
        var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
        if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
            CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
        }

        // get files src plugin path
        var CURRENT_COMPONENT_SRC_PLUGIN = ( CURRENT_COMPONENT_CONFIG.srcPlugin === undefined || CURRENT_COMPONENT_CONFIG.srcPlugin === null ) ? CURRENT_COMPONENT_PLUGIN : CURRENT_COMPONENT_CONFIG.srcPlugin;
        var CURRENT_COMPONENT_SRC_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_SRC_PLUGIN ];

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

    //fs.writeFileSync( './resources/log.txt', LOG );

    return true;
} );


/*

// update to gulp 4 – TODO: remove this comment

gulp.task( 'default', [ 'del' ], function() {
    // default task code here
} );
gulp.task( 'default', gulp.series( 'del', function() { 
    // default task code here
} ) );

*/


gulp.task( 'js:vendor', gulp.series( 'js:vendor_stack', function() { 
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
} ) );


// BUILD JS SCRIPTS

// js lang object

var JS_LANG_OBJECT_STR = '';
var PROPERTY_SEPARATOR = '=';
var PROPERTY_VAL_QUOTE = '"';

gulp.task( 'js:lang_file', function() {

    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );
    var LANG_FOLDERS = COMPONENTS_JSON.config.lang;

    // init lang object
    var JS_LANG_OBJECT = {};

    // add each lang
    for ( var i = 0; i < LANG_FOLDERS.length; i++ ) {
        JS_LANG_OBJECT[ LANG_FOLDERS[ i ] ] = {};
    }

    for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
        var CURRENT_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_PLUGIN ];
        var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

        // get each components config
        var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
        if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
            CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
        }

        // get files src plugin path
        var CURRENT_COMPONENT_SRC_PLUGIN = ( CURRENT_COMPONENT_CONFIG.srcPlugin === undefined || CURRENT_COMPONENT_CONFIG.srcPlugin === null ) ? CURRENT_COMPONENT_PLUGIN : CURRENT_COMPONENT_CONFIG.srcPlugin;
        var CURRENT_COMPONENT_SRC_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_SRC_PLUGIN ];

        if ( !! CURRENT_COMPONENT_CONFIG.js && CURRENT_COMPONENT_CONFIG.js !== null && !! CURRENT_COMPONENT_CONFIG.js.lang && CURRENT_COMPONENT_CONFIG.js.lang !== null ) {
            var CURRENT_PROP_STACK = CURRENT_COMPONENT_CONFIG.js.lang;
            for ( var j = 0; j < CURRENT_PROP_STACK.length; j++ ) {

                var CURRENT_FILE_NAME = CURRENT_PROP_STACK[ j ].key.indexOf( PATH_SEPARATOR ) == 0 ? CURRENT_PROP_STACK[ j ].key : PATH_SEPARATOR + CURRENT_PROP_STACK[ j ].key;
                var CURRENT_INTERNAL_PATH = ( CURRENT_PROP_STACK[ j ].path.indexOf( PATH_SEPARATOR ) == 0 ? CURRENT_PROP_STACK[ j ].path : PATH_SEPARATOR + CURRENT_PROP_STACK[ j ].path ) || '';

                // add all languages
                for ( var k = 0; k < LANG_FOLDERS.length; k++ ) {
                    var CURRENT_LANG_FOLDER = PATH_SEPARATOR + LANG_FOLDERS[ k ];

                    // get file
                    var ADAPTED_FILE_SRC = CURRENT_COMPONENT_SRC_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + CURRENT_INTERNAL_PATH + CURRENT_LANG_FOLDER + CURRENT_FILE_NAME;

                    JS_LANG_OBJECT_STR += COMPONENTS_JSON.config.jsLangObject + '.' + COMPONENTS_JSON.config.lang[ k ] + '[ \'' + splitFileName( CURRENT_FILE_NAME )[ 0 ] + '\' ] = {};\n';

                    var FILE_NAME = splitFileName( CURRENT_FILE_NAME )[ 0 ];

                    // init property
                    JS_LANG_OBJECT[ COMPONENTS_JSON.config.lang[ k ] ][ FILE_NAME ] = {};

                    var PROP_FILE_CONTENT = fs.readFileSync( ADAPTED_FILE_SRC ).toString();

                    // split in lines (may contain comment, property, empty)
                    var LINES = PROP_FILE_CONTENT.split( "\n" );
                    for ( var l = 0; l < LINES.length; l++ ) {

                        var LINE = LINES[ l ].trim();
                        if ( LINE != '' && LINE.indexOf( ';' ) !== 0 && LINE.indexOf( PROPERTY_SEPARATOR ) !== -1 ) {

                            // separate key & value
                            var PROP_KEY_VAL = LINE.split( PROPERTY_SEPARATOR );
                            var PROP_KEY = PROP_KEY_VAL[ 0 ].trim();
                            var PROP_VAL = PROP_KEY_VAL[ 1 ].trim().replace( /^\"+|\"+$/g, '' );

                            // add prop
                            JS_LANG_OBJECT[ COMPONENTS_JSON.config.lang[ k ] ][ FILE_NAME ][ PROP_KEY ] = PROP_VAL;
                        }

                    }

                }

            }
        }
    }

    //LOG = JS_LANG_OBJECT_STR;
    //LOG = JSON.stringify( JS_LANG_OBJECT, false, 4 );
    JS_LANG_OBJECT_STR = '// this file was generated by gulpfile.js\n\nvar ' + COMPONENTS_JSON.config.jsLangObject + ' = ' + JSON.stringify( JS_LANG_OBJECT, false, 4 ) + ';\n';

    var JS_LANG_DEST_FILE = JS_LANG_DEST_FILE_FALLBACK;
    if ( !! COMPONENTS_JSON.config && COMPONENTS_JSON.config !== null && !! COMPONENTS_JSON.config.jsLangObject && COMPONENTS_JSON.config.jsLangObject !== null ) {
        JS_LANG_DEST_FILE = '.' + COMPONENTS_JSON.config.jsLangObject;
    }
    fs.writeFileSync( JS_LANG_DEST_FILE, JS_LANG_OBJECT_STR );

    //LOG = JS_LANG_OBJECT_STR;

    //fs.writeFileSync( './resources/log.txt', LOG );

    return true;
} );


// script files stack

var SCRIPTS_STACK = [];

gulp.task( 'js:scripts_stack', function() {
    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );

    for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
        var CURRENT_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_PLUGIN ];
        var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

        // get each components config
        var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
        if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
            CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
        }

        // get files src plugin path
        var CURRENT_COMPONENT_SRC_PLUGIN = ( CURRENT_COMPONENT_CONFIG.srcPlugin === undefined || CURRENT_COMPONENT_CONFIG.srcPlugin === null ) ? CURRENT_COMPONENT_PLUGIN : CURRENT_COMPONENT_CONFIG.srcPlugin;
        var CURRENT_COMPONENT_SRC_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_SRC_PLUGIN ];

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
    //fs.writeFileSync( './resources/log.txt', LOG );

    return true;
} );

gulp.task( 'js:scripts_concat', function() {
    return gulp.src( SCRIPTS_STACK )
        .pipe( sourcemaps.init() )
        .pipe( concat( SCRIPTS_FILE_NAME ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( JS_DEST_PATH + '/' ) )
    ;
} );

gulp.task( 'js:scripts_compress', function() {
    return gulp.src( JS_DEST_PATH + '/' + SCRIPTS_FILE_NAME )
        .pipe( minify( {
            ext: {
                src:'.js',
                min:'.min.js'
            },
            exclude: [],
            ignoreFiles: [ VENDOR_FILE_NAME, '.min.js' ]
        } ) )
        .pipe( gulp.dest( JS_DEST_PATH + '/' ) )
    ;
} );


gulp.task( 'js:scripts', gulp.series( 'js:lang_file', 'js:scripts_stack', 'js:scripts_concat', function() {
    gulp.start( [
        'js:scripts_compress'
    ] );
} ) );


// COPY FILES

var FILE_STACK = [];

gulp.task( 'plugin:file_stack', function() {
    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );

    for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
        var CURRENT_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_PLUGIN ];
        var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

        // get each components config
        var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
        if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
            CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
        }

        // get files src plugin path
        var CURRENT_COMPONENT_SRC_PLUGIN = ( CURRENT_COMPONENT_CONFIG.srcPlugin === undefined || CURRENT_COMPONENT_CONFIG.srcPlugin === null ) ? CURRENT_COMPONENT_PLUGIN : CURRENT_COMPONENT_CONFIG.srcPlugin;
        var CURRENT_COMPONENT_SRC_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_SRC_PLUGIN ];

        if ( !! CURRENT_COMPONENT_CONFIG.copyFiles && CURRENT_COMPONENT_CONFIG.copyFiles !== null ) {
            var CURRENT_FILE_STACK = CURRENT_COMPONENT_CONFIG.copyFiles;
            for ( var j = 0; j < CURRENT_FILE_STACK.length; j++ ) {

                var CURRENT_FILE_SRC = CURRENT_FILE_STACK[ j ].src;
                var CURRENT_FILE_DEST = CURRENT_FILE_STACK[ j ].dest;

                var ADAPTED_FILE_SRC = CURRENT_COMPONENT_SRC_PLUGIN_PATH + ( ( CURRENT_FILE_SRC.indexOf( '/node_modules' ) == 0 || CURRENT_FILE_SRC.indexOf( RESOURCES_PATH ) == 0 ) ? '' : RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + CURRENT_FILE_SRC;
                var ADAPTED_FILE_DEST = ( ( CURRENT_FILE_DEST.indexOf( RESOURCES_PATH ) == 0 || CURRENT_FILE_DEST.indexOf( SRC_PATH ) == 0 ) ? '.' : RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH ) + CURRENT_FILE_DEST;
                
                FILE_STACK.push( {
                    src: ADAPTED_FILE_SRC,
                    dest: ADAPTED_FILE_DEST
                } );

                //LOG += ADAPTED_FILE_SRC + '\n';
                //LOG += ADAPTED_FILE_DEST + '\n\n';
            }
        }
    }

    //fs.writeFileSync( './resources/log.txt', LOG );

    return true;
} );

gulp.task( 'plugin_files', gulp.series( 'plugin:file_stack', function() {

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

    //fs.writeFileSync( './resources/log.txt', LOG );

    return stream;
} ) );


// COPY LANG PROPERTIES

var PROP_STACK = [];

gulp.task( 'plugin:lang_stack', function() {
    var COMPONENTS_JSON = JSON.parse( fs.readFileSync( COMPONENTS_CONFIG_FILE_PATH ) );
    var LANG_FOLDERS = COMPONENTS_JSON.config.lang;

    for ( var i = 0; i < COMPONENTS_JSON.use.length; i++ ) {
        var CURRENT_COMPONENT_PLUGIN = COMPONENTS_JSON.use[ i ].plugin || 0;
        var CURRENT_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_PLUGIN ];
        var CURRENT_COMPONENT_PATH = COMPONENTS_JSON.use[ i ].key;

        // get each components config
        var CURRENT_COMPONENT_CONFIG = JSON.parse( fs.readFileSync( CURRENT_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + SINGLE_CONFIG_FILE_NAME ) );
        if ( !! COMPONENTS_JSON.use[ i ].overrideComponentConfig && COMPONENTS_JSON.use[ i ].overrideComponentConfig !== null ) {
            CURRENT_COMPONENT_CONFIG = merge( CURRENT_COMPONENT_CONFIG, COMPONENTS_JSON.use[ i ].overrideComponentConfig );
        }

        // get files src plugin path
        var CURRENT_COMPONENT_SRC_PLUGIN = ( CURRENT_COMPONENT_CONFIG.srcPlugin === undefined || CURRENT_COMPONENT_CONFIG.srcPlugin === null ) ? CURRENT_COMPONENT_PLUGIN : CURRENT_COMPONENT_CONFIG.srcPlugin;
        var CURRENT_COMPONENT_SRC_PLUGIN_PATH = PLUGIN_PATHS[ CURRENT_COMPONENT_SRC_PLUGIN ];

        if ( !! CURRENT_COMPONENT_CONFIG.lang && CURRENT_COMPONENT_CONFIG.lang !== null ) {
            var CURRENT_PROP_STACK = CURRENT_COMPONENT_CONFIG.lang;
            for ( var j = 0; j < CURRENT_PROP_STACK.length; j++ ) {

                var CURRENT_FILE_NAME = CURRENT_PROP_STACK[ j ].key.indexOf( PATH_SEPARATOR ) == 0 ? CURRENT_PROP_STACK[ j ].key : PATH_SEPARATOR + CURRENT_PROP_STACK[ j ].key;
                var CURRENT_INTERNAL_PATH = ( CURRENT_PROP_STACK[ j ].path.indexOf( PATH_SEPARATOR ) == 0 ? CURRENT_PROP_STACK[ j ].path : PATH_SEPARATOR + CURRENT_PROP_STACK[ j ].path ) || '';

                // add all languages
                for ( var k = 0; k < LANG_FOLDERS.length; k++ ) {
                    var CURRENT_LANG_FOLDER = PATH_SEPARATOR + LANG_FOLDERS[ k ];

                    var ADAPTED_FILE_SRC = CURRENT_COMPONENT_SRC_PLUGIN_PATH + RESOURCES_PATH + COMPONENTS_PATH + CURRENT_COMPONENT_PATH + CURRENT_INTERNAL_PATH + CURRENT_LANG_FOLDER + CURRENT_FILE_NAME;
                    var ADAPTED_FILE_DEST = LANG_DEST_PATH + CURRENT_LANG_FOLDER;
                    
                    PROP_STACK.push( {
                        src: ADAPTED_FILE_SRC,
                        dest: ADAPTED_FILE_DEST
                    } );

                    //LOG += ADAPTED_FILE_SRC + '\n';
                    //LOG += ADAPTED_FILE_DEST + '\n\n';

                }

            }
        }
    }

    //fs.writeFileSync( './resources/log.txt', LOG );

    return true;
} );

gulp.task( 'plugin:lang', gulp.series( 'plugin:lang_stack', function() {
    var stream;
    for ( var i = 0; i < PROP_STACK.length; i++ ) {
        stream = gulp
            .src( PROP_STACK[ i ].src )
            .pipe( gulp.dest( PROP_STACK[ i ].dest ) )
        ;

        //LOG += PROP_STACK[ i ].src + '\n ––> ' + PROP_STACK[ i ].dest + '\n';
    }

    //fs.writeFileSync( './resources/log.txt', LOG );

    return stream;
} ) );


// BUILD CSS FROM SCSS

// compile scss to css
function scss_to_css() {
    return gulp.src( SCSS_SRC_PATH + '/**/*.scss' )
        .pipe( sourcemaps.init() )
        .pipe( sass().on( 'error', sass.logError ) )
        .pipe( autoprefixer( {
            browsers: [ 'last 8 versions' ],
            cascade: false
        } ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( CSS_DEST_PATH ) );
}

// delete css folder to avoid duplicatet files
function css_clean() {
    return gulp.src( CSS_DEST_PATH, { read: false } )
        .pipe( clean() );
}

// generate minified css file
/*
gulp.task( 'css_minify', gulp.series( 'plugin_scss', 'css_clean', 'sass', function() {
    return gulp.src( CSS_DEST_PATH + '/**-----------------/*.css' )
        .pipe( cleanCSS( { debug: true }, function( details ) {
            console.log( details.name + ': ' + details.stats.originalSize );
            console.log( details.name + ': ' + details.stats.minifiedSize );
        } ) )
        .pipe( rename( function( path ) {
            path.basename += '.min';
        } ) )
        .pipe( gulp.dest( CSS_DEST_PATH ) );
} ) );
*/
function css_minify() {
    gulp.series( plugin_scss, css_clean, scss_to_css, function() {
        return gulp.src( CSS_DEST_PATH + '/**/*.css' )
            .pipe( cleanCSS( { debug: true }, function( details ) {
                console.log( details.name + ': ' + details.stats.originalSize );
                console.log( details.name + ': ' + details.stats.minifiedSize );
            } ) )
            .pipe( rename( function( path ) {
                path.basename += '.min';
            } ) )
            .pipe( gulp.dest( CSS_DEST_PATH ) );
    } )
}

// generate minified css file and include atf style into header
/*
gulp.task( 'css_all', gulp.series( 'plugin_prepare_view', 'css_minify', function() {
    gulp.start( [
        'plugin:include_atf_style',
    ] );
} ) );
*/
function css_all() {
    return gulp.series( plugin_prepare_view, 'css_minify', function() {
        gulp.start( [
            'plugin:include_atf_style',
        ] );
    } )
}



// INCLUDE ATF STYLE FROM FILE INTO HEADER

gulp.task( 'plugin:include_atf_style', function() {

    var ATF_STYLE_FILE_STACK = [
        {
            PATH: TWIG_DATA_PATH,
            FILES: '/**/*.twig'
        }
    ];

    // TODO: read atf style files (SCSS_ATF_DEST_FILE, SCSS_ATF_DEST_FILE.replace( '.css', '.min.css' ) ), include content

    var COMPRESSED_ATF_STYLE = fs.readFileSync( CSS_DEST_PATH + '/atf.min.css' );
    var ATF_STYLE = fs.readFileSync( CSS_DEST_PATH + '/atf.css' );;

    var stream;
    for ( var i = 0; i < ATF_STYLE_FILE_STACK.length; i++ ) {
        stream = gulp.src( ATF_STYLE_FILE_STACK[ i ].PATH + ATF_STYLE_FILE_STACK[ i ].FILES )
            .pipe( replace( INCLUDE_COMPRESSED_ATF_STYLE_PATTERN, COMPRESSED_ATF_STYLE ) )
            .pipe( replace( INCLUDE_ATF_STYLE_PATTERN, ATF_STYLE ) )
            .pipe( gulp.dest( ATF_STYLE_FILE_STACK[ i ].PATH ) )
        ;
    }

    return stream;
} );


// REPLACE PLUGIN NAME

gulp.task( 'plugin_replace_plugin_name', function() {

    var PLUGIN_NAME_FILE_STACK = [
        {
            PATH: TWIG_DATA_PATH,
            FILES: '/**/*.twig'
        },
        {
            PATH: SRC_DATA_PATH,
            FILES: '/**/*.php'
        }
    ];

    var stream;
    for ( var i = 0; i < PLUGIN_NAME_FILE_STACK.length; i++ ) {
        stream = gulp.src( PLUGIN_NAME_FILE_STACK[ i ].PATH + PLUGIN_NAME_FILE_STACK[ i ].FILES )
            .pipe( replace( REPLACE_PLUGIN_NAME_PATTERN, PLUGIN_NAME ) )
            .pipe( gulp.dest( PLUGIN_NAME_FILE_STACK[ i ].PATH ) )
        ;
    }

    return stream;

    //gulp.src( TWIG_DATA_PATH + '/**/*.twig' )
    //    .pipe( replace( REPLACE_PLUGIN_NAME_PATTERN, PLUGIN_NAME ) )
    //    .pipe( gulp.dest( TWIG_DATA_PATH ) )
    //;
} );


// PLUGIN VIEW (build only viev files and documentation)

gulp.task( 'plugin:docs', function() {
    gulp.start( [
        'plugin:components',
        'plugin:documentation',
        'plugin_replace_plugin_name'
    ] );
} );


// PLUGIN ALL (build all plugin files)

gulp.task( 'plugin:view', gulp.series( 'plugin_files', 'plugin:lang', function() {
    gulp.start( [
        'plugin:components',
        'plugin:documentation',
        'plugin_replace_plugin_name'
    ] );
} ) );


// PREPARE VIEW (build layout files & replace plugin name)

/*
gulp.task( 'plugin_prepare_view', [ 'plugin_files' ], function() {
    gulp.start( [
        'plugin:components',
        'plugin_replace_plugin_name'
    ] );
} );
*/
/*
gulp.task( 'plugin_prepare_view', gulp.series( 'plugin_files', function() {
    gulp.start( [
        'plugin_replace_plugin_name'
    ] );
} ) );
*/
function plugin_prepare_view() {
    return gulp.series( plugin_files, function() {
        gulp.start( [
            plugin_replace_plugin_name
        ] );
    } )
}


// BUILD

/*
gulp.task( 'build', [ 'plugin:lang', 'plugin:documentation', 'plugin_prepare_view', 'css_minify' ], function() {
    gulp.start( [
        'plugin:include_atf_style',
        'js:vendor',
        'js:scripts'
    ] );
} );
*/
/*
gulp.task( 'build', gulp.series( 'plugin_prepare_view', 'css_minify', function() {
    gulp.start( [
        'js:vendor',
        'js:scripts'
    ] );
} ) );
*/
function build( cb ) {
    return gulp.series( plugin_prepare_view, css_minify, function() {
        gulp.start( [
            'js:vendor',
            'js:scripts'
        ] );
        cb();
    } )
}



// SASS WATCH

// watch scss files, execute task 'css_minify' if found changes
gulp.task( 'sass:watch', function() {
    var WATCH_SCSS_STACK = [];
    for ( var i = 0; i < PLUGIN_PATHS.length; i++ ) {
        WATCH_SCSS_STACK.push( PLUGIN_PATHS[ i ] + RESOURCES_PATH + COMPONENTS_PATH + '/**/*.scss' );
    }
    return watch( WATCH_SCSS_STACK, function() {
        gulp.start( 'css_minify' );
    } );
} );


// TEST

function defaultTask( cb ) {
  // place code for your default task here
  cb();
}

//exports.default = defaultTask

exports.build = build;
exports.css_minify = css_minify
//exports.default = series(clean, build);
