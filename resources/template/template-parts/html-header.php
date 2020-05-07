<?php 

	// prepare header config 
	$headerConfig = array(
		logo => array(
			filePath => $headerLogoFilePath,
			alt => $headerLogoAlt,
			width => $headerLogoWidth,
			height => $headerLogoHeight
		)
	);

	// print header
	if ( class_exists( 'BsxAppNavExampleNav001' ) ) {
		$BsxAppNavigation = new BsxAppNavExampleNav001;
		if ( method_exists( $BsxAppNavigation, 'printExampleHeader' ) ) {
			$BsxAppNavigation->printExampleHeader( $headerConfig );
		}
	}

	/*

			<header class="bsx-appnav-navbar bsx-appnav-fixed-top" data-fn="anchor-offset-elem" data-tg="sticky-container-below">

				<nav class="bsx-appnav-navbar-container">

					<button class="bsx-appnav-navbar-toggler" id="toggle-navbar-collapse" type="button" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation" data-fn="toggle" data-fn-target="[data-tg='navbar-collapse']" data-tg="dropdown-multilevel-excluded">
						<span class="sr-only">Menu</span>
						<i class="fa fa-navicon" aria-hidden="true"></i>
					</button>

					<a class="bsx-appnav-navbar-brand" href="#">
						<img src="<?php echo $headerLogoFilePath ?>" alt="<?php echo $headerLogoAlt ?>" width="<?php echo $headerLogoWidth ?>" height="<?php echo $headerLogoHeight ?>">
					</a>

					<!--

					TODO: mark current nav item for sr
						<span class="sr-only">(current)</span>

					-->

					<div class="bsx-appnav-navbar-collapse" id="navbarNavDropdown" data-tg="navbar-collapse">

						<?php 
							if ( class_exists( 'BsxAppNavExampleNav001' ) ) {
								$BsxAppNavigation = new BsxAppNavExampleNav001;
								if ( method_exists( $BsxAppNavigation, 'printLargeExampleNav' ) ) {
									$BsxAppNavigation->printLargeExampleNav();
								}
							}
						?>

					</div>

					<div class="bsx-appnav-collapse-backdrop" data-fn="remote-event" data-fn-target="#toggle-navbar-collapse" data-tg="dropdown-multilevel-excluded"></div>

					<?php 
						if ( class_exists( 'BsxAppNavExampleNav001' ) ) {
							$BsxAppNavigation = new BsxAppNavExampleNav001;
							if ( method_exists( $BsxAppNavigation, 'printExampleIconNav' ) ) {
								$BsxAppNavigation->printExampleIconNav();
							}
						}
					?>

				</nav>
			
			</header>
			
	*/
?>


