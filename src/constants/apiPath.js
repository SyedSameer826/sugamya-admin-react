import { update } from "lodash";

let appMode = process.env.REACT_APP_ENV;
let ASSET_URL = "https://s3-noi.aces3.ai/sugamaya-bucket/";
let URL;

console.log("appMode", appMode);

// 3.20.147.34

if (appMode === "development") {
  // URL = "http://localhost:9060/api/";
  // URL = "http://217.15.175.151:9060/api/";
  // URL = "https://036a261977c6.ngrok-free.app/api/";
  // URL = "https://backend.sugamya-ayurveda.com/api/";
  URL = "http://43.205.167.204/api/";
} else {
  // URL = "http://217.15.175.151:9060/api/";
  // URL = "https://036a261977c6.ngrok-free.app/api/";
  // URL = "http://localhost:9061/api/";
  // URL = "https://backend.sugamya-ayurveda.com/api/";
  // URL = "http://43.205.167.204/api/";
  // URL = "https://goldenpark.vayuz.com/api/";
  URL = "http://localhost:5000/api/";
}

let apiPath = {
  baseURL: URL,
  assetURL: ASSET_URL,
  dashboard: "admin/dashboard",
  setting: "/admin/setting",
  listOrder: "admin/order/list",
  viewOrder: "admin/order/view",
  statusOrder: "admin/order/status",
  setting: "admin/setting/",
  // Auth API
  logout: "admin/auth/logout",
  beforeLogin: "admin/auth/before-login",
  login: "admin/auth/login",
  country: "/country",
  doctors: "/doctors",
  slots: "/admin/appointment/slots",
  state: "/state/",
  city: "/city/",
  profile: "admin/auth/get-profile",
  updateProfile: "admin/auth/update-profile",
  changePassword: "admin/auth/change-password",
  updateAppSetting: "admin/auth/update-app-setting",

  // Patient APIs
  listPatient: "admin/patient",
  listPatientAilment: "admin/patient/ailment/list",
  listPatientAilmentCategory: "admin/patient/ailment/category",
  listUser: "admin/user",
  userdevices: "admin/user/devices",
  newAppointment: "admin/patient/new-appointment",
  viewPatient: "admin/patient/detail",
  viewPatientAppointment: "admin/patient",
  viewPatientOrders: "admin/patient",
  importPatient: "admin/patient/import-file",
  activity: "admin/user-activity",

  // Doctor's APIs
  listLeave: "/admin/Leave/list",
  doctor: "admin/doctor",
  viewDoctor: "admin/doctor/",
  forgotPassword: "admin/auth/forgot-password",
  verifyOTP: "admin/auth/verify-otp",
  sendOTP: "admin/auth/send-otp",
  changeMail: "admin/auth/change-mail",
  resetPassword: "admin/auth/reset-password",
  doctorsAppointments: "admin/doctor/availability/doctors",
  // SubAdmin APIs
  subAdmin: "admin/sub-admin",
  viewSubAdmin: "admin/sub-admin/",
  getModule: "admin/sub-admin/module-list",
  addPermission: "admin/sub-admin/add-permission",

  // ailment manager
  ailment: "admin/ailment",
  ailmentActivity: "admin/user-activity",
  ailmentCategory: "admin/ailment-category",

  // product manager
  product: "admin/product",
  productActivity: "admin/user-activity",
  viewContent: "/admin/content/view",
  policy: "admin/refund/policy/",
  // appointment base price
  appointment: "admin/appointment",
  updateAppointmentSchedule: "admin/appointment/update",
  order: "admin/Order",
  viewAppointment: "admin/appointment",
  updateAppointment: "admin/appointment/update-documents",
  appointmentPrice: "admin/appointment/price",
  calculatedAmount: "/app/user/calculated-Amount",
  fileUpload: "/file-upload",
  addAppointment: "/app/user/add-appointment",
  //Address
  address: "admin/user/addAddress",
  editAddress: "admin/user/editAddress",
  deleteAddress: "admin/user/deleteAddress",

  //collector
  collector: "admin/collector",
  location: "admin/service-location",

  // driver APIs
  driver: "admin/driver",
  importDealer: "admin/dealer/import-file",

  discount: "admin/discount",
  revenue: "admin/revenue",

  banner: "admin/banner",
  history: "admin/delivery-history",
  adminCommon: "admin/common",

  //cart Apis

  getCart: "/admin/cart/getCart",
  cartApproval: "/admin/cart/status-approval",
  getAppointCart: "/admin/cart/getappointCartList",
  productList: "/admin/cart/products",
  addCart: "/admin/cart/addCart",
  updatecart: "/admin/cart/changeCart",
  updateCartData: "/admin/cart/edit",
  // Content APIs
  // varianceList: "admin/country-variance",
  addVariance: "admin/country-variance",

  // Content APIs
  content: "admin/content",
  notification: "admin/notification",

  // EmailTemplate APIs
  listEmailTemplate: "admin/email-template/list",
  addEditEmailTemplate: "admin/email-template/add-edit",
  statusEmailTemplate: "admin/email-template/status",
  viewEmailTemplate: "admin/email-template/view",

  // Blog APIs
  listBlog: "admin/blog/list",
  addEditBlog: "admin/blog/add-edit",
  statusBlog: "admin/blog/status",
  viewBlog: "admin/blog/view",
  deleteBlog: "admin/blog",
  listReviews: "admin/reviews/list",
  userReviews: "admin/reviews/user-reviews",
  testimonial: "admin/reviews/testimonial",
  addEditReview: "admin/reviews/update-testimonial",
  addReview: "admin/reviews/add-testimonial",
  deleteReview: "admin/reviews/delete/",
  statusReview: "admin/reviews/status",

  listTransaction: "admin/trans",
  viewTransaction: "admin/trans/view",

  //get case paper api
  casePaper: "/admin/patient",
  downloadCase: "/admin/patient/download-pdf",

  // Banner APIs
  listBanner: "admin/banner/list",
  addBanner: "admin/banner/add",
  editBanner: "admin/banner/edit",
  deleteBanner: "admin/banner",
  statusBanner: "admin/banner/status",
  viewBanner: "admin/banner/view",

  listVideos: "admin/videos/list",
  addVideos: "admin/videos/add",
  editVideos: "admin/videos/",
  deleteVideo: "admin/videos",

  statusVideos: "admin/videos/status",
  viewVideos: "admin/videos/view",
  //category
  listCategory: "admin/category",
  statusCategory: "admin/category/status",

  getAppSetting: "common/app-setting",

  // Size APIs
  size: "admin/size",

  //order
  order: "admin/order",

  //Vendor apis

  common: {
    restaurantCategories: "categories",
    foodCategories: "food-categories",
    countries: "",
    sendNotification: "send-notification",

    imageUpload: "/image-upload",
    foodItems: "common/food-items",
    countries: "common/",
    cities: "",
    users: "",
  },

  getCountries: "/all-country",
  getProducts: "/products",

  // Auth API
  logout: "admin/auth/logout",
  signUp: "vendor/auth/sign-up",
};

export default apiPath;
