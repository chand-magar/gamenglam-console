import { AppProviders } from './app/providers/AppProviders';
import { AppRouter } from './app/routes';

const App = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};

export default App;