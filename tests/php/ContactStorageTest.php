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
}
