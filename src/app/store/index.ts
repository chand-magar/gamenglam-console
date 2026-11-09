import { configureStore } from '@reduxjs/toolkit';
import authReducer           from '../../features/auth/store/authSlice';
import categoryReducer       from '../../features/catalog/store/categorySlice';
import attributeReducer      from '../../features/catalog/store/attributeSlice';
import attributeValueReducer from '../../features/catalog/store/attributeValueSlice';
import productReducer        from '../../features/catalog/store/productSlice';
import productVariantReducer from '../../features/catalog/store/productVariantSlice';
import sectionReducer        from '../../features/employee/store/sectionSlice';
import pageReducer           from '../../features/employee/store/pageSlice';
import roleReducer           from '../../features/employee/store/roleSlice';
import userReducer           from '../../features/employee/store/userSlice';
import customerReducer       from '../../features/customer/store/customerSlice';
import inventoryReducer from '../../features/inventory/store/inventorySlice';
import orderReducer   from '../../features/order/store/orderSlice';
import couponReducer  from '../../features/coupon/store/couponSlice';
import reviewReducer      from '../../features/review/store/reviewSlice';
import newsletterReducer  from '../../features/newsletter/store/newsletterSlice';

export const store = configureStore({
  reducer: {
    auth:            authReducer,
    categories:      categoryReducer,
    attributes:      attributeReducer,
    attributeValues: attributeValueReducer,
    products:        productReducer,
    productVariants: productVariantReducer,
    sections:        sectionReducer,
    pages:           pageReducer,
    roles:           roleReducer,
    users:           userReducer,
    customers:       customerReducer,
    inventory: inventoryReducer,
    orders:    orderReducer,
    coupons:   couponReducer,
    reviews:    reviewReducer,
    newsletter: newsletterReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;