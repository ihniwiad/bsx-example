<?php 

	// prepare footer config 
	$footerConfig = array(
		logo => array(
			filePath => $footerLogoFilePath,
			alt => $footerLogoAlt,
			width => $footerLogoWidth,
			height => $footerLogoHeight
		)
	);

	// print footer
	if ( class_exists( 'BsxBasicFooterExampleFooter001' ) ) {
		$BsxFooter = new BsxBasicFooterExampleFooter001;
		if ( method_exists( $BsxFooter, 'printExampleFooter' ) ) {
			$BsxFooter->printExampleFooter( $footerConfig );
		}
	}

	/*

			<!-- FOOTER -->

			<footer class="page-footer" data-tg="sticky-container-above">

				<hr>

				<div class="container">

					<div class="text-center my-4">
						<a href="#"><?php // class="footer-grayscale-logo" ?>
							<img src="<?php echo $footerLogoFilePath ?>" alt="<?php echo $footerLogoAlt ?>" width="<?php echo $footerLogoWidth ?>" height="<?php echo $footerLogoHeight ?>">
						</a>
					</div>

					<div class="row">

						<div class="col-6 col-md-3">
							<div>
								<strong>Amet orci</strong>
							</div>
							<hr class="my-1">
							<ul class="list-unstyled">
								<li>
									<a class="footer-link" href="#">Eget eros</a>
								</li>
								<li>
									<a class="footer-link" href="#">Faucibus</a>
								</li>
								<li>
									<a class="footer-link" href="#">Tincidunt</a>
								</li>
								<li>
									<a class="footer-link" href="#">Duis leo</a>
								</li>
							</ul>
						</div>

						<div class="col-6 col-md-3">
							<div>
								<strong>Sed fringilla</strong>
							</div>
							<hr class="my-1">
							<ul class="list-unstyled">
								<li>
									<a class="footer-link" href="#">Mauris sit </a>
								</li>
								<li>
									<a class="footer-link" href="#">Amet nibh</a>
								</li>
								<li>
									<a class="footer-link" href="#">Donec sodales</a>
								</li>
								<li>
									<a class="footer-link" href="#">Sagittis magna</a>
								</li>
							</ul>
						</div>

						<div class="col-6 col-md-3">
							<div>
								<strong>Consequat</strong>
							</div>
							<hr class="my-1">
							<ul class="list-unstyled">
								<li>
									<a class="footer-link" href="#">Leo eget</a>
								</li>
								<li>
									<a class="footer-link" href="#">Bibendum sodales</a>
								</li>
								<li>
									<a class="footer-link" href="#">Augue velit</a>
								</li>
							</ul>
						</div>

						<div class="col-6 col-md-3">
							<div>
								<strong>Cursus nunc</strong>
							</div>
							<hr class="my-1">
							<ul class="list-unstyled">
								<li>
									<a class="footer-link" href="#">Aenean commodo</a>
								</li>
								<li>
									<a class="footer-link" href="#">Ligula eget </a>
								</li>
								<li>
									<a class="footer-link" href="#">Dolor</a>
								</li>
								<li>
									<a class="footer-link" href="#">Aenean massa. </a>
								</li>
								<li>
									<a class="footer-link" href="#">Cum sociis</a>
								</li>
							</ul>
						</div>

					</div>

					<div class="social-list text-center">
						<ul class="list-inline mb-0">
							<li class="list-inline-item">
								<a class="footer-icon-link hover-text-facebook" href="#" target="_blank"><i class="fa fa-facebook"></i><span class="sr-only">Facebook</span></a>
							</li>
							<li class="list-inline-item">
								<a class="footer-icon-link hover-text-twitter" href="#" target="_blank"><i class="fa fa-twitter"></i><span class="sr-only">Twitter</span></a>
							</li>
							<li class="list-inline-item">
								<a class="footer-icon-link hover-text-instagram" href="#" target="_blank"><i class="fa fa-instagram"></i><span class="sr-only">Instagram</span></a>
							</li>
							<li class="list-inline-item">
								<a class="footer-icon-link hover-text-google-plus" href="#" target="_blank"><i class="fa fa-google-plus"></i><span class="sr-only">Google plus</span></a>
							</li>
							<li class="list-inline-item">
								<a class="footer-icon-link hover-text-xing" href="#" target="_blank"><i class="fa fa-xing"></i><span class="sr-only">Xing</span></a>
							</li>
						</ul>
					</div>

					<hr class="my-2">

					<div class="row small">
						<div class="col-sm">
							&copy; Copyright <?php echo date_format( date_create(), 'Y' ); ?> <a class="footer-link" href="#">somebody</a>
						</div>
						<nav class="col-sm text-right">
							<a class="footer-link" href="#">Some</a>&ensp;|&ensp;<a class="footer-link" href="#">More</a>&ensp;|&ensp;<a class="footer-link" href="#">Links</a>
						</nav>
					</div>

				</div>
				
			</footer>

	*/

?>