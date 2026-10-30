<?php
// Load the WordPress stand-ins, then the real functions.php, and run the hooks
// that register the post type and the GraphQL schema once for all tests.

require dirname(__DIR__, 2) . '/vendor/autoload.php';
require __DIR__ . '/stubs/graphql.php';
require __DIR__ . '/stubs/wordpress.php';
require dirname(__DIR__, 2) . '/functions.php';

WpState::fire('init');
WpState::fire('graphql_register_types');
