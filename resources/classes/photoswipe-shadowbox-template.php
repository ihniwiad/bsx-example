<?php 

if ( ! class_exists( 'BsxPhotoswipe001' ) ) {

    class BsxPhotoswipe001 {

        function printExampleGallery( $assetsPath = '' ) {

            $fileExtension = '.jpg';
            $thumbSuffix = '-thumb';
            $galleryData = array(
                array(
                    srcTrunc => $assetsPath."example-img/example-img-001-1400x933",
                    size => "1400x933",
                    thumbWidth => 263,
                    thumbHeight => 175,
                    caption => "Lorem ipsum dolor sit amet"
                ),
                array(
                    srcTrunc => $assetsPath."example-img/example-img-002-1400x933",
                    size => "1400x933",
                    thumbWidth => 263,
                    thumbHeight => 175,
                    caption => "Consectetuer adipiscing elit"
                ),
                array(
                    srcTrunc => $assetsPath."example-img/example-img-003-1400x933",
                    size => "1400x933",
                    thumbWidth => 263,
                    thumbHeight => 175,
                    caption => "Aenean commodo ligula eget dolor"
                ),
                array(
                    srcTrunc => $assetsPath."example-img/example-img-004-1400x933",
                    size => "1400x933",
                    thumbWidth => 263,
                    thumbHeight => 175,
                    caption => "Aenean massa. Cum sociis natoque penatibus"
                ),
                array(
                    srcTrunc => $assetsPath."example-img/example-img-005-1400x933",
                    size => "1400x933",
                    thumbWidth => 263,
                    thumbHeight => 175,
                    caption => "Et magnis dis parturient montes"
                ),
                array(
                    srcTrunc => $assetsPath."example-img/example-img-006-1400x933",
                    size => "1400x933",
                    thumbWidth => 263,
                    thumbHeight => 175,
                    caption => "Nascetur ridiculus mus"
                ),
                array(
                    srcTrunc => $assetsPath."example-img/example-img-007-1400x933",
                    size => "1400x933",
                    thumbWidth => 263,
                    thumbHeight => 175,
                    caption => "Donec quam felis, ultricies nec"
                ),
                array(
                    srcTrunc => $assetsPath."example-img/example-img-008-1400x933",
                    size => "1400x933",
                    thumbWidth => 263,
                    thumbHeight => 175,
                    caption => "Pellentesque eu, pretium quis"
                ),
                array(
                    srcTrunc => $assetsPath."example-img/example-img-009-1400x933",
                    size => "1400x933",
                    thumbWidth => 263,
                    thumbHeight => 175,
                    caption => "Nulla consequat massa quis enim. Donec pede justo"
                ),
                array(
                    srcTrunc => $assetsPath."example-img/example-img-010-1400x933",
                    size => "1400x933",
                    thumbWidth => 263,
                    thumbHeight => 175,
                    caption => "Fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo"
                )
            );

            print('
<div class="my-gallery" itemscope itemtype="http://schema.org/ImageGallery" data-fn="photoswipe">
    <div class="row">
            ');

            foreach( $galleryData as $item ) {
                print('
<figure class="col-6 col-sm-3 mb-4" itemprop="associatedMedia" itemscope itemtype="http://schema.org/ImageObject">
    <a class="d-block text-center" href="'.$item[ 'srcTrunc' ].$fileExtension.'" itemprop="contentUrl" data-size="'.$item[ 'size' ].'">
        <script>document.write(\'<img class="img-fluid" src="" itemprop="thumbnail" alt="'.$item[ 'caption' ].'" width="'.$item[ 'width' ].'" height="'.$item[ 'height' ].'" data-fn="lazyload" data-src="'.$item[ 'srcTrunc' ].$thumbSuffix.$fileExtension.'">\');</script>
        <noscript><img class="img-fluid" src="'.$item[ 'srcTrunc' ].$thumbSuffix.$fileExtension.'" itemprop="thumbnail" alt="'.$item->caption.'"></noscript>
    </a>
    <figcaption class="sr-only" itemprop="caption description">'.$item[ 'caption' ].'</figcaption>
</figure>
                ');
            }
            
            print('
    </div>
</div>
            ');

        }
        // /function


        function printPhotoswipeShadowboxTemplate() {
            print('
<!-- PHOTOSWIPE SHADOWBOX TEMPLATE -->

<!-- Root element of PhotoSwipe. Must have class pswp. -->
<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
    <!-- Background of PhotoSwipe. 
         It’s a separate element as animating opacity is faster than rgba(). -->
    <div class="pswp__bg"></div>
    <!-- Slides wrapper with overflow:hidden. -->
    <div class="pswp__scroll-wrap">
        <!-- Container that holds slides. 
            PhotoSwipe keeps only 3 of them in the DOM to save memory.
            Don’t modify these 3 pswp__item elements, data is added later on. -->
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
            ');
        }
        // /function

    }
    // /class

}
// /if