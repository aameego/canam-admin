import client from './client.ts';

/** Contact Us form submission from the storefront. */
export type ContactQuery = {
  _id: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  message: string;
  createdAt: string;
};

// ponytail: backend returns the latest 200 with no paging; add paging when volume needs it.
export const queriesApi = {
  list: () => client.get<{ messages: ContactQuery[] }>('/contact'),
};
