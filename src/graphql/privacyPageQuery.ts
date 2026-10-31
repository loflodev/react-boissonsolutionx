import { PRIVACY_PATH } from "../entry-shared";

// The policy text lives in the page editor; the ACF group
// "Politique de confidentialité" holds the intro, date and officer
export const PRIVACY_PAGE_QUERY = `
  query {
    page(id: "${PRIVACY_PATH.slice(1)}", idType: URI) {
      title
      content
      politiqueDeConfidentialite {
        intro
        derniereMiseAJour
        responsableNom
        responsableTitre
        officeremail
        officeraddress
      }
    }
  }
`;
