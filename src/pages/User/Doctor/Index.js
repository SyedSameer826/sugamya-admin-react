import {
  Button,
  Table,
  Tooltip,
  Tag,
  Avatar,
  Image,
  Row,
  Col,
  Select,
  Input,
  DatePicker,
  message,
} from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import useApi from "../../../hooks/useApi";

import Plus from "../../../assets/images/plus.svg";
import ConfirmationBox from "../../../components/ConfirmationBox";
import DeleteModal from "../../../components/DeleteModal";
import SectionWrapper from "../../../components/SectionWrapper";
import apiPath from "../../../constants/apiPath";
import { AppStateContext, useAppContext } from "../../../context/AppContext";
import lang from "../../../helper/langHelper";
import { Severty, ShowToast } from "../../../helper/toast";
import useDebounce from "../../../hooks/useDebounce";
import useRequest from "../../../hooks/useRequest";
import AddFrom from "./_AddFrom";
import ViewAvailability from "./ViewAvailability";

import { useNavigate } from "react-router";
import {
  calculateAge,
  calculateAgeInYearsAndMonths,
  calculateAgeInYearsAndMonthsInDr,
} from "../../../helper/functions";
import { UndoOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Tabs } from "antd";
import DoctorAppointments from "./DoctorAppointments";
const { TabPane } = Tabs;

const { RangePicker } = DatePicker;
const { Option } = Select;

function Index() {
  const heading = lang("Doctor");
  const { setPageHeading } = useContext(AppStateContext);
  const { country } = useAppContext();
  const { getState, getCity, getCountry } = useApi();

  const sectionName = "Doctor";
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get("status");

  const api = {
    doctor: apiPath.doctor,
  };

  const page = urlParams.get("page");
  const pageSize = urlParams.get("pageSize");
  const search = urlParams.get("search");
  const start_date = urlParams.get("start_date");
  const end_date = urlParams.get("end_date");
  const [searchText, setSearchText] = useState(search ?? "");
  const { request } = useRequest();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  const [countries, setCountries] = useState();
  const [states, setStates] = useState();

  const [cities, setCities] = useState();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState();
  const [selectedDr, setSelectedDr] = useState();
  const [startDate, setStartDate] = useState();
  const [availability, setAvailability] = useState(false);
  //For Filters
  const [filter, setFilter] = useState({
    start_date: start_date ?? undefined,
    end_date: end_date ?? undefined,
  });

  const [endDate, setEndDate] = useState();
  const [selectedOptionsCountries, setSelectedOptionsCountries] = useState();
  const [selectedState, setselectedState] = useState();
  const [selectedCity, setSelectedCity] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [pagination, setPagination] = useState({
    current: +page ? +page : 1,
    pageSize: +pageSize ? +pageSize : 10,
  });
  const [exportLoading, setExportLoading] = useState(false);

  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const tabKey = queryParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabKey ? tabKey : "1");

  const handleTabChange = (key) => {
    setActiveTab(key);

    navigate(`/doctor?tab=${key}`);
  };

  const view = (id) => {
    navigate(`/doctor/view/${id}`);
  };

  const activity = (record) => {
    navigate(`/user/activity/${record?._id}`, { state: { data: record } });
  };

  const onDelete = (id) => {
    request({
      url: api.doctor + "/" + id,
      method: "DELETE",
      onSuccess: (data) => {
        setLoading(false);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleChangeStatus = (id) => {
    request({
      url: api.doctor + "/status" + id,
      method: "PUT",
      onSuccess: (data) => {
        console.log(data, 104444444);
        if (data.status == false) {
          ShowToast(data.message, Severty.ERROR);
        }
        setLoading(false);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const columns = [
    {
      title: "S.No.",
      dataIndex: "sno",
      key: "sno",
      render: (_, __, index) =>
        pagination.current === 1
          ? index + 1
          : (pagination.current - 1) * pagination?.pageSize + (index + 1),
    },
    {
      title: "Doctor Id",
      dataIndex: "uhid",
      key: "uhid",
      // filters: [
      //   {
      //     text: "A-Z",
      //     value: 1,
      //   },
      //   {
      //     text: "Z-A",
      //     value: -1,
      //   },
      // ],
      filterMultiple: false,
      width: 200,
      render: (_, { uhid, _id }) => {
        return uhid ? (
          <a
            style={{ marginLeft: 12, marginRight: 12 }}
            className="cap"
            onClick={() => view(_id)}
          >
            {uhid}
          </a>
        ) : (
          _id
        );
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      // filters: [
      //   {
      //     text: "A-Z",
      //     value: 1,
      //   },
      //   {
      //     text: "Z-A",
      //     value: -1,
      //   },
      // ],
      filterMultiple: false,
      render: (_, { name, _id, image }) => {
        return !image ? (
          <>
            <Avatar
              style={{ backgroundColor: "#00a2ae", verticalAlign: "middle" }}
              className="cap"
              size={40}
            >
              {" "}
              {name?.charAt(0)}{" "}
            </Avatar>
            <a
              style={{ marginLeft: 12, marginRight: 12 }}
              className="cap"
              onClick={() => view(_id)}
            >
              {name}
            </a>
          </>
        ) : (
          <>
            <Image className="image-index-radius" src={image} />

            <a
              style={{ marginLeft: 12, marginRight: 12 }}
              className="cap"
              onClick={() => view(_id)}
            >
              {name}
            </a>
          </>
        );
      },
      sorter: (a, b) => {
        let nameA = a.name?.toLowerCase();
        let nameB = b.name?.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      },
    },
    {
      title: "Email ID",
      dataIndex: "email",
      key: "email",
      // filters: [
      //   {
      //     text: "A-Z",
      //     value: 1,
      //   },
      //   {
      //     text: "Z-A",
      //     value: -1,
      //   },
      // ],
      filterMultiple: false,
      render: (_, { email }) => {
        return email ? (
          <span>{email.charAt(0).toLowerCase() + email.slice(1)}</span>
        ) : (
          "-"
        );
      },
      sorter: (a, b) => {
        return a.email.localeCompare(b.email);
      },
    },
    {
      title: "Phone Number",
      render: (_, { mobile_number, country_code }) => {
        if (country_code && mobile_number) {
          return `+${country_code}${mobile_number}`;
        } else if (mobile_number) {
          return mobile_number;
        } else {
          return ""; // Handle case where mobile_number is not available
        }
      },
    },
    {
      title: "Gender",
      key: "gender",
      dataIndex: "gender",
    },
    {
      title: "Experience",
      key: "experience",
      dataIndex: "experience",
    },

    {
      title: "Age",
      key: "age",
      dataIndex: "age",
      render: (_, { dob }) => {
        // const age = calculateAge(dob ? dob : 0);
        // console.log(age, "age>>>>>>>>>>>");
        return (
          <span>
            {dob ? calculateAgeInYearsAndMonthsInDr(dob) : "-"}{" "}
            {/* {age
              ? age.years && age.years !== 0
                ? `${age.years} years`
                : age.months && age.months !== 0
                ? `${age.months} months`
                : age.days && age.days !== 0
                ? `${age.days} days`
                : "-"
              : "-"} */}
          </span>
        );
      },
    },
    // {
    //   title: "Location ",
    //   key: "location",
    //   dataIndex: "location",
    //   render: (_, { location }) => {
    //     return <span className="log-width">{location}</span>;
    //   },
    // },
    {
      title: "City",
      key: "city",
      dataIndex: "city",
      render: (_, { citiesDet }) => {
        return <spna>{citiesDet?.name}</spna>;
      },
    },
    {
      title: "State",
      key: "state",
      dataIndex: "state",
      render: (_, { stateDet }) => {
        return <spna>{stateDet?.name}</spna>;
      },
    },
    {
      title: "Country",
      key: "country",
      dataIndex: "country",
      render: (_, { countryDet }) => {
        return <spna>{countryDet?.name}</spna>;
      },
    },
    {
      title: "Availability",
      // render: (_, { availability }) => {
      //   return availability ? (
      //     <>
      //       {availability.map((item) => (
      //         <>
      //           <h6>{item.availability_day}</h6>
      //           <div style={{ display: "flex", flexDirection: "column" }}>
      //             <span className="cap">
      //               {moment(item.availability_time_from).format("h:mm a") +
      //                 " - " +
      //                 moment(item.availability_time_to).format("h:mm a")}
      //             </span>
      //           </div>
      //         </>
      //       ))}
      //     </>
      //   ) : (
      //     "-"
      //   );
      // },
      render: (_, record) => {
        return (
          <Button
            onClick={() => {
              setSelected(record?._id);
              setAvailability(true);
              setSelectedDr(record);
            }}
          >
            {" "}
            <i class="fa fa-light fa-eye" style={{ fontSize: "14px" }}></i>
          </Button>
        );
      },
    },
    {
      title: "Head Doctor",
      key: "is_head_doctor",
      filters: [
        {
          text: "Yes",
          value: true,
        },
        {
          text: "No",
          value: false,
        },
      ],
      render: (_, { is_head_doctor, _id }) => {
        let color = is_head_doctor ? "green" : "grey";
        return (
          <a>
            <Tag
              onClick={(e) =>
                showConfirm({
                  record: _id,
                  path: api.doctor + "/hod",
                  onLoading: () => setLoading(true),
                  onSuccess: () => setRefresh((prev) => !prev),
                })
              }
              color={color}
              key={is_head_doctor}
            >
              {is_head_doctor ? "Yes" : "No"}
            </Tag>
          </a>
        );
      },
    },

    {
      title: "Status",
      key: "is_active",
      filters: [
        {
          text: "Active",
          value: true,
        },
        {
          text: "Inactive",
          value: false,
        },
      ],
      render: (_, { is_active, _id, is_delete }) => {
        let color = is_active ? "green" : "red";
        return (
          <a>
            <Tag
              onClick={(e) => {
                !is_delete
                  ? showConfirm({
                      record: _id,
                      path: api.doctor + "/status",
                      onLoading: () => setLoading(true),
                      onSuccess: () => setRefresh((prev) => !prev),
                    })
                  : message.error("Delete patient does not change status");
              }}
              color={color}
              key={is_active}
            >
              {is_active ? "Active" : "Inactive"}
            </Tag>
          </a>
        );
      },
    },
    {
      title: "Register Date",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
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
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            {!record?.is_delete ? (
              <>
                <Tooltip title={"Edit"} color={"purple"} key={"edit"}>
                  <Button
                    className="edit-cls btnStyle primary_btn"
                    onClick={() => {
                      setSelected(record);
                      setVisible(true);
                    }}
                  >
                    {/* <img src={EditIcon} /> */}
                    <i className="fas fa-edit"></i>
                    {/* <span>Edit</span> */}
                  </Button>
                </Tooltip>

                <Tooltip
                  title={"Activity Log"}
                  color={"purple"}
                  key={"activity user"}
                >
                  <Button
                    className="btnStyle primary_btn"
                    onClick={(e) => activity(record)}
                  >
                    <i className="fas fa-light fa-history"></i>
                  </Button>
                </Tooltip>

                <Tooltip title={"View Details"} color={"purple"} key={"Delete"}>
                  <Button
                    title=""
                    className="btnStyle primary_btn"
                    onClick={() => view(record._id)}
                  >
                    <i
                      class="fa fa-light fa-eye"
                      style={{ fontSize: "14px" }}
                    ></i>
                    {/* <span>View</span> */}
                  </Button>
                </Tooltip>

                {/* <Tooltip title={"Delete"} color={"purple"} key={"Delete"}>
              <Button
                title="Delete"
                className="btnStyle deleteDangerbtn"
                onClick={() => {
                  setSelected(record);
                  setShowDelete(true);
                }}
              >
                <img src={deleteWhiteIcon} />
                <span>Delete</span>
              </Button>
            </Tooltip> */}
              </>
            ) : (
              ""
            )}
          </div>
        );
      },
    },
  ];

  const calculateAge = (dob) => {
    console.log("dob????????????????", dob);
    if (!dob) return null;

    const today = moment();
    const birthDate = moment(dob, "DD-MM-YYYY"); // Specify the format 'DD-MM-YYYY'
    const years = today.diff(birthDate, "years");
    birthDate.add(years, "years");
    const months = today.diff(birthDate, "months");
    birthDate.add(months, "months");
    const days = today.diff(birthDate, "days");
    console.log(years, months, days);
    return { years, months, days };
  };

  useEffect(() => {
    getCountry({
      countryData: (data) => setCountries(data),
    });
  }, []);
  useEffect(() => {
    setLoading(true);
    fetchData(pagination, filter);
  }, [
    refresh,
    debouncedSearchText,
    startDate,
    endDate,
    selectedCity,
    selectedState,
    selectedOptionsCountries,
    filter,
  ]);

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const fetchData = (pagination, filters) => {
    console.log(filters, "filters>>>>>>>>>>>>>>>>>..........");
    const filterActive = filters ? filters.is_active : null;
    const filterName = filters ? filters.name : null;
    const filterEmail = filters ? filters.email : null;
    const filterIsHeadDoctor = filters ? filters.is_head_doctor : null; // Add is_head_doctor filter

    const queryString = Object.entries(filter)
      .filter(([_, v]) => v)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");
    if (queryString) {
      queryString.split("&").forEach((param) => {
        const [key, value] = param.split("=");
        urlParams.set(key, value);
      });
    }

    navigate(
      `/doctor${
        queryString
          ? `?${queryString}&search=${encodeURIComponent(
              debouncedSearchText,
            )}&page=${encodeURIComponent(
              pagination.current ?? 1,
            )}&pageSize=${encodeURIComponent(pagination.pageSize ?? 10)}`
          : `?search=${encodeURIComponent(
              debouncedSearchText,
            )}&page=${encodeURIComponent(
              pagination.current ?? 1,
            )}&pageSize=${encodeURIComponent(pagination.pageSize ?? 10)}`
      }`,
    );
    request({
      url:
        api.doctor +
        `?status=${filterActive ? filterActive.join(",") : ""}&name=${
          filterName ? filterName.join(",") : ""
        }&email=${filterEmail ? filterEmail.join(",") : ""}&is_head_doctor=${
          filterIsHeadDoctor !== null && filterIsHeadDoctor !== undefined
            ? filterIsHeadDoctor
            : ""
        }&page=${pagination ? pagination.current : 1}&pageSize=${
          pagination ? pagination.pageSize : 10
        }&search=${debouncedSearchText}${path ? `&status=1` : ""}&country=${
          selectedOptionsCountries ? selectedOptionsCountries : ""
        }&state=${selectedState ? selectedState : ""}&city=${
          selectedCity ? selectedCity : ""
        }${queryString ? `&${queryString}` : ""}`,
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setLoading(false);
        if (status) {
          setList(data.docs);
          setPagination((prev) => ({
            current: pagination?.current,
            total: data?.totalDocs,
            pageSize: pagination.pageSize,
          }));
        }
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleChange = (pagination, filters) => {
    fetchData(pagination, filters);
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
    setPagination({ current: 1, pageSize: pagination?.pageSize });
  };

  // const handleChangeDate = (e) => {
  //   if (e != null) {
  //     setStartDate(moment(e[0]._d).format("DD-MM-YYYY"));
  //     setEndDate(moment(e[1]._d).format("DD-MM-YYYY"));
  //   } else {
  //     setStartDate();
  //     setEndDate();
  //   }
  // };

  const getExportData = async (pagination, filters) => {
    console.log(filters, "filters>>>>>>>>>>>>>>>>>..........");
    const filterActive = filters ? filters.is_active : null;
    const filterName = filters ? filters.name : null;
    const filterEmail = filters ? filters.email : null;
    const filterIsHeadDoctor = filters ? filters.is_head_doctor : null; // Add is_head_doctor filter

    const queryString = Object.entries(filter)
      .filter(([_, v]) => v)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");
    if (queryString) {
      queryString.split("&").forEach((param) => {
        const [key, value] = param.split("=");
        urlParams.set(key, value);
      });
    }

    try {
      setExportLoading(true);
      request({
        url:
          api.doctor +
          `?status=${filterActive ? filterActive.join(",") : ""}&name=${
            filterName ? filterName.join(",") : ""
          }&email=${filterEmail ? filterEmail.join(",") : ""}&is_head_doctor=${
            filterIsHeadDoctor !== null && filterIsHeadDoctor !== undefined
              ? filterIsHeadDoctor
              : ""
          }&page=${
            pagination ? pagination.current : 1
          }&pageSize=${1000}&search=${debouncedSearchText}${
            path ? `&status=1` : ""
          }&country=${
            selectedOptionsCountries ? selectedOptionsCountries : ""
          }&state=${selectedState ? selectedState : ""}&city=${
            selectedCity ? selectedCity : ""
          }${queryString ? `&${queryString}` : ""}`,
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
      "Doctor Id": row?.uhid ? row?.uhid : "-",
      "Doctor Name": row.name ? row.name : "-",
      Email: row.email ? row.email : "-",
      "Phone Number":
        row.country_code && row.mobile_number
          ? `+${row.country_code}-${row.mobile_number}`
          : "-",
      Gender: row.gender ? row.gender : "-",
      experience: row.experience ? row.experience : "-",
      Age: row?.dob ? calculateAgeInYearsAndMonthsInDr(row?.dob) : "-",
      City: row.citiesDet?.name ? row.citiesDet?.name : "-",
      State: row.stateDet?.name ? row.stateDet?.name : "-",
      Country: row.countryDet?.name ? row.countryDet?.name : "-",
      "Head Doctor": row.is_head_doctor ? "Yes" : "No",
      Status: row.is_active === true ? "Active" : "Inactive",
      "Registered On": moment(row.created_at).format("DD-MM-YYYY"),
      "Rating Count": row.ratings.length ? row.ratings.length : "-",
    }));
    // alert(row.languageId.name)

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Doctor Data");
    XLSX.writeFile(
      workbook,
      `${moment().format("DD-MM-YYYY")}_Doctors${
        filter?.start_date
          ? `_${moment(filter?.start_date).format("DD-MM-YYYY")}`
          : ""
      }${
        filter?.end_date
          ? `-${moment(filter?.end_date).format("DD-MM-YYYY")}`
          : ""
      }${debouncedSearchText ? `_${debouncedSearchText}` : ""}.xlsx`,
    );
  };

  const handleReset = () => {
    setFilter({
      category_id: undefined,
      city_id: undefined,
      start_date: undefined,
      end_date: undefined,
      status: undefined,
      role: undefined,
    });
    setStartDate();
    setEndDate();
    setSearchText("");
  };
  return (
    <>
      <div className="tabled doctor">
        <Tabs
          className="blog-panel-tab"
          activeKey={activeTab}
          onChange={handleTabChange}
        >
          {/* TAB 1 → DOCTORS LIST */}
          <TabPane tab="Doctors List" key="1">
            <>
              <SectionWrapper
                cardHeading={lang("Doctors") + " " + lang("list")}
                extra={
                  <>
                    <div className="w-100 d-grid align-items-baseline text-head_right_cont">
                      <div className="pageHeadingSearch pageHeadingbig d-flex gap-2">
                        <div className="role-wrap">
                          <DatePicker.RangePicker
                            format="DD-MM-YY"
                            disabledDate={(current) =>
                              current && current > moment().endOf("day")
                            }
                            placeholder={[lang("Start Date"), lang("End Date")]}
                            value={[
                              filter.start_date
                                ? moment(filter.start_date, "YYYY-MM-DD")
                                : null,
                              filter.end_date
                                ? moment(filter.end_date, "YYYY-MM-DD")
                                : null,
                            ]}
                            onChange={(value) => {
                              if (value && value[0] && value[1]) {
                                setFilter((prev) => ({
                                  ...prev,
                                  start_date: moment(value[0]).format(
                                    "YYYY-MM-DD",
                                  ),
                                  end_date: moment(value[1]).format(
                                    "YYYY-MM-DD",
                                  ),
                                }));
                              } else {
                                setFilter((prev) => ({
                                  ...prev,
                                  start_date: undefined,
                                  end_date: undefined,
                                }));
                              }
                            }}
                          />
                        </div>
                        <Input.Search
                          className="searchInput"
                          placeholder="Search by Doctor Name, Phone Number and Email"
                          onChange={onSearch}
                          allowClear
                          value={searchText}
                        />
                        <Button
                          onClick={() => handleReset()}
                          type="primary"
                          icon={<UndoOutlined />}
                        >
                          Reset
                        </Button>
                        <Button
                          className="primary_btn btnStyle"
                          onClick={(e) => {
                            setVisible(true);
                            setSearchText("");
                          }}
                        >
                          <span className="add-Ic">
                            <img src={Plus} />
                          </span>
                          Add {sectionName}
                        </Button>
                        <Button
                          className="btnStyle  primary_btn"
                          loading={exportLoading}
                          onClick={() => getExportData()}
                        >
                          Export
                        </Button>
                      </div>
                    </div>
                  </>
                }
              >
                <div className="table-responsive customPagination">
                  <h4 className="text-right">
                    Total Records: {pagination.total}
                  </h4>
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
                      total: pagination?.total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      pageSizeOptions: ["10", "20", "30", "50"],
                    }}
                    onChange={handleChange}
                    className="ant-border-space"
                    rowClassName={(record) => {
                      return record.is_delete ? "deleted-row" : "";
                    }}
                  />
                </div>
              </SectionWrapper>

              {visible && (
                <AddFrom
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
              {availability && (
                <ViewAvailability
                  section={sectionName}
                  api={api}
                  show={availability}
                  hide={() => {
                    setSelected();
                    setAvailability(false);
                    setSelectedDr();
                  }}
                  data={selected}
                  selectedDr={selectedDr}
                  refresh={() => setRefresh((prev) => !prev)}
                />
              )}

              {showDelete && (
                <DeleteModal
                  title={"Delete User"}
                  subtitle={`Are you sure you want to Delete this user?`}
                  show={showDelete}
                  hide={() => {
                    setShowDelete(false);
                    setSelected();
                  }}
                  onOk={() => onDelete(selected?._id)}
                />
              )}

              {showStatus && (
                <DeleteModal
                  title={`${selected?.is_active ? `Block` : `UnBlock`} User`}
                  subtitle={`Are you sure you want to ${
                    selected?.is_active ? `block` : `unblock`
                  } this user?`}
                  show={showStatus}
                  hide={() => {
                    setShowStatus(false);
                    setSelected();
                  }}
                  onOk={() => handleChangeStatus(selected?._id)}
                />
              )}
            </>
          </TabPane>

          {/* TAB 2 → DOCTOR'S AVAILABILITY */}
          <TabPane tab="Doctor's Availability" key="2">
            <DoctorAppointments />
          </TabPane>
        </Tabs>
      </div>

      {/* KEEP YOUR MODALS BELOW (AddForm, DeleteModal, etc.) */}
    </>
  );
}

export default Index;
