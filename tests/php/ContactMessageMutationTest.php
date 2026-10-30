<?php

namespace BoissonSolutionX\Tests;

use GraphQL\Error\UserError;
use PHPUnit\Framework\TestCase;
use WP_Error;
use WPCF7_ContactForm;
use WpState;

final class ContactMessageMutationTest extends TestCase
{
    private const CONTENT = "Name: Jean Tremblay\nEmail: jean@example.com\nMessage: Bonjour,\nje veux commander.";

    protected function setUp(): void
    {
        WpState::reset();
        $_SERVER['REMOTE_ADDR'] = '203.0.113.7';
        $_POST = [];
    }

    /** Run the createContactMessage resolver the way WPGraphQL would */
    private function mutate(array $input): array
    {
        $resolve = WpState::$graphqlMutations['createContactMessage']['mutateAndGetPayload'];
        return $resolve($input, null, null);
    }

    private function validInput(array $overrides = []): array
    {
        return array_merge([
            'clientMutationId' => 'contact-form-submission',
            'title' => 'Contact from Jean Tremblay',
            'content' => self::CONTENT,
            'website' => '',
        ], $overrides);
    }

    public function testRegistersTheMutationAndItsType(): void
    {
        // The contact form is the only write endpoint; the old unauthenticated
        // createSubmission (ACF) mutation was removed and must not come back
        $this->assertSame(['createContactMessage'], array_keys(WpState::$graphqlMutations));
        $this->assertArrayHasKey('ContactMessage', WpState::$graphqlTypes);
        $this->assertSame(
            ['clientMutationId', 'title', 'content', 'status', 'website', 'formId'],
            array_keys(WpState::$graphqlMutations['createContactMessage']['inputFields'])
        );
    }

    public function testRequiresTitleAndContent(): void
    {
        $this->expectException(UserError::class);
        $this->expectExceptionMessage('The title and content fields are required.');
        $this->mutate($this->validInput(['content' => '']));
    }

    public function testStoresTheMessagePrivatelyWhateverStatusTheClientSends(): void
    {
        $payload = $this->mutate($this->validInput(['status' => 'publish']));

        $post = WpState::$posts[$payload['id']];
        $this->assertSame('contact_message', $post->post_type);
        $this->assertSame('private', $post->post_status);
        $this->assertSame('Contact from Jean Tremblay', $post->post_title);
        $this->assertSame('contact-form-submission', $payload['clientMutationId']);
    }

    public function testSanitizesTheTitleAndContent(): void
    {
        $payload = $this->mutate($this->validInput([
            'title' => '<b>Contact</b> from <script>x</script>Jean',
            'content' => "Name: Jean\nMessage: Salut <script>alert(1)</script><strong>!</strong>",
        ]));

        $post = WpState::$posts[$payload['id']];
        $this->assertStringNotContainsString('<', $post->post_title);
        $this->assertStringNotContainsString('<script', $post->post_content);
        $this->assertStringContainsString('<strong>!</strong>', $post->post_content);
    }

    public function testSavesTheSenderAndFlagsTheSubmission(): void
    {
        $id = $this->mutate($this->validInput())['id'];

        $this->assertSame('Jean Tremblay', WpState::$meta[$id]['_contact_form_name']);
        $this->assertSame('jean@example.com', WpState::$meta[$id]['_contact_form_email']);
        $this->assertTrue(WpState::$meta[$id]['_contact_form_submission']);
    }

    public function testHoneypotPretendsSuccessAndStoresNothing(): void
    {
        $payload = $this->mutate($this->validInput(['website' => 'https://spam.example']));

        $this->assertSame(0, $payload['id']);
        $this->assertSame('contact-form-submission', $payload['clientMutationId']);
        $this->assertSame([], WpState::$posts);
        $this->assertSame([], WPCF7_ContactForm::$submissions);
    }

    public function testRateLimitsFiveMessagesPerTenMinutesPerIp(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->mutate($this->validInput());
        }
        $this->assertCount(5, WpState::$posts);
        $this->assertSame(600, array_values(WpState::$transients)[0]['ttl']);

        // Another visitor is not affected
        $_SERVER['REMOTE_ADDR'] = '198.51.100.1';
        $this->mutate($this->validInput());
        $this->assertCount(6, WpState::$posts);

        $_SERVER['REMOTE_ADDR'] = '203.0.113.7';
        $this->expectException(UserError::class);
        $this->expectExceptionMessage('Too many messages');
        $this->mutate($this->validInput());
    }

    public function testReportsAFailedSaveInsteadOfClaimingSuccess(): void
    {
        WpState::$nextInsertError = new WP_Error('db_insert_error', 'Could not insert post into the database.');

        $this->expectException(UserError::class);
        $this->expectExceptionMessage('Could not insert post into the database.');
        $this->mutate($this->validInput());
    }

    public function testEmailsThroughTheFormTheFrontendNames(): void
    {
        WPCF7_ContactForm::add(1, 'Contact form 1');
        WPCF7_ContactForm::add(7, 'Site contact', 'cddc821');
        $_POST = ['untouched' => 'yes'];

        $this->mutate($this->validInput(['formId' => 'cddc821']));

        $this->assertCount(1, WPCF7_ContactForm::$submissions);
        $sent = WPCF7_ContactForm::$submissions[0];
        $this->assertSame(7, $sent['form']);
        $this->assertSame('Jean Tremblay', $sent['post']['your-name']);
        $this->assertSame('jean@example.com', $sent['post']['your-email']);
        $this->assertSame("Bonjour,\nje veux commander.", $sent['post']['your-message']);
        $this->assertSame(7, $sent['post']['_wpcf7']);
        $this->assertSame('fr_CA', $sent['post']['_wpcf7_locale']);
        // The real request data is restored afterwards
        $this->assertSame(['untouched' => 'yes'], $_POST);
    }

    public function testFallsBackToContactForm1ThenToTheFirstForm(): void
    {
        WPCF7_ContactForm::add(3, 'Newsletter');
        WPCF7_ContactForm::add(4, 'Contact form 1');
        $this->mutate($this->validInput(['formId' => 'unknown']));
        $this->assertSame(4, WPCF7_ContactForm::$submissions[0]['form']);

        WpState::reset();
        WPCF7_ContactForm::add(3, 'Newsletter');
        $this->mutate($this->validInput());
        $this->assertSame(3, WPCF7_ContactForm::$submissions[0]['form']);
    }

    public function testSendsNoEmailWhenNoFormExists(): void
    {
        $payload = $this->mutate($this->validInput());
        $this->assertGreaterThan(0, $payload['id']);
        $this->assertSame([], WPCF7_ContactForm::$submissions);
    }

    public function testOutputFieldsResolveFromThePayload(): void
    {
        $output = WpState::$graphqlMutations['createContactMessage']['outputFields'];
        $payload = $this->mutate($this->validInput());

        $this->assertSame('contact-form-submission', $output['clientMutationId']['resolve']($payload));
        $this->assertSame($payload['id'], $output['contactMessage']['resolve']($payload)->ID);
        $this->assertNull($output['contactMessage']['resolve'](['id' => 0]));
    }

    public function testContactMessageFieldsResolveFromObjectsArraysOrIds(): void
    {
        $fields = WpState::$graphqlTypes['ContactMessage']['fields'];
        $id = $this->mutate($this->validInput())['id'];
        $post = WpState::$posts[$id];

        $this->assertSame('Contact from Jean Tremblay', $fields['title']['resolve']($post));
        $this->assertSame('private', $fields['status']['resolve'](['ID' => $id]));
        $this->assertSame($post->post_content, $fields['content']['resolve']($post));
        $this->assertSame($post->post_content, $fields['content']['resolve'](['ID' => $id]));
        $this->assertNull($fields['title']['resolve']([]));
        $this->assertNull($fields['content']['resolve']([]));
    }
}
