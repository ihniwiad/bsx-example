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
			// js paths using relative path & version
			$currentVendorJsFilePath = $assetsPath . $vendorJsFileName . '?v=' . $vendorJsVersion;
			$currentScriptsJsFilePath = $assetsPath . $scriptsJsFileName . '?v=' . $scriptsJsVersion;
			if ( $isDevMode ) {
				$currentVendorJsFilePath = str_replace ( '.min', '' , $currentVendorJsFilePath );
				$currentScriptsJsFilePath = str_replace ( '.min', '' , $currentScriptsJsFilePath );
			}
		?>
		<script src="<?php echo $currentVendorJsFilePath ?>" defer></script>
		<script src="<?php echo $currentScriptsJsFilePath ?>" defer></script>
		
	</body>
	
</html>