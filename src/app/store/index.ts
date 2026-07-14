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
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;