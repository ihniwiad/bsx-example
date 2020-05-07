<?php 

class TestClass {

    var $var1;
    var $var2 = "constant string";

    function testFunction( $arg1, $arg2 ) {
        echo '<!-- TEST :) – '.$arg1.' – '.$arg2.' -->';
    }
}