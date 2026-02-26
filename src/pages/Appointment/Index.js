import {
  Button,
  DatePicker,
  Input,
  Select,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import Plus from "../../assets/images/plus.svg";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import ConfirmationBox from "../../components/ConfirmationBox";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { AppStateContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import AddForm from "./AddForm";
import UpdateScheduledAppointmentForm from "./UpdateScheduledAppointmentForm";
import AddAppointmentForm from "./AddAppointmentForm";
import ChangeDoctor from "./ChangeDoctor";
import { IstConvert } from "../../helper/functions";

const { RangePicker } = DatePicker;
const { Option } = Select;

function Index() {
  const heading = lang("Appointment ");
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Appointment Manager";
  const routeName = "appointment";
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const appointmentStatus = queryParams.get("appointment_status");

  const api = {
    appointment: apiPath.appointment,
  };

  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  const [endDate, setEndDate] = useState();
  const [startDate, setStartDate] = useState();
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get("status");
  const page = urlParams.get("page");
  const pageSize = urlParams.get("pageSize");
  const paramspatientSearchText = urlParams.get("patientSearchText");
  const paramsDoctorSearchText = urlParams.get("doctorSearchText");
  const end_date = urlParams.get("end_date");
  const [appointmentSearchText, setAppointmentSearchText] = useState(
    urlParams.get("debouncedSearchText") ?? "",
  );
  const [patientSearchText, setPatientSearchText] = useState(
    paramspatientSearchText ?? "",
  );
  const [doctorSearchText, setDoctorSearchText] = useState(
    paramsDoctorSearchText ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleAddAppointment, setVisibleAddAppointment] = useState(false);
  const [visibleUpdateSchedule, setUpdateScheduleVisible] = useState(false);
  const [modal, setModal] = useState(false);
  //For Filters
  const [filter, setFilter] = useState();

  const [selected, setSelected] = useState("");
  const [pagination, setPagination] = useState({
    current: +page ? +page : 1,
    pageSize: +pageSize ? +pageSize : 10,
  });
  const debouncedSearchText = useDebounce(appointmentSearchText, 300);
  const debouncedPatientSearchText = useDebounce(patientSearchText, 300);
  const debouncedDoctorSearchText = useDebounce(doctorSearchText, 300);
  const [exportLoading, setExportLoading] = useState(false);

  const navigate = useNavigate();
  const handleChangeStatus = (id, value, type) => {
    setLoading(true);
    const payload = { value: value };
    request({
      url: api.appointment + "/status/" + id + `?type=${type}`,
      method: "put",
      data: payload,
      onSuccess: (data) => {
        console.log(data, "data>>>>>>>>");
        if (data.status == false) {
          ShowToast(data.message, Severty.ERROR);
        } else {
          setLoading(false);
          setRefresh((prev) => !prev);
        }
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  const handleChange = (pagination, filters) => {
    setFilter(filters);
    fetchData(pagination, filters);
  };

  const correctAppointTime = (appointment_time, appointment_date) => {
    // console.log(appointment_time, "appointment_time", appointment_date, "appointment_date");

    // Parse the date and time separately and combine them
    const formattedDate = moment(appointment_date, "DD-MM-YYYY").format(
      "DD-MM-YYYY",
    );
    const formattedTime = moment(appointment_time, "hh:mm A").format("HH:mm");

    const appointmentDateTime = moment(
      `${formattedDate}T${formattedTime}`,
      "DD-MM-YYYYTHH:mm",
    );
    const currentTime = moment();

    // Clone appointmentDateTime before adding to avoid side effects
    const isDisabled = currentTime.isAfter(
      appointmentDateTime.clone().add(24, "hours"),
    );

    // console.log(isDisabled, "--isDisabled", currentTime, "currentTime", appointmentDateTime, "appointmentDateTime");
    return isDisabled;
  };

  const columns = [
    {
      title: "S. No",
      dataIndex: "index",
      key: "index",
      render: (value, item, index) =>
        pagination.current === 1
          ? index + 1
          : (pagination.current - 1) * pagination.pageSize + (index + 1),
    },
    {
      title: "Appointment ID",
      dataIndex: "appointment_id",
      key: "appointment_id",
      render: (_, { appointment_id }) =>
        appointment_id ? <span className="cap">{appointment_id}</span> : "-",
    },
    {
      title: "UHID",
      dataIndex: "uhid",
      key: "uhid",
      render: (_, { patient_details }) =>
        patient_details ? (
          <span
            className="cap"
            style={{ color: "red", cursor: "pointer" }}
            onClick={() => navigate(`/patient/view/${patient_details._id}`)}
          >
            {patient_details?.uhid}
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "Patient",
      dataIndex: "user",
      key: "user",
      render: (_, { patient_details, booked_for }) => {
        return (
          <>
            {patient_details ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span className="cap">{patient_details?.name}</span>
                <span className="cap">{patient_details?.email}</span>

                {patient_details?.mobile_number &&
                  patient_details?.country_code && (
                    <span style={{ color: "gray", fontSize: "12px" }}>
                      {patient_details?.country_code +
                        "-" +
                        patient_details?.mobile_number}
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
                      ? patient_details?.relationship_with_user
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
          : "-";
      },

      sorter: (a, b) =>
        moment(a.appointment_date).unix() - moment(b.appointment_date).unix(),
      // defaultSortOrder: 'descend',
    },
    {
      title: "Scheduled Time",
      key: "appointment_time",
      dataIndex: "appointment_time",
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
    // {
    //   title: "Booked On",
    //   key: "created_at",
    //   dataIndex: "created_at",
    //   render: (_, { created_at }) => {
    //     return moment(created_at).format("DD-MM-YYYY");
    //   },

    //   sorter: (a, b) =>
    //     moment(a.created_at).unix() - moment(b.created_at).unix(),
    //   // defaultSortOrder: 'descend',
    // },

    {
      title: "Booked On",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return created_at ? moment(created_at).format("DD-MM-YYYY") : "-";
      },
      sorter: (a, b) =>
        moment(a.created_at).unix() - moment(b.created_at).unix(),
      defaultSortOrder: "descend",
    },

    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (_, { price }) => {
        return price ? <span className="cap">${price}</span> : "$0";
      },
    },
    // {
    //   title: "User",
    //   dataIndex: "user",
    //   key: "user",
    //   render: (_, { user, booked_for }) => {
    //     return (
    //       <>
    //         {user ? (
    //           <div
    //             style={{
    //               display: "flex",
    //               flexDirection: "column",
    //               gap: 4,
    //             }}
    //           >
    //             <span className="cap">
    //               {user?.name
    //                 ? user?.name
    //                 : user?.firstName + " " + user?.lastName}
    //             </span>
    //             {user?.mobile_number && user?.country_code && (
    //               <span style={{ color: "gray", fontSize: "12px" }}>
    //                 {user?.country_code + "-" + user?.mobile_number}
    //               </span>
    //             )}
    //             {/* {booked_for && (
    //               <Tag
    //                 color={
    //                   booked_for == "self"
    //                     ? "green"
    //                     : booked_for == "relation"
    //                     ? "blue"
    //                     : "teal"
    //                 }
    //                 key={booked_for}
    //                 className="cap"
    //               >
    //                 {booked_for}
    //               </Tag>
    //             )} */}
    //           </div>
    //         ) : (
    //           "-"
    //         )}
    //       </>
    //     );
    //   },
    // },

    {
      title: "Doctor",
      dataIndex: "doctor",
      key: "doctor",
      render: (_, { _id, doctor }) => {
        return (
          <>
            {doctor ? (
              <div
                onClick={() => setModal(true)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span className="cap">{doctor?.name}</span>
                {/* {doctor?.mobile_number && doctor?.country_code && (
                  <span style={{ color: "gray", fontSize: "12px" }}>
                    {doctor?.country_code + "-" + doctor?.mobile_number}
                  </span>
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
      title: "Next Follow-up",
      dataIndex: "Next Follow-up",
      key: "nextFollowUpDate",
      render: (_, { nextFollowUpDate }) => nextFollowUpDate,
    },

    {
      title: "Appt Type",
      key: "appointment_type",
      filters: [
        {
          text: "New",
          value: "New",
        },
        {
          text: "Follow-up",
          value: "Follow-up",
        },
      ],
      render: (
        _,
        { appointment_type, _id, appointment_time, appointment_date },
      ) => {
        console.log("Status :: ", appointment_type);
        const timeInLocal = moment.utc(appointment_time, "HH:mm").local();
        const appTime = timeInLocal.isValid()
          ? timeInLocal.format("hh:mm A")
          : "-";
        const appDate = appointment_date
          ? moment.parseZone(appointment_date).format("DD-MM-YYYY")
          : "-";
        return (
          <a>
            <Select
              value={appointment_type}
              // style={{ width: 120 }}
              onChange={(value) => handleChangeStatus(_id, value, "type")}
              disabled={correctAppointTime(appTime, appDate)}
              // disabled={true}
            >
              <Option value="New">New</Option>
              <Option value="Follow-up">Follow-up</Option>
            </Select>
          </a>
        );
      },
    },

    {
      title: "Appt Category",
      key: "appointment_category",
      filters: [
        {
          text: "Not Applicable",
          value: "NA",
        },
        {
          text: "Reschedule",
          value: "Rescheduled",
        },
        {
          text: "Replacement",
          value: "Replacement",
        },
        {
          text: "Lab Report",
          value: "LabReport",
        },
        {
          text: "Emergency",
          value: "Emergency",
        },
      ],
      render: (
        _,
        { appointment_category, _id, appointment_time, appointment_date },
      ) => {
        console.log("Status :: ", appointment_category);
        const timeInLocal = moment.utc(appointment_time, "HH:mm").local();
        const appTime = timeInLocal.isValid()
          ? timeInLocal.format("hh:mm A")
          : "-";
        const appDate = appointment_date
          ? moment.parseZone(appointment_date).format("DD-MM-YYYY")
          : "-";
        return (
          <a>
            <Select
              value={appointment_category}
              // style={{ width: 120 }}
              onChange={(value) => handleChangeStatus(_id, value, "category")}
              disabled={correctAppointTime(appTime, appDate)}
            >
              <Option value="NA">Not Applicable</Option>
              <Option value="LabReport">Lab Report</Option>
              <Option value="Replacement">Replacement</Option>
              <Option value="Rescheduled">Reschedule</Option>
              <Option value="Emergency">Emergency</Option>
            </Select>
          </a>
        );
      },
    },
    {
      title: "Appt Status",
      key: "appointment_status",
      filters: [
        {
          text: "Upcoming",
          value: "pending",
        },
        {
          text: "Completed",
          value: "completed",
        },
        {
          text: "Cancelled",
          value: "cancelled",
        },
      ],
      render: (
        _,
        { appointment_status, _id, appointment_time, appointment_date },
      ) => {
        console.log("Status :: ", appointment_status);
        const timeInLocal = moment.utc(appointment_time, "HH:mm").local();
        const appTime = timeInLocal.isValid()
          ? timeInLocal.format("hh:mm A")
          : "-";
        const appDate = appointment_date
          ? moment.parseZone(appointment_date).format("DD-MM-YYYY")
          : "-";
        return (
          <a>
            <Select
              value={appointment_status}
              // style={{ width: 120 }}
              disabled
              // ={correctAppointTime(appTime, appDate)}
              onChange={(value) => handleChangeStatus(_id, value, "Astatus")}
            >
              <Option value="pending">Upcoming</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </a>
        );
      },
    },
    // {
    //   title: "Doctor Set Status",
    //   key: "status",
    //   filters: [
    //     {
    //       text: "Not assigned",
    //       value: "NA",
    //     },
    //     {
    //       text: "No Show",
    //       value: "NoShow",
    //     },
    //     // {
    //     //   text: "Patient Cancel",
    //     //   value: "patient_cancel",
    //     // },
    //     {
    //       text: "Cart",
    //       value: "Cart",
    //     },
    //     {
    //       text: "Incomplete",
    //       value: "Incomplete",
    //     },
    //     {
    //       text: "Report Awaited",
    //       value: "ReportAwaited",
    //     },
    //   ],
    //   render: (_, { status, _id , appointment_time , appointment_date}) => {
    //     console.log("Status :: ", status);
    //     const timeInLocal = moment.utc(appointment_time, "HH:mm").local();
    //     const appTime = timeInLocal.isValid() ? timeInLocal.format("hh:mm A") : "-"
    //     const appDate = appointment_date ? moment.parseZone(appointment_date).format("DD-MM-YYYY") : "-";
    //     return (
    //       <a>
    //         <Select
    //           value={status}
    //           // style={{ width: 120 }}
    //           disabled={correctAppointTime(appTime,appDate)}
    //           onChange={(value) => handleChangeStatus(_id, value, "status")}
    //         >
    //           {/* <Option value="NA">Not Assigned</Option>
    //           <Option value="NoShow">No Show</Option> */}
    //           {/* <Option value="patient_cancel">Patient Cancel</Option> */}
    //           {/* <Option value="Cart">Cart</Option>
    //           <Option value="Incomplete">Incomplete</Option>
    //           <Option value="ReportAwaited">Report Awaited</Option> */}
    //         </Select>
    //       </a>
    //     );
    //   },
    // },
    {
      title: "Doctor Set Status",
      key: "status",
      filters: [
        { text: "Not assigned", value: "NA" },
        { text: "No Show", value: "NoShow" },
        { text: "Cart", value: "Cart" },
        { text: "Incomplete", value: "Incomplete" },
        { text: "Report Awaited", value: "ReportAwaited" },
      ],
      render: (
        _,
        { status, _id, appointment_time, appointment_date, appointment_status },
      ) => {
        console.log("Status :: ", status);

        const timeInLocal = moment.utc(appointment_time, "HH:mm").local();
        const appTime = timeInLocal.isValid()
          ? timeInLocal.format("hh:mm A")
          : "-";
        const appDate = appointment_date
          ? moment.parseZone(appointment_date).format("DD-MM-YYYY")
          : "-";

        return (
          <a>
            <Select
              value={status}
              disabled={correctAppointTime(appTime, appDate)}
              onChange={(value) => handleChangeStatus(_id, value, "status")}
            >
              <Option
                value="NA"
                // disabled={appointment_status !== "pending"}
              >
                Not Assigned
              </Option>
              <Option
                value="NoShow"
                // disabled={appointment_status !== "cancelled"}
              >
                No Show
              </Option>
              <Option
                value="Cart"
                // disabled={appointment_status !== "completed"}
              >
                Cart
              </Option>
              <Option
                value="Incomplete"
                // disabled={appointment_status !== "cancelled"}
              >
                Incomplete
              </Option>
              <Option
                value="ReportAwaited"
                // disabled={appointment_status !== "completed"}
              >
                Report Awaited
              </Option>
            </Select>
          </a>
        );
      },
    },
    // {
    //   title: "Action",
    //   render: (_, record) => {
    //     return (
    //       <>
    //         {record?.appointment_status === "pending" &&
    //           record?.status === "NA" && record?.appointment_category !== "Emergency"&&(
    //             <Tooltip
    //               title={lang("Assign Doctor")}
    //               color={"purple"}
    //               key={"update" + routeName}
    //             >
    //               <Button
    //                 title={lang("Assign Doctor")}
    //                 className="Edit-cls btnStyle primary_btn"
    //                 onClick={() => {
    //                   setSelected(record);
    //                   setVisible(true);
    //                 }}
    //               >
    //                 Assign Doctor
    //                 {/* <i class="fas fa-edit"></i> */}
    //                 {/* <span>{lang("Edit")}</span> */}
    //               </Button>
    //             </Tooltip>
    //           )}

    //         <Tooltip
    //           color={"purple"}
    //           title={"View " + sectionName}
    //           key={"viewappointment" + routeName}
    //         >
    //           <Button
    //             className="btnStyle  primary_btn"
    //             title="View"
    //             onClick={() => navigate(`/${routeName}/view/${record._id}`)}
    //           >
    //             <i className="fa fa-light fa-eye"></i>
    //           </Button>
    //         </Tooltip>
    //       </>
    //     );
    //   },
    // },

    {
      title: "Action",
      render: (_, record) => {
        const appointmentDate = moment(record.appointment_date);
        const isPastAppointment = appointmentDate.isBefore(moment(), "day");

        return (
          <>
            {record?.appointment_status != "pending" && (
              <Tooltip title={"Edit"} color={"purple"} key={"edit"}>
                <Button
                  className="edit-cls btnStyle primary_btn"
                  onClick={() => {
                    setSelected(record);
                    setUpdateScheduleVisible(true);
                  }}
                >
                  <i class="fas fa-edit"></i>
                </Button>
              </Tooltip>
            )}

            {record?.appointment_status === "pending" &&
              record?.status === "NA" &&
              record?.appointment_category !== "Emergency" &&
              !isPastAppointment && (
                <Tooltip
                  title={lang("Assign Doctor")}
                  color={"purple"}
                  key={"update" + routeName}
                >
                  <Button
                    title={lang("Assign Doctor")}
                    className="Edit-cls btnStyle primary_btn"
                    onClick={() => {
                      setSelected(record);
                      setVisible(true);
                    }}
                  >
                    Assign Doctor
                  </Button>
                </Tooltip>
              )}

            <Tooltip
              color={"purple"}
              title={"View " + sectionName}
              key={"viewappointment" + routeName}
            >
              <Button
                className="btnStyle  primary_btn"
                title="View"
                onClick={() => navigate(`/${routeName}/view/${record._id}`)}
              >
                <i className="fa fa-light fa-eye"></i>
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetchData(pagination, filter);
  }, [
    refresh,
    debouncedSearchText,
    debouncedPatientSearchText,
    debouncedDoctorSearchText,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.status : null;
    const selectedSegment = filters ? filters.appointment_type : null;
    const selectedTab = filters ? filters.appointment_status : null;
    const selectedCategory = filters ? filters.appointment_category : null;

    navigate(
      `/appointment${`?patientSearchText=${encodeURIComponent(
        debouncedPatientSearchText,
      )}&doctorSearchText=${encodeURIComponent(
        debouncedDoctorSearchText,
      )}&debouncedSearchText=${encodeURIComponent(
        debouncedSearchText,
      )}&page=${encodeURIComponent(
        pagination.current ?? 1,
      )}&pageSize=${encodeURIComponent(pagination.pageSize ?? 10)}`}`,
    );
    request({
      url:
        api.appointment +
        `?page=${pagination ? pagination.current : 1}&pageSize=${
          pagination?.pageSize ? pagination.pageSize : 10
        }&debouncedSearchText=${
          debouncedSearchText ? debouncedSearchText : ""
        }&patientSearchText=${debouncedPatientSearchText}&doctorSearchText=${debouncedDoctorSearchText}&appointment_type=${
          selectedSegment ? selectedSegment : ""
        }&start_date=${startDate ? startDate : ""}&end_date=${
          endDate ? endDate : ""
        }&appointment_status=${
          selectedTab ? selectedTab : appointmentStatus
        }&appointment_category=${
          selectedCategory ? selectedCategory : ""
        }&status=${filterActive ? filterActive : ""}`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setList(data.data.docs);
        setPagination((prev) => ({
          current: pagination?.current,
          pageSize: pagination?.pageSize,
          total: data?.data?.totalDocs,
        }));
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);

        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleChangeDate = (e) => {
    if (e != null) {
      setStartDate(moment(e[0]._d).format("YYYY-MM-DD"));
      setEndDate(moment(e[1]._d).format("YYYY-MM-DD"));
    } else {
      setStartDate();
      setEndDate();
    }
  };

  const onPatientSearch = (e) => {
    setPatientSearchText(e.target.value);
    setPagination({ current: 1 });
  };

  const onAppointmentIdSearch = (e) => {
    setAppointmentSearchText(e.target.value);
    setPagination({ current: 1 });
  };

  const onDoctorSearch = (e) => {
    setDoctorSearchText(e.target.value);
    setPagination({ current: 1 });
  };

  const handleReset = () => {
    setRefresh((prev) => !prev);
    setPagination({ current: 1, pageSize: 10 });
    setStartDate();
    setEndDate();
    setDoctorSearchText("");
    setPatientSearchText("");
  };

  const getExportData = async (pagination, filters) => {
    const filterActive = filters ? filters.status : null;
    const selectedSegment = filters ? filters.appointment_type : null;
    const selectedTab = filters ? filters.appointment_status : null;
    const selectedCategory = filters ? filters.appointment_category : null;
    try {
      setExportLoading(true);
      request({
        url:
          api.appointment +
          `?page=${1}&pageSize=${
            pagination?.total ? pagination.total : 10000
          }&search=${debouncedSearchText}&patientSearchText=${debouncedPatientSearchText}&doctorSearchText=${debouncedDoctorSearchText}&appointment_type=${
            selectedSegment ? selectedSegment : ""
          }&start_date=${startDate ? startDate : ""}&end_date=${
            endDate ? endDate : ""
          }&appointment_status=${
            selectedTab ? selectedTab : appointmentStatus
          }&appointment_category=${
            selectedCategory ? selectedCategory : ""
          }&status=${filterActive ? filterActive : ""}`,
        method: "GET",
        onSuccess: ({ data, status, total, message }) => {
          setExportLoading(false);
          if (status) {
            excelData(data.docs ?? []);
          }
        },
        onError: (error) => {
          console.log(error);
          setExportLoading(false);
          ShowToast(error, Severty.ERROR);
        },
      });
    } catch (err) {
      console.log(err);
      setExportLoading(false);
    }
  };

  const excelData = (exportData) => {
    if (!exportData.length) return;

    const data = exportData.map((row, index) => ({
      "S.No.": index + 1,
      "Appointment Id": row?.appointment_id ? row?.appointment_id : "-",
      UHID: row?.patient_details?.uhid ? row?.patient_details?.uhid : "-",
      "Patient Name": row?.patient_details?.name
        ? row?.patient_details?.name
        : "-",
      "Patient Email": row?.patient_details?.email
        ? row?.patient_details?.email
        : "-",
      "Patient MobileNo.":
        row?.patient_details?.country_code &&
        row?.patient_details?.mobile_number
          ? `+${row?.patient_details?.country_code}${row?.patient_details?.mobile_number}`
          : "-",
      "Relationship with user":
        row?.booked_for === "relation"
          ? row?.patient_details?.relationship_with_user
          : row?.booked_for
            ? row?.booked_for
            : "-",

      "Scheduled Date": row?.appointment_date
        ? moment.parseZone(row?.appointment_date).format("DD-MM-YYYY")
        : "-",
      "Scheduled Time": row?.appointment_time
        ? moment(row?.appointment_time, "HH:mm").format("hh:mm A")
        : "-",
      "Booked On": row?.created_at
        ? moment(row?.created_at).format("DD-MM-YYYY")
        : "-",
      "Price($)": row?.price ? row?.price : "0",
      Doctor: row?.doctor?.name ? row?.doctor?.name : "-",
      "Appt Type": row?.appointment_type ? row?.appointment_type : "-",
      "Appt Category": row?.appointment_category
        ? row?.appointment_category
        : "-",
      "Appt Status": row?.appointment_status ? row?.appointment_status : "-",
      "Doctor Set Status":
        row?.status == "NA"
          ? "Not Assigned"
          : row?.status == "NoShow"
            ? "No Show"
            : row?.status == "Cart"
              ? "Cart"
              : row?.status == "Incomplete"
                ? "Incomplete"
                : row?.status == "ReportAwaited"
                  ? "Report Awaited"
                  : row?.status,
    }));
    // alert(row.languageId.name)

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Appointment Data");
    XLSX.writeFile(
      workbook,

      `${moment().format("DD-MM-YYYY")}_Appointments${
        startDate ? `_${moment(startDate).format("DD-MM-YYYY")}` : ""
      }${endDate ? `-${moment(endDate).format("DD-MM-YYYY")}` : ""}${
        debouncedDoctorSearchText ? `_Dr. ${debouncedDoctorSearchText}` : ""
      }${
        debouncedPatientSearchText ? `_${debouncedPatientSearchText}` : ""
      }.xlsx`,
    );
  };
  return (
    <>
      <SectionWrapper
        cardHeading={`Appointments`}
        extra={
          <>
            <div className="w-100 text-head_right_cont">
              <div className="pageHeadingSearch d-flex gap-2">
                {/* <Input.Search
                  className="searchInput"
                  placeholder="Search by customer name, Phone number, email"
                  onChange={onSearch}
                  allowClear
                /> */}
                <RangePicker
                  style={{ height: 44 }}
                  format="DD-MM-YY"
                  disabledDate={(current) => current.isAfter(Date.now())}
                  onChange={handleChangeDate}
                />

                <Input.Search
                  value={patientSearchText}
                  className="searchInput"
                  placeholder="Search by patient name"
                  onChange={onPatientSearch}
                  allowClear
                />

                <Input.Search
                  value={appointmentSearchText}
                  className="searchInput"
                  placeholder="Search by appointment ID"
                  onChange={onAppointmentIdSearch}
                  allowClear
                />

                <Input.Search
                  value={doctorSearchText}
                  className="searchInput"
                  placeholder="Search by doctor name"
                  onChange={onDoctorSearch}
                  allowClear
                />
              </div>
              <Button
                className="btnStyle  primary_btn"
                onClick={() => handleReset()}
              >
                Reset
              </Button>
              <Button
                className="btnStyle  primary_btn"
                loading={exportLoading}
                onClick={() => getExportData()}
              >
                Export
              </Button>
              <Button
                className="primary_btn btnStyle"
                onClick={(e) => {
                  setVisibleAddAppointment(true);
                  setSearchText("");
                }}
              >
                <span className="add-Ic">
                  <img src={Plus} />
                </span>
                Add Appointment
              </Button>
            </div>
          </>
        }
      >
        <div className="sssss" style={{ overflowx: "scroll" }}>
          <h4 className="text-right">Total Records: {pagination.total ?? 0}</h4>
          <Table
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={{
              current: pagination?.current,
              defaultPageSize: +pageSize
                ? +pageSize
                : (+pagination.pageSize ?? 10),
              responsive: true,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["10", "20", "30", "50"],
            }}
            onChange={handleChange}
            className="ant-border-space"
          />
        </div>
      </SectionWrapper>

      {visible && (
        <AddForm
          section={sectionName}
          api={api}
          show={visible}
          hide={() => {
            setSelected();
            setVisible(false);
          }}
          data={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}
      {visibleAddAppointment && (
        <AddAppointmentForm
          section={sectionName}
          api={api}
          show={visibleAddAppointment}
          hide={() => {
            setSelected();
            setVisibleAddAppointment(false);
          }}
          data={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}
      {visibleUpdateSchedule && (
        <UpdateScheduledAppointmentForm
          section={sectionName}
          api={api}
          show={visibleUpdateSchedule}
          hide={() => {
            setUpdateScheduleVisible(false);
          }}
          data={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}
      {/* {modal && (
        <ChangeDoctor
          section={sectionName}
          api={api}
          show={visible}
          hide={() => {
            setSelected();
            setVisible(false);
          }}
          data={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )} */}
    </>
  );
}

export default Index;
