<?php 

	// paths

	$serverName = $_SERVER[ 'SERVER_NAME' ];
	$homeUrl = '/';

	$rootPath = './../../';
	$resourcesPath = 'resources/';
	$templatePartsPath = 'template-parts/';

	$relativeAssetsPath = 'assets/';
	$assetsPath = $rootPath . 'assets/';
	//$rootRelatedAssetsPath = explode( $homeUrl, $assetsPath )[ 1 ];
	$rootRelatedAssetsPath = $assetsPath;


	// include classes file
	include './../classes/include-classes.php';

	// get css file version using absolute file path
	$cssFileName = 'css/style.min.css';
	$cssFilePath = $rootRelatedAssetsPath . $cssFileName;
	$cssVersion = file_exists( $cssFilePath ) ? filemtime( $cssFilePath ) : 'null';

	// get js file versions
	$vendorJsFileName = 'js/vendor.min.js';
	$vendorJsFilePath = $rootRelatedAssetsPath . $vendorJsFileName;
	$vendorJsVersion = file_exists( $vendorJsFilePath ) ? filemtime( $vendorJsFilePath ) : 'null';

	$scriptsJsFileName = 'js/scripts.min.js';
	$scriptsJsFilePath = $rootRelatedAssetsPath . $scriptsJsFileName;
	$scriptsJsVersion = file_exists( $scriptsJsFilePath ) ? filemtime( $scriptsJsFilePath ) : 'null';


	// include classes file
	//include './classes/include-classes.php';


	// include classes
	if ( class_exists( 'BsxPhotoswipe001' ) ) {
		$BsxPhotoswipe = new BsxPhotoswipe001;
	}


	// logo
	$headerLogoFilePath = $assetsPath.'img/ci/logo/logo.svg';
	$headerLogoAlt = 'Example Logo';
	$headerLogoWidth = 136;
	$headerLogoHeight = 32;

	$footerLogoFilePath = $headerLogoFilePath;
	$footerLogoAlt = $headerLogoAlt;
	$footerLogoWidth = $headerLogoWidth;
	$footerLogoHeight = $headerLogoHeight;


	// dev mode
	$isDevMode = false;
	if ( isset( $_GET[ 'dev' ] ) && $_GET[ 'dev' ] == '1' ) {
		$isDevMode = true;
	}

?>

<!DOCTYPE html>

<html class="no-js" lang="en"<?php if ( $isDevMode ) echo ' data-dev="'.$isDevMode.'"' ?>>

	<head>
	
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<title>bsx Template</title>

		<!-- fonts preload -->
		<?php include 'template-parts/fonts-preloads.php'; ?>
		<?php
			// make css & js paths using relative path & version
			$currentCssFilePath = $assetsPath . $cssFileName . '?v=' . $cssVersion;
			//$currentVendorJsFilePath = $assetsPath . $vendorJsFileName . '?v=' . $vendorJsVersion;
			//$currentScriptsJsFilePath = $assetsPath . $scriptsJsFileName . '?v=' . $scriptsJsVersion;
			if ( $isDevMode ) {
				$currentCssFilePath = str_replace ( '.min', '' , $currentCssFilePath );
				//$currentVendorJsFilePath = str_replace ( '.min', '' , $currentVendorJsFilePath );
				//$currentScriptsJsFilePath = str_replace ( '.min', '' , $currentScriptsJsFilePath );
			}
		?>
		<!-- css preload -->
		<link rel="preload" href="<?php echo $currentCssFilePath ?>" as="style">
		<?php
		/*
		<!-- TEST – js preload -->
		<link rel="preload" href="<?php echo $currentVendorJsFilePath ?>" as="script">
		<link rel="preload" href="<?php echo $currentScriptsJsFilePath ?>" as="script">
		*/
		?>

		<!-- atf style -->
		<?php include $templatePartsPath . 'atf-style.php'; ?>
		
		<!-- css -->
		<link href="<?php echo $currentCssFilePath ?>" rel="stylesheet">

		<!-- favicons -->
	    <link rel="icon" type="image/png" href="<?php echo $assetsPath ?>img/ci/icon/favicon-16x16.png" sizes="16x16">
	    <link rel="icon" type="image/png" href="<?php echo $assetsPath ?>img/ci/icon/favicon-32x32.png" sizes="32x32">
	    <link rel="icon" type="image/png" href="<?php echo $assetsPath ?>img/ci/icon/favicon-96x96.png" sizes="96x96">

	    <link rel="apple-touch-icon" href="<?php echo $assetsPath ?>img/ci/icon/apple-touch-icon-120x120.png">
	    <link rel="apple-touch-icon" href="<?php echo $assetsPath ?>img/ci/icon/apple-touch-icon-152x152.png" sizes="152x152">
	    <link rel="apple-touch-icon" href="<?php echo $assetsPath ?>img/ci/icon/apple-touch-icon-167x167.png" sizes="167x167">
	    <link rel="apple-touch-icon" href="<?php echo $assetsPath ?>img/ci/icon/apple-touch-icon-180x180.png" sizes="180x180">
		
	</head>
	
	<body>

		<a class="sr-only sr-only-focusable" href="#main">Skip to main content</a>
	
		<div class="wrapper" id="top">

			<?php include 'template-parts/html-header.php'; ?>