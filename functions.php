<?php
// Functions.php
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
                'description' => 'The status of the contact message',
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
                    return \WPGraphQL\Data\DataSource::resolve_post_object($payload['id'], $payload['context']);
                }
            ],
        ],
        'mutateAndGetPayload' => function($input, $context, $info) {
            // Validate required fields
            if (empty($input['title']) || empty($input['content'])) {
                throw new \GraphQL\Error\UserError('The title and content fields are required.');
            }

            // Set default status if not provided
            $status = !empty($input['status']) ? sanitize_text_field($input['status']) : 'publish';
            
            // Create a post to store the submission
            $post_args = [
                'post_type' => 'post', // Using standard post type for compatibility
                'post_title' => sanitize_text_field($input['title']),
                'post_content' => wp_kses_post($input['content']),
                'post_status' => $status,
            ];
            
            // Insert the post
            $post_id = wp_insert_post($post_args);
            
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
                // Try to find the form by title first
                $forms = WPCF7_ContactForm::find();
                $contact_form = null;
                
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
                'clientMutationId' => $input['clientMutationId'],
                'context' => $context,
            ];
        }
    ]);

    register_graphql_mutation('createSubmission', [
        'inputFields' => [
            'fullName' => [
                'type' => 'String',
                'description' => 'User Full Name',
            ],
            'email' => [
                'type' => 'String',
                'description' => 'User Email',
            ],
            'message' => [
                'type' => 'String',
                'description' => 'User Message',
            ],
        ],
        'outputFields' => [
            'success' => [
                'type' => 'Boolean',
                'description' => 'Whether or not data was stored successfully',
                'resolve' => function ($payload, $args, $context, $info) {
                    return isset($payload['success']) ? $payload['success'] : null;
                }
            ],
            'data' => [
                'type' => 'String',
                'description' => 'Payload of submitted fields',
                'resolve' => function ($payload, $args, $context, $info) {
                    return isset($payload['data']) ? $payload['data'] : null;
                }
            ]
        ],
        'mutateAndGetPayload' => function ($input, $context, $info) {

            if (!class_exists('ACF')) return [
                'success' => false,
                'data' => 'ACF is not installed'
            ];

            $sanitized_data = [];
            $errors = [];
            $acceptable_fields = [
                'fullName' => 'field_688f812fcee10',
                'email' => 'field_688f8161cee11',
                'message' => 'field_688f8172cee12',
            ];

            foreach ($acceptable_fields as $field_key => $acf_key) {
                if (!empty($input[$field_key])) {
                    $sanitized_data[$field_key] = sanitize_text_field($input[$field_key]);
                } else {
                    $errors[] = $field_key . ' was not filled out.';
                }
            }

            if (!empty($errors)) return [
                'success' => false,
                'data' => $errors
            ];

            $form_submission = wp_insert_post([
                'post_type' => 'form_submission',
                'post_title' => $sanitized_data['fullName'],
            ], true);

            if (is_wp_error($form_submission)) return [
                'success' => false,
                'data' => $form_submission->get_error_message()
            ];

            foreach ($acceptable_fields as $field_key => $acf_key) {
                update_field($acf_key, $sanitized_data[$field_key], $form_submission);
            }

            return [
                'success' => true,
                'data' => json_encode($sanitized_data)
            ];
        }
    ]);
});