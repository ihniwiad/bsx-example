			<?php include 'template-parts/html-footer.php'; ?>

			<div class="to-top-wrapper" data-fn="to-top-wrapper">
				<a class="btn btn-secondary btn-only-icon" href="#top"><i class="fa fa-arrow-up" aria-hidden="true"></i><span class="sr-only"></span></a>
			</div>
		
		</div>

		<?php 
			// photoswipe shadowbox template

			if ( method_exists( $BsxPhotoswipe, 'printPhotoswipeShadowboxTemplate' ) ) {
				$BsxPhotoswipe->printPhotoswipeShadowboxTemplate();
			}

		?>
		
		<?php
			// vendor js file version
			$vendorJsFilePath = $rootRelatedAssetsPath . 'js/vendor.min.js';
			$vendorJsVersion = file_exists( $vendorJsFilePath ) ? filemtime( $vendorJsFilePath ) : 'null';

			// scripts js file version
			$scriptsJsFilePath = $rootRelatedAssetsPath . 'js/scripts.min.js';
			$scriptsJsVersion = file_exists( $scriptsJsFilePath ) ? filemtime( $scriptsJsFilePath ) : 'null';
		?>
		<script src="<?php echo $assetsPath ?>js/vendor<?php if ( ! $isDevMode ) { ?>.min<?php } ?>.js?v=<?php echo $vendorJsVersion ?>" defer></script>
		<script src="<?php echo $assetsPath ?>js/scripts<?php if ( ! $isDevMode ) { ?>.min<?php } ?>.js?v=<?php echo $scriptsJsVersion ?>" defer></script>
		
	</body>
	
</html>