import {
  Row,
  Col,
  Card,
  Table,
  DatePicker,
  Tag,
  Button,
  Tooltip,
  Avatar,
} from "antd";
import React, { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";

import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import moment from "moment";
import ShowTotal from "../../components/ShowTotal";
import apiPath from "../../constants/apiPath";
import * as XLSX from "xlsx";
import { calculateAge } from "../../helper/functions";

import { AppStateContext, useAppContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
const { RangePicker } = DatePicker;

function UserDevices() {
  const sectionName = "User Logged In Devices";
  const routeName = "userDevices";
  const params = useParams();
  const navigate = useNavigate();
  const api = {
    list: apiPath.userdevices,
  };

  const heading = lang("User Logged In Devices") + " " + lang("management");
  const { setPageHeading } = useContext(AppStateContext);
  const { request } = useRequest();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState(0);
  const [days, setDays] = useState("");
  const [name, setName] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [exportLoading, setExportLoading] = useState(false);
  const location = useLocation();
  const userData = location?.state?.data;

  const columns = [
    {
      title: "Last Logged In",
      key: "login_time",
      dataIndex: "login_time",
      render: (_, { login_time }) => {
        if (!login_time) {
          return <p>-</p>;
        }

        // Parse the time in UTC and adjust to local time
        const timeInLocal = moment.utc(login_time, "DD-MM-YYYY hh:mm A").local();

        // Format the time in local time zone
        return (
          <p>{timeInLocal.isValid() ? timeInLocal.format("DD-MM-YYYY hh:mm A") : "-"}</p>
        );
      },
    },
    {
      title: "Last Logged Out",
      key: "logout_time",
      dataIndex: "logout_time",
      // render: (_, { logout_time }) => {
      //   if (!logout_time) {
      //     return <p>-</p>;
      //   }

      //   // Parse the time in UTC and adjust to local time
      //   const timeInLocal = moment.utc(logout_time, "HH:mm").local();

      //   // Format the time in local time zone
      //   return <p>{timeInLocal.isValid() ? timeInLocal.format("DD-MM-YYYY HH:mm A") : "-"}</p>;
      // },
      render: (_, { logout_time }) => {
        if (!logout_time) {
          return <p>-</p>;
        }

        // Parse the time in UTC and adjust to local time
        const timeInLocal = moment.utc(logout_time, "DD-MM-YYYY hh:mm A").local();

        // Format the time in local time zone
        return (
          <p>{timeInLocal.isValid() ? timeInLocal.format("DD-MM-YYYY hh:mm A") : "-"}</p>
        );
      },
    },
    {
      title: "Device Type",
      dataIndex: "device_type",
      key: "device_type",
      render: (_, { device_type }) => {
        return device_type ? (
          <Tag color={"green"}>
            <span className="cap">{device_type}</span>
          </Tag>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Action",
      fixed: "right",
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            <>
              <Tooltip
                title={"Activity Log"}
                color={"purple"}
                key={"activity user"}
              >
                <Button
                  className="btnStyle primary_btn"
                  onClick={(e) => activity(record._id)}
                >
                  <i className="fas fa-light fa-history"></i>
                </Button>
              </Tooltip>
            </>
          </div>
        );
      },
    },
  ];
  const activity = (id) => {
    navigate(`/user/activity/${id}`);
    setPageHeading("User Activity");
  };
  useEffect(() => {
    setLoading(true);
    fetchData(params.id, pagination);
  }, [refresh, startDate, endDate]);

  const fetchData = (userId, pagination, filters) => {
    request({
      url:
        api.list +
        `/${userId}` +
        `?page=${pagination ? pagination.current : 1}&limit=${
          pagination ? pagination.pageSize : 10
        }&start_date=${startDate ? startDate : ""}&end_date=${
          endDate ? endDate : ""
        }`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setDays(data.data.inactiveDays);
        setList(data.data.data);
        setName(
          data.data.list.docs[0].user.name
            ? data.data.list.docs[0].user.name
            : `${data.data.list.docs[0].user.firstName} ${data.data.list.docs[0].user.lastName}`
        );

        setDays(data.data.inactiveDays);
        setPagination((prev) => ({
          current: pagination.current,
          total: data.data.list.totalDocs,
        }));
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleChange = (pagination, filters) => {
    fetchData(pagination, filters);
  };
  console.log("isActive days work or not", days);
  const handleChangeDate = (e) => {
    if (e != null) {
      setStartDate(moment(e[0]._d).format("DD-MM-YYYY"));
      setEndDate(moment(e[1]._d).format("DD-MM-YYYY"));
    } else {
      setStartDate();
      setEndDate();
    }
  };

  // const handleExport = () => {
  //   const data =
  //     list &&
  //     list.length > 0 &&
  //     list.map((row, index) => ({
  //       "S.No.": index + 1,
  //       "User Id": row?.user_id?.uhid,
  //       Name:
  //         row?.user_id?.name?.split(" ")[0] +
  //         " " +
  //         row?.user_id?.name?.split(" ")[1],
  //       "Last Logged In": row?.login_time
  //         ? moment(row?.login_time).format("DD-MM-YYYY HH:mm A")
  //         : "-",
  //       "Last Logged Out": row?.logout_time
  //         ? moment(row?.logout_time).format("DD-MM-YYYY HH:mm A")
  //         : "-",
  //       "Device Type": row?.device_type ? row?.device_type : "-",
  //     }));
  //     // alert(row.languageId.name)

  //   const workbook = XLSX.utils.book_new();
  //   const worksheet = XLSX.utils.json_to_sheet(data);
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "User Data");
  //   XLSX.writeFile(
  //     workbook,
  //     `${
  //       startDate
  //         ? moment(startDate).format("ll")
  //         : moment(new Date()).format("ll")
  //     }_UserDevices_${debouncedSearchText}_${
  //       endDate ? moment(endDate).format("ll") : ""
  //     }.xlsx`
  //   );
  // };

  const getExportData = async (pagination, filters) => {
    try {
      setExportLoading(true);
      request({
        url:
          api.list +
          `/${params.id}` +
          `?page=${1}&limit=${
            pagination ? pagination.total : 1000
          }&start_date=${startDate ? startDate : ""}&end_date=${
            endDate ? endDate : ""
          }`,
        method: "GET",
        onSuccess: ({ data, status, total, message }) => {
          setExportLoading(false);
          if (status) {
            excelData(data.data ?? []);
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
      "User Id": row?.user_id?.uhid ? row?.user_id?.uhid : "-",
      Name:
        row?.user_id?.name?.split(" ")[0] +
        " " +
        row?.user_id?.name?.split(" ")[1],
      "Last Logged In": row?.login_time
        ? moment(row?.login_time).format("DD-MM-YYYY HH:mm A")
        : "-",
      "Last Logged Out": row?.logout_time
        ? moment(row?.logout_time).format("DD-MM-YYYY HH:mm A")
        : "-",
      "Device Type": row?.device_type ? row?.device_type : "-",
    }));
    // alert(row.languageId.name)

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Devices Data");
    XLSX.writeFile(
      workbook,
      `${moment().format("DD-MM-YYYY")}_UserDevices${
        startDate ? `_${moment(startDate).format("DD-MM-YYYY")}` : ""
      }${endDate ? `-${moment(endDate).format("DD-MM-YYYY")}` : ""}.xlsx`

      // (startDate && endDate ) ? `${
      //   startDate
      //     ? moment(startDate).format("ll")
      //     : moment().subtract(5, "years").format("ll")
      // }_UserDevices_${
      //   endDate ? moment(endDate).format("ll") : moment(new Date()).format("ll")
      // }.xlsx` : `UserDevices.xlsx`
    );
  };

  return (
    <>
      <Card className="mb-3">
        <div className="card-data-user-image-image">
          <div className="card-data-user-image">
            {userData?.image ? (
              <img src={userData?.image} />
            ) : (
              <>
                <Avatar
                  style={{
                    backgroundColor: "#00a2ae",
                    verticalAlign: "middle",
                  }}
                  className="cap"
                  size={60}
                >
                  {" "}
                  {userData?.name?.charAt(0)}{" "}
                </Avatar>
              </>
            )}
          </div>
          <div className="card-data-user">
            <h3>{userData?.name ? userData?.name : ""}</h3>
            <h3>{userData?.email ? userData?.email : userData?.email}</h3>
            <h6>User Id : {userData?.uhid ? userData?.uhid : ""}</h6>
          </div>
        </div>
      </Card>
      <div className="tabled customerMain">
        <Row gutter={[24, 0]}>
          <Col span={24} xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              title={
                <>
                  <div className="card-subtitle-heading">
                    <div>{sectionName + " Management"}</div>
                  </div>
                </>
              }
              extra={
                <>
                  <div className="searchOuter search-topbar">
                    <RangePicker
                    format="DD-MM-YY"
                      disabledDate={(current) => current.isAfter(Date.now())}
                      onChange={handleChangeDate}
                    />
                    <Button
                      className="btnStyle  primary_btn"
                      loading={exportLoading}
                      onClick={() => getExportData()}
                    >
                      Export
                    </Button>
                  </div>
                </>
              }
            >
              {/* <h4 className="text-right mb-1">
                { `${days? days: 0} Active Days` }
              </h4> */}
              <div className="table-responsive customPagination">
                <Table
                  loading={loading}
                  columns={columns}
                  dataSource={list}
                  pagination={{
                    defaultPageSize: 10,
                    responsive: true,
                    total: pagination.total,
                    showSizeChanger: false,
                    // pageSizeOptions: ["10", "20", "30", "50"],
                  }}
                  onChange={handleChange}
                  className="ant-border-space"
                />
              </div>
            </Card>
          </Col>
        </Row>
        <Button
          className="primary_btn btnStyle float-end"
          onClick={() => window.history.back()}
        >
          Back
        </Button>
      </div>
    </>
  );
}
export default UserDevices;
