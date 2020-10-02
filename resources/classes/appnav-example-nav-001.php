<?php 

if ( ! class_exists( 'BsxAppNavExampleNav001' ) ) {

	class BsxAppNavExampleNav001 {

	    function printLargeExampleNav() {
	        print('
<ul class="bsx-appnav-navbar-nav bsx-main-navbar-nav" aria-labelledby="toggle-navbar-collapse">
    <li class="bsx-appnav-desktop-hidden">
        <a class="" href="#"><i class="fa fa-home" aria-hidden="true"></i>&nbsp;<span class="sr-only">Home</span></a>
    </li>
	<li class="bsx-appnav-bigmenu-dropdown columns-3">
		<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a0" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Lorem ipsum</a>
		<ul class="" aria-labelledby="navbarDropdownMenuLink-a0">
			<li class="bsx-appnav-back-link">
				<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
			</li>
			<li class="">
				<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a0a" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Aliquam lorem</a>
				<ul class="" aria-labelledby="navbarDropdownMenuLink-a0a">
					<li class="bsx-appnav-back-link">
						<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
					</li>
					<li>
						<a class="" href="#">Ante in</a>
					</li>
					<li class="">
						<a class="" href="#">Dapibus</a>
					</li>
					<li>
						<a class="" href="#">Viverra quis</a>
					</li>
					<li>
						<a class="" href="#">Feugiat a</a>
					</li>
				</ul>
			</li>
			<li class="">
				<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a0b" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Tellus</a>
				<ul class="" aria-labelledby="navbarDropdownMenuLink-a0b">
					<li class="bsx-appnav-back-link">
						<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
					</li>
					<li>
						<a class="" href="#">Enim</a>
					</li>
					<li>
						<a class="" href="#">Eifend ac</a>
					</li>
				</ul>
			</li>
		</ul>
	</li>
	<li class="">
		<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a1" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Dolor sit amet</a>
		<ul class="" aria-labelledby="navbarDropdownMenuLink-a1">
			<li class="bsx-appnav-back-link">
				<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
			</li>
			<li class="">
				<a class="" href="#">Aenean vulputate</a>
			</li>
			<li class="">
				<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a1a" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Eleifend tellus</a>
				<ul class="" aria-labelledby="navbarDropdownMenuLink-a1a">
					<li class="bsx-appnav-back-link">
						<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
					</li>
					<li>
						<a class="" href="#">Aenean leo ligula</a>
					</li>
					<li>
						<a class="" href="#">Orttitor euel</a>
					</li>
					<li>
						<a class="" href="#">Consequat vitae</a>
					</li>
				</ul>
			</li>
		</ul>
	</li>
	<li class="bsx-appnav-bigmenu-dropdown columns-3 active">
		<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a2" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Dictum</a>
		<ul class="" aria-labelledby="navbarDropdownMenuLink-a2">
			<li class="bsx-appnav-back-link">
				<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
			</li>
			<li class="">
				<a class="" href="#">Felis eu pede</a>
			</li>
			<li class="">
				<a class="" href="#">Mollis pretium</a>
			</li>
			<li class="active">
				<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a2a" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Integer tincidunt</a>
				<ul class="" aria-labelledby="navbarDropdownMenuLink-a2a">
					<li class="bsx-appnav-back-link">
						<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
					</li>
					<li>
						<a class="" href="#">Cras dapibus</a>
					</li>
					<li>
						<a class="" href="#">Vivamus</a>
					</li>
				</ul>
			</li>
			<li class="">
				<a class="" href="#">Elementum</a>
			</li>
			<li class="">
				<a class="" href="#">Semper</a>
			</li>
		</ul>
	</li>
	<li class="bsx-appnav-bigmenu-dropdown columns-3">
		<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a3" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Adipiscing</a>
		<ul class="" aria-labelledby="navbarDropdownMenuLink-a3">
			<li class="bsx-appnav-back-link">
				<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
			</li>
			<li class="">
				<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a3a" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Imperdiet a</a>
				<ul class="" aria-labelledby="navbarDropdownMenuLink-a3a">
					<li class="bsx-appnav-back-link">
						<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
					</li>
					<li>
						<a class="" href="#">Venenatis</a>
					</li>
					<li>
						<a class="" href="#">Vitae</a>
					</li>
					<li>
						<a class="" href="#">Justo</a>
					</li>
					<li>
						<a class="" href="#">Nullam</a>
					</li>
				</ul>
			</li>
			<li class="">
				<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a3b" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Rhoncus ut</a>
				<ul class="" aria-labelledby="navbarDropdownMenuLink-a3b">
					<li class="bsx-appnav-back-link">
						<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
					</li>
					<li>
						<a class="" href="#">Arcu</a>
					</li>
					<li>
						<a class="" href="#">In enim justo</a>
					</li>
				</ul>
			</li>
			<li class="">
				<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a3c" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Fringilla vel</a>
				<ul class="" aria-labelledby="navbarDropdownMenuLink-a3c">
					<li class="bsx-appnav-back-link">
						<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
					</li>
					<li>
						<a class="" href="#">Aliquet nec</a>
					</li>
					<li>
						<a class="" href="#">Vulputate</a>
					</li>
					<li>
						<a class="" href="#">Eget</a>
					</li>
				</ul>
			</li>
		</ul>
	</li>
	<li class="">
		<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a5" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Aenean</a>
		<ul class="" aria-labelledby="navbarDropdownMenuLink-a5">
			<li class="bsx-appnav-back-link">
				<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
			</li>
			<li>
				<a class="" href="#">Nulla consequat</a>
			</li>
			<li>
				<a class="" href="#">Pede justo</a>
			</li>
		</ul>
	</li>
	<li class="bsx-appnav-bigmenu-dropdown columns-3">
		<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a4" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Ligula</a>
		<ul class="" aria-labelledby="navbarDropdownMenuLink-a4">
			<li class="bsx-appnav-back-link">
				<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
			</li>
			<li class="">
				<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a4a" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Ultricies nec</a>
				<ul class="" aria-labelledby="navbarDropdownMenuLink-a4a">
					<li class="bsx-appnav-back-link">
						<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
					</li>
					<li>
						<a class="" href="#">Pellentesque</a>
					</li>
					<li>
						<a class="" href="#">Eu pretium quis</a>
					</li>
				</ul>
			</li>
			<li class="">
				<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a4b" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Donec quam felis</a>
				<ul class="" aria-labelledby="navbarDropdownMenuLink-a4b">
					<li class="bsx-appnav-back-link">
						<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
					</li>
					<li>
						<a class="" href="#">Nascetur</a>
					</li>
					<li>
						<a class="" href="#">Ridiculus</a>
					</li>
					<li>
						<a class="" href="#">Mus</a>
					</li>
				</ul>
			</li>
			<li class="">
				<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a4c" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Massa</a>
				<ul class="" aria-labelledby="navbarDropdownMenuLink-a4c">
					<li class="bsx-appnav-back-link">
						<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
					</li>
					<li>
						<a class="" href="#">Et magnis dis</a>
					</li>
					<li>
						<a class="" href="#">Parturient montes</a>
					</li>
				</ul>
			</li>
		</ul>
	</li>
	<li class="">
		<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-a7" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Cum sociis</a>
		<ul class="" aria-labelledby="navbarDropdownMenuLink-a7">
			<li class="bsx-appnav-back-link">
				<a class="" href="#" aria-label="Menüebene schließen" data-label="Zurück" data-fn="dropdown-multilevel-close"></a>
			</li>
			<li class="">
				<a class="" href="#">Natoque penatibus</a>
			</li>
			<li class="">
				<a class="" href="#">Faucibus tincidunt</a>
			</li>
		</ul>
	</li>
</ul>
			');
	    }
	    // /function


	    function printExampleIconNav( $hasSearch = true, $hasLangNav = true ) {
	        print('
<ul class="bsx-appnav-navbar-nav bsx-icon-navbar-nav bsx-allmedia-dropdown-nav">
	<li class="bsx-appnav-bigmenu-dropdown">
		<a class="" id="navbarDropdownMenuLink-b4" href="javascript:void(0);" data-fn="dropdown-multilevel" data-fn-options="'."{ focusOnOpen: '[data-tg=\'header-search-input\']' }".'" aria-haspopup="true" aria-expanded="false"><i class="fa fa-search" aria-hidden="true"></i><span class="sr-only">Suche</span></a>
		<ul class="" aria-labelledby="navbarDropdownMenuLink-b4">
			<li class="bsx-dropdown-item-container">

				<form class="bsx-dropdown-form">
					<label class="sr-only" for="navbarSearchInput">Suchen</label>

					<div class="input-group input-group-lg">
						<input class="form-control" id="navbarSearchInput" type="text" placeholder="Suchbegriff eingeben" data-tg="header-search-input">
						<span class="input-group-append">
							<button class="btn btn-secondary" type="submit"><i class="fa fa-search" aria-hidden="true"></i> <span class="sr-only">Suchen</span></button>
						</span>
					</div>
				</form>
			</li>
		</ul>
	</li>
	<li class="">
		<a class="bsx-appnav-dropdown-toggle" id="navbarDropdownMenuLink-b5" href="javascript:void(0);" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">DE</a>
		<ul class="ul-right" aria-labelledby="navbarDropdownMenuLink-b5">
			<li class="">
				<a class="" href="#">EN</a>
			</li>
		</ul>
	</li>
</ul>
			');
	    }
	    // /function


	    function printBackdrop() {
	        print('
<div class="bsx-appnav-collapse-backdrop" data-fn="remote-event" data-fn-target="#toggle-navbar-collapse" data-tg="dropdown-multilevel-excluded"></div>
			');
	    }
	    // /function


	    function printExampleHeader( $headerConfig = null ) {
	    	print('
<header class="bsx-appnav-navbar bsx-appnav-fixed-top" data-fn="anchor-offset-elem" data-tg="sticky-container-below">

	<nav class="bsx-appnav-navbar-container">

		<button class="bsx-appnav-navbar-toggler" id="toggle-navbar-collapse" type="button" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation" data-fn="toggle" data-fn-target="[data-tg=\'navbar-collapse\']" data-tg="dropdown-multilevel-excluded">
			<span class="sr-only">Menu</span>
			<i class="fa fa-navicon" aria-hidden="true"></i>
		</button>

		<a class="bsx-appnav-navbar-brand" href="#">
			<img src="'.$headerConfig["logo"]["filePath"].'" alt="'.$headerConfig["logo"]["alt"].'" width="'.$headerConfig["logo"]["width"].'" height="'.$headerConfig["logo"]["height"].'">
		</a>

		<!--

		TODO: mark current nav item for sr
			<span class="sr-only">(current)</span>

		-->

		<div class="bsx-appnav-navbar-collapse" id="navbarNavDropdown" data-tg="navbar-collapse">
			'); 
			
			$this->printLargeExampleNav();

	        print('
		</div>

		<div class="bsx-appnav-collapse-backdrop" data-fn="remote-event" data-fn-target="#toggle-navbar-collapse" data-tg="dropdown-multilevel-excluded"></div>
			'); 

			$this->printExampleIconNav();

	        print('
	</nav>

</header>
	    	');
	    }
	    // /function

	}
	// /class

}
// /if