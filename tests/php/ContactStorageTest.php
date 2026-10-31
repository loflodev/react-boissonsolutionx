<?php

namespace BoissonSolutionX\Tests;

use PHPUnit\Framework\TestCase;
use WPCF7_ContactForm;
use WpState;

// The private post type, the one-time migration of old public submissions,
// and the Contact Form 7 lookup
final class ContactStorageTest extends TestCase
{
    protected function setUp(): void
    {
        WpState::reset();
    }

    public function testMessagesAreNeverPublic(): void
    {
        $type = WpState::$postTypes['contact_message'];

        $this->assertFalse($type['public']);
        $this->assertFalse($type['publicly_queryable']);
        $this->assertFalse($type['show_in_rest']);
        $this->assertTrue($type['exclude_from_search']);
        $this->assertTrue($type['show_ui']);
    }

    public function testMigratesOldPublicSubmissionsOnce(): void
    {
        $legacy = wp_insert_post(['post_type' => 'post', 'post_status' => 'publish']);
        update_post_meta($legacy, '_contact_form_submission', true);
        $article = wp_insert_post(['post_type' => 'post', 'post_status' => 'publish']);

        WpState::fire('admin_init');

        $this->assertSame('contact_message', WpState::$posts[$legacy]->post_type);
        $this->assertSame('private', WpState::$posts[$legacy]->post_status);
        // Regular articles are left alone
        $this->assertSame('post', WpState::$posts[$article]->post_type);
        $this->assertSame(1, WpState::$options['contact_messages_migrated']);

        // Already migrated: a later legacy post is not touched again
        $late = wp_insert_post(['post_type' => 'post', 'post_status' => 'publish']);
        update_post_meta($late, '_contact_form_submission', true);
        WpState::fire('admin_init');
        $this->assertSame('post', WpState::$posts[$late]->post_type);
    }

    public function testOnlyAdministratorsCanReadMessages(): void
    {
        $type = WpState::$postTypes['contact_message'];

        $this->assertTrue($type['map_meta_cap']);
        $this->assertSame('do_not_allow', $type['capabilities']['create_posts']);
        foreach (array_diff_key($type['capabilities'], ['create_posts' => true]) as $cap) {
            $this->assertSame('manage_options', $cap);
        }
        $this->assertSame('manage_options', $type['capabilities']['read_private_posts']);
    }

    public function testRetriesTheMigrationUntilNoPublicSubmissionIsLeft(): void
    {
        $stuck = wp_insert_post(['post_type' => 'post', 'post_status' => 'publish']);
        update_post_meta($stuck, '_contact_form_submission', true);
        $moved = wp_insert_post(['post_type' => 'post', 'post_status' => 'publish']);
        update_post_meta($moved, '_contact_form_submission', true);
        WpState::$failUpdateIds = [$stuck];

        WpState::fire('admin_init');

        $this->assertSame('contact_message', WpState::$posts[$moved]->post_type);
        $this->assertSame('post', WpState::$posts[$stuck]->post_type);
        $this->assertArrayNotHasKey('contact_messages_migrated', WpState::$options);

        // The next admin request finishes the job
        WpState::$failUpdateIds = [];
        WpState::fire('admin_init');

        $this->assertSame('private', WpState::$posts[$stuck]->post_status);
        $this->assertSame(1, WpState::$options['contact_messages_migrated']);
    }

    public function testFindsAFormByHashOrNumericId(): void
    {
        WPCF7_ContactForm::add(12, 'Contact form 1', 'cddc821');

        $this->assertSame(12, boissonsx_find_contact_form('cddc821')->id());
        $this->assertSame(12, boissonsx_find_contact_form('12')->id());
        $this->assertSame(12, boissonsx_find_contact_form(12)->id());
    }

    public function testReturnsNullForEmptyOrUnknownForms(): void
    {
        WPCF7_ContactForm::add(12, 'Contact form 1', 'cddc821');

        $this->assertNull(boissonsx_find_contact_form(''));
        $this->assertNull(boissonsx_find_contact_form('ffffff0'));
        $this->assertNull(boissonsx_find_contact_form('99'));
    }

    public function testSchedulesTheDailyCleanupOnce(): void
    {
        WpState::fire('init');
        $first = WpState::$cron['boissonsx_purge_contact_messages'];
        WpState::fire('init');

        $this->assertSame('daily', $first['recurrence']);
        $this->assertSame($first, WpState::$cron['boissonsx_purge_contact_messages']);
    }

    public function testDeletesContactMessagesOlderThanTwelveMonths(): void
    {
        $old = wp_insert_post(['post_type' => 'contact_message', 'post_status' => 'private',
            'post_date_gmt' => gmdate('Y-m-d H:i:s', time() - 366 * DAY_IN_SECONDS)]);
        update_post_meta($old, '_contact_form_email', 'jean@example.com');
        $recent = wp_insert_post(['post_type' => 'contact_message', 'post_status' => 'private',
            'post_date_gmt' => gmdate('Y-m-d H:i:s', time() - 300 * DAY_IN_SECONDS)]);
        $article = wp_insert_post(['post_type' => 'post', 'post_status' => 'publish',
            'post_date_gmt' => '2020-01-01 00:00:00']);

        WpState::fire('boissonsx_purge_contact_messages');

        $this->assertArrayNotHasKey($old, WpState::$posts);
        $this->assertArrayNotHasKey($old, WpState::$meta);
        $this->assertArrayHasKey($recent, WpState::$posts);
        // Only contact messages are ever deleted
        $this->assertArrayHasKey($article, WpState::$posts);
    }

    public function testRetentionCanBeChangedOrTurnedOff(): void
    {
        $id = wp_insert_post(['post_type' => 'contact_message', 'post_status' => 'private',
            'post_date_gmt' => gmdate('Y-m-d H:i:s', time() - 40 * DAY_IN_SECONDS)]);

        WpState::$filters['boissonsx_contact_retention_days'] = 0;
        $this->assertSame(0, boissonsx_purge_contact_messages());
        $this->assertArrayHasKey($id, WpState::$posts);

        WpState::$filters['boissonsx_contact_retention_days'] = 30;
        $this->assertSame(1, boissonsx_purge_contact_messages());
        $this->assertArrayNotHasKey($id, WpState::$posts);
    }

    public function testDeletesABacklogInBatchesOf200(): void
    {
        for ($i = 0; $i < 201; $i++) {
            wp_insert_post(['post_type' => 'contact_message', 'post_status' => 'private',
                'post_date_gmt' => '2020-01-01 00:00:00']);
        }

        $this->assertSame(200, boissonsx_purge_contact_messages());
        $this->assertSame(1, boissonsx_purge_contact_messages());
    }
}
