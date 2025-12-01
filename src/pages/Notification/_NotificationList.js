// import React, { useEffect, useState } from "react";
// import useRequest from "../../hooks/useRequest";
// import { Avatar, List, Skeleton } from "antd";
// import moment from "moment";
// import LogoMImg from "../../assets/images/logo-black-main.png";

// export const NotificationList = () => {
//   const [loading, setLoading] = useState(true);
//   const [list, setList] = useState([]);
//   const { request } = useRequest();

//   const dates = {
//     today: moment(new Date()).format("DD-MM-YYYY"),
//     yesterday: moment(new Date().getTime() - 24 * 60 * 60 * 1000).format(
//       "DD-MM-YYYY"
//     ),
//   };

//   console.log(dates, "datedmjgfjhg");

//   const fetchData = () => {
//     setLoading(true);
//     request({
//       url: "/admin/notification/getNotification",
//       method: "GET",
//       onSuccess: (data) => {
//         setLoading(false);
//         setList(data?.data);
//         // setPagination(prev => ({ current: pagination?.current, total: data?.data?.length }))
//       },
//       onError: (error) => {
//         setLoading(false);
//         // ShowToast(error, Severty.ERROR)
//       },
//     });
//     // setList(dummyNotifications);
//     setLoading(false);
//   };

//   const readNotification = () => {
//     setLoading(true);

//     request({
//       url: "/admin/notification/readAll",
//       method: "GET",
//       onSuccess: (data) => {
//         setLoading(false);
//         // setList(data?.data)
//         // setPagination(prev => ({ current: pagination?.current, total: data?.data?.length }))
//       },
//       onError: (error) => {
//         setLoading(false);
//         // ShowToast(error, Severty.ERROR)
//       },
//     });
//     // setList(dummyNotifications);
//   };

//   useEffect(() => {
//     fetchData();
//     readNotification();
//   }, []);

//   useEffect(() => {
//     console.log(list);
//   }, [list]);

//   return (
//     <>
//       {loading ? (
//         <Skeleton />
//       ) : (
//         <>
//           {Object.keys(list).map((groupedKey, index) => {
//             return (
//               <div className="notification-card" key={"groupItem" + index}>
//                 <List
//                   itemLayout="horizontal"
//                   dataSource={list[groupedKey]}
//                   renderItem={(item, index) => {
//                     const timeInLocal = moment
//                       .utc(item?.utc_time, "HH:mm")
//                       .local();

//                     return(
//                     <List.Item>
//                       <List.Item.Meta
//                         avatar={
//                           <Avatar
//                             className="notifiaction-logo-img-main"
//                             src={LogoMImg}
//                           />
//                         }
//                         title={
//                           <div className="notifiaction-logo-img">
//                             {/* <img
                              
//                               alt="Notification"
//                               style={{ marginRight: '16px' }}
//                               /> */}
//                             <div>
//                               {item.description
//                                 ?.replace(
//                                   "{{APPOINTMENT_DATE}}",
//                                   moment
//                                     .parseZone(item?.utc_date)
//                                     .format("DD-MM-YYYY")
//                                 )
//                                 .replace("{{APPOINTMENT_TIME}}", timeInLocal.isValid() ? timeInLocal.format("hh:mm A") : "-")}
//                             </div>
//                           </div>
//                         }
//                         description={moment(item.created_at).format(
//                           "DD-MM-YYYY hh:mm:ss A"
//                         )}
//                       />
//                     </List.Item>)
//                   }}
//                 />
//               </div>
//             );
//           })}
//         </>
//       )}
//     </>
//   );
// };


import React, { useEffect, useState } from "react";
import useRequest from "../../hooks/useRequest";
import { Avatar, List, Skeleton } from "antd";
import moment from "moment";
import LogoMImg from "../../assets/images/logo-black-main.png";

export const NotificationList = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const { request } = useRequest();

  const dates = {
    today: moment(new Date()).format("DD-MM-YYYY"),
    yesterday: moment(new Date().getTime() - 24 * 60 * 60 * 1000).format(
      "DD-MM-YYYY"
    ),
  };

  console.log(dates, "datedmjgfjhg");

  const fetchData = () => {
    request({
      url: "/admin/notification/getNotification",
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setList(data?.data);
      },
      onError: (error) => {
        setLoading(false);
        // ShowToast(error, Severty.ERROR)
      },
    });
  };

  const readNotification = () => {
    request({
      url: "/admin/notification/readAll",
      method: "GET",
      onSuccess: (data) => {
        // setList(data?.data)
      },
      onError: (error) => {
        // ShowToast(error, Severty.ERROR)
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
    readNotification();
  }, []);

  useEffect(() => {
    console.log(list);
  }, [list]);

  return (
    <>
      {loading ? (
        <div style={{ minHeight: "calc(100vh - 200px)", padding: "24px" }}>
          <Skeleton active paragraph={{ rows: 8 }} />
          <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: "24px" }} />
          <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: "24px" }} />
        </div>
      ) : (
        <>
          {Object.keys(list).map((groupedKey, index) => {
            return (
              <div className="notification-card" key={"groupItem" + index}>
                <List
                  itemLayout="horizontal"
                  dataSource={list[groupedKey]}
                  renderItem={(item, index) => {
                    const timeInLocal = moment
                      .utc(item?.utc_time, "HH:mm")
                      .local();

                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              className="notifiaction-logo-img-main"
                              src={LogoMImg}
                            />
                          }
                          title={
                            <div className="notifiaction-logo-img">
                              <div>
                                {item.description
                                  ?.replace(
                                    "{{APPOINTMENT_DATE}}",
                                    moment
                                      .parseZone(item?.utc_date)
                                      .format("DD-MM-YYYY")
                                  )
                                  .replace(
                                    "{{APPOINTMENT_TIME}}",
                                    timeInLocal.isValid()
                                      ? timeInLocal.format("hh:mm A")
                                      : "-"
                                  )}
                              </div>
                            </div>
                          }
                          description={moment(item.created_at).format(
                            "DD-MM-YYYY hh:mm A"
                          )}
                        />
                      </List.Item>
                    );
                  }}
                />
              </div>
            );
          })}
        </>
      )}
    </>
  );
};