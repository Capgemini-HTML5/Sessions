<?php

	// Simple proxy class to circumvent the Cross-Domain-Policy of browsers

	$postdata = http_build_query(
		$_POST
	);

	$opts = array('http' =>
		array(
			'method'  => 'POST',
			'header'  => 'Content-type: application/x-www-form-urlencoded',
			'content' => $postdata
		)
	);

	$context  = stream_context_create($opts);

	$result = file_get_contents($_GET["url"], false, $context);
	
	echo $result;

?>