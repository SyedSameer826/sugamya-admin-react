
import './App.css';
import Home from './pages/Home';
import HomeNew from './pages/HomeNew';
import SearchProperty from './pages/SearchProperty';
import PropertyDetail from './pages/PropertyDetail';
// import Developments from './pages/Developments';
import DevelopmentDetail from './pages/DevelopmentDetail';
import DevelopmentPropertyListing from './pages/DevelopmentPropertyListing';
import DevelopmentPropertyDetail from './pages/DevelopmentPropertyDetail';
import ExploreProperty from './pages/ExploreProperty';
import AddProperty from './pages/AddProperty';
import AddPropertyDevelopment from './pages/AddPropertyDevelopment';
import About from './pages/About';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from './components/PrivateRoute'
import { AuthProvider, AuthContext } from './context/AuthContext';
import { AppContextProvider } from './context/AppContext';
import React, { useContext, Suspense } from 'react';
import ScrollToTop from './components/ScrollToTop';
import MyAccount from './pages/MyAccount';
import AgentProfile from './pages/AgentProfile';
import Loader from './components/Loader';
import MatchProfile from './pages/MatchProfile';
import MatchProperty from './pages/MatchProperty';
import MatchingDetail from './pages/MatchingDetail';
import DeveloperProfile from './pages/DeveloperProfile';
import SavedProfile from './pages/SavedProfiles';
import Error from './pages/Error';
import Offer from './pages/Offer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
// import Case from './../pages/User/Patient/Case'

const Developments = React.lazy(() => import('./pages/Developments'));

function App() {

  return (
    <AuthProvider>
      <AppContextProvider>
        <Suspense fallback={<Loader />}>
          <BrowserRouter>
            <ScrollToTop />
            <ToastContainer closeOnClick={false} />
            <AppRoutes />
          </BrowserRouter>
        </Suspense>
      </AppContextProvider>
    </AuthProvider>
  );
}

const AppRoutes = () => {
  const { isSubscriptionBuy, isLoggedIn } = useContext(AuthContext)

  return (
    <Routes >
      <Route path="/" element={(isSubscriptionBuy && isLoggedIn) ? <HomeNew /> : <Home />} />
      <Route path="/about" element={<About />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>}
      >
        <Route path="/homenew" element={<HomeNew />} />
        <Route path="/search" element={<SearchProperty />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/developments" element={<Developments />} />
        <Route path="/developments/:id" element={<DevelopmentDetail />} />
        <Route path="/developments/:id/property" element={<DevelopmentPropertyListing />} />
        <Route path="/developmentpropertydetail" element={<DevelopmentPropertyDetail />} />
        <Route path="/explore" element={<ExploreProperty />} />
        <Route path="/AddProperty" element={<AddProperty />} />
        <Route path="/addpropertydevelopment" element={<AddPropertyDevelopment />} />

        <Route path="/my-account" element={<MyAccount />} />

        <Route path="/:id/profile" element={<AgentProfile />} />
        <Route path="/developer-profile" element={<DeveloperProfile />} />
        <Route path="/:id/matched-profile" element={<MatchProfile />} />
        <Route path="/:id/matched-property" element={<MatchProperty />} />
        <Route path="/matching-details" element={<MatchingDetail />} />
        <Route path="/saved-profiles" element={<SavedProfile />} />
        <Route path="/offer" element={<Offer />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/term-conditions" element={<TermsConditions />} />

        <Route path="/" element={
          <PrivateRoute>
            <HomeNew />
          </PrivateRoute>
        }

        />
      </Route>
      <Route path="*" element={<Error />} />
    </Routes>
  )
}

const Layout = () => {
  return (<> <Outlet />  </>
  )
}
export default App;