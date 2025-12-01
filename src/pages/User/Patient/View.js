import {
  Row,
  Col,
  Card,
  Button,
  Skeleton,
  Avatar,
  Select,
  Image,
  Tooltip,
  Table,
  Tag,
} from "antd";
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useRequest from "../../../hooks/useRequest";
import { ShowToast, Severty } from "../../../helper/toast";
import apiPath from "../../../constants/apiPath";
import { Badge } from "antd";
import moment from "moment";
const { Option } = Select;

function View() {
  const sectionName = "Patient";
  const routeName = "patient";
  const params = useParams();
  const navigate = useNavigate();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState({});
  const [appointments, setPatientAppointment] = useState([]);
  const [patientCart, setPatientCart] = useState([]);
  const [patientAge, setPatientAge] = useState();
  const [patientTransactions, setPatientTransactions] = useState([]);
  const [patientOrders, setPatientOrder] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const view = (id) => {
    navigate(`/appointment/view/${id}`);
  };
  const fetchData = (id) => {
    setLoading(true);
    request({
      url: apiPath.viewPatient + "/" + id,
      method: "GET",
      onSuccess: ({ status, data }) => {
        if (!status) return;
        setLoading(false);
        setPatient(data);
        setPatientAge(calculateAge(data.dob));
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  const fetchAppointmentData = (id) => {
    setLoading(true);
    request({
      url: apiPath.viewPatientAppointment + "/appointments/" + id,
      method: "GET",
      onSuccess: ({ status, data }) => {
        if (!status) return;
        setLoading(false);
        setPatientAppointment(data);
        fetchDoctors(data);
        setPatientAge(calculateAge(data.dob));
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  const fetchOrderData = (id) => {
    setLoading(true);
    request({
      url: apiPath.viewPatientOrders + "/order/" + id,
      method: "GET",
      onSuccess: ({ status, data }) => {
        if (!status) return;
        setLoading(false);
        setPatientOrder(data.docs);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const fetchCartData = (id) => {
    setLoading(true);
    request({
      url: apiPath.viewPatientOrders + "/cart/" + id,
      method: "GET",
      onSuccess: ({ status, data }) => {
        if (!status) return;
        setLoading(false);
        setPatientCart(data.docs);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const fetchTransactionData = (id) => {
    setLoading(true);
    request({
      url: apiPath.viewPatientAppointment + "/transaction/" + id,
      method: "GET",
      onSuccess: ({ status, total }) => {
        if (!status) return;
        setLoading(false);
        setPatientTransactions(total.docs);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const fetchDoctors = (data) => {
    const uniqueDoctors = {};

    // Iterate through each appointment record
    data.forEach((appointment) => {
      const docotorId = appointment?.doctor_id?._id;
      if (!uniqueDoctors.hasOwnProperty(docotorId)) {
        uniqueDoctors[docotorId] = {
          _id: docotorId,
          uhid: appointment?.doctor_id?.uhid, // Store the entire appointment details
          name: appointment?.doctor_id?.name,
          email: appointment?.doctor_id?.email,
          mobile_number: `${appointment?.doctor_id?.country_code}${appointment?.doctor_id?.mobile_number}`,
        };
      }
    });
    const uniqueDoctorsArray = Object.values(uniqueDoctors);
  };

  useEffect(() => {
    fetchData(params.id);
    fetchAppointmentData(params.id);
    fetchOrderData(params.id);
    fetchCartData(params.id);
    fetchTransactionData(params.id);
  }, []);

  const AppointmentColumns = [
    {
      title: "S. No",
      dataIndex: "index",
      key: "index",
      render: (value, item, index) =>
        pagination.current === 1
          ? index + 1
          : (pagination.current - 1) * 10 + (index + 1),
    },
    {
      title: "Appointment Id",
      key: "appointment_id",
      dataIndex: "appointment_id",
    },
    {
      title: "UHID",
      dataIndex: "uhid",
      key: "uhid",
      render: (_, { patient_id }) =>
        patient_id ? (
          <span
            className="cap"
            style={{ color: "red", cursor: "pointer" }}
          // onClick={() => navigate(`/patient/view/${patient_id._id}`)}
          >
            {patient_id?.uhid}
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "Patient",
      dataIndex: "user",
      key: "user",
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
                <span className="cap">{patient_id?.email}</span>

                {patient_id?.mobile_number &&
                  patient_id?.country_code && (
                    <span style={{ color: "gray", fontSize: "12px" }}>
                      {patient_id?.country_code +
                        "-" +
                        patient_id?.mobile_number}
                    </span>
                  )}
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
      title: "Scheduled Date",
      key: "date",
      dataIndex: "date",
      render: (_, { appointment_date }) => {
        return appointment_date
          ? moment.parseZone(appointment_date).format("DD-MM-YYYY")
          : new Date();
      },

      sorter: (a, b) =>
        moment(a.appointment_date).unix() - moment(b.appointment_date).unix(),
      // defaultSortOrder: 'descend',
    },
    {
      title: "Scheduled Time",
      key: "time",
      dataIndex: "time",
      render: (_, { appointment_time }) => {
        if (!appointment_time) {
          return <p>-</p>;
        }

        // Parse the time in UTC and adjust to local time
        const timeInLocal = moment.utc(appointment_time, "HH:mm").local();

        // Format the time in local time zone
        return (
          <p>{timeInLocal.isValid() ? timeInLocal.format("hh:mm A") : "-"}</p>
        );
      },
    },
    {
      title: "Booked On",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },

      sorter: (a, b) =>
        moment(a.created_at).unix() - moment(b.created_at).unix(),
      // defaultSortOrder: 'descend',
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
      title: "Doctor",
      dataIndex: "doctor_id",
      key: "doctor_id",
      render: (_, { doctor_id }) =>
      // <Image width={50} src={image ? apiPath.assetURL + image : notfound} />
      {
        return (
          <Link
            style={{ color: "blue" }}
            to={`/doctor/view/${doctor_id?._id}`}
          >
            {doctor_id?.name}
          </Link>
        );
      },
    },
   
    {
      title: "Appt Type",
      key: "appointment_type",
      dataIndex: "appointment_type",
    },
    {
      title: "Appt Category",
      key: "appointment_category",
      dataIndex: "appointment_category",
    },
    {
      title: "Appt Status",
      key: "appointment_status",
      dataIndex: "appointment_status",
    },
    {
      title: "Doctor Set Status",
      key: "status",
      dataIndex: "status",
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            <Tooltip title={"View Details"} color={"purple"} key={"Delete"}>
              <Button
                title=""
                className="btnStyle primary_btn"
                onClick={() => view(record._id)}
              >
                <i class="fa fa-light fa-eye" style={{ fontSize: "14px" }}></i>
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const TransactionColumns = [
    {
      title: "S.No.",
      dataIndex: "sno",
      key: "sno",
      render: (_, __, index) =>
        pagination.current === 1
          ? index + 1
          : (pagination.current - 1) * 10 + (index + 1),
    },
    {
      title: "Transaction ID",
      dataIndex: "uhid",
      key: "uhid",
      sorter: (a, b) => {
        if (a.transaction_id && b.transaction_id) {
          return a.transaction_id.localeCompare(b.transaction_id);
        }
        return 0;
      },
      render: (_, { uhid, transaction_id }) => {
        return uhid ? (
          <Link style={{ cursor: "pointer" }} to={`/${routeName}/view/${transaction_id}`}>{uhid}</Link>
        ) : (
          transaction_id
        );
      },
    },
    {
      title: "Payment ID",
      dataIndex: "uhid",
      key: "uhid",
      render: (_, { uhid, transaction_id }) => {
        return uhid ? (
          <Link to={`/${routeName}/view/${transaction_id}`}>{uhid}</Link>
        ) : (
          transaction_id
        );
      },
    },
    {
      title: "Transaction Date",
      key: "date_time_transaction",
      dataIndex: "date_time_transaction",
      sorter: (a, b) => moment(a?.created_at).unix() - moment(b?.created_at).unix(),
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
    },
    {
      title: "Patients",
      key: "booked_for",
      dataIndex: "patient_id",
      // render: (patient) => patient?.name || "N/A",
      render: (_, { patient_id }) => {
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
                <span className="cap"
                  style={{ color: "red", cursor: "pointer" }}
                  onClick={() => navigate(`/patient/view/${patient_id._id}`)}

                >{patient_id?.uhid}</span>
                <span className="cap">{patient_id?.name}</span>
                <span className="cap">{patient_id?.email}</span>

                {patient_id?.mobile_number &&
                  patient_id?.country_code && (
                    <span style={{ color: "gray", fontSize: "12px" }}>
                      {patient_id?.country_code +
                        "-" +
                        patient_id?.mobile_number}
                    </span>
                  )}
                {/* {booked_for && (
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
                          ? patient_details?.relationship_with_user
                          : booked_for}
                      </Tag>
                    )} */}
              </div>
            ) : (
              "-"
            )}
          </>
        );
      },
    },
    {
      title: "Appointment ID",
      dataIndex: ["appointment_id", "appointment_id"],
      key: "appointment_id",
      filterMultiple: false,
      width: 200,
      render: (_, { appointment_id }) => {
        return appointment_id && appointment_id.appointment_id
          ? <Link to={`/appointment/view/${appointment_id._id}`}> {appointment_id.appointment_id} </Link>
          : "";
      },
      sorter: (a, b) => {
        if (a.appointment_id && b.appointment_id) {
          return a.appointment_id.appointment_id.localeCompare(b.appointment_id.appointment_id);
        }
        return 0;
      },
    },
    {
      title: "Order ID",
      key: "order_id",
      dataIndex: "order_id",
      render: (_, { order_id }) => {
        return order_id?.order_id;
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
    // {
    //   title: "Booked By",
    //   key: "booked_by",
    //   dataIndex: "booked_by",
    // },
    // {
    //   title: "Booked For",
    //   key: "booked_for",
    //   dataIndex: "patient_id",
    //   render: (patient) => patient?.name || "N/A",
    // },
    // {
    //   title: "Doctor Name",
    //   key: "doctor_name",
    //   dataIndex: "doctor_name",
    // },
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
    },
    {
      title: "Gst Amount",
      dataIndex: "gst_amount",
      key: "gst_amount",
      render: (_, { gst_amount, discountedPrice }) =>
        gst_amount ? (
          <span className="cap">${gst_amount}</span>
        ) : (
          "$0"
        ),
    },
    {
      title: "Payment Mode",
      key: "payment_mod",
      dataIndex: "payment_mod",
    },
  ];

  const CartColumns = [
    {
      title: "S.No.",
      dataIndex: "sno",
      key: "sno",
      render: (_, __, index) =>
        pagination.current === 1
          ? index + 1
          : (pagination.current - 1) * 10 + (index + 1),
    },
    {
      title: "Cart ID",
      dataIndex: "cartId",
      key: "cartId",
      sorter: (a, b) => a?.cartId?.localeCompare(b?.cartId),
      render: (_, { cartId, patientDetails }) => {
        return cartId ? cartId : cartId;
      },
    },
    {
      title: "Appointment ID",
      dataIndex: "appointmentId",
      key: "appointmentId",
      render: (_, { appointmentDetails }) =>
        appointmentDetails ? appointmentDetails?.appointment_id : "-",
    },
    {
      title: "UHID",
      dataIndex: "patientDetails",
      key: "patientDetails",
      render: (_, { patientDetails }) =>
        patientDetails ? (
          <Link to={`/patient/view/${patientDetails?._id}`}>
            {" "}
            {patientDetails?.uhid}{" "}
          </Link>
        ) : (
          "-"
        ),
    },
    {
      title: "Patient",
      dataIndex: "patientDetails",
      key: "patientName",
      render: (_, { patientDetails, booked_for }) => {
        return (
          <>
            {patientDetails ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span className="cap">{patientDetails?.name}</span>
                <span className="cap">{patientDetails?.email}</span>

                {patientDetails?.mobile_number &&
                  patientDetails?.country_code && (
                    <span style={{ color: "gray", fontSize: "12px" }}>
                      {patientDetails?.country_code +
                        "-" +
                        patientDetails?.mobile_number}
                    </span>
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
      title: "Cart Date and Time",
      dataIndex: "cart",
      key: "cart",
      sorter: (a, b) =>
        moment(a?.created_at).unix() - moment(b?.created_at).unix(),
      render: (_, { created_at }) => {
        return created_at ? moment(created_at).format("DD-MM-YYYY HH:mm") : "-";
      },
    },
    {
      title: "Cart Expiry",
      dataIndex: "cartExpiry",
      key: "cartExpiry",
      sorter: (a, b) =>
        moment(a?.cartExpiry, "DD-MM-YYYY").unix() - moment(b?.cartExpiry, "DD-MM-YYYY").unix(),
      render: (_, { cartExpiry }) => {
        return cartExpiry ? cartExpiry : "-";
      },
    },
    {
      title: "Doctor Name",
      dataIndex: "doctorDetails",
      key: "doctorName",
      render: (doctorDetails) => (doctorDetails ? doctorDetails?.name : "-"),
    },
    // {
    //   title: "User Name",
    //   dataIndex: "userDetails",
    //   key: "userDetails",
    //   render: (userDetails) => userDetails ? userDetails[0]?.name : "-"
    // },
    {
      title: "Products",
      dataIndex: "productDetails",
      key: "products",
      render: (_, { products }) => (
        <>
          {products?.length
            ? products?.map((product, index) => (
              <div key={index} style={{ marginBottom: "8px" }}>
                <span style={{ marginLeft: "12px" }}>
                  {product?.productDetails?.[0]?.name} - {product?.qty}
                </span>
              </div>
            ))
            : "-"}
        </>
      ),
    },
    {
      title: "Cart Basic Price",
      dataIndex: "productDetails",
      key: "productPrice",
      render: (_, { cartTotal }) => (
        <>
          <span>{cartTotal ? `$ ${cartTotal?.toFixed(2)}` : "$0"}</span>
        </>
      ),
    },
    {
      title: "Cart Display Price",
      dataIndex: "productDetails",
      key: "productPrice",
      render: (_, { total_amount }) => (
        <>
          <span>{total_amount ? `$ ${total_amount?.toFixed(2)}` : "$0"}</span>
        </>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration) => <span>{duration}</span>,
    },
    // {
    //   title: "Cart total",
    //   dataIndex: "cartTotal",
    //   key: "cartTotal",
    //   render: (cartTotal) => (
    //     <span>{cartTotal ? `$ ${cartTotal?.toFixed(2)}` : "-"}</span>
    //   ),
    // },
    {
      title: "Gst Amount",
      dataIndex: "gst_amount",
      key: "gst_amount",
      render: (gst_amount) => (
        <span>{gst_amount ? `$ ${gst_amount?.toFixed(2)}` : "$0"}</span>
      ),
    },
    // {
    //   title: "Total Amount",
    //   dataIndex: "total_amount",
    //   key: "total_amount",
    //   render: (total_amount) => (
    //     <span>{total_amount ? `$ ${total_amount?.toFixed(2)}` : "-"}</span>
    //   ),
    // },
    {
      title: "Admin approval",
      key: "admin_approval",

      render: (_, { admin_approval, _id, is_delete }) => {
        let color = admin_approval ? "green" : "red";
        return (
          <a>
            <Tag
              // onClick={(e) => {
              //   !admin_approval
              //     ? showConfirm({
              //         record: _id,
              //         path: apiPath.cartApproval,
              //         onLoading: () => setLoading(true),
              //         onSuccess: () => setRefresh((prev) => !prev),
              //       })
              //     : message.error("Cart Already approved!");
              // }}
              color={color}
              key={admin_approval}
            >
              {admin_approval ? "Approved" : "Not-Approved"}
            </Tag>
          </a>
        );
      },
    },
    {
      title: "doctor approval",
      key: "doctor_approval",

      render: (_, { doctor_approval, _id, is_delete }) => {
        let color = doctor_approval ? "green" : "red";
        return (
          <a>
            <Tag
              onClick={(e) => {
                // showConfirm({
                //       record: _id,
                //       path: api.patient + "/status",
                //       onLoading: () => setLoading(true),
                //       onSuccess: () => setRefresh((prev) => !prev),
                //     })
              }}
              color={color}
              key={doctor_approval}
            >
              {doctor_approval ? "Approved" : "Not-Approved"}
            </Tag>
          </a>
        );
      },
    },
    {
      title: "Cart Status",
      dataIndex: "cartStatus",
      key: "cartStatus",
      filters: [
        { text: "Checkout", value: "checkout" },
        { text: "Expiry", value: "expiry" },
        { text: "Pending", value: "pending" }, // Add more statuses as needed
      ],
      onFilter: (value, record) => record.cartStatus === value,
      render: (cartStatus, record) => (
        <>
          {record?.cartStatus == "checkout" ? <Tag
            color={"green"}
          // onClick={() => {
          //   setShowStatus(true); // Open the modal
          //   setSelected(record); // Set the selected cart item
          // }}
          // style={{ cursor: "pointer" }}
          >
            {cartStatus}
          </Tag> : <Tag
            color={
              cartStatus === "checkout"
                ? "green"
                : cartStatus === "expiry"
                  ? "red"
                  : "orange"
            }
            // onClick={() => handleCartStatus(record)}
            style={{ cursor: "pointer" }}
          >
            {cartStatus}
          </Tag>}
        </>
      ),
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => {
    //     return (
    //       <div div className="d-flex justify-contenbt-start">
    //         {(record?.cartStatus !== "checkout" && record?.cartStatus !== "expiry") ? (
    //           <Tooltip title={"Edit"} color={"purple"} key={"edit"}>
    //             <Button
    //               className="edit-cls btnStyle primary_btn"
    //               onClick={() => {
    //                 setSelected(record);
    //                 setVisible(true);
    //               }}
    //             >
    //               {/* <img src={EditIcon} /> */}
    //               <i className="fas fa-edit"></i>
    //               {/* <span>Edit</span> */}
    //             </Button>
    //           </Tooltip>
    //         ) : (
    //           ""
    //         )}
    //       </div>
    //     );
    //   },
    // },
  ];

  function calculateAge(dob) {
    // Parse the DOB and current date
    const currentDate = new Date();
    const dobDate = new Date(dob);
    const currentDateObj = new Date(currentDate);

    // Calculate the difference in milliseconds
    let ageDiffMs = currentDateObj - dobDate;

    // Convert milliseconds to years, months, and days
    let ageDate = new Date(ageDiffMs);
    let ageYears = Math.abs(ageDate.getUTCFullYear() - 1970);
    let ageMonths = ageDate.getUTCMonth();
    let ageDays = ageDate.getUTCDate() - 1; // Subtract 1 to get days, as getUTCDate returns the day of the month (1 to 31)

    return {
      years: ageYears,
      months: ageMonths,
      days: ageDays,
    };
  }
  const orderColumns = [
    {
      title: "S.No.",
      dataIndex: "sno",
      key: "sno",
      render: (_, __, index) =>
        pagination.current === 1
          ? index + 1
          : (pagination.current - 1) * 10 + (index + 1),
    },
    {
      title: "Order id",
      dataIndex: "order_id",
      key: "order_id",
      // render: (_, { uid }) => (uid ? <span className="cap">#{uid}</span> : "-"),
    },
    {
      title: "Order Date",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) =>
        moment(a?.created_at).unix() - moment(b?.created_at).unix(),
      render: (_, { created_at }) =>
        created_at ? (
          <span className="cap">{moment(created_at).format("DD-MM-YYYY")}</span>
        ) : (
          "-"
        ),
    },
    {
      title: "Order Time",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) =>
        moment(a?.created_at).unix() - moment(b?.created_at).unix(),
      render: (created_at) =>
        created_at ? (
          <span className="cap">{moment(created_at).format("HH:mm")}</span>
        ) : (
          "-"
        ),
    },
    {
      title: "UHID",
      dataIndex: "booked_by",
      key: "booked_by",
      render: (_, { patientDetail }) =>
        patientDetail ? (
          <span className="cap">{patientDetail?.uhid}</span>
        ) : (
          "-"
        ),
    },
    {
      title: "Patient Name",
      dataIndex: "booked_for",
      key: "booked_for",
      render: (_, { patientDetail }) =>
        patientDetail ? (
          <span className="cap">{patientDetail?.name}</span>
        ) : (
          "-"
        ),
    },
    {
      title: "Appointment ID",
      dataIndex: "appointmentDetails",
      key: "appointment_id",
      filterMultiple: false,
      width: 200,
      render: (_, { appointmentDetails }) => {
        return appointmentDetails && appointmentDetails.appointment_id ? (
          <Link to={`/appointment/view/${appointmentDetails._id}`}>
            {appointmentDetails.appointment_id}
          </Link>
        ) : (
          "-"
        );
      },
      sorter: (a, b) => {
        if (
          a.appointmentDetails &&
          b.appointmentDetails &&
          a.appointmentDetails.appointment_id &&
          b.appointmentDetails.appointment_id
        ) {
          return a.appointmentDetails.appointment_id.localeCompare(
            b.appointmentDetails.appointment_id
          );
        }
        return 0;
      },
    },
    {
      title: "Cart ID",
      dataIndex: "cart",
      key: "cart",
      filterMultiple: false,
      width: 200,
      render: (_, { cart }) => {
        return cart && cart.cartId ? <p>{cart?.cartId}</p> : "-";
      },
    },
    {
      title: "Agency",
      dataIndex: "agency",
      key: "agency",
      render: (_, { agency }) =>
        agency ? <span className="cap">{agency}</span> : "-",
    },
    {
      title: "Docket Number",
      dataIndex: "docketNumber",
      key: "docketNumber",
      render: (_, { docketNumber }) =>
        docketNumber ? <span className="cap">{docketNumber}</span> : "-",
    },
    {
      title: "Docket Date",
      dataIndex: "docketDate",
      key: "docketDate",
      render: (_, { docketDate }) =>
        docketDate ? (
          <span className="cap">{moment(docketDate).format("DD-MM-YYYY")}</span>
        ) : (
          "-"
        ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (_, { userAddress }) =>
        userAddress ? (
          <span className="cap">
            {`${userAddress?.building_no}, ${userAddress?.city?.name} ,${userAddress?.state?.name} , ${userAddress?.country?.name}`}
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "Cart Price",
      dataIndex: "price",
      key: "price",
      render: (_, { discountedAmount }) =>
        discountedAmount ? (
          <span className="cap">${discountedAmount}</span>
        ) : (
          "-"
        ),
    },
    {
      title: "Discount Code",
      dataIndex: "discountCode",
      key: "discountCode",
      render: (_, { discountCode }) =>
        discountCode ? <span className="cap">{discountCode}</span> : "-",
    },
    {
      title: "Discounted Amount",
      dataIndex: "discountedAmount",
      key: "discountedAmount",
      render: (_, { discountedAmount, discountedPrice }) =>
        discountedAmount ? (
          <span className="cap">${discountedAmount - discountedPrice}</span>
        ) : (
          "-"
        ),
    },
    {
      title: "Order Price",
      dataIndex: "doctor_id",
      key: "doctor_id",
      render: (_, { discountedAmount, discountedPrice }) =>
        discountedAmount ? (
          <span className="cap">${discountedAmount - discountedPrice}</span>
        ) : (
          "-"
        ),
    },

    {
      title: "Gst Amount",
      dataIndex: "gst_amount",
      key: "gst_amount",
      render: (_, { gst_amount, discountedPrice }) =>
        gst_amount ? <span className="cap">${gst_amount}</span> : "$0",
    },
    {
      title: "Status",
      key: "orderStatus",
      dataIndex: "orderStatus",
      filters: [
        {
          text: "Received",
          value: "Received",
        },
        {
          text: "Shipped",
          value: "Shipped",
        },
        {
          text: "Delivered",
          value: "Delivered",
        },
        {
          text: "Refunded",
          value: "Refunded",
        },
        {
          text: "Cancelled",
          value: "Cancelled",
        },
        {
          text: "Processing",
          value: "processing",
        },
        // {
        //   text: "Ready to pickup",
        //   value: "ready to pickup",
        // },
      ],
      render: (_, { orderStatus, _id }) => {
        return (
          <a>
            <Select
              value={orderStatus}
              style={{ width: 120 }}
              disabled
            // onChange={(value) => handleChangeStatus(_id, value, "type")}
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
      title: "Delivery Date",
      dataIndex: "deliveryDate",
      key: "deliveryDate",
      sorter: (a, b) =>
        moment(a?.deliveryDate).unix() - moment(b?.deliveryDate).unix(),
      render: (_, { deliveryDate }) => {
        return (
          <span>
            {" "}
            {deliveryDate ? moment(deliveryDate).format("DD-MM-YYYY") : "-"}
          </span>
        );
        // if (deliveryDate) {
        //   return <span>{moment(deliveryDate).format("DD-MM-YYYY")}</span>;
        // } else {
        //   const currentDate = new Date();
        //   currentDate.setDate(currentDate.getDate() + 8);
        //   return (
        //     <span className="cap">
        //       {moment(currentDate).format("DD-MM-YYYY")}
        //     </span>
        //   );
        // }
      },
    },
  ];

  const imageUrlPrefix = "https://sugamaya.s3.amazonaws.com/";
  return (
    <>
      <Row gutter={16}>
        <Col span={24} xs={24}>
          <Card title={sectionName + " Details"}>
            {/* <p className="text-right">#{doctor.uhid}</p>
            <p className="text-right">{doctor.name}</p> */}
            {loading ? (
              [1, 2, 3].map((item) => <Skeleton active key={item} />)
            ) : (
              <div className="view-main-list ">
                {loading ? (
                  [1, 2, 3].map((item) => <Skeleton active key={item} />)
                ) : (
                  <div className="view-main-patient">
                    <div className="view-user-prouser-details">
                      <h6>
                        {patient && !patient.image ? (
                          <Avatar
                            style={{
                              backgroundColor: "#00a2ae",
                              verticalAlign: "middle",
                            }}
                            className="cap"
                          >
                            {patient?.name?.charAt(0)}
                          </Avatar>
                        ) : (
                          <Image
                            className="image-radius"
                            src={patient?.image}
                          />
                        )}
                      </h6>

                      <div>
                        <p className="mb-0">#{patient?.uhid}</p>
                        <span> {patient?.name}</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* {
                  <div className="view-inner-cls">
                    <h5>Advisory Note :</h5>
                    {patient && patient?.advisory ? (
                      <h6>
                        <div className="pdf-icons">
                          <i className="fas fa-file-pdf"></i>
                        </div>
                        <h6>
                          <a
                            href={patient?.advisory}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View 
                          </a>
                        </h6>
                      </h6>
                    ) : "-"}
                  </div>
                }
                  {
                  <div className="view-inner-cls">
                    <h5>LabReports Note :</h5>
                    {patient && patient?.labReports ? (
                      <h6>
                        <div className="pdf-icons">
                          <i className="fas fa-file-pdf"></i>
                        </div>
                        <h6>
                          <a
                            href={patient?.labReports}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View 
                          </a>
                        </h6>
                      </h6>
                    ) : "-"}
                  </div>
                } */}

                {patient?.file?.length ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                    <h5 style={{ margin: 0 }}>Patient Documents:</h5>

                    <div style={{ display: "flex", gap: "15px" }}>
                      {patient &&
                        patient?.file?.map((doc) => {
                          const ext = doc.split(".").pop().toLowerCase();

                          const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
                          const isPDF = ext === "pdf";

                          const handleDownload = async (e) => {
                            e.preventDefault();
                            try {
                              const response = await fetch(apiPath.assetURL + doc);
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const formattedDate = moment().format("DD_MM_YYYY");
                              const fileName = `${formattedDate}_${patient?.uhid}_${patient?.name}.${ext}`;

                              const a = document.createElement("a");
                              a.style.display = "none";
                              a.href = url;
                              a.setAttribute("download", fileName);
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            } catch (error) {
                              console.error("Error downloading file:", error);
                            }
                          };

                          return (
                            <div
                              key={doc}
                              style={{ cursor: "pointer" }}
                              onClick={handleDownload}
                            >
                              {isImage && (
                                <img
                                  src={apiPath.assetURL + doc}
                                  alt="document"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover",
                                    borderRadius: "5px",
                                  }}
                                />
                              )}
                              {isPDF && (
                                <i
                                  className="fas fa-file-pdf"
                                  style={{ fontSize: "40px", color: "red" }}
                                ></i>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>

                ) : (
                  ""
                )}
              </div>
            )}
          </Card>
          {/* <Card title={`${sectionName} Details`}>
        
            {loading ? (
              [1, 2, 3].map((item) => <Skeleton active key={item} />)
            ) : (
              <div className="view-main-patient">
                 <div className="view-user-prouser-details">
        <h6>
          {patient && !patient.image ? (
            <Avatar
              style={{
                backgroundColor: "#00a2ae",
                verticalAlign: "middle",
              }}
              className="cap"
            >
              {patient?.name?.charAt(0)}
            </Avatar>
          ) : (
            <Image className="image-radius" src={patient?.image} />
          )}
        </h6>
     
        <div>
        <p className="mb-0">#{patient?.uhid}</p>
          <span> {patient?.name}</span>
        </div>
        </div>
               
              </div>
            )}
          </Card> */}
        </Col>

        <div className="float-end mt-3 w-100 text-right">
          <Button
            className="primary_btn btnStyle"
            onClick={() => window.history.back()}
          >
            Back
          </Button>
        </div>
      </Row>

      <Card className="mt-3" title="Appointments">
        <div className="tabled">
          <Row gutter={[24, 0]}>
            <Col xs={24} xl={24}>
              <div className="table-responsive customPagination">
                <p>Total Records: {appointments.length}</p>
                <Table
                  loading={loading}
                  columns={AppointmentColumns}
                  dataSource={appointments}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      <Card className="mt-3" title="Orders">
        <div className="tabled">
          <Row gutter={[24, 0]}>
            <Col xs={24} xl={24}>
              <div className="table-responsive customPagination">
                <p>Total Records: {patientOrders.length}</p>
                <Table
                  loading={loading}
                  columns={orderColumns}
                  dataSource={patientOrders}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      <Card className="mt-3" title="Carts">
        <div className="tabled">
          <Row gutter={[24, 0]}>
            <Col xs={24} xl={24}>
              <div className="table-responsive customPagination">
                <p>Total Records: {patientOrders.length}</p>
                <Table
                  loading={loading}
                  columns={CartColumns}
                  dataSource={patientCart}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      <Card className="mt-3" title="Transactions">
        <div className="tabled">
          <Row gutter={[24, 0]}>
            <Col xs={24} xl={24}>
              <div className="table-responsive customPagination">
                <Table
                  loading={loading}
                  columns={TransactionColumns}
                  dataSource={patientTransactions}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Col>
          </Row>
        </div>
      </Card>
    </>
  );
}

export default View;
