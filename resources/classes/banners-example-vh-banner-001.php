<?php 

if ( ! class_exists( 'BsxBannersExampleVhBanner001' ) ) {

	class BsxBannersExampleVhBanner001 {

	    function printExampleVhBanner001( $assetsPath = '', $size = 2, $imgIndex = '007', $text = 'Lorem ipsum' ) {
	        print('
<div class="below-navbar-content d-flex align-items-center bg-fixed bg-cover banner-vh-' . $size . ' bg-c25" style="background-image: url(\'' . $assetsPath . 'example-img/example-banner-' . $imgIndex . '-lr.jpg\');" data-fn="lazyload" data-src="' . $assetsPath . 'example-img/example-banner-' . $imgIndex . '.jpg">

	<div class="banner-inner">

		<div class="container py-4">

			<h1 class="display-1 text-white text-shadow-darker">' . $text . '</h1>
			
		</div>

	</div>

</div>
			');
	    }
	    // /function

	}
	// /class

}
// /if