<?php
// Functions.php

// Longest contact title and content accepted (the form caps name, email and
// message well under these)
const BOISSONSX_MAX_TITLE = 200;
const BOISSONSX_MAX_CONTENT = 5000;

// Private storage for contact form submissions (never shown on the public site).
add_action('init', function () {
    register_post_type('contact_message', [
        'label' => 'Contact messages',
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => false,
        'exclude_from_search' => true,
        'publicly_queryable' => false,
        'supports' => ['title', 'editor', 'custom-fields'],
        'menu_icon' => 'dashicons-email',
        // Visitor PII: administrators only (editors keep their post rights)
        'map_meta_cap' => true,
        'capabilities' => [
            'create_posts' => 'do_not_allow',
            'edit_posts' => 'manage_options',
            'edit_others_posts' => 'manage_options',
            'edit_private_posts' => 'manage_options',
            'edit_published_posts' => 'manage_options',
            'read_private_posts' => 'manage_options',
            'delete_posts' => 'manage_options',
            'delete_others_posts' => 'manage_options',
            'delete_private_posts' => 'manage_options',
            'delete_published_posts' => 'manage_options',
            'publish_posts' => 'manage_options',
            'read' => 'manage_options',
        ],
    ]);
});

// Legacy submissions saved as public posts by the old mutation
function boissonsx_legacy_contact_posts() {
    return get_posts([
        'post_type' => 'post',
        'post_status' => 'any',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'meta_key' => '_contact_form_submission',
    ]);
}

// One-time migration: older submissions were saved as public posts.
// Marked done only once none are left, so a failed update is retried.
add_action('admin_init', function () {
    if (get_option('contact_messages_migrated')) {
        return;
    }

    foreach (boissonsx_legacy_contact_posts() as $post_id) {
        wp_update_post([
            'ID' => $post_id,
            'post_type' => 'contact_message',
            'post_status' => 'private',
        ], true);
    }

    if (!boissonsx_legacy_contact_posts()) {
        update_option('contact_messages_migrated', 1);
    }
});

// Client IP for the rate limit. Behind a reverse proxy listed in
// BOISSONSX_TRUSTED_PROXIES, the visitor is the right-most untrusted
// X-Forwarded-For hop. IPv6 is keyed by /64, what one host usually holds.
function boissonsx_client_ip() {
    $default = defined('BOISSONSX_TRUSTED_PROXIES') ? BOISSONSX_TRUSTED_PROXIES : [];
    $trusted = (array) apply_filters('boissonsx_trusted_proxies', $default);
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');

    if ($trusted && in_array($ip, $trusted, true) && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $hops = array_reverse(array_map('trim', explode(',', (string) $_SERVER['HTTP_X_FORWARDED_FOR'])));
        foreach ($hops as $hop) {
            if (!in_array($hop, $trusted, true)) {
                $ip = $hop;
                break;
            }
        }
    }

    if (!filter_var($ip, FILTER_VALIDATE_IP)) {
        return 'unknown';
    }
    $packed = inet_pton($ip);
    if (strlen($packed) === 16) {
        return inet_ntop(substr($packed, 0, 8) . str_repeat("\0", 8)) . '/64';
    }
    return $ip;
}

// The Contact Form 7 form that sends the notification email. A form pinned in
// wp-config (BOISSONSX_CONTACT_FORM_ID) wins over the one the client names.
function boissonsx_contact_form_id($requested) {
    $pinned = defined('BOISSONSX_CONTACT_FORM_ID') ? (string) BOISSONSX_CONTACT_FORM_ID : '';
    $pinned = (string) apply_filters('boissonsx_contact_form_id', $pinned);
    return $pinned !== '' ? $pinned : (string) $requested;
}

// Resolve a Contact Form 7 form from its hash id ("cddc821", CF7 5.8+) or numeric post id.
function boissonsx_find_contact_form($form_id) {
    $form_id = sanitize_text_field((string) $form_id);
    if ($form_id === '' || !class_exists('WPCF7_ContactForm')) {
        return null;
    }

    if (function_exists('wpcf7_get_contact_form_by_hash')) {
        $form = wpcf7_get_contact_form_by_hash($form_id);
        if ($form) {
            return $form;
        }
    }

    if (ctype_digit($form_id)) {
        return wpcf7_contact_form((int) $form_id);
    }

    return null;
}

add_action('graphql_register_types', function () {

    register_graphql_object_type('ContactMessage', [
    'description' => 'Contact message submitted through a form',
    'fields' => [
        'id' => [
            'type' => 'ID',
            'description' => 'The global ID of the contact message',
        ],
        'title' => [
            'type' => 'String',
            'description' => 'The title of the contact message',
            'resolve' => function($post) {
                $id = is_object($post) ? $post->ID : (is_array($post) && isset($post['ID']) ? $post['ID'] : null);
                return $id ? get_the_title($id) : null;
            }
        ],
        'content' => [
            'type' => 'String',
            'description' => 'The content of the contact message',
            'resolve' => function($post) {
                if (is_object($post) && isset($post->post_content)) {
                    return $post->post_content;
                }
                if (is_array($post) && isset($post['post_content'])) {
                    return $post['post_content'];
                }
                // Try to fetch post object if possible
                $id = is_object($post) ? $post->ID : (is_array($post) && isset($post['ID']) ? $post['ID'] : null);
                if ($id) {
                    $wp_post = get_post($id);
                    if ($wp_post && isset($wp_post->post_content)) {
                        return $wp_post->post_content;
                    }
                }
                return null;
            }
        ],
        'status' => [
            'type' => 'String',
            'description' => 'The status of the contact message',
            'resolve' => function($post) {
                $id = is_object($post) ? $post->ID : (is_array($post) && isset($post['ID']) ? $post['ID'] : null);
                return $id ? get_post_status($id) : null;
            }
        ],
    ],
]);

    register_graphql_mutation('createContactMessage', [
        'inputFields' => [
            'clientMutationId' => [
                'type' => 'String',
                'description' => 'A unique identifier for the client performing the mutation',
            ],
            'title' => [
                'type' => 'String',
                'description' => 'The title of the contact message',
            ],
            'content' => [
                'type' => 'String',
                'description' => 'The content of the contact message containing name, email and message',
            ],
            'status' => [
                'type' => 'String',
                'description' => 'Ignored. Messages are always stored as private.',
            ],
            'website' => [
                'type' => 'String',
                'description' => 'Honeypot field. Must stay empty.',
            ],
            'formId' => [
                'type' => 'String',
                'description' => 'Contact Form 7 form used to send the notification email: hash id (e.g. "cddc821") or numeric post id.',
            ],
        ],
        'outputFields' => [
            'clientMutationId' => [
                'type' => 'String',
                'description' => 'The same string that was provided as clientMutationId in the mutation input',
                'resolve' => function($payload) {
                    return $payload['clientMutationId'];
                }
            ],
            'contactMessage' => [
                'type' => 'ContactMessage',
                'description' => 'The contact message that was created',
                'resolve' => function($payload) {
                    return !empty($payload['id']) ? get_post($payload['id']) : null;
                }
            ],
        ],
        'mutateAndGetPayload' => function($input, $context, $info) {
            // Validate required fields
            if (empty($input['title']) || empty($input['content'])) {
                throw new \GraphQL\Error\UserError('The title and content fields are required.');
            }

            // Honeypot: bots fill every field. Pretend success, store nothing.
            if (!empty($input['website'])) {
                return [
                    'id' => 0,
                    'clientMutationId' => $input['clientMutationId'] ?? null,
                    'context' => $context,
                ];
            }

            // Size caps before anything is counted or stored
            if (mb_strlen($input['title']) > BOISSONSX_MAX_TITLE || mb_strlen($input['content']) > BOISSONSX_MAX_CONTENT) {
                throw new \GraphQL\Error\UserError('The message is too long.');
            }

            // Rate limit: 5 submissions per 10 minutes per client
            $rate_key = 'contact_rate_' . md5(boissonsx_client_ip());
            $attempts = (int) get_transient($rate_key);
            if ($attempts >= 5) {
                throw new \GraphQL\Error\UserError('Too many messages. Please try again later.');
            }
            set_transient($rate_key, $attempts + 1, 10 * MINUTE_IN_SECONDS);

            // Store the submission privately; the client never chooses the status
            $post_args = [
                'post_type' => 'contact_message',
                'post_title' => sanitize_text_field($input['title']),
                'post_content' => wp_kses_post($input['content']),
                'post_status' => 'private',
            ];
            
            // Insert the post. Without `true`, a failure returns 0 instead of a
            // WP_Error and would be reported to the visitor as a success
            $post_id = wp_insert_post($post_args, true);
            
            if (is_wp_error($post_id)) {
                throw new \GraphQL\Error\UserError($post_id->get_error_message());
            }
            
            // Extract the sender from the content. Single-line, bounded captures
            // keep CR/LF out of the name and email that end up in mail headers
            $content = $input['content'];
            $name = '';
            $email = '';
            $message = '';

            if (preg_match('/Name:[ \t]*([^\r\n]{1,100})/', $content, $matches)) {
                $name = sanitize_text_field($matches[1]);
                update_post_meta($post_id, '_contact_form_name', $name);
            }

            if (preg_match('/Email:[ \t]*([^\r\n]{1,254})/', $content, $matches)) {
                $candidate = sanitize_email(trim($matches[1]));
                if (is_email($candidate)) {
                    $email = $candidate;
                    update_post_meta($post_id, '_contact_form_email', $email);
                }
            }

            if (preg_match('/Message:\s*(.+)/s', $content, $matches)) {
                $message = sanitize_textarea_field($matches[1]);
            }

            // Mark as contact form submission
            update_post_meta($post_id, '_contact_form_submission', true);

            // If Contact Form 7 is active, email the message. Without a valid
            // sender the message stays saved for the admin, but no mail is sent
            if (class_exists('WPCF7') && $name !== '' && $email !== '') {
                // The pinned form, else the one the frontend asked for (VITE_CONTACT_FORM_ID)
                $contact_form = boissonsx_find_contact_form(boissonsx_contact_form_id($input['formId'] ?? ''));

                // Otherwise fall back to the form titled "Contact form 1"
                $forms = $contact_form ? [] : WPCF7_ContactForm::find();

                foreach ($forms as $form) {
                    if ($form->title() === 'Contact form 1') {
                        $contact_form = $form;
                        break;
                    }
                }
                
                // If not found by title, try the first form
                if (!$contact_form && !empty($forms)) {
                    $contact_form = $forms[0];
                }
                
                // If we found a form, submit it
                if ($contact_form) {
                    // Backup the original $_POST
                    $original_post = $_POST;

                    // Simulate a real form submission by setting $_POST
                    $_POST = [
                        'your-name'    => $name,
                        'your-email'   => $email,
                        'your-message' => $message,
                        '_wpcf7'       => $contact_form->id(),
                        '_wpcf7_version' => defined('WPCF7_VERSION') ? WPCF7_VERSION : '5.8',
                        '_wpcf7_locale' => get_locale(),
                        '_wpcf7_unit_tag' => 'wpcf7-fake-unit-tag',
                        '_wpcf7_container_post' => 0,
                    ];

                    $result = $contact_form->submit();

                    // Restore the original $_POST
                    $_POST = $original_post;

                    // The message is saved either way; record whether the mail
                    // went out so a failure shows up in the admin
                    $status = is_array($result) && isset($result['status']) ? $result['status'] : 'unknown';
                    update_post_meta($post_id, '_contact_form_mail_status', sanitize_text_field((string) $status));
                }
            }
            
            // Return the payload
            return [
                'id' => $post_id,
                'clientMutationId' => $input['clientMutationId'] ?? null,
                'context' => $context,
            ];
        }
    ]);
});