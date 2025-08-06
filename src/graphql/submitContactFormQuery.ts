export const SUBMIT_CONTACT_FORM_QUERY = `
  mutation CreateContactMessage($input: CreateContactMessageInput!) {
    createContactMessage(input: $input) {
      clientMutationId
      contactMessage {
        id
        title
        content
        status
      }
    }
  }
`;

