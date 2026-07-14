import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/index';
import { tokenService } from '../../core/utils/token';
import { fetchMeThunk } from '../../features/auth/store/authSlice';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner/index';

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenService.getAccessToken();
      const user  = tokenService.getUser();
      if (token && user) {
        await store.dispatch(fetchMeThunk());
      }
      setIsInitialized(true);
    };
    initAuth();
  }, []);

  if (!isInitialized) return <LoadingSpinner />;

  return <>{children}</>;
};

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <AuthInitializer>
      {children}
    </AuthInitializer>
  </Provider>
);