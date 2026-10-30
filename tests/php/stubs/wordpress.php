<?php
// Minimal in-memory stand-ins for the WordPress, WPGraphQL and Contact Form 7
// APIs that functions.php calls. Each records what it was given in
// WpState so tests can assert on it; WpState::reset() starts a test clean.

const MINUTE_IN_SECONDS = 60;

final class WpState
{
    /** @var array<string, list<callable>> */
    public static array $actions = [];
    /** @var array<string, array<string, mixed>> */
    public static array $postTypes = [];
    /** @var array<string, array<string, mixed>> */
    public static array $graphqlTypes = [];
    /** @var array<string, array<string, mixed>> */
    public static array $graphqlMutations = [];
    /** @var array<int, object> */
    public static array $posts = [];
    /** @var array<int, array<string, mixed>> */
    public static array $meta = [];
    /** @var array<string, mixed> */
    public static array $options = [];
    /** @var array<string, array{value: mixed, ttl: int}> */
    public static array $transients = [];
    /** @var array<string, mixed> Value each filter returns instead of its default */
    public static array $filters = [];
    /** @var list<int> Posts wp_update_post fails to update */
    public static array $failUpdateIds = [];
    public static ?WP_Error $nextInsertError = null;
    public static int $nextId = 100;

    public static function reset(): void
    {
        self::$posts = [];
        self::$meta = [];
        self::$options = [];
        self::$transients = [];
        self::$filters = [];
        self::$failUpdateIds = [];
        self::$nextInsertError = null;
        self::$nextId = 100;
        WPCF7_ContactForm::$forms = [];
        WPCF7_ContactForm::$submissions = [];
    }

    public static function fire(string $hook): void
    {
        foreach (self::$actions[$hook] ?? [] as $callback) {
            $callback();
        }
    }
}

class WP_Error
{
    public function __construct(private string $code = '', private string $message = '')
    {
    }

    public function get_error_message(): string
    {
        return $this->message;
    }
}

function add_action(string $hook, callable $callback): void
{
    WpState::$actions[$hook][] = $callback;
}

function apply_filters(string $hook, mixed $value): mixed
{
    return array_key_exists($hook, WpState::$filters) ? WpState::$filters[$hook] : $value;
}

function register_post_type(string $type, array $args): void
{
    WpState::$postTypes[$type] = $args;
}

function register_graphql_object_type(string $name, array $config): void
{
    WpState::$graphqlTypes[$name] = $config;
}

function register_graphql_mutation(string $name, array $config): void
{
    WpState::$graphqlMutations[$name] = $config;
}

function sanitize_text_field(string $text): string
{
    return trim(preg_replace('/\s+/', ' ', strip_tags($text)));
}

function sanitize_textarea_field(string $text): string
{
    return trim(strip_tags($text));
}

function sanitize_email(string $email): string
{
    return preg_replace('/[^a-z0-9+_.@-]/i', '', $email);
}

function is_email(string $email): string|false
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false ? $email : false;
}

// Close enough to WordPress for the tests: drops scripts and unknown tags
function wp_kses_post(string $html): string
{
    $html = preg_replace('#<script\b[^>]*>.*?</script>#is', '', $html);
    return strip_tags($html, '<p><a><strong><em><br>');
}

function is_wp_error(mixed $thing): bool
{
    return $thing instanceof WP_Error;
}

function wp_insert_post(array $args, bool $wp_error = false): int|WP_Error
{
    if (WpState::$nextInsertError) {
        $error = WpState::$nextInsertError;
        WpState::$nextInsertError = null;
        return $wp_error ? $error : 0;
    }
    $id = WpState::$nextId++;
    WpState::$posts[$id] = (object) array_merge(
        ['ID' => $id, 'post_status' => 'draft', 'post_content' => '', 'post_title' => ''],
        $args
    );
    return $id;
}

function wp_update_post(array $args, bool $wp_error = false): int|WP_Error
{
    $id = $args['ID'];
    if (in_array($id, WpState::$failUpdateIds, true)) {
        return $wp_error ? new WP_Error('db_update_error', 'Could not update post in the database.') : 0;
    }
    foreach ($args as $key => $value) {
        WpState::$posts[$id]->$key = $value;
    }
    return $id;
}

function get_post(int $id): ?object
{
    return WpState::$posts[$id] ?? null;
}

function get_posts(array $args): array
{
    $ids = [];
    foreach (WpState::$posts as $id => $post) {
        if ($post->post_type !== $args['post_type']) {
            continue;
        }
        if (isset($args['meta_key']) && !isset(WpState::$meta[$id][$args['meta_key']])) {
            continue;
        }
        $ids[] = $id;
    }
    return $ids;
}

function get_the_title(int $id): string
{
    return WpState::$posts[$id]->post_title ?? '';
}

function get_post_status(int $id): string|false
{
    return WpState::$posts[$id]->post_status ?? false;
}

function update_post_meta(int $id, string $key, mixed $value): void
{
    WpState::$meta[$id][$key] = $value;
}

function get_option(string $name, mixed $default = false): mixed
{
    return WpState::$options[$name] ?? $default;
}

function update_option(string $name, mixed $value): void
{
    WpState::$options[$name] = $value;
}

function get_transient(string $key): mixed
{
    return WpState::$transients[$key]['value'] ?? false;
}

function set_transient(string $key, mixed $value, int $ttl): void
{
    WpState::$transients[$key] = ['value' => $value, 'ttl' => $ttl];
}

function get_locale(): string
{
    return 'fr_CA';
}

// Contact Form 7: a registry of fake forms that record what they were sent

class WPCF7
{
}

class WPCF7_ContactForm
{
    /** @var list<WPCF7_ContactForm> */
    public static array $forms = [];
    /** @var list<array{form: int, post: array<string, mixed>}> */
    public static array $submissions = [];

    public function __construct(private int $id, private string $title, public string $hash = '')
    {
    }

    public static function add(int $id, string $title, string $hash = ''): self
    {
        return self::$forms[] = new self($id, $title, $hash);
    }

    /** @return list<WPCF7_ContactForm> */
    public static function find(): array
    {
        return self::$forms;
    }

    public function id(): int
    {
        return $this->id;
    }

    public function title(): string
    {
        return $this->title;
    }

    /** @return array{status: string} */
    public function submit(): array
    {
        self::$submissions[] = ['form' => $this->id, 'post' => $_POST];
        return ['status' => 'mail_sent'];
    }
}

function wpcf7_get_contact_form_by_hash(string $hash): ?WPCF7_ContactForm
{
    foreach (WPCF7_ContactForm::$forms as $form) {
        if ($form->hash !== '' && $form->hash === $hash) {
            return $form;
        }
    }
    return null;
}

function wpcf7_contact_form(int $id): ?WPCF7_ContactForm
{
    foreach (WPCF7_ContactForm::$forms as $form) {
        if ($form->id() === $id) {
            return $form;
        }
    }
    return null;
}
