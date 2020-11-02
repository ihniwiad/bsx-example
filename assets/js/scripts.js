var BSX_UTILS = ( function( $ ) {

    var Utils = {
        $document:      $( document ),
        $window:        $( window ),
        $body:          $( 'body' ),
        $scrollRoot:    $( 'html, body'),

        $functionElems: null,
        $targetElems: null,

        events: {
            initJs: 'initJs'
        },

        selectors: {
            functionElement:    '[data-fn]',
            targetElement:      '[data-tg]',
            focussableElements: 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
        },

        attributes: {
            functionElement:    'data-fn',
            targetElement:      'data-tg',
            target:             'data-fn-target',
            options:            'data-fn-options',
            callback:           'data-fn-callback'
        },

        classes: {
            open:           'show',
            active:         'active',
            animating:      'animating',
            animatingIn:    'animating-in',
            animatingOut:   'animating-out',
            invalid:        'is-invalid'
        },
        
        mediaSize: null,
        mediaSizes: [ 
            {
                breakpoint: 0,
                label: 'xs'
            },
            {
                breakpoint: 576,
                label: 'sm'
            },
            {
                breakpoint: 768,
                label: 'md'
            },
            {
                breakpoint: 992,
                label: 'lg'
            },
            {
                breakpoint: 1200,
                label: 'xl'
            }
        ],

        anchorOffsetTop: 0,

        lang: null,

        Alert: null,

        MessageHandler: null,

        WaitScreen: null,

        CookieHandler: null
        
    };

    // cache all functional elements
    var $functionAndTargetElems = $( Utils.selectors.functionElement + ', ' + Utils.selectors.targetElement );
    Utils.$functionElems = $functionAndTargetElems.filter( Utils.selectors.functionElement );
    Utils.$targetElems = $functionAndTargetElems.filter( Utils.selectors.targetElement );

    // anchors offset top
    var anchorOffsetTopSelector = '[data-fn~="anchor-offset-elem"]';
    var anchorOffsetTopDistance = 20;
    var $anchorOffsetTopElem = Utils.$functionElems.filter( anchorOffsetTopSelector );

    $.fn._getAnchorOffset = function() {
        // if header element position is fixed scroll below header

        var offsetTop = anchorOffsetTopDistance;

        if ( $anchorOffsetTopElem.length > 0 && $anchorOffsetTopElem.css( 'position' ) == 'fixed' ) {
            offsetTop += $anchorOffsetTopElem.outerHeight();
        }

        return offsetTop;
    }

    Utils.anchorOffsetTop = $anchorOffsetTopElem._getAnchorOffset();

    Utils.$window.on( 'sizeChange', function() {
        Utils.anchorOffsetTop = $anchorOffsetTopElem._getAnchorOffset();
    } );

    // get lang
    Utils.lang = Utils.$body.parent().attr( 'lang' ) || 'en';

    // convert type
    function _convertType( value ) {
        try {
            value = JSON.parse( value );
            return value;
        }
        catch( e ) {
            // 'value' is not a json string.
            return value
        }
    }

    // get transition duration
    $.fn.getTransitionDuration = function() {
        var duration = 0;
        var cssProperty = 'transition-duration';
        var prefixes = [ 'webkit', 'ms', 'moz', 'o' ];
        if ( this.css( cssProperty ) ) {
            duration = this.css( cssProperty );
        }
        else {
            for ( i = 0; i < prefixes.length; i++ ) {
                if ( this.css( '-' + prefixes[ i ] + '-' + cssProperty ) ) {
                    duration = this.css( '-' + prefixes[ i ] + '-' + cssProperty );
                    break;
                }
            }
        }

        if ( duration.indexOf != undefined ) {
            return ( duration.indexOf( 'ms' ) > -1 ) ? parseFloat( duration ) : parseFloat( duration ) * 1000;
        }
        else {
            return 0;
        }
        
    };

    // set and remove animation class
    $.fn.setRemoveAnimationClass = function( animatingClass, callback ) {
        var currentAnimatingClass = ( !! animatingClass ) ? animatingClass : Utils.classes.animating;
        var $this = $( this );
        var transitionDuration = $this.getTransitionDuration();
        if ( transitionDuration > 0 ) {
            $this.addClass( animatingClass );
            var timeout = setTimeout( function() {
                $this.removeClass( animatingClass );
                if ( !! callback ) {
                    callback();
                }
            }, transitionDuration );
        }
    };

    // check if element is positiones inside (x, y, width, height) of another element
    $.fn.elemPositionedInside = function( container ) {

        var $this = $( this );
        var $container = $( container );

        var elemOffsetLeft = $this.offset().left;
        var elemOffsetTop = $this.offset().top;
        var elemWidth = $this.width();
        var elemHeight = $this.height();

        var containerOffsetLeft = $container.offset().left;
        var containerOffsetTop = $container.offset().top;
        var containerWidth = $container.outerWidth(); // include border since offset will calulate only to border
        var containerHeight = $container.outerHeight();

        return elemOffsetLeft >= containerOffsetLeft
            && ( elemOffsetLeft + elemWidth ) <= ( containerOffsetLeft + containerWidth )
            && elemOffsetTop >= containerOffsetTop
            && ( elemOffsetTop + elemHeight ) <= ( containerOffsetTop + containerHeight );
    };

    // calculate sizes to fit inner element into outer element (only if inner is larger than outer) keeping distance in x & y direction
    getFitIntoSizes = function( settings ) {
        
        var outerWidth = settings.outerWidth || Utils.$window.width();
        var outerHeight = settings.outerHeight || Utils.$window.height();
        var innerWidth = settings.innerWidth;
        var innerHeight = settings.innerHeight;
        var xDistance = settings.xDistance || 0;
        var yDistance = settings.yDistance || 0;
        
        var resizeWidth;
        var resizeHeight;
        
        var outerRatio =  outerWidth / outerHeight;
        var innerRatio = ( innerWidth + xDistance ) / ( innerHeight + yDistance );
        
        if ( outerRatio > innerRatio ) {
            // limited by height
            resizeHeight = ( outerHeight >= innerHeight + yDistance ) ? innerHeight : outerHeight - yDistance;
            resizeWidth = parseInt( innerWidth / innerHeight * resizeHeight );
        }
        else {
            // limited by width
            resizeWidth = ( outerWidth >= innerWidth + xDistance ) ? innerWidth : outerWidth - xDistance;
            resizeHeight = parseInt( innerHeight / innerWidth * resizeWidth );
        }
        
        return [ resizeWidth, resizeHeight ];
    }

    // aria expanded
    $.fn.ariaExpanded = function( value ) {
        if ( typeof value !== 'undefined' ) {
            $( this ).attr( 'aria-expanded', value );
            return value;
        }
        return _convertType( $( this ).attr( 'aria-expanded' ) );
    };

    // aria
    $.fn.aria = function( ariaName, value ) {
        if ( typeof value !== 'undefined' ) {
            $( this ).attr( 'aria-' + ariaName, value );
            return value;
        }
        else {
            return _convertType( $( this ).attr( 'aria-' + ariaName ) );
        }
    };

    // hidden
    $.fn.hidden = function( value ) {
        if ( typeof value !== 'undefined' ) {
            if ( value == true ) {
                $( this ).attr( 'hidden', true );
            }
            else {
                $( this ).removeAttr( 'hidden' );
            }
        }
        else {
            return _convertType( $( this ).attr( hidden ) );
        }
    };
    
    // media size (media change event)
    var mediaSize = '';
    var mediaSizeBodyClassPrefix = 'media-';

    _getmediaSize = function() {
        var currentmediaSize;
        if ( !! window.matchMedia ) {
            // modern browsers
            for ( i = 0; i < Utils.mediaSizes.length - 1; i++ ) {
                if ( window.matchMedia( '(max-width: ' + ( Utils.mediaSizes[ i + 1 ].breakpoint - 1 ) + 'px)' ).matches ) {
                    currentmediaSize = Utils.mediaSizes[ i ].label;
                    break;
                }
                else {
                    currentmediaSize = Utils.mediaSizes[ Utils.mediaSizes.length - 1 ].label;
                }
            }
        }
        else {
            // fallback old browsers
            for ( i = 0; i < Utils.mediaSizes.length - 1; i++ ) {
                if ( Utils.$window.width() < Utils.mediaSizes[ i + 1 ].breakpoint ) {
                    currentmediaSize = Utils.mediaSizes[ i ].label;
                    break;
                }
                else {
                    currentmediaSize = Utils.mediaSizes[ Utils.mediaSizes.length - 1 ].label;
                }
            }
        }
        if ( currentmediaSize != Utils.mediaSize ) {
            // remove / set body class
            Utils.$body.removeClass( mediaSizeBodyClassPrefix + Utils.mediaSize );
            Utils.$body.addClass( mediaSizeBodyClassPrefix + currentmediaSize );

            Utils.mediaSize = currentmediaSize;
            Utils.$window.trigger( 'sizeChange' );
        }
    };
    Utils.$document.ready( function() {
        _getmediaSize();
        Utils.$window.trigger( 'sizeChangeReady' );
    } );
    Utils.$window.on( 'resize', function() {
        _getmediaSize();    
    } );
    // /media size (media change event)

    // get options from attribute
    // syntax: data-fn-options="{ focusOnOpen: '[data-tg=\'header-search-input\']', bla: true, foo: 'some text content' }"
    $.fn.getOptionsFromAttr = function() {
        var $this = $( this );
        var options = $this.attr( Utils.attributes.options );
        if ( typeof options !== 'undefined' ) {
            return ( new Function( 'return ' + options ) )();
        }
        else {
            return {};
        }
    }
    // /get options from attribute

    // get elem from selector
    getElementFromSelector = function( selector ) {
        var $elem = Utils.$functionElems.filter( selector );
        if ( $elem.length == 0 ) {
            $elem = Utils.$targetElems.filter( selector );
            if ( $elem.length == 0 ) {
                $elem = $( selector );
            }
        }
        return $elem;
    }
    // /get elem from selector

    // get form values
    $.fn.getFormValues = function() {

        var values = {};

        $formElems = $( this ).find( 'input, select, textarea' );

        $formElems.each( function( i, elem ) {

            var $elem = $( elem );

            if ( $elem.attr( 'type' ) == 'checkbox' ) {

                var checkboxName = $elem.attr( 'name' );
                var $checkboxGroup = $formElems.filter( '[name="' + checkboxName + '"]' );
                var checkboxGroupCount = $checkboxGroup.length;

                if ( checkboxGroupCount > 1 ) {
                    var checkboxGroupValues = [];
                    $checkboxGroup.each( function( j, groupElem ) {
                        var $groupElem = $( groupElem );
                        if ( $groupElem.is( ':checked' ) ) {
                            checkboxGroupValues.push( $groupElem.val() );
                        }
                    } );
                    if ( checkboxGroupValues.length > 0 ) {
                        values[ checkboxName ] = checkboxGroupValues;
                    }
                    else {
                        values[ checkboxName ] = null;
                    }
                }
                else {
                    values[ checkboxName ] = $elem.is( ':checked' ) ? $elem.val() : null;
                }
            }
            else if ( $elem.attr( 'type' ) == 'radio' ) {
                if ( $elem.is( ':checked' ) ) {
                    values[ $elem.attr( 'name' ) ] = $elem.val();
                }
            }
            else {
                values[ $elem.attr( 'name' ) ] = $elem.val();
            }
        } );
        return values;
    }
    /*
    $.fn.getFormValues = function() {

        var $form = this;
        var values = {};

        function inject( position, value ) {

            var match = position.match( /^([^\[]+)(.*)/ );

            if ( !! match[ 2 ] ) {
                var exp = /\[([^\]]+)]/g;
                var child;
                var children = [];
                children[ 0 ] = match[ 1 ];
                while ( ( child = exp.exec( match[ 2 ] ) ) !== null )
                {
                    children.push( child[ 1 ] );
                }

                for ( var i = children.length - 1; i >= 0; i-- ) {
                    var val = {};
                    val[ children[ i ] ] = value;
                    value = val;
                }

                values = $.extend( true, values, value );
            }
            else {
                values[ match[ 1 ] ] = value;
            }
        }

        $form.find( 'input, select, textarea' ).each( function( i, elem ) {

            var $elem = $( elem );

            if ( !! $elem.attr( 'name' ) ) {

                if ( $elem.attr( 'type' ) == "checkbox" ) {
                    // get checkbox group
                    var groupValues = [];
                    $form.find( '[name="' + $elem.attr( 'name' ) + '"]:checked' ).each( function( j, checkbox )
                    {
                        groupValues.push( $( checkbox ).val() );
                    } );
                    inject( $elem.attr( 'name' ), groupValues );
                }
                else if ( $elem.attr( 'type' ) == 'radio' ) {
                    if ( $elem.is( ':checked' ) ) {
                        inject( $elem.attr( 'name' ), $elem.val() );
                    }
                }
                else {
                    inject( $elem.attr( 'name' ), $elem.val() );
                }
            }

        } );
        return values;
    }
    */
    // /get form values

    // replace form by message
    $.fn.replaceFormByMessage = function( options ) {

        var $form = $( this );
        var $parent = $form.parent();
        var $message = ( !! options && !! options.$message ) ? options.$message : $form.next();

        // hide form, show message instead
        $parent.css( { height: ( parseInt( $parent.css( 'height' ) ) + 'px' ) } );
        $form.fadeOut( function() {
            $message.fadeIn();
            $parent.animate( { height: ( parseInt( $message.css( 'height' ) ) + 'px' ) }, function() {
                $parent.removeAttr( 'style' );
            } );
        } );
        $form.aria( 'hidden', true );
        $message.aria( 'hidden', false );
    }
    // /replace form by message

    // execute callback function
    $.fn.executeCallbackFunction = function() {

        var callbackStr = $( this ).attr( Utils.attributes.callback );

        if ( !! callbackStr ) {

            // get function name
            var explode = callbackStr.split( '(' );
            var callbackName = explode[ 0 ];

            var callback = Function( callbackStr );

            if ( !! callback && typeof window[ callbackName ] === 'function' ) {
                callback();
            }

        }
    }
    // /execute callback function

    return Utils;
} )( jQuery );
( function( Utils ) {
	
	// detect ios / android
	var isIos = /iPad|iPhone|iPod/.test( navigator.platform ) && ! window.MSStream;
	var iosVersion = null;
	var iosFullVersion = null;
	var isAndroid = /(android)/i.test( navigator.userAgent );
	var isWin = navigator.platform.indexOf( 'Win' ) > -1;
	var isMobileIe = navigator.userAgent.match( /iemobile/i );
	var isWinPhone = navigator.userAgent.match( /Windows Phone/i );
	if ( isIos ) {
		document.body.className += ' is-ios';

		// detect version (required for fixes)
		var iosMaxVersion = 11;
		iosVersion = parseInt(
			( '' + ( /CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec( navigator.userAgent ) || [ 0,'' ] )[ 1 ] )
			.replace( 'undefined', '3_2' ).replace( '_', '.' ).replace( /_/g, '' )
		) || false;
		iosFullVersion = ( '' + ( /CPU.*OS ([0-9_]{1,9})|(CPU like).*AppleWebKit.*Mobile/i.exec( navigator.userAgent ) || [ 0,'' ] )[ 1 ] )
			.replace( 'undefined', '3_2' ) || false;
		if ( iosVersion !== false ) {
			document.body.className += ' ios' + iosVersion;
			for ( i = iosVersion; i <= iosMaxVersion; i++ ) {
				document.body.className += ' ioslte' + i;
			}
		}

	}
	else if ( isAndroid ) {
		document.body.className += ' is-android';
	}
	else if ( isWin ) {
		document.body.className += ' is-win';
		if ( isMobileIe ) {
			document.body.className += ' is-mobile-ie';
		}
	}
	if ( isWinPhone ) {
		document.body.className += ' is-win-phone';
	}
	
	function detectIe() {
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf( 'MSIE ' );
			if ( msie > 0 ) {
			return parseInt( ua.substring( msie + 5, ua.indexOf( '.', msie ) ), 10 );
		}
		var trident = ua.indexOf( 'Trident/' );
		if ( trident > 0 ) {
			var rv = ua.indexOf( 'rv:' );
			return parseInt( ua.substring( rv + 3, ua.indexOf( '.', rv ) ), 10 );
		}
		var edge = ua.indexOf( 'Edge/' );
		if ( edge > 0 ) {
			return parseInt( ua.substring( edge + 5, ua.indexOf( '.', edge ) ), 10 );
		}
		return false;
	}

	// detect ie gt 9
	var ieMaxVersion = 14;
	var ieVersion = detectIe();
	var isIe = ( ieVersion !== false );
	if ( isIe && ieVersion > 9 ) {
		document.body.className += ' ie ie' + ieVersion;
		for ( i = ieVersion; i <= ieMaxVersion; i++ ) {
			document.body.className += ' ielte' + i;
		}
	}

	// fix ios missing body click event (set event to all div elements which are children of body)
	if ( isIos ) {
		var bodyChildren = document.body.children;
		for ( i = 0; i < bodyChildren.length; i++ ) {
			if ( bodyChildren[ i ].tagName == 'DIV' ) {
				bodyChildren[ i ].setAttribute( 'onclick', 'void(0);' );
			}
		}
	}


	var AnalyzeBrowser = {
		isIos: isIos,
		iosVersion: iosVersion,
		iosFullVersion: iosFullVersion,
		isAndroid: isAndroid,
		isWin: isWin,
		isIe: isIe,
		ieVersion: ieVersion,
		isMobileIe: isMobileIe,
		isWinPhone: isWinPhone
	};

	// add browser data to utils to use global
	Utils.AnalyzeBrowser = AnalyzeBrowser;

} )( BSX_UTILS );
/*
<!-- ALERT MODAL -->

<!-- alert modal (empty) -->
<div class="modal fade plenty-alert-modal" tabindex="-1" role="alert" data-tg="plenty-alert-modal">
	<div class="modal-dialog" role="document">
		<div class="modal-content" data-tg="plenty-alert-modal-content">
		</div>
	</div>
</div>

<div style="display: none;" aria-hidden="true">

	<!-- alert template to clone into alert modal -->

	<div class="alert alert-danger alert-dismissible my-1" data-tg="plenty-error-alert">
		<div class="font-weight-bold" data-g-tg="plenty-alert-title"></div>
		<div class="d-inline">Code <span data-g-tg="plenty-alert-code">0</span>: </div>
		<div class="d-inline" data-g-tg="plenty-alert-content"></div>
		<button type="button" class="close" data-dismiss="alert" aria-label="Close">
			<span aria-hidden="true">×</span>
		</button>
	</div>

	<!-- message template to clone into alert modal -->

	<div class="alert alert-success alert-dismissible my-1" data-tg="plenty-message-alert">
		<div class="font-weight-bold" data-g-tg="plenty-alert-title"></div>
		<div data-g-tg="plenty-alert-content"></div>
		<span class="modal-countdown" data-g-tg="plenty-alert-countdown" style="display: none;"></span>
		<button type="button" class="close" data-dismiss="alert" aria-label="Close">
			<span aria-hidden="true">×</span>
		</button>
	</div>

</div>
*/

( function( $, Utils ) {

	var Alert = {
		currentAlerts: 0,
		ids: [],
		isOpen: false,
		isClosing: false,
		cancelClosing: false,
		singleClosedEvent: 'singleAlertClosed'
	};

	Alert.adaptAlert = function( currentAlert, options ) {

		var defaults = {
			titleSelector: '[data-g-tg="plenty-alert-title"]',
			contentSelector: '[data-g-tg="plenty-alert-content"]',
			codeSelector: '[data-g-tg="plenty-alert-code"]',
			countdownSelector: '[data-g-tg="plenty-alert-countdown"]',
			title: 'Unknown message',
			content: 'Message information missing.'
		};

		var options = $.extend( {}, defaults, options );

		$currentAlert = $( currentAlert );
		$currentAlertTitle = $currentAlert.find( options.titleSelector );
		$currentAlertContent = $currentAlert.find( options.contentSelector );
		$currentAlertCountdown = $currentAlert.find( options.countdownSelector );
		$currentAlertCode = $currentAlert.find( options.codeSelector );

		// create alert id
        var alertId = ( Alert.ids.length > 0 ) ? Alert.ids[ Alert.ids.length - 1 ] + 1 : 0;
        Alert.ids.push( alertId );
        $currentAlert.attr( 'data-autoclose-id', alertId );


		// fill data
		if ( options.title != '' ) {
			$currentAlertTitle.html( options.title );
		}
		$currentAlertContent.html( options.content );

		// add error code if available
		if ( !! options.errorCode ) {
			$currentAlertCode.html( options.errorCode );
		}
		
		// bind autoclose if available
		if ( options.autoclose === true ) {
			$currentAlert.autoclose( {
				id: alertId,
				$countdownElem: $currentAlertCountdown,
				$pauseEventElem: $currentAlert,
	            stopEvent: 'close.bs.alert',
	            closeFunctionName: 'alert',
	            closeFunctionParams: 'close'
			} );
		}

	}

	Alert.showAlert = function( state, options ) {

		// count new alert
		Alert.currentAlerts++;

		// cancel closing if alert appears while closing
		if ( Alert.isOpen && Alert.isClosing ) {
			Alert.cancelClosing = true;
		}

		// clone alert from template
		var $errorAlertClone;

		switch ( state ) {
			case 'error':
				$currentAlertClone = Alert.$errorAlert.clone();
				break;
			case 'message':
				$currentAlertClone = Alert.$messageAlert.clone();
				break;
		} 

		// adapt alert contents
		Alert.adaptAlert( $currentAlertClone, options );

		// enable close (bootstrap)
		$currentAlert.alert();

		// bind event on close single alert (bootstrap)
		$currentAlert.on( 'close.bs.alert', function() {

			Alert.$modal.trigger( Alert.singleClosedEvent );

			// subtract dismissed alert
			Alert.currentAlerts--;

			// try close modal
			Alert.tryCloseModal();
		} );

		// append alert
		$currentAlertClone.appendTo( Alert.$modalContent );

		// show modal
		Alert.openModal( options );
	}

	// separate functions for error and message
	Alert.showError = function( options ) {

		Alert.showAlert( 'error', options );

	}
	Alert.showMessage = function( options ) {

		Alert.showAlert( 'message', options );

	}

	// alert modal functions

	Alert.openModal = function() {

		Alert.cancelClosing = false;
		
		if ( ! Alert.$modal.is( ':visible' ) ) {

			// open modal (bootstrap)
			Alert.$modal.modal( 'show' );

			// remember open
			Alert.isOpen == true;

			// bind close (bootstrap)
			Alert.$modal.one( 'hide.bs.modal', function() {

				// remember closing
				Alert.isClosing = true;

				// close
				Alert.setModalClosed();
			} );
		}

	}

	Alert.tryCloseModal = function() {

		// close modal if currently < 1 alert shown
		if ( Alert.currentAlerts < 1 ) {

			// close (bootstrap)
			Alert.$modal.modal( 'hide' );

		}

	}

	Alert.setModalClosed = function() {
		
		Alert.$modal.one( 'hidden.bs.modal', function() {

			// check cancel closing
			if ( Alert.cancelClosing === true ) {
				// do nothing, reopen
			}
			else {

				// empty if closing done
				Alert.$modalContent.empty();

				// remember closing complete
				Alert.currentAlerts = 0;
				Alert.isOpen = false;
				Alert.isClosing = false;
			}

		} );

	}

	Alert.init = function() {

		/*
 		var defaults = {
			defaultClass: 'alert alert-dismissible m-0',
			titleClass: 'font-weight-bold',
			states: {
				success: {
					stateClass: 'alert-success',
					autoclose: true,
					autocloseDelay: 5000,
					title: 'Note',
					content: 'Action succesfull done.'
				},
				error: {
					stateClass: 'alert-danger',
					autoclose: false,
					autocloseDelay: null,
					title: 'Error',
					content: 'An unknown error occured.'
				}
			},
			closeCallback: null
		};

		Alert.options = $.extend( {}, defaults, options );
		*/

		Alert.$modal = Utils.$targetElems.filter( '[data-tg="plenty-alert-modal"]' );
        Alert.$modalContent = Utils.$targetElems.filter( '[data-tg="plenty-alert-modal-content"]' );

        Alert.$errorAlert = Utils.$targetElems.filter( '[data-tg="plenty-error-alert"]' );
        Alert.$messageAlert = Utils.$targetElems.filter( '[data-tg="plenty-message-alert"]' );

	}

	// init alert modal
	Alert.init();

	/*
	$.fn.plentyAlert = function( options ) {

        var defaults = {
        	defaultClass: 'alert alert-dismissible m-0',
        	stateClass: 'alert-success',
        	autoclose: true,
        	autocloseDelay: 5000,
        	iconClass: null,
			titleClass: 'font-weight-bold',
			title: 'Bitte beachten',
			content: 'Die Aktion wurde erforgreich ausgeführt.',
			closeCallback: null
        };

        options = $.extend( {}, defaults, options );

        var $modal = $( this );
        var $modalAlert = Utils.$targetElems.filter( '[data-tg="plenty-alert"]' );
        var $modalAlertTitle = Utils.$targetElems.filter( '[data-tg="plenty-alert-title"]' );
        var $modalAlertContent = Utils.$targetElems.filter( '[data-tg="plenty-alert-content"]' );

		var title = ( typeof options.title === 'object' ) ? options.title[ Utils.lang ] : options.title;
		var content = ( typeof options.content === 'object' ) ? options.content[ Utils.lang ] : options.content;

		// TEST – TODO: remove
		//content += '&nbsp;<span data-fn="coundown">countdown</span>';

		$modalAlert.attr( 'class', options.defaultClass + ' ' + options.stateClass );
		$modalAlertTitle
			.attr( 'class', options.titleClass )
			.html( title )
		;
		$modalAlertContent.html( content );

		// open
		$modal.modal( 'show' );

		if ( options.closeCallback && typeof options.closeCallback === 'function' ) {
			$modal.one( 'hide.bs.modal', function() {
				options.closeCallback();
			} );
		}
 
		// auto close
		if ( options.autoclose && Number( parseFloat( options.autocloseDelay ) ) === options.autocloseDelay ) {
			$modal.autoclose( {
				autoclose: true,
				$countdownElem: Utils.$targetElems.filter( '[data-tg="plenty-alert-countdown"]' ),
				$pauseEventElem: Utils.$targetElems.filter( '[data-tg="plenty-alert"]' )
			} );
		}
	}
	*/

	// init
	// TEST – TODO: remove
	/*
	Utils.$functionElems.filter( '[data-fn="plenty-alert-modal-trigger"]' ).on( 'click', function() {

		var $alertModal = Utils.$targetElems.filter( '[data-tg="plenty-message-modal"]' );

		$alertModal.plentyAlert( {
        	stateClass: 'alert-success',
        	autoclose: true,
        	autocloseDelay: 5000,
			title: {
				de: 'Hinweis',
				en: 'Note'
			},
			content: {
				de: 'Du hast dich erfolgreich ausgeloggt.',
				en: 'You logged out.'
			}
		} );
	} );
	*/
	/*
	// TEST – TODO: remove
	Utils.$functionElems.filter( '[data-fn="plenty-add-message-alert"]' ).on( 'click', function() {
		var options = {
			title: 'Message',
			content: 'Faucibus tincidunt.',
			autoclose: true
		};
		Alert.showMessage( options );
	} );
	// TEST – TODO: remove
	Utils.$functionElems.filter( '[data-fn="plenty-add-error-alert"]' ).on( 'click', function() {
		var options = {
			errorCode: 123,
			title: 'Fehler',
			content: 'Lorem ipsum dolor set.'
		};
		Alert.showError( options );
	} );
	// TEST – TODO: remove (cursor up: create message, cursor down: create error)
	if ( location.href.indexOf( 'debug=1' ) >= 0 ) {
		$( document ).keydown( function( event ) {
			switch ( event.keyCode ) {
				case 38:
					var options = {
						title: 'Message',
						content: 'Faucibus tincidunt.',
						autoclose: true
					};
					Alert.showMessage( options );
					break;
				case 40:
					var options = {
						errorCode: 123,
						title: 'Fehler',
						content: 'Lorem ipsum dolor set.'
					};
					Alert.showError( options );
					break;
			}
		} );
	}
	*/
	// add alert to utils to use global
	Utils.Alert = Alert;

} )( jQuery, BSX_UTILS );

/*

<div data-fn-options="{ appearOffset: 100 }">Listen to element to appear (call ui handler via js function)</div>

*/

/*

TODO: 
    - clean up
    - make global function from _elemInWindow() listening appear left / right too

*/

( function( $, Utils ) {

    var UiHandler = {
        id: -1
    };

    UiHandler.listenAppear = function( elem, options ) {

        var $elem = $( elem );

        var defaults = {
            appearEventTriggered: false,
            appearEvent: 'appear.uiHandler',
            appearOffset: 0
        };

        // get options from function
        var options = $.extend( {}, defaults, options );

        // get options from attr
        options = $.extend( {}, options, $elem.getOptionsFromAttr() );

        // data
        $elem.data( {
            appearEventTriggered: false,
            id: UiHandler.id + 1
        } );

        /*

        // functions
        $.fn._belowTheFold = function( offset ) {
            var fold = Utils.$window.height() + Utils.$window.scrollTop();
            console.log( '_belowTheFold: ' + ( fold <= $( this ).offset().top - offset ) );
            console.log( '$( this ).offset().top - offset: ' + ( $( this ).offset().top - offset ) );
            console.log( 'fold: ' + ( fold ) );
            return fold <= $( this ).offset().top - offset;
        };
        $.fn._rightOfFold = function( offset ) {
            var fold = Utils.$window.width() + Utils.$window.scrollLeft();
            console.log( '_rightOfFold: ' + ( fold <= $( this ).offset().left - offset ) );
            return fold <= $( this ).offset().left - offset;
        };
        $.fn._aboveTheTop = function( offset ) {
            var fold = Utils.$window.scrollTop();
            console.log( '_aboveTheTop: ' + ( fold >= $( this ).offset().top + offset  + $( this ).height() ) );
            return fold >= $( this ).offset().top + offset  + $( this ).height();
        };
        $.fn._leftOfBegin = function( offset ) {
            var fold = Utils.$window.scrollLeft();
            console.log( '_leftOfBegin: ' + ( fold >= $( this ).offset().left + offset + $( this ).width() ) );
            return fold >= $( this ).offset().left + offset + $( this ).width();
        };
        $.fn._withinViewport = function( offset ) {
            console.log( '_withinViewport: ' + ( ! $( this )._rightOfFold( offset ) && ! $( this )._leftOfBegin( offset ) && ! $( this )._belowTheFold( offset ) && ! $( this )._aboveTheTop( offset ) ) );
            return
                ! $( this )._rightOfFold( offset ) 
                && ! $( this )._leftOfBegin( offset )
                && ! $( this )._belowTheFold( offset )
                && ! $( this )._aboveTheTop( offset )
            ;
        }

        $.fn._triggerEventIfInViewport = function( offset ) {
            var $elem = $( this );
            console.log( '$elem.offset().top: ' + $elem.offset().top );
            if ( ! options.appearEventTriggered && $elem._withinViewport( offset ) ) {
                $elem.trigger( options.appearEvent );
                options.appearEventTriggered = true;
            }
            else {
                // remove event listeners after event triggered
                //Utils.$window.off( 'scroll.uiHandler.appear' 'resize.uiHandler.appear');
            }

        }

        // initial check
        $elem._triggerEventIfInViewport( options.appearOffset );

        // listen events
        Utils.$window.on( 'scroll.uiHandler.appear resize.uiHandler.appear', function() {
            $elem._triggerEventIfInViewport( options.appearOffset );
        } );
        $.fn._elemPositionedInsideWindow = function() {

            var $this = $( this );
            var $container = Utils.$window;

            var elemOffsetLeft = $this.offset().left;
            var elemOffsetTop = $this.offset().top;
            var elemWidth = $this.width();
            var elemHeight = $this.height();

            var containerOffsetLeft = $container.scrollLeft();
            var containerOffsetTop = $container.scrollTop();
            var containerWidth = $container.width();
            var containerHeight = $container.height();

            console.log( 'elemOffsetLeft: ' + elemOffsetLeft + ' – elemOffsetTop: ' + elemOffsetTop + ' - elemWidth: ' + elemWidth + ' – elemHeight: ' + elemHeight );
            console.log( 'containerOffsetLeft: ' + containerOffsetLeft + ' – containerOffsetTop: ' + containerOffsetTop + ' - containerWidth: ' + containerWidth + ' – containerHeight: ' + containerHeight );

            console.log( 'elemOffsetLeft >= containerOffsetLeft: ' + elemOffsetLeft >= containerOffsetLeft );
            console.log( '( elemOffsetLeft + elemWidth ) <= ( containerOffsetLeft + containerWidth ): ' + ( elemOffsetLeft + elemWidth ) <= ( containerOffsetLeft + containerWidth ) );
            console.log( 'elemOffsetTop >= containerOffsetTop: ' + elemOffsetTop >= containerOffsetTop );
            console.log( '( elemOffsetTop + elemHeight ) <= ( containerOffsetTop + containerHeight ): ' + ( elemOffsetTop + elemHeight ) <= ( containerOffsetTop + containerHeight ) );

            return elemOffsetLeft >= containerOffsetLeft
                && ( elemOffsetLeft + elemWidth ) <= ( containerOffsetLeft + containerWidth )
                && elemOffsetTop >= containerOffsetTop
                && ( elemOffsetTop + elemHeight ) <= ( containerOffsetTop + containerHeight );
        };

        */



        function _elemInWindow( elem, tol ) {

            var $this = $( elem );
            var tolerance = tol || 0;

            var elemOffsetTop = $this.offset().top;
            var elemHeight = $this.height();

            var windowScrollTop = Utils.$window.scrollTop();
            var windowHeight = Utils.$window.height();

            //console.log( 'elemOffsetTop: ' + elemOffsetTop + ' – elemHeight: ' + elemHeight + ' - windowScrollTop: ' + windowScrollTop + ' – windowHeight: ' + windowHeight );
            //console.log( 'containerOffsetLeft: ' + containerOffsetLeft + ' – containerOffsetTop: ' + containerOffsetTop + ' - containerWidth: ' + containerWidth + ' – containerHeight: ' + containerHeight );

            //console.log( '! ' + elemOffsetTop + ' (elemOffsetTop) > ' + ( windowScrollTop + windowHeight ) + '(windowScrollTop + windowHeight)' );
            //console.log( ! ( elemOffsetTop > windowScrollTop + windowHeight ) );

            //console.log( '! ' + windowScrollTop + ' (windowScrollTop) > ' + ( elemOffsetTop + elemHeight ) + '(elemOffsetTop + elemHeight)' );
            //console.log( ! ( windowScrollTop > elemOffsetTop + elemHeight ) );

            //console.log( 'RESULT: ' + ( ( ! ( elemOffsetTop > windowScrollTop + windowHeight ) ) && ( ! ( windowScrollTop > elemOffsetTop + elemHeight ) ) ) );

            return ( ! ( elemOffsetTop > windowScrollTop + windowHeight + tolerance ) ) 
                && ( ! ( windowScrollTop > elemOffsetTop + elemHeight + tolerance ) );
        };

        Utils.$window.on( 'scroll.' + options.appearEvent + '.' + $elem[ 'id' ] + ' resize.' + options.appearEvent + '.' + $elem[ 'id' ], function() {

            //console.log( '$elem.data( \'appearEventTriggered\' ): ' + $elem.data( 'appearEventTriggered' ) );
            //console.log( '_elemInWindow( $elem, options.appearOffset ): ' + _elemInWindow( $elem, options.appearOffset ) );

            if ( 
                ! $elem.data( 'appearEventTriggered' )
                && _elemInWindow( $elem, options.appearOffset )
                //&& ! ( Utils.$window.scrollTop() + Utils.$window.height() < $elem.offset().top + options.appearOffset ) // below the fold
                //&& ! ( Utils.$window.scrollTop() > $elem.offset().top + $elem.height() + options.appearOffset ) // above the top
                //&& ! Utils.$window.scrollLeft() > $elem.offset().left + $elem.width() + options.appearOffset // right of fold
                //&& ! Utils.$window.scrollLeft() + Utils.$window.width() < $elem.offset().left + options.appearOffset // left of begin
            ) {
                $elem[ 'appearEventTriggered' ] = true;
                $elem.trigger( options.appearEvent );
                //console.log( 'TRIGGERED: ' + options.appearEvent );
            }
            else {
                if ( $elem.data.appearEventTriggered ) {
                    // remove event listeners after event triggered
                    Utils.$window.off( 'scroll.' + options.appearEvent + '.' + $elem[ 'id' ] + ' resize.' + options.appearEvent + '.' + $elem[ 'id' ] );
                    //console.log( 'OFF: ' + options.appearEvent );
                }
            }
        } );

        //console.log( 'STARTET LISTEN: ' + options.appearEvent );

    };

    // add ui handler to utils to use global
    Utils.UiHandler = UiHandler;

} )( jQuery, BSX_UTILS );
( function( $, Utils ) {

    var Autoclose = {
        timeouts: [],
        intervals: [],
        init: function( elem, options ) {
            return initAutoclose( elem, options );
        }
    };

    function initAutoclose( elem, options ) {

        var defaults = {
            $countdownElem: null,
            $pauseEventElem: null,
            autoclose: false,
            autocloseDelay: 5000,
            pauseEvent: 'mouseenter',
            continueEvent: 'mouseleave',
            stopEvent: 'hide.bs.modal',
            closeFunctionName: 'modal',
            closeFunctionParams: 'hide'
        };

        var options = $.extend( {}, defaults, options );

        // prepare data object to give into functions
        var data = {
            $elem: $( elem ),
            options: options,
            id: options.id,
            hasCountdown: 
                typeof options.$countdownElem !== 'undefined' 
                && options.$countdownElem != null 
                && options.$countdownElem.length > 0
            ,
            remainingTime: options.autocloseDelay,
            startTime: null,
            paused: false
        };

        // functions

        _startCounting = function( data ) {

            if ( ! data.options.$countdownElem.is( ':visible' ) ) {
                data.options.$countdownElem.show();
            }
            data.options.$countdownElem.text( Math.round( data.remainingTime / 1000 ) );
            
            Autoclose.intervals[ data.id ] = window.setInterval( function() { return ( function( data ) {

                var $elem = $( data.$elem );

                remaingSeconds = data.remainingTime - ( new Date() ).getTime() + data.startTime;
                options.$countdownElem.text( Math.round( remaingSeconds / 1000 ) );

            } )( data ) }, 1000 );
            
            // remove existing event listeners (pause / continue)
            _destroyPausingListeners( data );

            // bind new event listeners (pause / continue)
            if ( !! data.options.$pauseEventElem ) {
                data.options.$pauseEventElem.on( data.options.pauseEvent + '.alert.countdown', function() {
                    _pauseTimeout( data );
                } );
                data.options.$pauseEventElem.on( data.options.continueEvent + '.alert.countdown', function() {
                    _continueTimeout( data );
                } );
            }
        }

        _startTimeout = function( data ) {

            data.startTime = ( new Date() ).getTime();

            Autoclose.timeouts[ data.id ] = window.setTimeout( function() { return ( function( data ) {

                var $elem = $( data.$elem );

                if ( data.hasCountdown ) {
                    window.clearInterval( Autoclose.intervals[ data.id ] );
                }
                $elem[ data.options.closeFunctionName ]( data.options.closeFunctionParams );

            } )( data ) }, data.options.autocloseDelay );

            // coundown
            if ( data.hasCountdown ) {

                // start counting
                _startCounting( data );

            }
        }

        _pauseTimeout = function( data ) {

            data.paused = true;
            data.remainingTime -= ( new Date() ).getTime() - data.startTime;
            window.clearTimeout( Autoclose.timeouts[ data.id ] );

            if ( data.hasCountdown ) {
                window.clearInterval( Autoclose.intervals[ data.id ] );
            }
        }

        _continueTimeout = function( data ) {

            data.paused = false;
            data.startTime = ( new Date() ).getTime();
            Autoclose.timeouts[ data.id ] = window.setTimeout( function() { return ( function( data ) {

                var $elem = $( data.$elem );

                _destroyPausingListeners( data );
                $elem[ data.options.closeFunctionName ]( data.options.closeFunctionParams );
                window.clearInterval( Autoclose.intervals[ data.id ] );

            } )( data ) }, data.remainingTime );

            // coundown
            if ( data.hasCountdown ) {
                // restart counting
                _startCounting( data );
            }
        }

        _stopTimeout = function( data ) {

            _destroyPausingListeners( data );
            window.clearTimeout( Autoclose.timeouts[ data.id ] );

            if ( data.hasCountdown ) {
                window.clearInterval( Autoclose.intervals[ data.id ] );
            }
        }

        _destroyPausingListeners = function( data ) {

            data.options.$pauseEventElem.off( data.options.pauseEvent + '.alert.countdown' + ' ' + data.options.continueEvent + '.alert.countdown' );
        }

        // start autoclose
        _startTimeout( data );

        // clear autoclose if closing manually
        data.$elem.one( data.options.stopEvent, function() {

            _stopTimeout( data );

        } );

    }

    $.fn.autoclose = function( options ) {
        options = options || {};
        this.each( function() {
            return new Autoclose.init( this, options );
        } );
    }

} )( jQuery, BSX_UTILS );

( function( $, Utils ) {

	var CookieHandler = {};

	CookieHandler.setCookie = function( cookieName, cookieValue, expiresDays, path ) {
	    var date = new Date();
	    date.setTime( date.getTime() + ( expiresDays * 24 * 60 * 60 * 1000 ) );
	    document.cookie = cookieName + '=' + cookieValue + '; ' + 'expires=' + date.toUTCString() + ( !! path ? '; path=' + path : '' );
	};

	CookieHandler.getCookie = function( cookieName ) {
	    var searchStr = cookieName + '=';
	    var cookies = document.cookie.split( ';' );
	    for ( var i = 0; i < cookies.length; i++ ) {
	        var cookie = cookies[ i ];
	        while ( cookie.charAt( 0 ) == ' ' ) {
	        	cookie = cookie.substring( 1 );
	        };
	        if ( cookie.indexOf( searchStr ) == 0 ) {
	        	return cookie.substring( searchStr.length, cookie.length );
	        };
	    }
	    return '';
	};

	// add cookie handler to utils to use global
	Utils.CookieHandler = CookieHandler;

} )( jQuery, BSX_UTILS );

( function( $, Utils ) {

	var MessageHandler = {};

	MessageHandler.handleError = function( jqXHR ) {

		var fallbackErrorMessage = 'unknown error';
		var fallbackErrorCode = 0;

		var responseText = ( jqXHR.responseText != '' ) ? $.parseJSON( jqXHR.responseText ) : false;
		if ( 
			!! responseText
			&& responseText.error.error_stack !== undefined
			&& responseText.error.error_stack.length > 0 
		) {
			throwErrorStack( responseText.error.error_stack );
		}
		else if ( 
			!! responseText 
			&& ( responseText.error.message !== undefined || responseText.error.code !== undefined )
		) {
			var errorCode;
			var errorMessage;

			if ( responseText.error.code !== undefined ) {
				errorCode = responseText.error.code;
			}
			else {
				errorCode = fallbackErrorCode;
			}

			if ( responseText.error.message !== undefined ) {
				errorMessage = responseText.error.message;
			}
			else {
				errorMessage = fallbackErrorMessage;
			}

			MessageHandler.throwError( errorCode, errorMessage );
		}
		else {
			MessageHandler.throwError( fallbackErrorCode, fallbackErrorMessage );
		}
	};

	MessageHandler.throwError = function( code, message ) {
		throwErrorStack( [ { code: code, message: message } ] );
	};

	function throwErrorStack( errorStack ) {

		$.each( errorStack, function( i, error ) {

			// add errors
			var options = {
				errorCode: error.code,
				title: '',
				content: error.message
			};
			Utils.Alert.showError( options );

		});

		Utils.WaitScreen.hide();
	}

	MessageHandler.printMessage = function( message ) {

		var options = {
			title: '',
			content: message,
			autoclose: true
		};
		Utils.Alert.showMessage( options );

	};

	// add message handler to utils to use global
	Utils.MessageHandler = MessageHandler;

} )( jQuery, BSX_UTILS );

/*

<div data-fn="remote-event" data-fn-target="#id-1" data-fn-options="{ triggerEvent: 'click',  remoteEvent: 'click' }"></div>

*/

( function( $, Utils ) {

    $.fn.remoteEvent = function() {

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var targetSelector = $elem.attr( Utils.attributes.target ) || '';
            var $target = ( Utils.$targetElems.filter( targetSelector ).lenght > 0 ) ? Utils.$targetElems.filter( targetSelector ) : $( targetSelector );
            var attrOptions = $elem.getOptionsFromAttr();
            var triggerEvent = attrOptions.triggerEvent || 'click';
            var remoteEvent = attrOptions.remoteEvent || 'click';

            $elem.on( triggerEvent, function() {
                if ( $target.length > 0 ) {
                    $target.trigger( remoteEvent );
                }
            } );

        } );

    };

} )( jQuery, BSX_UTILS );
// simple slide toggle (e.g. accordion)

/*
<div data-fn="slidetoggle">
    <div role="heading">
        <!-- aria-labelledby="..." may refer to a discribing headline outside the trigger -->
        <button id="accordion-1-trigger-1" data-g-tg="slidetoggle-trigger" aria-controls="accordion-1-target-1" aria-expanded="false">Click me to slidetoggle content</button>
    </div>
    <div id="accordion-1-target-1" data-g-tg="slidetoggle-target" aria-labelledby="accordion-1-trigger-1" style="display: none;">
        Here is some content...
    </div>
</div>
*/

( function( $, Utils ) {

    $.fn.simpleSlideToggle = function( options ) {

        var defaults = {
            effectIn: 'slideDown',
            effectOut: 'slideUp',
            effectDuration: 400,
            openedClass: Utils.classes.open,
            triggerOpenedClass: Utils.classes.active,
            bodyOpenedClass: '',
            animatingClass: Utils.classes.animating,
            animatingInClass: Utils.classes.animatingIn,
            animatingOutClass: Utils.classes.animatingOut,
            preventDefault: true
        };

        options = $.extend( {}, defaults, options );

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var $elemTrigger = $elem.find( options.triggerSelector ).first();
            var $elemBody = $elem.find( options.bodySelector ).first();

            // initial set closed
            if ( ! $elem.is( '.' + options.openedClass ) ) {
                $elemBody.css( { display: 'none' } );
            }

            // bind click event
            $elemTrigger.on( 'click', function( event) {

                if ( options.preventDefault ) {
                    event.preventDefault();
                }

                if ( ! $elem.is( '.' + options.openedClass ) ) {
                    // open
                    $elem
                        .addClass( options.animatingClass )
                        .addClass( options.animatingInClass );
                    $elemTrigger
                        .addClass( options.triggerOpenedClass )
                        .ariaExpanded( 'true' );
                    $elemBody.stop()[ options.effectIn ]( options.effectDuration, function() {
                        $elem
                            .addClass( options.openedClass )
                            .removeClass( options.animatingClass )
                            .removeClass( options.animatingInClass );
                        $elemBody.addClass( options.bodyOpenedClass );
                    } );
                }
                else {
                    // close
                    $elem
                        .addClass( options.animatingClass )
                        .addClass( options.animatingOutClass )
                        .removeClass( options.openedClass );
                    $elemTrigger
                        .removeClass( options.triggerOpenedClass )
                        .ariaExpanded( 'false' );
                    $elemBody.removeClass( options.bodyOpenedClass );
                    $elemBody.stop()[ options.effectOut ]( options.effectDuration, function() {
                        $elem
                            .removeClass( options.animatingClass )
                            .removeClass( options.animatingOutClass );
                    } );
                }

            } );

        } );

    };

} )( jQuery, BSX_UTILS );
/*

<button class="plenty-navbar-toggler" type="button" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation" data-fn="toggle" data-fn-target="[data-tg='navbar-collapse']">
    <i class="fa fa-navicon" aria-hidden="true"></i>
</button>

<div class="plenty-navbar-collapse" id="navbarNavDropdown" data-tg="navbar-collapse">
    ...
</div>

*/

( function( $, Utils ) {

    // toggle (e.g. main navigation container)
    $.fn.toggle = function( options ) {

        var defaults = {
            openedClass: Utils.classes.open,
            closedClass: '',
            animatingClass: Utils.classes.animating,
            triggerOpenedClass: Utils.classes.active,
            triggerClosedClass: '',
            openCallback: function() {},
            closeCallback: function() {},
            openedCallback: function() {},
            closedCallback: function() {}
        };

        options = $.extend( {}, defaults, options );

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var targetSelector = $elem.attr( Utils.attributes.target ) || '';
            var $target = ( Utils.$targetElems.filter( targetSelector ).lenght > 0 ) ? Utils.$targetElems.filter( targetSelector ) : $( targetSelector );
            var transitionDuration = $target.getTransitionDuration();

            // get options from attr
            options = $.extend( {}, options, $elem.getOptionsFromAttr() );

            if ( $target.length > 0 ) {

                function _show() {
                    $target
                        .addClass( options.openedClass )
                        .removeClass( options.closedClass )
                    ;
                    $elem
                        .removeClass( options.triggerClosedClass )
                        .addClass( options.triggerOpenedClass )
                        .ariaExpanded( 'true' )
                    ;
                    options.openCallback();

                    // set & remove 'options.animatingClass'
                    $target.setRemoveAnimationClass( options.animatingClass, options.openedCallback );
                }

                function _hide() {
                    $target
                        .removeClass( options.openedClass )
                        .addClass( options.closedClass )
                    ;
                    $elem
                        .addClass( options.triggerClosedClass )
                        .removeClass( options.triggerOpenedClass )
                        .ariaExpanded( 'false' )
                    ;
                    options.closeCallback();
                    
                    // set & remove 'options.animatingClass'
                    $target.setRemoveAnimationClass( options.animatingClass, options.closedCallback );
                }

                // click
                $elem.on( 'click', function() {

                    // toggle 'options.openedClass' & aria-expanded (use 'options.openedClass' to check visibility since element might be ':visible' but out of viewport)
                    // allow multiple classes (which would be separated by space)
                    if ( ! $target.is( '.' + options.openedClass.replace( ' ', '.') ) ) {
                        _show()
                    }
                    else {
                        _hide()
                    }

                } );

                // show
                $elem.on( 'show', function() {
                    _show()
                } );

                // hide
                $elem.on( 'hide', function() {
                    _hide()
                } );

            }

        } );

    };

} )( jQuery, BSX_UTILS );
/*
<!-- WAIT SCREEN -->
<div class="wait-screen" data-tg="wait-screen">
	<i class="fa fa-circle-o-notch fa-spin wait-screen-icon" aria-hidden="true"></i>
</div>
*/

( function( $, Utils ) {

	var WaitScreen = {
		isOpen: false,
		count: 0
	};

	WaitScreen.show = function() {

		WaitScreen.count++;
		WaitScreen.$waitScreen.addClass( WaitScreen.options.openClass );
		WaitScreen.isOpen = true;

	}

	WaitScreen.hide = function( forceClosing ) {

		WaitScreen.count--;
		if ( WaitScreen.count < 1 || forceClosing ) {
			WaitScreen.count = 0;
			WaitScreen.$waitScreen.removeClass( WaitScreen.options.openClass );
			WaitScreen.isOpen = false;
		}

	}

	WaitScreen.init = function( options ) {

		var defaults = {
			openClass: Utils.classes.open
		}

		WaitScreen.options = $.extend( {}, defaults, options );

		WaitScreen.$waitScreen = Utils.$targetElems.filter( '[data-tg="wait-screen"]' );

	}

	// init wait screen
	WaitScreen.init();

	// add wait screen to utils to use globally
	Utils.WaitScreen = WaitScreen;

} )( jQuery, BSX_UTILS );

/*
IE lte 11 handle overflow of -banner-inner within .banner-vh-{ ... }

<body class="ie ielte11">
	...
	<div class="banner-vh-1 d-flex align-items-center">
		<div class="banner-inner">
			...
	    </div>
	</div>
	...
</body>
*/

( function( $, Utils ) {

	//console.log( 'loaded ielte11-banner-height (not inited yet)' );

	// ie lte 11 fix: handle banner overflow (resize .banner-vh-{ ... } to minimum .banner-inner height)
	if ( Utils.$body.is( '.ielte11' ) ) {

		//console.log( 'init ielte11-banner-height' );

		var $banners = $( '[class*="banner-vh-"]' );

		$banners.each( function() {

			var $banner = $( this );
			var $bannerInner = $banner.children( '.banner-inner' );
			var $bannerInnerChildren = $bannerInner.children();

			Utils.$window.on( 'resize', function() {

				//console.log( 'resize' );

				// reset height (keep other element style)
				$banner.css( { height: '' } );

				var bannerHeight = parseInt( $banner.css( 'height' ) );
				var bannerPaddingY = parseInt( $banner.css( 'padding-top' ) ) + parseInt( $banner.css( 'padding-bottom' ) );

				// TODO: calculate height of .banner-inner children since .banner-inner will never overflow .banner

				var bannerInnerChildrenHeight = 0;
				var recentMarginBottom = 0;
				$bannerInnerChildren.each( function() {
					// TODO: margin top, height, margin-bottom
					$child = $( this );

					currentMarginTop = parseInt( $child.css( 'margin-top' ) );

					bannerInnerChildrenHeight += ( recentMarginBottom > currentMarginTop ) ? recentMarginBottom : currentMarginTop;
					bannerInnerChildrenHeight += parseInt( $child.css( 'height' ) );

					// remember
					recentMarginBottom = parseInt( $child.css( 'margin-bottom' ) );

					//console.log( '    item (mt: ' + currentMarginTop + ' h:' + parseInt( $child.css( 'height' ) ) + ' mb:' + recentMarginBottom + ')' );
				} );

				var bannerInnerPaddingY = parseInt( $bannerInner.css( 'padding-top' ) ) + parseInt( $bannerInner.css( 'padding-bottom' ) );

				var bannerInnerHeight = parseInt( $bannerInner.css( 'height' ) );

				// get banner padding y

				if ( bannerInnerChildrenHeight > bannerHeight - bannerPaddingY - bannerInnerPaddingY ) {

					//console.log( 'set inner height (bich:' + bannerInnerChildrenHeight + ' bh:' + bannerHeight + ' bih:' + bannerInnerHeight + ' bipy' + bannerInnerPaddingY + ')' );

					$banner.css( { height: ( bannerInnerChildrenHeight + bannerInnerPaddingY + bannerPaddingY ) + 'px' } );
				}
				else {

					//console.log( 'do nothing (bich:' + bannerInnerChildrenHeight + ' bh:' + bannerHeight + ' bih:' + bannerInnerHeight + ' bipy' + bannerInnerPaddingY + ')' );

				}

			} );

		} );

		Utils.$window.on( 'load', function() {
			Utils.$window.trigger( 'resize' );
		} );

	}

} )( jQuery, BSX_UTILS );

/*
<!-- REAL IMAGE BANNER -->
		
<div class="multilayer-banner">
	<figure class="multilayer-absolute-layer">
		<script>document.write('<img class="object-fit-cover" src="" data-fn="lazyload" data-src="/some-example-img.jpg" alt="Some example image">');</script>
		<noscript><img class="object-fit-cover" src="/some-example-img.jpg" alt="Some example image"></noscript>
	</figure>
	<div class="multilayer-static-layer align-items-center">
		<div class="container py-5">
			<h1 class="display-1 text-white">Example Banner Text</h1>
		</div>
	</div>
</div>

*/

( function( $, Utils ) {

	var polyfillSelector = 'img.object-fit-cover';
	var polyfillAddClass = 'polyfill-object-fit-cover';

	if ( ! Modernizr.objectfit ) {

		$.fn.polyfillObjectFitCover = function() {

			var $images = $( this );

			$images.each( function ( i ) {

				var $img = $( this );
				var imgUrl;

				_setImage = function( img, imgUrl ) {

					if ( imgUrl ) {

						var $img = $( img );
						var $container = $img.parent();
						$container
							.css( { 
								backgroundImage: 'url(' + imgUrl + ')',
								backgroundPosition: 'center',
								backgroundSize: 'cover'
							} )
							.addClass( polyfillAddClass )
						;
						$img.css( 'opacity', 0 );
					}

				}

				if ( $img.is( '[data-fn="lazyload"]' ) ) {
					// is lazyload, wait for trigger loaded

					imgUrl = $img.data( 'src' );

					$img.on( 'loaded', ( function( img, imgUrl ) {
						_setImage( $img, imgUrl );
					} )( $img, imgUrl ) );
				}
				else {
					// standard img

					imgUrl = $img.prop( 'src' );

					_setImage( $img, imgUrl );
				}

			} );

		}

		// init
	
		var $images = $( polyfillSelector );
		$images.polyfillObjectFitCover();

	}

} )( jQuery, BSX_UTILS );

( function( $, Utils ) {

    // animated anchors (e.g. knowledge hash navigation)
    $.fn.animatedAnchors = function( options ) {

        var $elems = $( this );

        var defaults = {
            scrollToInitialHash: true,
            scrollDurationMin: 300,
            scrollDurationMax: 800,
            scrollDurationPer1000: 400,
            offset: function() {
                return Utils.anchorOffsetTop;
            },
            scrollTolerance: 1, // scroll little bit more than to anchor position to make sure to trigger scrollspy navigation
            excludedSelectors: [ '[role="tabpanel"]' ]
        };

        options = $.extend( {}, defaults, options );

        // function
        
        $.fn._animatedScrollTo = function( itemOptions ) {

            // merge item options
            options = $.extend( {}, options, itemOptions );

            $this = $( this );

            var scrollTop = Utils.$window.scrollTop();
            var thisOffsetTop = $this.offset().top + options.scrollTolerance;

            var scrollDuration = Math.abs( thisOffsetTop - options.offset() - scrollTop ) * options.scrollDurationPer1000 / 1000;

            // limit scroll duration (min, max)
            if  ( scrollDuration < options.scrollDurationMin ) {
                scrollDuration = options.scrollDurationMin;
            }
            else if ( scrollDuration > options.scrollDurationMax ) {
                scrollDuration = options.scrollDurationMax;
            }

            Utils.$scrollRoot.animate( { scrollTop: ( thisOffsetTop - options.offset() ) }, scrollDuration );

        }

        // scroll to initial url anchor
        if ( options.scrollToInitialHash ) {
            var $currentAnchor = $( window.location.hash );
            if ( window.location.hash && $currentAnchor.length > 0 ) {

                // TODO: use browser native jumping to hash instead of smooth (but late) scrolling?

                // scroll only if hash element is not excluded
                var scrollToElem = true;
                for ( var i = 0; i < options.excludedSelectors.length; i++ ) {
                    if ( $currentAnchor.is( options.excludedSelectors[ i ] ) ) {
                        scrollToElem = false;
                    }
                }

                if ( scrollToElem ) {

                    // scroll to anchor
                    $currentAnchor._animatedScrollTo();

                    /*
                    setTimeout( function() {

                    } );
                    */

                    // scroll to anchor again after fonts loaded
                    Utils.$window.on( 'load', function() {
                        $currentAnchor._animatedScrollTo();
                    } );

                }
            }
        }

        $elems.each( function() {

            var $elem = $( this );

            // add options from attr
            var itemOptions = $elem.getOptionsFromAttr();

            $elem.on( 'click', function( event ) {

                // check if prevent default (e.g. jumping to elem within hash tabs which do not allow hash change)
                if ( !! itemOptions && itemOptions.preventDefault === true ) {
                    event.preventDefault();
                }

                var targetSelector = $elem.attr( 'href' );
                var $target = $( targetSelector );

                if ( $target.length > 0 ) {
                    $target._animatedScrollTo( itemOptions );
                }

            } );

        } );

    };

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        $( 'a[href^="#"]:not([href="#"]):not([role="tab"]):not([aria-controls])' ).animatedAnchors();

    } );

} )( jQuery, BSX_UTILS );
/*
<div class="fixed-banner fixed-banner-bottom fixed-banner-closable bg-warning text-black d-none" tabindex="-1" role="dialog" hidden data-fn="cookie-related-elem" data-fn-options="{ cookieName: 'privacyBannerHidden', cookieExpiresDays: 365, hiddenCookieValue: '1', hiddenClass: 'd-none' }">
	<div class="container py-3">
		<div class="mb-2">
			Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. 
		</div>
		<div class="text-center">
			<button class="btn btn-success" data-fn="cookie-related-elem-close"><span>Accept</span><i class="fa fa-check" aria-hidden="true"></i></button><button class="btn btn-secondary ml-2" data-fn="cookie-related-elem-close"><span>Close</span><i class="fa fa-close" aria-hidden="true"></i></button>
		</div>
	</div>
</div>
*/


( function( $, Utils ) {

	var CookieRelatedElem = {};

	CookieRelatedElem.init = function( elem, options ) {

		var defaults = {
			closeElemSelector: '[data-fn="cookie-related-elem-close"]',
			hiddenCookieValue: '1',
			cookieExpiresDays: 365, 
			cookiePath: '/',
			focusOnOpen: true,
			remoteOpenable: false
		};

        options = $.extend( {}, defaults, options );
		/*
		options = { 
			cookieName: 'privacyBannerHidden', 
			cookieExpiresDays: 365, 
			hiddenCookieValue: '1', 
			hiddenClass: 'd-none'
		};
		*/

		var $elem = $( elem );
		if ( options.focusOnOpen ) {
			CookieRelatedElem.$focussedElem = null;
		}

		$.fn._showElem = function() {

			var $elem = $( this );

			if ( options.focusOnOpen ) {
				if ( CookieRelatedElem.$focussedElem === null ) {
					CookieRelatedElem.$focussedElem = $( Utils.$document.activeElement );
				}

				CookieRelatedElem.$focussableChildren = $elem.find( Utils.selectors.focussableElements );
			}

			// open dialog
			$elem.removeClass( options.hiddenClass );

			$elem.removeAttr( 'hidden' );

			// set focus to first focussable elem
			if ( options.focusOnOpen ) {
				CookieRelatedElem.$focussableChildren.first().focus();
			}
		};

		$.fn._hideElem = function() {

			var $elem = $( this );
			
			if ( !! options.hiddenClass ) {
				$elem.addClass( options.hiddenClass );
			}
			else {
				$elem.hide();
			}

			$elem.attr( 'hidden', '' );

			// set focus back to elem that was focussed before opening dialog
			if ( options.focusOnOpen && !! CookieRelatedElem.$focussedElem ) {
				CookieRelatedElem.$focussedElem.focus();
				CookieRelatedElem.$focussedElem = null;
			}
		};

		$.fn._bindClose = function() {

			var $currentElem = $( this );
			var $close = $currentElem.find( options.closeElemSelector );

			// bind hide elem & cookie set (if options.remoteOpenable always set close click event to be able to close manually after open remote)
			$close.on( 'click', function() {

				console.log( 'close clicked' );

				// set cookie, hide elem
				if ( !! options.cookieName && !! options.hiddenCookieValue && !! options.cookieExpiresDays && !! options.cookiePath ) {
					Utils.CookieHandler.setCookie( options.cookieName, options.hiddenCookieValue, options.cookieExpiresDays, options.cookiePath );

					$currentElem._hideElem();
				}

			} );
		};



		// check if cookie already set

		// TODO: if following condition is true click handler to close will be missing – apply method to open & close?
		if ( !! options.cookieName && !! Utils.CookieHandler.getCookie( options.cookieName ) && Utils.CookieHandler.getCookie( options.cookieName ) == options.hiddenCookieValue ) {

			// hide elem im visible
			if ( ! $elem.is( '.' + options.hiddenClass ) ) {
				$elem._hideElem();
			}

			if ( options.remoteOpenable ) {

				// bind hide elem & cookie set
				$elem._bindClose();

			}
		}
		else {

			// show elem if hidden
			if ( $elem.is( '.' + options.hiddenClass ) ) {
				$elem._showElem();
			}

			// bind hide elem & cookie set
			$elem._bindClose();
		}

		// remote openable & closable
		if ( options.remoteOpenable ) {

			// open
			$elem.on( 'CookieRelatedElem.open', function() {
				$( this )._showElem();
			} );

			// close
			$elem.on( 'CookieRelatedElem.close', function() {
				$( this )._hideElem();
			} );
		}

	}

	$.fn.initCookieRelatedElem = function() {
		$( this ).each( function( i, elem ) {

			var $elem = $( elem );

			var options = $elem.getOptionsFromAttr();

			return CookieRelatedElem.init( $elem, options );
		} );
	}

	// init
    Utils.$window.on( Utils.events.initJs, function() {

	    Utils.$functionElems.filter( '[data-fn="cookie-related-elem"]' ).initCookieRelatedElem();

    } );

} )( jQuery, BSX_UTILS );

/*
tabs structure:

<!-- 
	bootstrap js unfortunately requires class .nav for tab functionality:

	https://github.com/twbs/bootstrap/blob/v4-dev/js/src/tab.js 
	line 42: 
	NAV_LIST_GROUP : '.nav, .list-group',
-->
<ul class="nav" role="tablist" data-fn="hash-tablist">
	<li class="arrow-tab-item">
		<a class="arrow-tab-link-white-to-red active" id="topic-1-tab" href="#topic-1" role="tab" aria-controls="home" aria-selected="true" data-fn="hash-tab" data-fn-callback="ga( 'send', 'event', 'TEST', 'submit' )">Tab 1</a>
	</li>
	<li class="arrow-tab-item">
		<a class="arrow-tab-link-white-to-red" id="topic-2-tab" href="#topic-2" role="tab" aria-controls="profile" aria-selected="false" data-fn="hash-tab" data-fn-callback="ga( 'send', 'event', 'TEST', 'submit' )">Tab 2</a>
	</li>
	<li class="arrow-tab-item">
		<a class="arrow-tab-link-white-to-red" id="topic-3-tab" href="#topic-3" role="tab" aria-controls="messages" aria-selected="false" data-fn="hash-tab" data-fn-callback="ga( 'send', 'event', 'TEST', 'submit' )">Tab 3</a>
	</li>
</ul>

<div class="tab-content">
	<div class="tab-pane fade active show" id="topic-1" role="tabpanel" aria-labelledby="topic-1-tab">
		Content 1
	</div>
	<div class="tab-pane fade" id="topic-2" role="tabpanel" aria-labelledby="topic-2-tab">
		Content 2
	</div>
	<div class="tab-pane fade" id="topic-3" role="tabpanel" aria-labelledby="topic-3-tab">
		Content 3
	</div>
</div>

*/


/*
link into hash tab:

<a href="#topic-1" aria-controls="topic-1-tab" data-fn="link-into-hash-tab">Link into hash tab</a>

*/

( function( $, Utils ) {

	var hashTablistSelector = '[data-fn="hash-tablist"]';
	var hashTabSelector = '[data-fn="hash-tab"]';

	var linkIntoHashTabSelector = '[data-fn="link-into-hash-tab"]';

    $.fn.hashTabs = function() {
		
		var $hashTablist = $( this );
		var $hashTabs = $hashTablist.children().children( hashTabSelector );
		
		// init hash tabs
		$hashTabs.click( function( event ) {
			
			event.preventDefault();

			var $tab = $( this );
			$tab.tab( 'show' );

			// check if callback function (e.g. tracking)
            $tab.executeCallbackFunction();
		} );
		
		// trigger window events after tab change finished (required to trigger lazyload etc.)
		$hashTabs.on( 'shown.bs.tab', function() {
			Utils.$window.trigger( 'sizeChange' );
			Utils.$window.trigger( 'scroll' );
		} );
		
		// initial adaption if hash, set scroll top 0
		var hash = window.location.hash;
		
		if ( hash ) {
			// wait init tabs to be finished (otherwise fade effect will disappear)
				
			var $currentHashTab = Utils.$functionElems.filter( 'a' + hashTabSelector + '[href="' + hash + '"]' );
			
			if ( $currentHashTab.length > 0 ) {
			
				setTimeout( function() {
					$currentHashTab.tab( 'show' );

					// check if callback function (e.g. tracking)
            		$currentHashTab.executeCallbackFunction();
				} );
				
				// scroll to top
				function scrollToTop() {
					window.scrollTo( 0, 0 );
				}
				
				// allow 2 events to make firefox happy
				var initialScrollToHash = 0;
				var allowEventsNumber = 2;
				Utils.$window.on( 'scroll.initialScrollToHash', function() {
					if ( initialScrollToHash < allowEventsNumber ) {
						scrollToTop();
						initialScrollToHash++;
					}
					else {
						Utils.$window.off( 'scroll.initialScrollToHash' );
					}
				} );
			}
			
		}
		
		// adapt tab to changed hash
		window.addEventListener( 'hashchange', function() {
			var hash = window.location.hash;
			var $targetTab = Utils.$functionElems.filter( 'a' + hashTabSelector + '[href="' + hash + '"]' )
			if ( hash && $targetTab.length > 0 ) {
				$targetTab.tab( 'show' );
			}
		}, false );
		
		// adapt hash to changed tab
		$hashTabs.on( 'shown.bs.tab', function( event ) {
			if ( history.pushState ) {
				history.pushState( null, null, '#'+ $( event.target ).attr( 'href' ).substr( 1 ) );
			} 
			else {
				window.location.hash = '#'+ $( event.target ).attr( 'href' ).substr( 1 );
			}
		} );

    };


    // link into hash tab
    $.fn.linkIntoHashTab = function() {

		var $hashTabLinks = $( this );

		$hashTabLinks.each( function() {
			
			var $link = $( this );

			$link.click( function( event ) {

				// stop link execution, trigger click instead
				event.preventDefault();

				var hash = $link.attr( 'href' );
				var $tab = Utils.$functionElems.filter( 'a' + hashTabSelector + '[href="' + hash + '"]' );

				// trigger click
				$tab.trigger( 'click' );

				// check scrolling
		        var distanceTop = Utils.anchorOffsetTop;
				var tabOffset = $tab.offset().top;
				// only scroll if tab is outside of viewport
				if ( tabOffset - distanceTop < window.pageYOffset || tabOffset > ( window.pageYOffset + window.innerHeight ) ) {
					Utils.$scrollRoot.animate( { scrollTop: tabOffset - distanceTop } );
				}

			} );

		} );
	};

    // init

    // (tabs)
    Utils.$functionElems.filter( hashTablistSelector ).each( function() {
        $( this ).hashTabs();
    } );

    // (links)
    Utils.$functionElems.filter( linkIntoHashTabSelector ).linkIntoHashTab();

} )( jQuery, BSX_UTILS );
// remote event (e.g. main navigation backdrop)

( function( $, Utils ) {

    Utils.$functionElems.filter( '[data-fn="remote-event"]' ).remoteEvent();

} )( jQuery, BSX_UTILS );
/*

<button class="plenty-navbar-toggler" type="button" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation" data-fn="toggle" data-fn-target="[data-tg='navbar-collapse']">
    <i class="fa fa-navicon" aria-hidden="true"></i>
</button>

<div class="plenty-navbar-collapse" id="navbarNavDropdown" data-tg="navbar-collapse">
    ...
</div>

*/

( function( $, Utils ) {

    Utils.$functionElems.filter( '[data-fn="toggle"]' ).toggle();

} )( jQuery, BSX_UTILS );
/*
 * Lazy Load - jQuery plugin for lazy loading images
 *
 * Copyright (c) 2007-2013 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 *
 * Version:  1.9.3
 * 
 */

( function( $, window, document, Utils ) {
    var $window = $(window);
    var $document = $(document);

    // check ios version fo using picture srcset
    var isPictureCompatibeBrowser = true;

    if ( Utils.AnalyzeBrowser !== undefined ) {
        if ( Utils.AnalyzeBrowser.isIos && Utils.AnalyzeBrowser.iosVersion && Utils.AnalyzeBrowser.iosFullVersion ) {
            // check ios
            if ( Utils.AnalyzeBrowser.iosVersion < 9 ) {
                isPictureCompatibeBrowser = false;
            }
            else if ( Utils.AnalyzeBrowser.iosVersion == 9 ) {
                // check minor version (format `12_3_1`)
                var iosFullVersion = Utils.AnalyzeBrowser.iosFullVersion;
                var iosVersionNumbers = iosFullVersion.split( '_' );
                // requires minimum 9.3.x
                if ( iosVersionNumbers[ 1 ] < 3 ) {
                    isPictureCompatibeBrowser = false;
                }
            }
        }
        else if ( Utils.AnalyzeBrowser.isIe && Utils.AnalyzeBrowser.ieVersion ) {
            // check ie, requires minimum 13
            if ( Utils.AnalyzeBrowser.ieVersion <= 12 ) {
                isPictureCompatibeBrowser = false;
            }
        }
    }

    $.fn.lazyload = function( options, index ) {
        var elements = this;
        var $container;
        var settings = {
            threshold                      : 0,
            failure_limit                  : 0,
            event                          : "scroll",
            effect_speed                   : '200',
            effect                         : "show",
            container                      : window,
            data_attribute                 : "original",
            skip_invisible                 : true,
            appear                         : null,
            load                           : null,
            placeholder                    : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mNk4GHAAIxDWRAAOokAg37Zbo4AAAAASUVORK5CYII=",
            srcset_data_attribute          : "srcset",
            picture_width_data_attribute   : "width",
            picture_height_data_attribute  : "height"
        };

        // get responsive sources from `data-srcset` and/or from `data-src`
        _getMediaMatchingSrc = function( srcsetJson, src ) {
            var currentSrc = '';
            for ( var i = 0; i < srcsetJson.length; i++ ) {
                //console.log( i + ': media: ' + srcsetJson[ i ].media + ', src: ' + srcsetJson[ i ].src );
                if ( typeof srcsetJson[ i ].media != 'undefined' && typeof srcsetJson[ i ].src != 'undefined' && window.matchMedia( srcsetJson[ i ].media ).matches ) {
                    //console.log( 'match: ' + srcsetJson[ i ].src );
                    currentSrc = srcsetJson[ i ].src;
                    break;
                }
            }
            if ( currentSrc == '' ) {
                currentSrc = src;
            }
            //console.log( 'currentSrc: ' + currentSrc );
            return currentSrc;
        }

        $.fn._isPicture = function() {
            return $( this ).parent().is( 'picture' );
        }

        function update() {
            
            var counter = 0;

            elements.each(function() {
                var $this = $(this);
                if (settings.skip_invisible && !$this.is(":visible")) {
                    return;
                }
                if ($.abovethetop(this, settings) ||
                    $.leftofbegin(this, settings)) {
                        /* Nothing. */
                } else if (!$.belowthefold(this, settings) &&
                    !$.rightoffold(this, settings)) {
                        $this.trigger("appear");
                        /* if we found an image we'll load, reset the counter */
                        counter = 0;
                } else {
                    if (++counter > settings.failure_limit) {
                        return false;
                    }
                }
            });

        }

        if(options) {
            /* Maintain BC for a couple of versions. */
            if (undefined !== options.failurelimit) {
                options.failure_limit = options.failurelimit;
                delete options.failurelimit;
            }
            if (undefined !== options.effectspeed) {
                options.effect_speed = options.effectspeed;
                delete options.effectspeed;
            }

            $.extend(settings, options);
        }

        /* Cache container as jQuery as object. */
        $container = (settings.container === undefined ||
                      settings.container === window) ? $window : $(settings.container);

        /* Fire one scroll event per scroll. Not one scroll event per image. */
        if (0 === settings.event.indexOf("scroll")) {
            $container.bind(settings.event, function() {
                return update();
            });
        }

        this.each(function() {
            var self = this;
            var $self = $(self);
            var isBgImg = ! $self.is( "img" );

            self.loaded = false;
            
            // resize function
            $.fn.resizeUnloadImg = function( newImgWidth, newImgHeight ) {

                //console.log( 'resizeUnloadImg' );
                //console.log( 'data-src: ' + $self.attr( 'data-' + settings.data_attribute ) );
                //console.log( settings.placeholder );
                //console.log( 'newImgWidth: ' + newImgWidth );
                //console.log( 'newImgHeight: ' + newImgHeight );

                var $img = $( this );

                if ( 
                    (
                        $self.attr( 'src' ) == ''
                        || $self.attr( 'src' ) == settings.placeholder 
                    )
                    && !! newImgWidth && !! newImgHeight 
                ) {

                    // set or reset to intended size (always, no need to remove style, just overwrite immediately)
                    $img.css( { width: newImgWidth + 'px', height: newImgHeight + 'px' } );
                    //console.log( 'resizeUnloadImg – width / height SET (1) (' + $img.attr( 'data-src' ) + ')' );

                    // check for css size limitation
                    var cssImgWidth = parseInt( $img.css( 'width' ) );

                    // reduce size after set if nessesary
                    if ( cssImgWidth != newImgWidth ) {
                        var calcImgWidth = cssImgWidth;
                        var calcImgHeight = newImgHeight / newImgWidth * cssImgWidth;
                        // adapt
                        $img.css( { width: calcImgWidth + 'px', height: calcImgHeight + 'px' } );
                        //console.log( 'resizeUnloadImg – width / height SET (2) (' + $img.attr( 'data-src' ) + ')' );
                    }

                    // trigger scroll since other unload images might have been appeared during resizing current image
                    $window.trigger( 'scroll' );

                }
                else {
                    //console.log( '----- called resize but img altrady loaded (or no sizes given) – data-src: ' + $self.attr( 'data-' + settings.data_attribute ) );
                }
            }

            // get image sizes (from width / height or data-with / data-height)
            $.fn.getSizes = function() {
                //console.log( 'getSizes' );
                var isPicture = $( this )._isPicture();
                var width = null;
                var height = null;
                if ( isPictureCompatibeBrowser && isPicture ) {
                    //console.log( 'isPictureCompatibeBrowser && isPicture' );
                    $( this ).parent().find( 'source' ).each( function( i, source ) {
                        //console.log( 'source: ' + i );
                        var media = $( source ).attr( 'media' );
                        //console.log( 'media: ' + media );

                        if ( window.matchMedia( media ).matches || media === undefined ) {
                            width = $( source ).attr( 'data-' + settings.picture_width_data_attribute );
                            height = $( source ).attr( 'data-' + settings.picture_height_data_attribute );
                            //console.log( '----- found matching media: ' + width + ' x ' + height );
                            return false; // break after first match
                        }
                    } );

                    // if no media matches get sizes from img tag
                    if ( width == null && height == null ) {
                        //console.log( '----- found NO matching media' );
                        width = $( this ).attr( 'width' );
                        height = $( this ).attr( 'height' );
                    }
                }
                else {
                    //console.log( 'else' );
                    width = $( this ).attr( 'width' );
                    height = $( this ).attr( 'height' );
                }
                return [ width, height ];
            }

            // generate event id
            var eventId = $self.attr( 'data-' + settings.data_attribute ).replace(/[/.]/g, '_') + '_' + index;

            /* If no src attribute given use data:uri. */
            if ( $self.is( 'img' ) && ( ! $self.attr( 'src' ) || $self.attr( 'src' ) == settings.placeholder ) ) {
            
                /* custom adaption: set sizes to unload images after placeholder is set */
                
                $self.attr( 'src', settings.placeholder );

                // set placeholders to sources
                if ( $self._isPicture() ) {
                    $self.parent().find( 'source' ).attr( 'srcset', settings.placeholder );
                }

                // set width & height since placeholder has square format
                var origSizes = $self.getSizes();
                var origImgWidth = origSizes[ 0 ];
                var origImgHeight = origSizes[ 1 ];

                //console.log( '--- initial sizes: ' + origImgWidth + ' x ' + origImgHeight );

                if ( !! origImgWidth && !! origImgHeight ) {

                    // initial resize
                    $self.resizeUnloadImg( origImgWidth, origImgHeight );

                    // events for later resize

                    // media sm, md, lg: resize on sizeChange
                    $window.on( 'sizeChange.lazyloadUnload.' + eventId, function() {
                        //console.log( 'TRIGGERED sizeChange.lazyloadUnload.' + eventId );
                        if ( $self.attr( 'src' ) == settings.placeholder ) {
                            $self.resizeUnloadImg( origImgWidth, origImgHeight );
                        }
                    } );

                    // media xs: resize on window resize
                    $window.on( 'resize.lazyloadUnload.' + eventId, function() {
                        //console.log( 'TRIGGERED resize.lazyloadUnload.' + eventId );
                        if ( !! window.mediaSize && window.mediaSize == 'xs' ) {
                            if ( $self.attr( 'src' ) == settings.placeholder ) {
                                $self.resizeUnloadImg( origImgWidth, origImgHeight );
                            }
                        }
                    } );
                }
                
            }
            
            // if width and height given, do initial resize, handle resize events

            /* When appear is triggered load original image. */
            $self.one("appear", function() {

                if ( $self.is( 'img' ) ) {
                    // unbind unload resize events (only for imgs)

                    // destroy resize event after loading
                    $window.unbind( 'sizeChange.lazyloadUnload.' + eventId + ' resize.lazyloadUnload.' + eventId );

                    //console.log( 'unbind sizeChange ' + eventId );

                    // destroy resize event after loading
                    $window.unbind( 'sizeChange.lazyloadUnload.' + eventId + ' resize.lazyloadUnload.' + eventId );

                    //console.log( 'unbind resize ' + eventId );
 
                }

                if (!this.loaded) {
                    if (settings.appear) {
                        var elements_left = elements.length;
                        settings.appear.call(self, elements_left, settings);
                    }
                    // load hidden placeholder img in background, replace lazy img src on load
                    // prepare preload url, required before load placeholder
                    var srcAttrVal = $self.attr( 'data-' + settings.data_attribute );
                    var preloadImgSrc = srcAttrVal;
                    var preloadImgSrcset = $self.attr( 'data-' + settings.srcset_data_attribute );

                    // check if src or srcset json
                    var srcsetJson = [];
                    if ( !! preloadImgSrcset ) {
                        // get json

                        srcsetJson = ( new Function( 'return ' + preloadImgSrcset ) )();

                        // get img src to preload
                        preloadImgSrc = _getMediaMatchingSrc( srcsetJson, srcAttrVal );
                        //console.log( 'preloadImgSrc: ' + preloadImgSrc );

                    }

                    if ( isPictureCompatibeBrowser && $self._isPicture() ) {
                        var $sources = $self.parent().find( 'source' );
                        var mediaSourceMap = [];
                        var mediaMatchFound = false;

                        $sources.each( function () {

                            var media = $( this ).attr( 'media' );
                            var srcset = $( this ).attr( 'data-' + settings.srcset_data_attribute );

                            if ( ! mediaMatchFound && ( window.matchMedia( media ).matches || ! media ) ) {
                                mediaMatchFound = true; // use first match

                                // load following srcset instead of img original
                                preloadImgSrc = srcset;
                            }

                            // if no match found preloadImgSrc remains default from img (as defined above)
                        } );
                    }

                    $("<img>")
                        .bind("load", function() {

                            if ( $self.is( "img" ) ) {
                                $self.hide();
                                //console.log( 'hidden (' + preloadImgSrc + ')' );
                                if ( isPictureCompatibeBrowser && $self._isPicture() ) {
                                    // replace all sources (of which one has already been preloaded)
                                    $sources.each( function () {
                                        var srcset = $( this ).attr( 'data-' + settings.srcset_data_attribute );
                                        $( this ).attr( 'srcset', srcset );
                                    } );
                                }
                                $self
                                    .attr( 'src', $self.attr( 'data-' + settings.data_attribute ) )
                                    .css( { width: '', height: '' } )
                                ; // custom adaption
                                //console.log( 'settings.effect: ' + settings.effect );
                                //console.log( 'settings.effect_speed: ' + settings.effect_speed );
                                $self[ settings.effect ]( settings.effect_speed );
                                //console.log( 'shown (' + preloadImgSrc + ')' );
                            }
                            else {
                                // is background image
                                var backgroundImage = $self.css("background-image");
                                if ( backgroundImage.indexOf( preloadImgSrc ) == -1 ) {
                                    $self.css( { backgroundImage: "url('" + preloadImgSrc + "'), " + backgroundImage } ); // load new image and put it before old one without removing old one
                                }
                                else {
                                    $self.css( { backgroundImage: "url('" + preloadImgSrc + "')" } );
                                }

                                // add sizeChange event listener to change background img
                                $window.on( 'sizeChange', function() {
                                    var currentImgSrc = _getMediaMatchingSrc( srcsetJson, srcAttrVal );
                                    //console.log( '----- changed to: ' + currentImgSrc );
                                    $self.css( { backgroundImage: "url('" + currentImgSrc + "')" } );
                                } );
                            }

                            // don't know if this event is still used or obsolete, but if required should be triggered here
                            $self.trigger( 'loaded' );

                            self.loaded = true;
                                     
                            /* Remove image from array so it is not looped next time. */
                            var temp = $.grep(elements, function(element) {
                                return !element.loaded;
                            });
                            elements = $(temp);

                            if (settings.load) {
                                var elements_left = elements.length;
                                settings.load.call(self, elements_left, settings);
                            }
                        
                        })
                        .attr( 'src', preloadImgSrc );
                    
                }
            });

            /* When wanted event is triggered load original image */
            /* by triggering appear.                              */
            if (0 !== settings.event.indexOf("scroll")) {
                $self.bind(settings.event, function() {
                    if (!self.loaded) {
                        $self.trigger("appear");
                    }
                });
            }
        });

        /* Force initial check if images should appear. */
        $document.ready(function() {
            update();
        });
        //  custom adaption: update after fonts loaded
        $window.on( 'load resize', function() {
            update();
        } );

        return this;
    };

    /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

    $.belowthefold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top + $(settings.container).height();
        }

        return fold <= $(element).offset().top - settings.threshold;
    };

    $.rightoffold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.width() + $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left + $(settings.container).width();
        }

        return fold <= $(element).offset().left - settings.threshold;
    };

    $.abovethetop = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top;
        }

        return fold >= $(element).offset().top + settings.threshold  + $(element).height();
    };

    $.leftofbegin = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left;
        }

        return fold >= $(element).offset().left + settings.threshold + $(element).width();
    };

    $.inviewport = function(element, settings) {
         return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) &&
                !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
    };

    /* Custom selectors for your convenience.   */
    /* Use as $("img:below-the-fold").something() or */
    /* $("img").filter(":below-the-fold").something() which is faster */

    $.extend($.expr[":"], {
        "below-the-fold" : function(a) { return $.belowthefold(a, {threshold : 0}); },
        "above-the-top"  : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-screen": function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-screen" : function(a) { return !$.rightoffold(a, {threshold : 0}); },
        "in-viewport"    : function(a) { return $.inviewport(a, {threshold : 0}); },
        /* Maintain BC for couple of versions. */
        "above-the-fold" : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-fold"  : function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-fold"   : function(a) { return !$.rightoffold(a, {threshold : 0}); }
    });

} )( jQuery, window, document, BSX_UTILS );


// init function
( function( $, Utils ) {

    $.fn.initLazyload = function( options ) {

        var defaults = {
            effect: 'fadeIn',
            event: ( typeof Modernizr !== "undefined" && Modernizr.touchevents ) ? 'scroll touchmove' : 'scroll',
            data_attribute: 'src'
        };

        options = $.extend( {}, defaults, options );

        var $elems = $( this );

        $elems.each( function( i, image ) {

            var $image = $( image );

            if ( !! $image.attr( 'data-fn-effect' ) ) {
                options.effect = $image.attr( 'data-fn-effect' );
            }

            $image.lazyload( options, i );
            
        } );

    }

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        Utils.$functionElems.filter( '[data-fn="lazyload"]' ).initLazyload();

    } );

} )( jQuery, BSX_UTILS );

// submit (e.g. knowledge search results pages)

/*
<form class="form-inline justify-content-md-end" action="/search/" method="GET">
    <label class="mr-2 mb-0" for="searchResultsEachPage">Results each page</label>
    <select class="custom-select" name="s" id="searchResultsEachPage" data-fn="submit-on-change">
        <option value="10">10</option>
        <option value="25" selected="">25</option>
        <option value="50">50</option>
    </select>
</form>
*/

( function( $, Utils ) {

    $.fn.submitOnChange = function() {

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var $form = $elem.closest( 'form' );

            $elem.on( 'change', function() {
                $form.submit();
            } );

        } );
    }

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        Utils.$functionElems.filter( '[data-fn="submit-on-change"]' ).submitOnChange();

    } );

} )( jQuery, BSX_UTILS );
/*
<body>
    <a class="sr-only sr-only-focusable" href="#main">Skip to main content</a>
    <div class="wrapper" id="top">
        ...
        <div class="to-top-wrapper" data-fn="to-top-wrapper">
            <a class="btn btn-secondary btn-only-icon" href="#top"><i class="fa fa-arrow-up" aria-hidden="true"></i><span class="sr-only">Scroll to top</span></a>
        </div>
    </div>
</body>
*/

( function( $, Utils ) {

    $.fn.toggleToTopButton = function( options ) {

        var $elem = $( this );

        var defaults = {
            threshold: 100,
            visibleClass: Utils.classes.open
        };

        options = $.extend( {}, defaults, options );
    
        function _positionToTopButton() {
            if ( Utils.$document.scrollTop() > 100 ) {
                if ( ! $elem.is( '.' + options.visibleClass ) ) {
                    $elem.addClass( options.visibleClass );
                }
            }
            else {
                if ( $elem.is( '.' + options.visibleClass ) ) {
                    $elem.removeClass( options.visibleClass );
                }
            }
        }

        // position
        _positionToTopButton()
        
        Utils.$window.on( 'scroll resize', function() {
            _positionToTopButton();
        });
    
    }

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        Utils.$functionElems.filter( '[data-fn="to-top-wrapper"]' ).toggleToTopButton();

    } );

} )( jQuery, BSX_UTILS );
( function( $, Utils ) {

    // TEST – TODO: remove

    window.testFormSuccess = function( values, form ) {
        console.log( 'testFormSuccess' );

        $form = $( form );

        $form.addClass( 'test-success' );

        for ( var key in values ) {
            console.log( key + ': ' + values[ key ] );
        }

    }

    // /TEST

/**
 * @module Services
 */

    /**
     * Provide methods for client-side form validation.
     * @class ValidationService
     * @static
     */
    var ValidationService = {};

    ValidationService.validate = function( form, options ) {

        return validate( form, options );

        /**
         * Check if element is a form element (input, select, textarea) or search for child form elements
         * @function getFormControl
         * @private
         * @param  {object} elem the element to get the form element from
         * @return {object} a valid form element (input, select, textarea) – may contain multiple elements of the same type (only first found type if multiple types) if elem contains multiple form elements
         */
        function getFormControl( elem ) {
            var $elem = $( elem );
            if ( $elem.is( 'input' ) || $elem.is( 'select' ) || $elem.is( 'textarea' ) ) {
                return $elem;
            }
            else {
                if ( $elem.find( 'input' ).length > 0 ) {
                    return $elem.find( 'input' );
                }
                else if ( $elem.find( 'select' ).length > 0 ) {
                    return $elem.find( 'select' );
                }
                else if ( $elem.find( 'textarea' ).length > 0 ) {
                    return $elem.find( 'textarea' );
                }
                else {
                    return null;
                }
            }
        }

        /**
         * Check given element has any value
         * @function validateText
         * @private
         * @param {object} formControl the form element to validate
         * @return {boolean}
         */
        function validateText( formControl )
        {
            // check if formControl is no checkbox or radio
            if ( formControl.is( 'input' ) || formControl.is( 'select' ) || formControl.is( 'textarea' ) )
            {
                // check if length of trimmed value is greater then zero
                return $.trim( formControl.val() ).length > 0;

            }
            else
            {
                console.error( 'Validation Error: Cannot validate Text for <' + formControl.prop( "tagName" ) + '>' );
                return false;
            }
        }

        /**
         * Check given element's value is a valid email-address
         * @function validateEmail
         * @private
         * @param {object} formControl the form element to validate
         * @return {boolean}
         */
        function validateEmail( formControl )
        {
            var mailRegExp = /[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/;
            if ( validateText( formControl ) )
            {
                return mailRegExp.test( $.trim( formControl.val() ) );
            }
            else
            {
                return false;
            }
        }

        /**
         * Check given element's value is a valid number
         * @function validateNumber
         * @private
         * @param {object} formControl the form element to validate
         * @return {boolean}
         */
        function validateNumber( formControl )
        {
            if ( validateText( formControl ) )
            {
                return $.isNumeric( $.trim( formControl.val() ) );
            }
            else
            {
                return false;
            }
        }

        /**
         * Check given element's value is equal to a references value
         * @function compareValues
         * @private
         * @param {object} formControl the form element to validate
         * @param {string} reference the required value
         * @param {boolean} caseSensitive direct compare, without convert to lowerCase
         * @return {boolean}
         */
        function compareValues( formControl, reference, caseSensitive )
        {
            formControl = $.trim( formControl.val() );
            reference   = $.trim(
                $( reference ).length > 0
                    ? $( reference ).val()
                    : reference );

            if ( caseSensitive )
            {
                return formControl == reference;
            }
            return formControl.toLowerCase() == reference.toLowerCase();
        }

        function isNotVisibleOrEnabled( formControl )
        {
            return ( ! formControl.is( ':visible' ) || ! formControl.is( ':enabled' ) );
        }

        /**
         * Validate a form. Triggers event 'validationFailed' if any element has an invalid value
         * @function validate
         * @param   {object}    form The form element to validate
         * @returns {boolean}
         * @example
         *  ```html
         *      <form data-fn="validate-form" data-fn-options="{ preventDefault: true, setValidatedClass: true, invalidClass: 'is-invalid' }" data-fn-callback="testFormSuccess">
         *          <!-- check if value is "text" -->
         *          <input type="text" required>
         *
         *          <!-- check if value is a valid email-address -->
         *          <input type="email" required>
         *
         *          <!-- check if value is a valid number -->
         *          <input type="number" required>
         *
         *          <!-- check if value is "foo" -->
         *          <input type="text" required data-required="value" data-required-value="foo">
         *
         *          <!-- check if values are identical -->
         *          <input type="text" id="input1" required>
         *          <input type="text" required data-required="value" data-required-value="#input1">
         *
         *          <!-- validate radio buttons -->
         *          <input type="radio" name="radioGroup" required>
         *          <input type="radio" name="radioGroup" required>
         *          <input type="radio" name="radioGroup" required>
         *
         *          <!-- validate individual checkbox -->
         *          <input type="checkbox" required>
         *
         *          <!-- validate checkbox group (if data-required is empty min is 1) -->
         *          <fieldset data-required="{ min: 1, max: 2 }">
         *              <input type="checkbox" name="checkboxGroup">
         *              <input type="checkbox" name="checkboxGroup">
         *              <input type="checkbox" name="checkboxGroup">
         *          </fieldset>
         *
         *       </form>
         *    ```
         *
         * @example
         *      $form.one( 'validationFailed', function( missingFields ) {
         *          // handle missing fields
         *      });
         */
        function validate( form, options ) {

            var $formControl, formControls, validationKey, currentHasError, groupName, checked, checkedMin, checkedMax, validationAttrVal, validationKeys, formControlType;
            var $form         = $( form );
            var missingFields = [];
            var hasError      = false;

            var defaults = {
                invalidClass: 'is-invalid',
                validClass: 'is-valid',
                validatedClass: 'was-validated',
                validationAttr: 'data-required',
                validationKeys: 'text, email, number, value, none',
                validationReferenceAttr: 'data-required-value',
                defaultValidationKey: 'text',
                successCallback: true,
                setValidatedClass: false,
                callbackAttr: Utils.attributes.callback,
                modalIdentifier: '.modal',
                modalScrollIdentifier: '.modal-body'
            };

            options = $.extend( {}, defaults, options );

            // remove validated class if set
            if ( options.setValidatedClass && !! options.validatedClass ) {
                $form.removeClass( options.validatedClass );
            }

            // check every required input inside form

            $form.find( 'input:required, select:required, textarea:required, [' + options.validationAttr + '] input[type="checkbox"]' ).each( function( i, elem ) {

                var $elem = $( elem );
                validationAttrVal = $elem.attr( options.validationAttr );

                formControls = getFormControl( elem );

                // validationKeys seems obsolete, contains one or multiple comma separated validation keys corresponding to one or multiple form control children 
                // get validation key or set default
                validationKeys = ( !! validationAttrVal ) ? validationAttrVal : options.defaultValidationKey;

                if ( $elem.is( 'input' ) && options.validationKeys.indexOf( $elem.attr( options.validationAttr ) ) == -1 && options.validationKeys.indexOf( $elem.attr( 'type' ) ) > -1 ) {
                    // if input (not validate value) use validation key from type attribute (if type is allowed)
                    validationKeys = $elem.attr( 'type' );
                }
                validationKeys = validationKeys.split( ',' );

                for ( var i = 0; i < formControls.length; i++ ) {

                    $formControl = $( formControls[ i ] );
                    formControlType = $formControl.attr( 'type' );

                    // skip validation, if input is invisible or disabled
                    if ( isNotVisibleOrEnabled( $formControl ) )
                    {
                        return;
                    }

                    validationKey   = validationKeys[i].trim() || validationKeys[0].trim();
                    currentHasError = false;

                    // formControl is textfield (text, mail, password) or textarea
                    if ( 
                        (
                            $formControl.is( 'input' )
                            && formControlType != 'radio'
                            && formControlType != 'checkbox'
                        )
                        || $formControl.is( 'textarea' )
                    ) {
                        switch ( validationKey ) {

                            case 'text':
                                currentHasError = !validateText( $formControl );
                                break;

                            case 'email':
                                currentHasError = !validateEmail( $formControl );
                                break;

                            case 'number':
                                currentHasError = !validateNumber( $formControl );
                                break;

                            case 'value':
                                currentHasError = !compareValues( $formControl, $( elem ).attr( options.validationReferenceAttr ), ( typeof $formControl.attr( 'type' ) === 'password' ) );
                                break;

                            case 'none':
                                // do not validate
                                break;

                            default:
                                console.error( 'Form validation error: unknown validate property: "' + validationAttrVal + '"' );
                                break;
                        }
                    }
                    else if ( 
                        $formControl.is( 'input' )
                        && (formControlType == 'radio'
                        || formControlType == 'checkbox')
                    ) {
                        // validate radio buttons
                        groupName   = $formControl.attr( 'name' );
                        checked = $form.find( 'input[name="' + groupName + '"]:checked' ).length;

                        if ( formControlType == 'radio' ) {
                            checkedMin = 1;
                            checkedMax = 1;
                        }
                        else {
                            if ( checked > 1 ) {
                                // get min, max from checkbox group parent
                                validationAttrVal = $formControl.closest( '[' + options.validationAttr + ']' ).attr( options.validationAttr );
                            }
                            var minMax = (new Function( "return " + validationAttrVal ))() || {min: 1, max: 1000000};
                            checkedMin = minMax.min;
                            checkedMax = minMax.max;
                        }

                        currentHasError = ( checked < checkedMin || checked > checkedMax );

                    }
                    else if ( $formControl.is( 'select' ) ) {
                        // validate selects
                        currentHasError = ( $formControl.val() == '' || $formControl.val() == '-1' );
                    }
                    else {
                        console.error( 'Form validation error: ' + $( elem ).prop( "tagName" ) + ' does not contain an form element' );
                        return;
                    }

                    if ( currentHasError ) {
                        hasError = true;
                        missingFields.push( $formControl );

                        if ( formControls.length > 1 ) {
                            $formControl.addClass( options.invalidClass );
                            $form.find( 'label[for="' + $formControl.attr( 'id' ) + '"]' ).addClass( options.invalidClass );
                        }
                        else {
                            $( elem ).addClass( options.invalidClass );
                        }
                        if ( $formControl.attr( 'data-clone-error' ) ) {
                            // clone error state to closest selector
                            $formControl.closest( $formControl.attr( 'data-clone-error' ) ).addClass( options.invalidClass );
                        }
                    }
                }

            } );

            // scroll to element on 'validationFailed'
            $form.one( 'validationFailed', function() {

                var distanceTop   = function() {
                    return Utils.anchorOffsetTop;
                };
                var $error        = $form.find( '.' + options.invalidClass ).first();
                var errorOffset   = $error.offset().top;
                var $scrollTarget = Utils.$scrollRoot;

                // if form is inside of modal, scroll modal instead of body
                if ( $form.parents( options.modalIdentifier ).length > 0 ) {
                    $scrollTarget = $form.parents( options.modalIdentifier ).find( options.modalScrollIdentifier );
                    errorOffset   = $scrollTarget.scrollTop() - ( $scrollTarget.offset().top - $error.offset().top );
                }
                else if ( $form.is( options.modalIdentifier ) ) {
                    $scrollTarget = $form.find( options.modalScrollIdentifier );
                    errorOffset   = $scrollTarget.scrollTop() - ( $scrollTarget.offset().top - $error.offset().top );
                }

                // only scroll if error is outside of viewport
                if ( errorOffset - distanceTop() < window.pageYOffset || errorOffset > ( window.pageYOffset + window.innerHeight ) ) {
                    $scrollTarget.animate( {
                        scrollTop: errorOffset - distanceTop()
                    } );
                }
            } );

            if ( hasError )
            {
                // remove error class on focus
                $form.find( '.' + options.invalidClass ).each( function( i, elem )
                {
                    $formControl = $( getFormControl( elem ) );
                    $formControl.on( 'focus click', function()
                    {
                        var $errorElement = $( elem );
                        $errorElement.removeClass( options.invalidClass );
                        $form.find( 'label[for="' + $( this ).attr( 'id' ) + '"]' ).removeClass( options.invalidClass );

                        if ( $errorElement.attr( 'data-clone-error' ) ) {
                            // clone error state to closest selector
                            $errorElement.closest( $errorElement.attr( 'data-clone-error' ) ).removeClass( options.invalidClass );
                        }

                        // reset error class for each radio/checkbox group elem (and related label) on first elem of group focussed
                        if ( $errorElement.attr( 'type' ) == 'radio' || $errorElement.attr( 'type' ) == 'checkbox' ) {
                            var errorElementGroupName = $errorElement.attr( 'name' );
                            $form.find( 'input[name="' + errorElementGroupName + '"]' ).each( function( j, groupFormControl ) {
                                var $groupFormControl = $( groupFormControl );
                                $groupFormControl.removeClass( options.invalidClass );
                                $form.find( 'label[for="' + $groupFormControl.attr( 'id' ) + '"]' ).removeClass( options.invalidClass );
                            } );
                        }

                    } );
                } );

                $form.trigger( 'validationFailed', [missingFields] );
            }

            // set validated class after successful validation (NOTE: callback function may set error after successful validation, therefore setting class is not activated by default)
            if ( options.setValidatedClass && ! hasError && !! options.validatedClass ) {
                $form.addClass( options.validatedClass );
            }

            var callback = $form.attr( options.callbackAttr );

            if ( ! hasError && options.successCallback && !! callback && callback != "submit" && typeof window[ callback ] === "function" ) {

                var values = form.getFormValues();

                window[ callback ]( values, $form );
                return false;
            }
            else {
                return !hasError;
            }
        }
    };

    /**
     * jQuery-Plugin to calling {{#crossLink "ValidationService/validate"}}ValidationService.validate{{/crossLink}}
     * on jQuery wrapped elements.
     * @return {boolean}
     */
    $.fn.validateForm = function( options )
    {
        return ValidationService.validate( this, options );
    };

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        Utils.$functionElems.filter( '[data-fn*="validate-form"]' ).each( function() {

            $( this ).on( 'submit', function( event ) {
            
                var $form = $( this );

                var options = $form.getOptionsFromAttr();

                if ( !! options.preventDefault ) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                if ( ! $form.validateForm( options ) ) {
                    return false;
                }

            } );

        } );

    } );

} )( jQuery, BSX_UTILS );
// test-component-001/js/component.js
/*

EXAMPLE 1:

<ul>
    <li>
        <a href="#" aria-label="close" data-fn="dropdown-multilevel-close"></a>
    </li>
    <li>
        <a id="id-1" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Link</a>
        <ul aria-labelledby="id-1"><!--  -->
            ...
        </ul>
    </li>
    ...
</ul>

<div data-tg="dropdown-multilevel-excluded">I will be ignored</div>


EXAMPLE 2:

- external trigger for level 1 (anywhere)
- trigger and list do not have to share a common list

<a id="id-0" href="#" data-fn="dropdown-multilevel" data-fn-target="[data-tg='navbar']" aria-haspopup="true" aria-expanded="false">Open menu</a>

<div data-tg="navbar">
    <ul aria-labelledby="id-0">
        <li>
            <a href="#" aria-label="close" data-fn="dropdown-multilevel-close"></a>
        </li>
        <li>
            <a id="id-1" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Link</a>
            <ul aria-labelledby="id-1"><!--  -->
                ...
            </ul>
        </li>
        ...
    </ul>
</div>

*/

( function( $, Utils ) {

    // dropdown multilevel (e.g. main navigation lists)
    $.fn.dropdownMultilevel = function( options ) {

        // config
        var defaults = {
            openedClass: Utils.classes.open,
            hasOpenedSublevelClass: 'has-' + Utils.classes.open,
            animatingClass: Utils.classes.animating,
            closeElemSelector: '[data-fn="dropdown-multilevel-close"]',
            excludedBodyElements: '[data-tg="dropdown-multilevel-excluded"]',
            scrollDuration: 100
        };

        options = $.extend( {}, defaults, options );

        // vars
        var openedElems = []; // remember opened elements
        var $elems = $( this );
        var $excludedElems = Utils.$targetElems.filter( options.excludedBodyElements );

        // functions
        $.fn._getTarget = function() {
            // gets target (li) defined by triggers target attribute or gets parent li as target
            var $this = $( this );
            var $target;
            if ( $this.attr( Utils.attributes.target ) ) {
                // has fn target attr
                var targetSelector = $this.attr( Utils.attributes.target );
                $target = ( Utils.$targetElems.filter( targetSelector ).lenght > 0 ) ? Utils.$targetElems.filter( targetSelector ) : $( targetSelector );
            }
            else {
                // parent
                $target = $this.parent( 'li' );
            }
            return $target;
        };
        $.fn._getList = function() {
            // gets relatet list (ul) using aria labelledby attribute (refers to trigger id)
            var $this = $( this );
            return $this._getTarget().find( '[aria-labelledby="' + $this.attr( 'id' ) + '"]' );
        };
        $.fn._getCloseElem = function() {
            // gets close link (must be placed within first list element)
            var $this = $( this );
            return $this._getList().children().fist().find( '[data-fn="dropdown-multilevel-close"]' );
        };
        $.fn._getParentList = function() {
            // gets parent ul to target (doesn’t have to be parent to trigger)
            var $this = $( this );
            return $this._getTarget().parent( 'ul' );
        };
        $.fn._openDropdown = function() {

            var $this = $( this );
            var $thisTarget = $this._getTarget();
            var $thisParentList = $this._getParentList();
            $thisTarget
                .addClass( options.openedClass )
                .setRemoveAnimationClass( options.animatingClass );
            $this.ariaExpanded( 'true' );
            $thisParentList
                // scroll up to keep opened sublevel in position
                .animate({ scrollTop: 0 }, options.scrollDuration, function() {
                    $( this ).addClass( options.hasOpenedSublevelClass );
                } );

            // remember
            openedElems.push( $this );
        };
        $.fn._closeDropdown = function() {

            var $this = $( this );
            var $thisTarget = $this._getTarget();
            var $thisParentList = $this._getParentList();
            $thisTarget
                .removeClass( options.openedClass )
                .setRemoveAnimationClass( options.animatingClass );
            $this.ariaExpanded( 'false' );
            $thisParentList.removeClass( options.hasOpenedSublevelClass );

            // remember
            openedElems.pop();
        };
        function _closeAllDropdowns() {

            // close from latest to earliest
            for ( var i = openedElems.length - 1; i >= 0; i-- ) {
                $( openedElems[ i ] )._closeDropdown();
            }

        };

        function _listenBodyWhileDropdownOpen( currentOpenedElems ) {

            Utils.$body.one( 'click.body', function( bodyEvent ) {

                var $bodyEventTarget = $( bodyEvent.target );

                // if dropdowns open
                if ( currentOpenedElems.length > 0 ) {

                    if ( $.inArray( $bodyEventTarget[ 0 ], $excludedElems ) == -1 ) {

                        var $currentLatestOpenedList = $( currentOpenedElems[ currentOpenedElems.length - 1 ] )._getList();

                        if ( $currentLatestOpenedList.children().children( options.closeElemSelector ).parent().has( $bodyEventTarget ).length > 0 ) {
                            // click on close button

                            // TODO: allow executing link if bigmenu deepest level shown but still has sublevels

                            bodyEvent.preventDefault();

                            // close current dropdown level
                            $( currentOpenedElems[ currentOpenedElems.length - 1 ] )._closeDropdown();

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );
                        }
                        else if ( $currentLatestOpenedList.has( $bodyEventTarget ).length > 0 || $currentLatestOpenedList.is( $bodyEventTarget ) ) {
                            // click on opend list (event is inside list || event is list)

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );
                        }
                        else if ( ! $currentLatestOpenedList.has( $bodyEventTarget ).length > 0 ) {
                            // click outside dropdowns

                            //close all
                            _closeAllDropdowns();
                        }

                    }
                    else {

                        // create new close listener
                        _listenBodyWhileDropdownOpen( openedElems );

                    }

                }

            } );

        }

        $elems.each( function() {

            var $elem = $(this);
            var targetSelector = $elem.attr( Utils.attributes.target ) || '';
            var $target = $elem._getTarget(); // ( targetSelector != '' ) ? $( targetSelector ) : $elem.parent();
            var $list = $elem._getList(); // $target.find( '[aria-labelledby="' + $elem.attr( 'id' ) + '"]' );

            $elem.on( 'click', function( event ) {

                if ( $target.length > 0 && $list.length > 0 ) {

                    // remove event listener if click on dropdown trigger since new event listener will be created after click
                    Utils.$body.off( 'click.body' );

                    // check if clicked on open dropdown trigger
                    var $eventTarget = $( event.target );
                    var $latestOpenedElem = $( openedElems[ openedElems.length - 1 ] );

                    if ( $latestOpenedElem.has( $eventTarget ).length > 0 || $latestOpenedElem.is( $eventTarget ) ) {

                        event.preventDefault();

                        // close current dropdown level
                        $( openedElems[ openedElems.length - 1 ] )._closeDropdown();

                        if ( openedElems.length > 0 ) {

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );
                        }

                    }
                    else {

                        // check if do something (check visibility and position inside parent since might be visible but out of sight)
                        if ( ! $list.is( ':visible' ) || ! $list.elemPositionedInside( $target.parent() ) ) {

                            // show list, stop link execution
                            event.preventDefault();

                            // close opened dropdowns if not parents
                            if ( openedElems.length > 0 ) {

                                var $latestOpenedList = $( openedElems[ openedElems.length - 1 ] )._getList();

                                // check if clicked dropdown is inside or outside of already opened dropdown
                                if ( ! $latestOpenedList.has( $elem ).length > 0 ) {

                                    // click outside opened dropdown – close all
                                    _closeAllDropdowns();
                                }
                                else {
                                    // keep opened dropdowns
                                }

                            }

                            // open
                            $elem._openDropdown();

                            // check options, do any special taks?
                            var options;
                            if ( ( options = $elem.getOptionsFromAttr() ) ) {
                                if ( options.focusOnOpen ) {
                                    Utils.$targetElems.filter( options.focusOnOpen ).focus();
                                }
                            }

                            event.stopPropagation();

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );

                        }
                        else {
                            // related list is already shown, do not open or close anything

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );
                        }
                    }

                }

            } );

        } );

        // close all dropdowns on resize & orientationchange
        Utils.$window.on( 'orientationchange sizeChange', function() {
            _closeAllDropdowns();
        } );

    };

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        Utils.$functionElems.filter( '[data-fn="dropdown-multilevel"]' ).dropdownMultilevel();

    } );

} )( jQuery, BSX_UTILS );



/*

minimum structure (items don't have to be direct children of gallery and don't have to be siblings):

<div data-fn="photoswipe">
    ...
    <figure>
        <a href="large-img-001-720x720.jpg" itemprop="contentUrl" data-size="720x720">
            <img src="large-img-001-720x720-thumb.jpg" alt="Image 1">
        </a>
    </figure>
    ...
    <div>
        ...
        <div>
            ...
            <figure>
                <a href="large-img-002-1440x720.jpg" itemprop="contentUrl" data-size="1440x720">
                    <img src="large-img-002-1440x720-thumb.jpg" alt="Image 2">
                </a>
            </figure>
            ...
        </div>
        ...
    </div>
    ...
</div>


better readable structure (rich snippets):

<div itemscope itemtype="http://schema.org/ImageGallery" data-fn="photoswipe">
    ...
    <figure itemprop="associatedMedia" itemscope itemtype="http://schema.org/ImageObject">
        <a href="large-img-001-720x720.jpg" itemprop="contentUrl" data-size="720x720">
            <img src="large-img-001-720x720-thumb.jpg" alt="Image 1">
        </a>
        <figcaption class="sr-only" itemprop="caption description">Caption 1</figcaption>
    </figure>
    ...
    <div>
        ...
        <div>
            ...
            <figure itemprop="associatedMedia" itemscope itemtype="http://schema.org/ImageObject">
                <a href="large-img-002-1440x720.jpg" itemprop="contentUrl" data-size="1440x720">
                    <img src="large-img-002-1440x720-thumb.jpg" alt="Image 2">
                </a>
                <figcaption class="sr-only" itemprop="caption description">Caption 1</figcaption>
            </figure>
            ...
        </div>
        ...
    </div>
    ...
</div>


pswp template:

<!-- PHOTOSWIPE SHADOWBOX TEMPLATE -->

<!-- Root element of PhotoSwipe. Must have class pswp. -->
<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
    <!-- Background of PhotoSwipe. 
         It's a separate element as animating opacity is faster than rgba(). -->
    <div class="pswp__bg"></div>
    <!-- Slides wrapper with overflow:hidden. -->
    <div class="pswp__scroll-wrap">
        <!-- Container that holds slides. 
            PhotoSwipe keeps only 3 of them in the DOM to save memory.
            Don't modify these 3 pswp__item elements, data is added later on. -->
        <div class="pswp__container">
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
        </div>
        <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->
        <div class="pswp__ui pswp__ui--hidden">
            <div class="pswp__top-bar">
                <!--  Controls are self-explanatory. Order can be changed. -->
                <div class="pswp__counter"></div>
                <button class="pswp__button pswp__button--close" title="Close (Esc)"><span><i class="fa fa-close" aria-hidden="true"></i><span class="sr-only">&nbsp;</span></span></button>
                <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"><i class="fa fa-arrows-alt" aria-hidden="true"></i></button>
                <button class="pswp__button pswp__button--zoom" title="Zoom in/out"><i class="fa fa-search-plus" aria-hidden="true"></i></button>
                <!-- Preloader demo http://codepen.io/dimsemenov/pen/yyBWoR -->
                <!-- element will get class pswp__preloader- -active when preloader is running -->
                <div class="pswp__preloader">
                    <div class="pswp__preloader__icn">
                      <i class="fa fa-circle-o-notch" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
            <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                <div class="pswp__share-tooltip"></div> 
            </div>
            <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"><i class="fa fa-arrow-left" aria-hidden="true"></i></button>
            <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"><i class="fa fa-arrow-right" aria-hidden="true"></i></button>
            <div class="pswp__caption">
                <div class="pswp__caption__center container text-center"></div>
            </div>
        </div>
    </div>
</div>


*/

( function( $, Utils ) {

    // photoswipe

    var initPhotoSwipeFromDOM = function(gallerySelector) {

        // add lazyload src identifier
        var lazyloadSrcAttr = 'data-scr';
        var placeholderSrcString = 'base64';
        var itemNodeName = 'FIGURE';

        function closestElem(el, selector) {
            var matchesFn;
            // find vendor prefix
            ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) {
                if (typeof document.body[fn] == 'function') {
                    matchesFn = fn;
                    return true;
                }
                return false;
            });
            var parent;
            // traverse parents
            while (el) {
                parent = el.parentElement;
                if (parent && parent[matchesFn](selector)) {
                    return parent;
                }
                el = parent;
            }
            return null;
        }

        // parse slide data (url, title, size ...) from DOM elements 
        // (children of gallerySelector)
        var parseThumbnailElements = function(el) {
            // TODO: find figure elems instaed of child nodes
            var thumbElements = el.getElementsByTagName( itemNodeName ),
                numNodes = thumbElements.length,
                items = [],
                figureEl,
                linkEl,
                size,
                item;

            for(var i = 0; i < numNodes; i++) {

                figureEl = thumbElements[i]; // <figure> element

                // include only element nodes – customize: allow non thumb elements as siblings of thumbs
                if( figureEl.nodeType !== 1 || figureEl.nodeName.toUpperCase() !== itemNodeName ) {
                    continue;
                }

                linkEl = figureEl.children[0]; // <a> element

                size = linkEl.getAttribute('data-size').split('x');

                // create slide object
                item = {
                    src: linkEl.getAttribute('href'),
                    w: parseInt(size[0], 10),
                    h: parseInt(size[1], 10)
                };

                if(figureEl.children.length > 1) {
                    // <figcaption> content
                    item.title = figureEl.children[1].innerHTML; 
                }

                if(linkEl.children.length > 0) {
                    // <img> thumbnail element, retrieving thumbnail url

                    // custom adaption: src might be empty or lazyload placeholder, therefor get src from lazyload src attr

                    var thumb = linkEl.getElementsByTagName( 'img' )[0];

                    item.msrc = thumb.getAttribute( 'src' );

                    if ( ( item.msrc == '' || item.msrc.indexOf( placeholderSrcString ) > -1 ) && !! thumb.getAttribute( lazyloadSrcAttr ) ) {
                        // get src from lazyload src attr
                        item.msrc = thumb.getAttribute( lazyloadSrcAttr )
                    }
                    
                } 

                item.el = figureEl; // save link to element for getThumbBoundsFn
                items.push(item);
            }

            return items;
        };

        // find nearest parent element
        var closest = function closest(el, fn) {
            return el && ( fn(el) ? el : closest(el.parentNode, fn) );
        };

        // triggers when user clicks on thumbnail
        var onThumbnailsClick = function(e) {
            e = e || window.event;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;

            var eTarget = e.target || e.srcElement;

            // find root element of slide
            var clickedListItem = closest(eTarget, function(el) {
                return ( el.tagName && el.tagName.toUpperCase() === itemNodeName );
            });

            if(!clickedListItem) {
                return;
            }

            // find index of clicked item by looping through all child nodes
            // alternatively, you may define index via data- attribute

            // TODO: clickedGallery might be any container but gallery, find closest parent with gallerySelector
            var clickedGallery = closestElem( clickedListItem, gallerySelector ),
                // TODO: find all figure elems
                childNodes = clickedGallery.getElementsByTagName( itemNodeName ),
                numChildNodes = childNodes.length,
                nodeIndex = 0,
                index;

            for (var i = 0; i < numChildNodes; i++) {
                if(childNodes[i].nodeType !== 1) { 
                    continue; 
                }

                if(childNodes[i] === clickedListItem) {
                    index = nodeIndex;
                    break;
                }
                nodeIndex++;
            }

            if(index >= 0) {
                // open PhotoSwipe if valid index found
                openPhotoSwipe( index, clickedGallery );
            }
            return false;
        };

        // parse picture index and gallery index from URL (#&pid=1&gid=2)
        var photoswipeParseHash = function() {
            var hash = window.location.hash.substring(1),
            params = {};

            if(hash.length < 5) {
                return params;
            }

            var vars = hash.split('&');
            for (var i = 0; i < vars.length; i++) {
                if(!vars[i]) {
                    continue;
                }
                var pair = vars[i].split('=');  
                if(pair.length < 2) {
                    continue;
                }           
                params[pair[0]] = pair[1];
            }

            if(params.gid) {
                params.gid = parseInt(params.gid, 10);
            }

            return params;
        };

        var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
            // TODO: '.pswp' doesn't exist, does this cause any problems?
            var pswpElement = document.querySelectorAll('.pswp')[0],
                gallery,
                options,
                items;

            items = parseThumbnailElements(galleryElement);

            // define options (if needed)
            options = {

                // define gallery index (for URL)
                galleryUID: galleryElement.getAttribute('data-pswp-uid'),

                getThumbBoundsFn: function(index) {
                    // See Options -> getThumbBoundsFn section of documentation for more info
                    var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                        pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                        rect = thumbnail.getBoundingClientRect(); 

                    return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
                },

                history: false

            };

            // PhotoSwipe opened from URL
            if(fromURL) {
                if(options.galleryPIDs) {
                    // parse real index when custom PIDs are used 
                    // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                    for(var j = 0; j < items.length; j++) {
                        if(items[j].pid == index) {
                            options.index = j;
                            break;
                        }
                    }
                } else {
                    // in URL indexes start from 1
                    options.index = parseInt(index, 10) - 1;
                }
            } else {
                options.index = parseInt(index, 10);
            }

            // exit if index not found
            if( isNaN(options.index) ) {
                return;
            }

            if(disableAnimation) {
                options.showAnimationDuration = 0;
            }

            // Pass data to PhotoSwipe and initialize it
            gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
            
            // plenty modification
            /*
            gallery.listen('beforeChange', function() {
                if ( gallery.isDragging() ) {
                }
            });
            */
            // / plenty modification
        };

        // loop through all gallery elements and bind events
        var galleryElements = document.querySelectorAll( gallerySelector );

        for(var i = 0, l = galleryElements.length; i < l; i++) {
            galleryElements[i].setAttribute('data-pswp-uid', i+1);
            galleryElements[i].onclick = onThumbnailsClick;
        }

        // Parse URL and open gallery if it contains #&pid=3&gid=1
        var hashData = photoswipeParseHash();
        if(hashData.pid && hashData.gid) {
            openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
        }
    };

    // execute above function
    initPhotoSwipeFromDOM( '[data-fn="photoswipe"]' );

    // /photoswipe

} )( jQuery, BSX_UTILS );


// CUSTOM INIT EVENT

( function( $, Utils ) {

    Utils.$window.trigger( Utils.events.initJs );

} )( jQuery, BSX_UTILS );
//# sourceMappingURL=scripts.js.map
