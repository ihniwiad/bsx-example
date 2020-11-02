<?php 
	// template part of bsx-example including fonts preloads

	// NOTE: Pay attention to the order of included fonts since is important to pagespeed (check components order and components content). Do not include fonts which are not in use.

	// NOTE: The following line will be used by gulpfile as template.

	// ###TEMPLATE_BEGIN###<link rel="preload" href="' . $assetsPath . '###HREF###" as="font" type="font/###TYPE###" crossorigin>###TEMPLATE_END###

	print('
<link rel="preload" href="' . $assetsPath . 'fonts/font-awesome/fontawesome-webfont.woff2?v=4.5.0" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="' . $assetsPath . 'fonts/roboto/Roboto-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="' . $assetsPath . 'fonts/roboto/Roboto-Light.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="' . $assetsPath . 'fonts/roboto/Roboto-Medium.woff2" as="font" type="font/woff2" crossorigin>

	');