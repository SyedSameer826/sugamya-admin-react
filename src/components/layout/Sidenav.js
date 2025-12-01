import { Image, Menu, Modal, Skeleton } from "antd";
import { useContext, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "../../assets/images/Logo.svg";
import Blog from "../../assets/images/side_nav/blog.svg";
import Cath from "../../assets/images/side_nav/cath.svg";
import Chat from "../../assets/images/side_nav/chat.svg";
import Cms from "../../assets/images/side_nav/cms.svg";
import Coust from "../../assets/images/side_nav/customer.svg";
import Dash from "../../assets/images/side_nav/dash.svg";
import Log from "../../assets/images/side_nav/log.svg";
import Bell from "../../assets/images/side_nav/notification.svg";
import Order from "../../assets/images/side_nav/order.svg";
import Setting from "../../assets/images/side_nav/setting.svg";
import Sub from "../../assets/images/side_nav/sub.svg";
import User from "../../assets/images/side_nav/user.svg";
import Alimenticon from "../../assets/images/side_nav/ali-management.svg";
import StarIcon from "../../assets/images/side_nav/star.svg";
import Baseprice from "../../assets/images/side_nav/base-price.svg";
import Appointments from "../../assets/images/side_nav/appointments.svg";
import Discounts from "../../assets/images/side_nav/discounts.svg";
import Email from "../../assets/images/side_nav/email.svg";
import Content from "../../assets/images/side_nav/content.svg";
import Country from "../../assets/images/side_nav/country.svg";
import { AuthContext } from "../../context/AuthContext";
import DeleteModal from "../DeleteModal";

export const menuItems = [
  {
    key: "Dashboard",
    path: "/dashboard",
    icon: Dash,
    label: "Dashboard",
    isShow: true,
  },
  {
    key: "user-manager",
    label: "User",
    icon: User,
    path: "/user",
  },
  {
    key: "patient-manager",
    label: "Patient",
    icon: User,
    path: "/patient",
  },
  {
    key: "appointment-manager",
    label: "Appointment",
    icon: Appointments,
    path: "/appointment",
  },
  {
    key: "cart-manager",
    label: "Cart",
    icon: Coust,
    path: "/cart",
  },
  {
    key: "order-manager",
    label: "Order",
    icon: Order,
    path: "/order",
  },
  {
    key: "Revenue",
    label: "Transaction",
    icon: Discounts,
    path: "/revenue",
  },


  {
    key: "ailment-manager",
    label: "Ailment",
    icon: Alimenticon,
    path: "/ailment",
  },
  {
    key: "product-Manager",
    label: "Product",
    icon: Cath,
    path: "/product",
  },
  // {
  //   key: "leave-Manager",
  //   label: "Leave",
  //   icon: Cath,
  //   path: "/leave",
  // },
  {
    key: "appointment-price",
    label: "Base Price",
    icon: Baseprice,
    path: "/appointment-price",
  },

  {
    key: "discount",
    label: "Discount",
    icon: Discounts,
    path: "/discount",
  },
  {
    key: "country-variance",
    label: "Country Variance",
    icon: Country,
    path: "/country-variance",
  },
  {
    key: "sub-admin-manager",
    path: "/sub-admin",
    icon: Sub,
    label: "Sub Admin",
  },
  {
    key: "doctor-manager",
    label: "Doctor",
    icon: Coust,
    path: "/doctor",
  },
  {
    key: "email-template",
    label: "Email Template",
    icon: Email,
    path: "/email-template",
  },
  // {
  //   key: "Cancellation & Refund Policy Matrix",
  //   label: "Cancellation & Refund",
  //   icon: Content,
  //   path: "/refund-policy",
  // },
  {
    key: "static",
    label: "Static Pages",
    icon: Blog,
    path: "/blogs",
  },

  
  {
    key: "chat-support",
    label: "Chat Support",
    icon: StarIcon,
    path: "/chat-support",
  },
  {
    key: "patient-doctor-support",
    label: "Patient Doctor Chat",
    icon: StarIcon,
    path: "/patient-doctor-chat",
  },
  {
    key: "rating-manager",
    label: "Reviews & Ratings",
    icon: StarIcon,
    path: "/ratings",
  },
  {
    key: "notification-manager",
    label: "Notifications",
    icon: Bell,
    path: "/notification",
  },
 
  {
    key: "settings",
    label: "Settings",
    icon: Setting,
    path: "/settings",
  },
];

function Sidenav({ color }) {
  const { pathname } = useLocation();
  const page = pathname.replace("/", "");
  const { userProfile, logout, setUserProfile } = useContext(AuthContext);
  const { confirm } = Modal;
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuLinks, setMenuLinks] = useState([]);
  const [menuMode, setMenuMode] = useState("vertical");

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const showDeleteConfirm = (record) => {
    setIsLogoutModalVisible(true);
  };

  const isActiveLink = (pattern, pathname) => {
    const regexPattern = new RegExp(`^${pattern.replace("*", ".*")}$`);
    return regexPattern.test(pathname);
  };

  const renderTitle = (item) => {
    return (
      <>
        <Image preview={false} src={item.icon} />
        <span className="label">{item.label}</span>
      </>
    );
  };

  useEffect(() => {
    setLoading(true);
    if (!userProfile) return;
    if (userProfile.type == "Admin") {
      // console.log(menuItems, "Admin");
      setMenuLinks(menuItems);
      setLoading(false);
      return;
    }
    const newArray = menuItems.filter((item) => {
      if (item.isShow) {
        return true;
      } else {
        // console.log(menuItems, "Admin");
        return userProfile?.permission?.includes(item.key);
      }
      //return item;
    });

    const links = newArray.filter((item) => {
      if (item?.children?.length) {
        return true;
      } else if (!item?.children) {
        return true;
      } else {
        return false;
      }
    });

    setMenuLinks(links);
    setLoading(false);
  }, [userProfile]);

  useEffect(() => {
    // setMenuLinks(menuItems);
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setMenuMode("inline");
      } else {
        setMenuMode("vertical");
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {loading ? (
        [1, 2, 3, 4, 5, 6].map((item) => <Skeleton active key={item} />)
      ) : (
        <>
          <div className="brand-logo">
            <NavLink to="" className="imgOuter">
              <img className="" src={Logo} alt="" />
              <h4>Admin Portal</h4>
            </NavLink>
          </div>
          <Menu inlineCollapsed={false} mode={menuMode} className="sideNavMain">
            {menuLinks.map((item) => {
              if (item.children) {
                return (
                  <>
                    <Menu.SubMenu
                      key={item.key}
                      title={
                        <>
                          <span className="icon">
                            <Image preview={false} src={item.icon} />
                          </span>
                          <span className="label">{item.label}</span>
                        </>
                      }
                    >
                      {item.children.map((child) => (
                        <Menu.Item key={child.key}>
                          <NavLink to={child.path}>{child.label}</NavLink>
                        </Menu.Item>
                      ))}
                    </Menu.SubMenu>
                  </>
                );
              }

              return (
                <Menu.Item key={item.key}>
                  <NavLink to={item.path}>{renderTitle(item)}</NavLink>
                </Menu.Item>
              );
            })}

            <Menu.Item onClick={showDeleteConfirm}>
              <NavLink to={"#"}>
                <>
                  <Image preview={false} src={Log} />
                  <span className="label">Logout</span>
                </>
              </NavLink>
            </Menu.Item>
          </Menu>
        </>
      )}
      {isLogoutModalVisible && (
        <DeleteModal
          title={"Logout"}
          subtitle={`Are you sure you want to Logout the Application?`}
          show={isLogoutModalVisible}
          hide={() => {
            setIsLogoutModalVisible(false);
          }}
          onOk={() => logout()}
        />
      )}
    </>
  );
}

export default Sidenav;
