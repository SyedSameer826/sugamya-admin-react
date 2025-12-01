import { Row, Col, Card, Table, DatePicker, Tag, Button, Avatar } from "antd";
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
import { SubTitle } from "chart.js";
const { RangePicker } = DatePicker;


function Activity() {
  
  const sectionName = "Activity";
  const routeName = "activity";
  const params = useParams();
  const navigate = useNavigate();
  const api = {
    list: apiPath.activity,
  };

  const heading = lang("User") + " " + lang("management");
  const { setPageHeading } = useContext(AppStateContext);
  const { request } = useRequest();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState(0);
  const [days, setDays] = useState('');
  const [name, setName] = useState('')
  const location = useLocation()
  const userData = location?.state?.data
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const columns = [
   
   
    {
      title: "Active On",
      key: "active_on",
      dataIndex: "active_on",
      render: (_, { active_on }) => {
        return active_on
          ? moment(active_on).format("DD-MM-YYYY hh:mm A")
          : "-";
      },
    },
    {
      title: "Inactive On",
      key: "inactive_on",
      dataIndex: "inactive_on",
      render: (_, { inactive_on }) => {
        return inactive_on
          ? moment(inactive_on).format("DD-MM-YYYY hh:mm A")
          : "-";
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
  ];

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
        setDays(data.data.inactiveDays)
        setList(data.data.list.docs);
        // setName(data.data.list.docs[0].user.name? data.data.list.docs[0].user.name:`${ data.data.list.docs[0].user.firstName} ${ data.data.list.docs[0].user.lastName}` );

        setDays(data.data.inactiveDays)
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
console.log("isActive days work or not",days)
  const handleChangeDate = (e) => {
    if (e != null) {
      setStartDate(moment(e[0]._d).format("DD-MM-YYYY"));
      setEndDate(moment(e[1]._d).format("DD-MM-YYYY"));
    } else {
      setStartDate();
      setEndDate();
    }
  };
  const handleExport = () => {
    const data =
      list &&
      list.length > 0 &&
      list.map((row, index) => (
        {
          "S.No.": index + 1,
          "User Id": row?.user_id?.uhid ? row?.user_id?.uhid : "-",
          "Name": (row?.user_id?.name?.split(" ")[0] && row?.user_id?.name?.split(" ")[1])  ? row?.user_id?.name?.split(" ")[0] +" "+ row?.user_id?.name?.split(" ")[1] : "-",          
          "Device Type": row?.device_type ? row?.device_type : "-",
          "Active on":row?.active_on? moment(row?.active_on).format("DD-MM-YYYY HH:mm A"): "-",
          "InActive On":row?.inactive_on ? moment(row?.inactive_on).format("DD-MM-YYYY HH:mm A"): "-",
        }
        // alert(row.languageId.name)
      ));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Data");
    XLSX.writeFile(
      workbook,
      `${moment().milliseconds() +
      1000 * (moment().seconds() + 60 * 60) +
      "-access"
      }.xlsx`
    );
  };

  return (
    <>
    <Card className="mb-3">
     <div className="card-data-user-image-image">
     <div className="card-data-user-image">
     {userData?.image ?  <img src={userData?.image} /> : 
     <>
      <Avatar
      style={{ backgroundColor: "#00a2ae", verticalAlign: "middle" }}
      className="cap"
      size={60}
    >
      {" "}
      {userData?.name?.charAt(0)}{" "}
    </Avatar>
     </>}
      </div>
    <div className="card-data-user">
                  <h3>{userData?.name ? userData?.name : ""}</h3>
                  <h3>{userData?.email ? userData?.email : userData?.email}</h3>
                  <h6>UHID : {userData?.uhid ? userData?.uhid : ""}</h6>
                  </div>
     </div>
    </Card>
      <div className="tabled customerMain">
     

        <Row gutter={[24, 0]}>
          <Col span={24} xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24 card-subtitle-heading-card-new420kk"          
              title={
                <>
                <div className="card-subtitle-heading">
                  <div>{sectionName + " Management"}</div>
                  </div>
                </>
              }
             
            
              // extra={
              //   <>
              //     <div className="searchOuter search-topbar">
              //       <RangePicker
              //         disabledDate={(current) => current.isAfter(Date.now())}
              //         onChange={handleChangeDate}
              //       />
              //       <Button className="btnStyle  primary_btn" onClick={() => handleExport()} >Export</Button>
              //     </div>
              //   </>
              // }
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
        <Button className="primary_btn btnStyle float-end" onClick={()=>  window.history.back()}>Back</Button>
      </div>
    </>
  );
}
export default Activity;
