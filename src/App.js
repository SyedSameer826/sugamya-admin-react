import React, { Suspense, useContext } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";
import { AuthContext, AuthProvider } from "./context/AuthContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./assets/styles/custom.css";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import Loader from "./components/Loader";
import PrivateRoute from "./components/PrivateRoute";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Auth/Home";
import Profile from "./pages/Auth/Profile";
import SignIn from "./pages/Auth/SignIn";
import Error from "./pages/Error";

import { PATH_HEADING_MAP } from "./constants/path-heading-map.constants";

import {
  Ailment,
  AppointmentPrice,
  Content,
  ContentEdit,
  ContentView,
  DeliveryHistory,
  Discount,
  Doctor,
  Notifications,
  Order,
  Patient,
  Product,
  SubAdmin,
  EditEmailTemplate,
  EmailTemplate,
  ViewEmailTemplate,
  RefundPolicy,
  CountryVariance,
  Appointment,
  ViewPatient,
  ViewDoctor,
  User,
  ViewUser,
  ViewSubAdmin,
  Setting,
  Blog,
  Case,
  Cart,
  ViewBlog,
  Revenue,
  EditBlog,
  Videos,
  AddVideos,
  EditVideos,
  AddBlog,
  Banner,
  AddBanner,
  ViewBanner,
  EditBanner,
  Ratings,
  ViewAppointment,
  UserDevices,
} from "./pages";

import Activity from "./pages/User/Activity";
import AddForm from "./pages/EmailTemplate/AddForm";
import Index from "./pages/Leave";
import Chat from "./pages/ChatSupport/Chat";
import PatientDoctorChat from "./pages/ChatSupport/PatientDoctorChat";

window.Buffer = window.Buffer || require("buffer").Buffer;
function App() {
  console.log("making live 7");
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
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<SignIn />} />
      {/* <Route path="/sign-up" element={<Register />} /> */}

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Auth Routes */}
        <Route exact path="/" element={<Home />} />
        <Route exact path="/dashboard" element={<Home />} />
        <Route exact path="/profile" element={<Profile />} />
        <Route exact path="/settings" element={<Setting />} />
        {/* <Route exact path="/permission" element={<Permission/>}/> */}

        {/* Patient Route */}
        <Route exact path="/patient" element={<Patient />} />
        <Route exact path="/patient/view/:id" element={<ViewPatient />} />
        <Route exact path="/user/activity/:id" element={<Activity />} />
        <Route exact path="/case/:id" element={<Case />} />

        <Route exact path="/blogs" element={<Blog />} />
        <Route exact path="/blogs/view/:id" element={<ViewBlog />} />
        <Route exact path="/blogs/edit/:id" element={<EditBlog />} />
        <Route exact path="/blogs/add" element={<AddBlog />} />
        {/* <Route exact path="/banners" element={<Banner />} /> */}
        <Route exact path="/banner/view/:id" element={<ViewBanner />} />
        <Route exact path="/banner/edit/:id" element={<EditBanner />} />
        <Route exact path="/banner/add" element={<AddBanner />} />
        {/* <Route exact path="/videos" element={<Videos />} /> */}
        <Route exact path="/videos/edit/:id" element={<EditVideos />} />
        <Route exact path="/videos/add" element={<AddVideos />} />

        {/* Doctor Route */}
        <Route exact path="/doctor" element={<Doctor />} />
        <Route exact path="/doctor/view/:id" element={<ViewDoctor />} />

        <Route exact path="/user" element={<User />} />
        <Route exact path="/user/view/:id" element={<ViewUser />} />
        <Route exact path="/user-devices/:id" element={<UserDevices />} />
        <Route exact path="/revenue" element={<Revenue />} />
        <Route exact path="/ratings" element={<Ratings />} />

        {/* Sub Admin Route */}
        <Route
          exact
          path={PATH_HEADING_MAP.subadmin.path}
          element={<SubAdmin />}
        />
        <Route exact path="/sub-admin/view/:id" element={<ViewSubAdmin />} />

        {/* Patient Ailment Route */}
        <Route exact path="/ailment" element={<Ailment />} />
        <Route exact path="/ailment/activity/:id" element={<Activity />} />

        {/* Product Route */}
        <Route exact path="/product" element={<Product />} />
        <Route exact path="/product/activity/:id" element={<Activity />} />

        {/* appointment ase price manager */}
        <Route exact path="/appointment-price" element={<AppointmentPrice />} />

        {/* appointment manager */}
        <Route exact path="/appointment" element={<Appointment />} />
        <Route
          exact
          path="/appointment/view/:id"
          element={<ViewAppointment />}
        />

        {/* Order Route */}
        <Route exact path="/order" element={<Order />} />

        {/*Cart router  */}
        <Route exact path="/cart" element={<Cart />} />

        {/* Content Route */}
        <Route exact path="/content" element={<Content />} />
        <Route exact path="/content/update/:slug?" element={<ContentEdit />} />
        <Route exact path="/content/view/:slug" element={<ContentView />} />

        {/* EmailTemplate Routes */}
        <Route exact path="/email-template" element={<EmailTemplate />} />
        <Route exact path="/email-template/add" element={<AddForm />} />
        <Route
          exact
          path="/email-template/update/:id?"
          element={<EditEmailTemplate />}
        />
        <Route
          exact
          path="/email-template/view/:id"
          element={<ViewEmailTemplate />}
        />

        {/* Refund Policy Routes */}
        <Route exact path="/refund-policy" element={<RefundPolicy />} />

        {/* delivery manager */}
        <Route exact path="/delivery" element={<DeliveryHistory />} />

        {/* notification */}
        <Route exact path="/notification" element={<Notifications />} />

        {/* country variance */}
        <Route exact path="/country-variance" element={<CountryVariance />} />
        {/* country variance */}
        <Route exact path="/discount" element={<Discount />} />

        <Route exact path="/leave" element={<Index />} />

        <Route path="/chat-support" element={<Chat />} />

        <Route path="/patient-doctor-chat" element={<PatientDoctorChat />} />

        {/* country variance
        <Route exact path="/revenue" element={<Revenue />} /> */}

        {/* 
        <Route exact path="/locations" element={<ServiceLocation />} />
        <Route exact path="/locations/:id" element={<ServiceLocationView />} /> */}
      </Route>

      <Route path="*" element={<Error />} />
    </Routes>
  );
};

const Layout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

export default App;
