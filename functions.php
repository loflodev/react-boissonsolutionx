<?php
// Functions.php

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
    ]);
});

// One-time migration: older submissions were saved as public posts.
add_action('admin_init', function () {
    if (get_option('contact_messages_migrated')) {
        return;
    }

    $legacy = get_posts([
        'post_type' => 'post',
        'post_status' => 'any',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'meta_key' => '_contact_form_submission',
    ]);

    foreach ($legacy as $post_id) {
        wp_update_post([
            'ID' => $post_id,
            'post_type' => 'contact_message',
            'post_status' => 'private',
        ]);
    }

    update_option('contact_messages_migrated', 1);
});

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

            // Rate limit: 5 submissions per 10 minutes per IP
            $ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? 'unknown');
            $rate_key = 'contact_rate_' . md5($ip);
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
            
            // Extract data from content
            $content = $input['content'];
            $name = '';
            $email = '';
            $message = '';
            
            if (preg_match('/Name:\s*([^\n]+)/', $content, $matches)) {
                $name = trim($matches[1]);
                update_post_meta($post_id, '_contact_form_name', $name);
            }
            
            if (preg_match('/Email:\s*([^\n]+)/', $content, $matches)) {
                $email = trim($matches[1]);
                update_post_meta($post_id, '_contact_form_email', $email);
            }
            
            if (preg_match('/Message:\s*(.+)/s', $content, $matches)) {
                $message = trim($matches[1]);
            }
            
            // Mark as contact form submission
            update_post_meta($post_id, '_contact_form_submission', true);
            
            // If Contact Form 7 is active, try to send the email
            if (class_exists('WPCF7')) {
                // Use the form the frontend asked for (VITE_CONTACT_FORM_ID)
                $contact_form = boissonsx_find_contact_form($input['formId'] ?? '');

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
        'your-name'    => $name ?: 'Test Name',
        'your-email'   => $email ?: 'test@email.com',
        'your-message' => $message ?: 'Message body',
        '_wpcf7'       => $contact_form->id(),
        '_wpcf7_version' => defined('WPCF7_VERSION') ? WPCF7_VERSION : '5.8',
        '_wpcf7_locale' => get_locale(),
        '_wpcf7_unit_tag' => 'wpcf7-fake-unit-tag',
        '_wpcf7_container_post' => 0,
    ];

    // Submit the form
    $contact_form->submit();

    // Restore the original $_POST
    $_POST = $original_post;
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