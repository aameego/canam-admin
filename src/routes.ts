export const routes = {
  root: '/',
  login: '/login',
  resetPassword: '/reset-password',
  customers: '/customers',
  customerNew: '/customers/new',
  customer: (id: string) => `/customers/${id}`,
  customerEdit: (id: string) => `/customers/${id}/edit`,
  products: '/products',
  productNew: '/products/new',
  product: (id: string) => `/products/${id}`,
  productEdit: (id: string) => `/products/${id}/edit`,
  categories: '/categories',
  orders: '/orders',
  order: (id: string) => `/orders/${id}`,
  coupons: '/coupons',
  couponNew: '/coupons/new',
  coupon: (id: string) => `/coupons/${id}`,
} as const;

export const GUEST_PATHS = [routes.login, routes.resetPassword] as const;

export const CATALOG_PATHS = [routes.products, routes.productNew, routes.categories] as const;
