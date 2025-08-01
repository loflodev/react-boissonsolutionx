export const SUBMIT_CONTACT_FORM_QUERY = `
      mutation CreateContactMessage($fullName: String!, $email: String!, $message: String!) {
        createContactMessage(input: {
          clientMutationId: "contact-form-submission"
          title: $fullName
          email: $email
          content: $message
          
        }) {
          clientMutationId
          contactMessage {
            id
            title
          }
        }
      }
    `;