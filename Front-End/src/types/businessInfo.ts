export type InternalBusinessInfo = {
    id: string;
    company_name: string;
    url: string; // the endpoint for general business needs
}

export type BusinessInfo = {
  businessId: string;
  businessName: string;
  productId: string;
  productName: string;
  identityBusinessID: InternalBusinessInfo['id'];
};

export type BusinessID = BusinessInfo['businessId'];
export type IdentityBusinessID = BusinessInfo['identityBusinessID'];