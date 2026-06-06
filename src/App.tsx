// App.tsx
// Root of the operator dashboard app.
// Only one page for now. If more pages are added later,
// wrap this in <BrowserRouter> and add <Routes> here.

import { Dashboard } from "./pages/Dashboard";

function App() {
  return <Dashboard />;
}

export default App;
