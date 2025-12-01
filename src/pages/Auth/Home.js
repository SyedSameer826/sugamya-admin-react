import {
  Card,
  Col,
  Progress,
  Tooltip,
  Button,
  Radio,
  Row,
  Image,
  Select,
  Skeleton,
  Tabs,
  Modal,
  Input,
  Avatar,
  Tag,
  Form,
  Table,
  Typography,
} from "antd";
import SectionWrapper from "../../components/SectionWrapper";

import React, { useContext, useEffect, useState } from "react";
import apiPath from "../../constants/apiPath";
import { AppStateContext } from "../../context/AppContext";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import LineChartWithoutAxis from "./_Line";
import LineChart from "./_LineCart";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import moment from "moment";
import ConfirmationBox from "../../components/ConfirmationBox";
import { render } from "@testing-library/react";
import useApi from "../../hooks/useApi";
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

export const Months = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

function Home() {
  const { setPageHeading, country } = useContext(AppStateContext);
  const [form] = Form.useForm();
  const [inputValue, setInputValue] = useState("");

  const [apiResponse, setResponse] = useState([]);
  const [data, setGraphData] = useState({
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        label: "Monthly Customer Count", // This dataset represents the number of customers per month.
        data: [],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Weekly Customer Count (Aggregated)", // This dataset aggregates weekly counts into respective months.
        data: [], // Example: June's data is the sum of all weekly counts in June.
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
      {
        label: "Yearly Customer Count", // This dataset represents the number of customers per year.
        data: [], // Assuming the yearly count applies to 2024 and is shown in July for demonstration.
        borderColor: "rgb(54, 162, 235)",
        tension: 0.1,
      },
    ],
  });
  useEffect(() => {
    if (apiResponse) {
      const { customerMonthlyCount, customerWeeklyCount, customerYearlyCount } =
        apiResponse;

      // Extract monthly counts
      const monthlyData = Array(12).fill(0);
      customerMonthlyCount?.forEach((item) => {
        const monthIndex = new Date(item.month).getMonth();
        monthlyData[monthIndex] = item.count;
      });

      // Aggregate weekly counts into monthly counts
      const weeklyDataAggregated = Array(12).fill(0);
      customerWeeklyCount?.forEach((item) => {
        const [startWeek, endWeek] = item.week.split(" - ");
        const startMonth = new Date(startWeek + " 2024").getMonth();
        const endMonth = new Date(endWeek + " 2024").getMonth();

        if (startMonth === endMonth) {
          // If the week is within a single month
          weeklyDataAggregated[startMonth] += item.count;
        } else {
          // If the week spans two months, divide the count equally
          weeklyDataAggregated[startMonth] += item.count / 2;
          weeklyDataAggregated[endMonth] += item.count / 2;
        }
      });

      // Extract yearly counts (assuming the year is for 2024 and mapped to July index)
      const yearlyData = Array(12).fill(0);
      const currentYearData = customerYearlyCount?.find(
        (item) => item.year === 2024
      );
      if (currentYearData) {
        yearlyData[6] = currentYearData.count; // July index
      }

      // Update state with new graph data
      setGraphData((prevState) => ({
        ...prevState,
        datasets: [
          {
            ...prevState.datasets[0],
            data: monthlyData,
          },
          {
            ...prevState.datasets[1],
            data: weeklyDataAggregated,
          },
          {
            ...prevState.datasets[2],
            data: yearlyData,
          },
        ],
      }));
    }
  }, [apiResponse]);
  console.log("apiresponse", apiResponse);
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState();
  const { showConfirm } = ConfirmationBox();
  const [dashboard, setDashboard] = useState();
  const [recentOrders, setrecentOrder] = useState();
  const [topDoctor, settopDoctor] = useState();
  const [refresh, setRefresh] = useState();
  const [revenue, setRevenue] = useState();
  const [period, setPeriod] = useState("month");
  const [selectedIds, setSelectedIds] = useState([]);
  const [cancelModal, showCancelModal] = useState(false);
  const [cancellation, setReasonModal] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [list, setList] = useState([]);
  const [cancelData, setCancelData] = useState({});

  const { getState, getCity, getCountry } = useApi();
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    getCountry({
      countryData: (data) => setCountries(data),
    });
  }, []);
  useEffect(() => {
    if (!topDoctor || topDoctor.length === 0) return;

    const uniqueCountryIds = [
      ...new Set(
        topDoctor
          .map((d) => d.doctor_id?.country)
          .filter(Boolean)
      ),
    ];

    const uniqueStateIds = [
      ...new Set(
        topDoctor
          .map((d) => d.doctor_id?.state)
          .filter(Boolean)
      ),
    ];

    if (uniqueCountryIds?.length > 0) {
      const countryId = uniqueCountryIds[0];
      getState({
        countryId,
        stateData: (data) => setStates(data),
      });
    }
    if (uniqueStateIds?.length > 0) {
      const stateId = uniqueStateIds[0];
      getCity({
        stateId,
        cityData: (data) => setCities(data),
      });
    }
  }, [topDoctor]);


  const getCityName = (id) => cities?.find((c) => c?._id === id)?.name || "";
  const getStateName = (id) => states?.find((s) => s?._id === id)?.name || "";
  const getCountryName = (id) => countries?.find((c) => c?._id === id)?.name || "";

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedIds(selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User", // Column configuration not to be checked
      name: record.name,
    }),
  };
  const navigate = useNavigate();
  const handleOk = () => {
    form.validateFields().then((values) => {
      console.log("Submitted value:", values.inputField);
      let data = { ...cancelData, reason: values.inputField };
      updateOrderStatus(data);
      setReasonModal(false); // Close the modal after submission
    });
  };
  const api = {
    appointment: apiPath.appointment,
    order: apiPath.order,
  };
  const updateOrderStatus = (data) => {
    const id = data.id;
    const status = data.status;
    const payload = { cancellationReason: data.reason };
    request({
      url: apiPath.order + "/" + id + "/" + status,
      method: "PUT",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        console.log(data, "data>>>>>>>>>>>>");
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          setRefresh((prev) => !prev);
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  const count = [
    {
      today: "Number of Patients(Cumulative)",
      title: `${dashboard?.totalPatients ? dashboard.totalPatients : 0}`,
      persent: "10%",
      icon: <i class="fas fa-user-friends"></i>,
      bnb: "bnb2",
      url: "/patient",
      key: "totalPatients",
    },
    {
      today: "Number of Users(Cumulative)",
      title: `${dashboard?.totalUsers ? dashboard.totalUsers : 0}`,
      icon: <i class="fas fa-people-carry"></i>,
      bnb: "bnb2",
      url: "/user",
      key: "totalUsers",
    },
    {
      today: "No. Completed of Appointments(Cumulative)",
      title: `${dashboard?.totalCompletedAppointments
          ? dashboard.totalCompletedAppointments
          : 0
        }`,
      icon: <i class="fas fa-copyright"></i>,
      bnb: "bnb2",
      url: "/appointment?appointment_status=completed",
      key: "totalAppointments",
    },
    {
      today: "No. of Upcoming Appointments",
      title: `${dashboard?.totalUpcomingAppointmnets
          ? dashboard.totalUpcomingAppointmnets
          : 0
        }`,
      icon: <i class="fas fa-copyright"></i>,
      bnb: "bnb2",
      url: "/appointment?appointment_status=pending",
      key: "totalAppointments",
    },
    {
      today: "No. of pending carts",
      url: "/cart",
      title: `${dashboard?.totalCart ? dashboard.totalCart : 0}`,
      icon: <i class="fas fa-copyright"></i>,
      bnb: "bnb2",
      // url: "/appointment",
      key: "totalAppointments",
    },
    {
      today: "No. of complete order(Cumulative)",
      title: `${dashboard?.totalOrders ? dashboard.totalOrders : 0}`,
      icon: <i class="fas fa-copyright"></i>,
      bnb: "bnb2",
      url: "/order",
      key: "totalAppointments",
    },
    {
      today: "Revenue(Cumulative)",
      title: `$ ${dashboard?.totalTransaction ? dashboard?.totalTransaction : 0
        }`,
      icon: <i class="fas fa-copyright"></i>,
      bnb: "bnb2",
      url: "/revenue",
      key: "totalAppointments",
    },
  ];

  const appointments = [
    {
      title: "Appointment ID",
      dataIndex: "appointment_id",
      key: "appointment_id",
      render: (_, { appointment_id }) =>
        appointment_id ? <span className="cap">{appointment_id}</span> : "-",
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (_, { _id, user_id }) => {
        return (
          <>
            {user_id ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span className="cap">{user_id?.name}</span>
                {user_id?.mobile_number && user_id?.country_code && (
                  <span style={{ color: "gray", fontSize: "12px" }}>
                    {"" + user_id?.country_code + "-" + user_id?.mobile_number}
                  </span>
                )}
                <span style={{ color: "gray", fontSize: "12px" }}>
                  {user_id?.email}
                </span>
              </div>
            ) : (
              "-"
            )}
          </>
        );
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (_, { price }) => {
        return price ? <span className="cap">${price}</span> : "-";
      },
    },
    {
      title: "Patient",
      dataIndex: "patient",
      key: "patient",
      render: (_, { patient_id, booked_for }) => {
        return (
          <>
            {patient_id ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span className="cap">{patient_id?.name}</span>
                {patient_id?.mobile_number && patient_id?.country_code && (
                  <span style={{ color: "gray", fontSize: "12px" }}>
                    {patient_id?.country_code + "-" + patient_id?.mobile_number}
                  </span>
                )}
                <span style={{ color: "gray", fontSize: "12px" }}>
                  {patient_id?.email}
                </span>
                {booked_for && (
                  <Tag
                    color={
                      booked_for == "self"
                        ? "green"
                        : booked_for == "relation"
                          ? "blue"
                          : "teal"
                    }
                    key={booked_for}
                    className="cap"
                  >
                    {booked_for === "relation"
                      ? patient_id?.relationship_with_user
                      : booked_for}
                  </Tag>
                )}
              </div>
            ) : (
              "-"
            )}
          </>
        );
      },
    },
    {
      title: "Doctor",
      dataIndex: "doctor",
      key: "doctor",
      render: (_, { _id, doctor_id }) => {
        return (
          <>
            {doctor_id ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span className="cap">{doctor_id?.name}</span>
                {doctor_id?.mobile_number && doctor_id?.country_code && (
                  <span style={{ color: "gray", fontSize: "12px" }}>
                    {doctor_id?.country_code + "-" + doctor_id?.mobile_number}
                  </span>
                )}
                <span style={{ color: "gray", fontSize: "12px" }}>
                  {doctor_id?.email}
                </span>
              </div>
            ) : (
              "-"
            )}
          </>
        );
      },
    },
    {
      title: "Scheduled Date",
      key: "date",
      dataIndex: "date",
      render: (_, { appointment_date }) => {
        return moment(appointment_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Scheduled Time",
      key: "time",
      dataIndex: "time",
      render: (_, { appointment_time }) => {
        if (!appointment_time) return <p>-</p>;

        const [hours, minutes] = appointment_time.split(":").map(Number);
        const utcDate = new Date(Date.UTC(1970, 0, 1, hours, minutes));

        const istTime = new Intl.DateTimeFormat("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        })
          .format(utcDate)?.toUpperCase();

        console.log(istTime, "12-hour");

        return <p>{istTime}</p>;
      },
    },

    {
      title: "Booked On",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <>
            <Tooltip
              color={"purple"}
              title={"View Appointment Manager"}
              key={"viewappointment" + "appointment"}
            >
              <Button
                className="btnStyle  primary_btn"
                title="View"
                onClick={() => navigate(`/appointment/view/${record._id}`)}
              >
                <i className="fa fa-light fa-eye"></i>
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];

  const orderList = [
    {
      title: "Order ID",
      dataIndex: "order_id",
      key: "order_id",
      render: (_, { order_id }) =>
        order_id ? <span className="cap">{order_id}</span> : "-",
    },

    // {
    //   title: "Appointment Date",
    //   dataIndex: "appointment_at",
    //   key: "appointment_at",
    //   render: (_, { appointmentDetails }) =>
    //     appointmentDetails ? (
    //       <span className="cap">
    //         {moment(appointmentDetails.created_at).format("DD-MM-YYYY")}
    //       </span>
    //     ) : (
    //       "-"
    //     ),
    // },
    {
      title: "User",
      dataIndex: "booked_by",
      key: "booked_by",
      render: (_, { userDetails }) =>
        userDetails ? (
          <span className="cap">
            {userDetails.firstName + " " + userDetails.lastName}
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "Amount",
      dataIndex: "appointmentDetails.price",
      key: "appointmentDetails.price",
      render: (_, record) =>
        record.appointmentDetails && record.appointmentDetails.price ? (
          <span className="cap">${record.appointmentDetails.price}</span>
        ) : (
          "-"
        ),
    },
    {
      title: "Patient",
      dataIndex: "booked_for",
      key: "booked_for",
      render: (_, { patientDetail }) =>
        patientDetail ? <span className="cap">{patientDetail.name}</span> : "-",
    },
    {
      title: "Doctor",
      dataIndex: "doctor_id",
      key: "doctor_id",
      render: (_, { doctorDetails }) =>
        doctorDetails ? <span className="cap">{doctorDetails.name}</span> : "-",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (_, { userAddress }) =>
        userAddress ? (
          <span className="cap">
            {userAddress.building_no +
              "," +
              userAddress.city?.name +
              "," +
              userAddress.country?.name}
          </span>
        ) : (
          "-"
        ),
    },

    {
      title: "Status",
      key: "orderStatus",
      render: (_, { orderStatus, _id }) => {
        return (
          <a>
            <Select
              value={orderStatus}
              style={{ width: 120 }}
              onChange={(value) => handleChangeStatus(_id, value, "type")}
            >
              <Option value="Received">Received</Option>
              <Option value="Shipped">Shipped</Option>
              <Option value="Delivered">Delivered</Option>
              <Option value="Cancelled">Cancelled</Option>
              <Option value="Refunded">Refunded</Option>
            </Select>
          </a>
        );
      },
    },
    {
      title: "Order Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (_, { created_at }) =>
        created_at ? (
          <span className="cap">{moment(created_at).format("DD-MM-YYYY")}</span>
        ) : (
          "-"
        ),
    },
    // {
    //   title: "Delivery Date",
    //   dataIndex: "deliveryDate",
    //   key: "deliveryDate",
    //   render: (_, { deliveryDate }) =>
    //     deliveryDate ? (
    //       <span className="cap">
    //         {moment(deliveryDate).format("DD-MM-YYYY")}
    //       </span>
    //     ) : (
    //       "-"
    //     ),
    // },
  ];
  const handleChangeStatus = (id, status) => {
    let data = { id, status };
    if (status == "Cancelled") {
      console.log(status, "status>>>>>>>>>>");
      setReasonModal(true);
      setCancelData(data);
      return;
    } else {
      updateOrderStatus(data);
    }
  };
  const columns = [
    {
      title: "Name",
      dataIndex: ["doctor_id", "name"],
      key: "name",
      filterMultiple: false,
      render: (_, { doctor_id }) => {
        return doctor_id && doctor_id.image ? (
          <>
            <Image className="image-index-radius" src={doctor_id.image} />
            <a style={{ marginLeft: 12, marginRight: 12 }} className="cap">
              {doctor_id.name}
            </a>
          </>
        ) : (
          <>
            <Avatar
              style={{ backgroundColor: "#00a2ae", verticalAlign: "middle" }}
              className="cap"
              size={40}
            >
              {doctor_id ? doctor_id.name.charAt(0) : ""}
            </Avatar>
            <a style={{ marginLeft: 12 }} className="cap">
              {doctor_id ? doctor_id.name : ""}
            </a>
          </>
        );
      },
    },
    {
      title: "Email ID",
      dataIndex: ["doctor_id", "email"],
      key: "email",
      filterMultiple: false,
      render: (_, { doctor_id }) => {
        return doctor_id && doctor_id.email ? (
          <span style={{ textTransform: "lowercase" }}>{doctor_id.email}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Phone Number",
      render: (_, { doctor_id }) => {
        return doctor_id && doctor_id?.mobile_number
          ? `${doctor_id?.country_code ? doctor_id?.country_code : ""}${doctor_id?.mobile_number
          }`
          : "-";
      },
    },
    {
      title: "Gender",
      key: "gender",
      dataIndex: ["doctor_id", "gender"],
    },
    {
      title: "Experience",
      key: "experience",
      dataIndex: ["doctor_id", "experience"],
    },
    {
      title: "Location",
      key: "location",
      render: (_, { doctor_id }) => {
        if (!doctor_id) return "-";

        const cityName = getCityName(doctor_id?.city);
        const stateName = getStateName(doctor_id?.state);
        const countryName = getCountryName(doctor_id?.country);

        return (
          <span className="log-width">
            {[cityName, stateName, countryName].filter(Boolean).join(", ")}
          </span>
        );
      },
    },
    // {
    //   title: "City",
    //   key: "city",
    //   dataIndex: ["doctor_id", "city"],
    //   render: (_, { doctor_id }) => {
    //     return <span>{doctor_id && doctor_id.city ? doctor_id.city.name : ""}</span>;
    //   }
    // },
    // {
    //   title: "State",
    //   key: "state",
    //   dataIndex: ["doctor_id", "state"],
    //   render: (_, { doctor_id }) => {
    //     return <span>{doctor_id && doctor_id.state ? doctor_id.state.name : ""}</span>;
    //   }
    // },
    // {
    //   title: "Country",
    //   key: "country",
    //   dataIndex: ["doctor_id", "country"],
    //   render: (_, { doctor_id }) => {
    //     return <span>{doctor_id && doctor_id.country ? doctor_id.country.name : ""}</span>;
    //   }
    // },
    // {
    //   title: "Head doctor",
    //   key: "is_head_doctor",

    //   render: (_, { doctor_id }) => {
    //     let isHeadDoctor = doctor_id ? doctor_id.is_head_doctor : false;
    //     let color = isHeadDoctor ? "green" : "grey";
    //     return (
    //       <a>
    //         <Tag
    //           onClick={() =>
    //             showConfirm({
    //               record: doctor_id._id,
    //               // path: api.doctor + "/hod",
    //               onLoading: () => setLoading(true),
    //               onSuccess: () => setRefresh((prev) => !prev),
    //             })
    //           }
    //           color={color}
    //           key={isHeadDoctor}
    //         >
    //           {isHeadDoctor ? "Yes" : "No"}
    //         </Tag>
    //       </a>
    //     );
    //   },
    // },
    // {
    //   title: "Status",
    //   key: "is_active",
    //   // filters: [
    //   //   {
    //   //     text: "Active",
    //   //     value: true,
    //   //   },
    //   //   {
    //   //     text: "Inactive",
    //   //     value: false,
    //   //   },
    //   // ],
    //   render: (_, { doctor_id }) => {
    //     let isActive = doctor_id ? doctor_id.is_active : false;
    //     let color = isActive ? "green" : "red";
    //     return (
    //       <a>
    //         <Tag
    //           onClick={() =>
    //             showConfirm({
    //               record: doctor_id._id,
    //               path: api.doctor + "/status",
    //               onLoading: () => setLoading(true),
    //               onSuccess: () => setRefresh((prev) => !prev),
    //             })
    //           }
    //           color={color}
    //           key={isActive}
    //         >
    //           {isActive ? "Active" : "Inactive"}
    //         </Tag>
    //       </a>
    //     );
    //   },
    // },
    {
      title: "Register Date",
      key: "created_at",
      dataIndex: ["doctor", "created_at"],
      render: (_, { doctor_id }) => {
        return doctor_id
          ? moment(doctor_id.created_at).format("DD-MM-YYYY")
          : "";
      },
    },
    {
      title: "Rating Count",
      key: "rating",
      dataIndex: "rating",
      render: (_, { ratings }) => {
        return ratings?.length || 0;
      },
      sorter: (a, b) => (a.ratings?.length || 0) - (b.ratings?.length || 0),
    },
  ];

  const revenues = [
    {
      title: "Transaction ID",
      dataIndex: "uhid",
      key: "uhid",
      render: (_, { uhid, transaction_id }) => {
        return transaction_id;
      },
    },
    {
      title: "Transaction Date",
      key: "date_time_transaction",
      dataIndex: "date_time_transaction",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
    },
    {
      title: "Appointment ID",
      dataIndex: ["appointment_id", "appointment_id"],
      key: "appointment_id",
      filterMultiple: false,
      width: 200,
      render: (_, { appointment_id }) => {
        return appointment_id && appointment_id.appointment_id ? (
          <Link to={`/appointment/view/${appointment_id._id}`}>
            {" "}
            {appointment_id.appointment_id}{" "}
          </Link>
        ) : (
          ""
        );
      },
    },
    {
      title: "Order ID",
      key: "order_id",
      dataIndex: "order_id",
      render: (order_id) => {
        return order_id?.order_id ? order_id?.order_id : "-";
      },
    },
    {
      title: "Order Date",
      key: "date_time_order",
      dataIndex: "date_time_order",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
    },
    {
      title: "Booked For",
      key: "booked_for",
      dataIndex: "patient_id",
      render: (patient) => patient?.name || "N/A",
    },
    {
      title: "Doctor Name",
      key: "doctor_name",
      dataIndex: "doctor_name",
    },
    {
      title: "Order Type",
      key: "type",
      dataIndex: "type",
      render: (text, record) => {
        return record.type ? record.type : "";
      },
    },
    {
      title: "Order Amount",
      key: "transaction_amount",
      dataIndex: "transaction_amount",
      render: (text, record) => {
        return record.transaction_amount
          ? `$${record.transaction_amount}`
          : "-";
      },
    },
    {
      title: "Payment Mode",
      key: "payment_mod",
      dataIndex: "payment_mod",
    },
  ];

  const fetchData = async (period) => {
    setLoading(true);
    request({
      url: `admin/dashboard/graph`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setList(data.data);
        setResponse(data.data);
        // setUpcomingAppointments(data.data.upcomingAppointments)
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);

        ShowToast(error, Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const onChange = (e) => {
    setPeriod(e.target.value);
  };

  const handleChange = (value) => {
    fetchData();
  };

  useEffect(() => {
    setPageHeading("Welcome Admin");
    setLoading(true);
    request({
      url: apiPath.dashboard + `${year ? `?year=${year}` : ""}`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setDashboard(data.data);
        setUpcomingAppointments(data.data.upcomingAppointments);
        setrecentOrder(data.data.recentOrders);
        settopDoctor(data.data.sortedDoctors);
        setRevenue(data.data.revenue);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  }, [year, refresh]);

  return (
    <>
      <div className="page-top-space home-card layout-content">
        <div className="mb-24">
          <div className="sub_title">
            <p>Here is the information about all your business</p>
          </div>
          <SectionWrapper className="mb-3">
            <Row className="ms-3 me-3 mt-3">
              <Col xs={24} sm={18} md={24}>
                <Row
                  className=" mb-3"
                  gutter={[24, 16]}
                // style={{ marginLeft: "0" }}
                >
                  <h3></h3>
                  {count.map((c, index) => (
                    <Col
                      key={index}
                      xs={24}
                      sm={24}
                      md={12}
                      lg={12}
                      xl={8}
                      className="mb24"
                    // style={{ paddingRight: "0px" }}
                    >
                      {/* <Link to={c.url}> */}
                      <CountCard c={c} key={index} loading={loading} />
                      {/* </Link> */}
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </SectionWrapper>
          <SectionWrapper cardHeading={`Upcoming Appointments`}>
            <div className="table-responsive customPagination ">
              <Table
                loading={loading}
                columns={appointments}
                dataSource={upcomingAppointments}
                onChange={handleChange}
                className="ant-border-space for-scrollablee"
              />
            </div>
          </SectionWrapper>
          <SectionWrapper cardHeading={`Recent Orders`}>
            <div className="table-responsive customPagination">
              <Table
                loading={loading}
                columns={orderList}
                dataSource={recentOrders}
                onChange={handleChange}
                className="ant-border-space for-scrollablee"
              />
            </div>
          </SectionWrapper>
          <SectionWrapper cardHeading={`Top Doctor`}>
            <div className="table-responsive customPagination">
              <Table
                loading={loading}
                columns={columns}
                dataSource={topDoctor}
                onChange={handleChange}
                className="ant-border-space for-scrollablee"
              />
            </div>
          </SectionWrapper>

          <SectionWrapper cardHeading={`Transactions`}>
            <div className="table-responsive customPagination">
              <Table
                loading={loading}
                columns={revenues}
                dataSource={revenue}
                onChange={handleChange}
                className="ant-border-space for-scrollablee"
              />
            </div>
          </SectionWrapper>
        </div>

        {
          <Row className="mt-3" gutter={[24, 0]}>
            <Col xs={24} xl={12} lg={24} className="mb-24">
              <Card bordered={false} className="circlebox h-full">
                <div className="graph-title">
                  <Title level={5}>User</Title>
                  {/* <Row style={{ justifyContent: "end" }}>
            <Radio.Group defaultValue="month" buttonStyle="solid" onChange={onChange}>
              <Radio.Button value="week">Week</Radio.Button>
              <Radio.Button value="month">Month</Radio.Button>
              <Radio.Button value="year">Year</Radio.Button>
            </Radio.Group>
          </Row> */}
                </div>
                {loading ? (
                  [1, 2, 3].map((item) => <Skeleton active key={item} />)
                ) : (
                  <LineChart data={data} borderColor="#1EB564" />
                )}
              </Card>
            </Col>
          </Row>
        }
      </div>
      {cancellation && (
        <Modal
          open={cancellation}
          width={950}
          okText="Add"
          onOk={handleOk}
          onCancel={() => setReasonModal(false)}
          cancelText="Cancel"
        >
          <Form form={form}>
            <Form.Item
              name="inputField"
              label="Reason for canceling order"
              rules={[{ required: true, message: "Input is required!" }]}
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type here"
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
}

const CountCard = ({ c, loading }) => {
  const [percentage, setPercentage] = useState();
  const [difference, setDifference] = useState();
  const { userProfile } = useAuthContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (!c) return null;

    console.log(c);
    const diff = c._7Day - c._14Day;

    const percentage = parseInt(
      ((diff / (c._7Day + c._14Day)) * 100).toFixed(2)
    );

    setPercentage(!!percentage ? percentage : 0);
  }, [c]);

  //if (!c) return null
  return (
    <Card
      hoverable
      bordered={false}
      className="criclebox dash-b-circle"
      style={{ height: "100%" }}
      loading={loading}
      onClick={() => {
        userProfile?.type != "SubAdmin" && c.url && navigate(c.url);
      }}
    >
      <div className="number" style={{ paddingLeft: "10px" }}>
        <Row align="middle" gutter={[24, 0]}>
          <Col xs={18}>
            <span>{c?.today}</span>
            {/* <p className="ftp_text">Last 7 days</p> */}
            <Title level={3}>{c?.title}</Title>
          </Col>
          <Col xs={6}>
            <div className="icon_box">
              <LineChartWithoutAxis
                isUp={percentage >= 0}
                points={[c?._14Day, c?._7Day]}
              />
            </div>
          </Col>
        </Row>
      </div>

      <div className="number_main" style={{ paddingLeft: "10px" }}>
        <div
          className="icon"
          style={{ color: percentage <= 0 ? "red" : "green" }}
        >
          <span>
            {percentage > 0 ? (
              <i class="fas fa-arrow-up"></i>
            ) : (
              <i class="fas fa-arrow-down"></i>
            )}
          </span>
          <span className="percentage">{Math.abs(percentage)}%</span>
        </div>
      </div>
    </Card>
  );
};

export default Home;
