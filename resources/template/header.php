<?php 

	// paths

	$rootPath = './../../';
	$resourcesPath = 'resources/';
	$assetsPath = $rootPath.'assets/';


	// include classes file
	include './../classes/include-classes.php';


	// include classes
	if ( class_exists( 'BsxPhotoswipe001' ) ) {
		$BsxPhotoswipe = new BsxPhotoswipe001;
	}


	// logo

	$headerLogoFilePath = $assetsPath.'img/ci/logo/logo.svg';
	$headerLogoAlt = 'Example Logo';
	$headerLogoWidth = 136;
	$headerLogoHeight = 27;

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

		<!-- atf style -->
		<?php include 'template-parts/atf-style.php'; ?>
		
		<!-- css -->
		<link href="<?php echo $assetsPath ?>css/style<?php if ( ! $isDevMode ) { ?>.min<?php } ?>.css" rel="stylesheet">

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