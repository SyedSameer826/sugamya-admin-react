import { Button, DatePicker, Table, Tag, Select } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DeleteModal from "../../components/DeleteModal";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { AppStateContext, useAppContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
//   import AddFrom from "./AddFrom";
import { useNavigate } from "react-router";
import StatusModal from "../../components/LeaveStatus";

const { RangePicker } = DatePicker;

function Index() {
  const heading = lang("Leave");
  const { setPageHeading } = useContext(AppStateContext);

  const sectionName = "Leave";
  const routeName = "patient";
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get("status");

  const api = {
    addEdit: apiPath.listPatient,
    doctor: apiPath.listLeave,
  };

  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [totalRecords, setTotalRecords] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [selectedOptionsCountries, setSelectedOptionsCountries] = useState();
  const [selectedState, setselectedState] = useState();
  const [selectedCity, setSelectedCity] = useState();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
 //For Filters
 const [filter, setFilter] = useState();

  const onDelete = (id) => {
    request({
      url: api.patient + "/" + id,
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

  const handleStatusClick = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

  const handleStatusSubmit = (status, reason,record) => {
    console.log("Status:", status);
    console.log("Reason:", reason);
    // Implement your submit logic here, such as an API call to update the status
  };
  const columns = [
    {
      title: "Doctor uhid",
      dataIndex: "doctorId",
      key: "doctorId",
      filterMultiple: false,
      width: 200,
      render: (_, { doctors, _id }) => {
        return doctors ? (
          <Link to={`/doctor/view/${doctors._id}`}> {doctors.uhid} </Link>
        ) : (
          _id
        );
      },
      sorter: (a, b) => {
        let nameA = a.doctors.uhid?.toLowerCase();
        let nameB = b.doctors.uhid?.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      },
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 200,
      render: (_, { startDate }) => {
        return startDate ? moment(startDate).format("ll") : "-";
      },
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      width: 200,
      render: (_, { endDate }) => {
        return endDate ? moment(endDate).format("ll") : "-";
      },
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      width: 200,
      render: (_, { reason }) => {
        return reason ? reason.trim() : "-"; // If reason exists, return it, otherwise return a placeholder
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        {
          text: "Vacation",
          value: "Vacation",
        },
        {
          text: "Medical",
          value: "Medical",
        },
        {
          text: "Other",
          value: "Other",
        },
      ],
      filterMultiple: false,
      width: 200,
      render: (_, { type, otherTypeDescription }) => {
        return type === "Other" && otherTypeDescription
          ? `Other - ${otherTypeDescription}`
          : type;
      },
    },
    {
      title: "Status",
      dataIndex: "leaveStatus",
      key: "leaveStatus",
      filters: [
        {
          text: "Pending",
          value: "Pending",
        },
        {
          text: "Approved",
          value: "Approved",
        },
        {
          text: "Rejected",
          value: "Rejected",
        },
      ],
      filterMultiple: false,
      width: 200,
      render: (_, record) => {
        let color =
          record?.leaveStatus === "Approved"
            ? "green"
            : record?.leaveStatus === "Rejected"
            ? "red"
            : "orange";
        return (
          <Tag
            color={color}
            key={record?.leaveStatus}
            onClick={() => handleStatusClick(record)}
          >
            {record?.leaveStatus}
          </Tag>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("ll");
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetchData({ ...pagination, current: 1 },filter);
  }, [
    refresh,
    debouncedSearchText,
    startDate,
    endDate,
    selectedCity,
    selectedState,
    selectedOptionsCountries,
  ]);

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.leaveStatus : "";
    const filterType = filters ? filters.type : "";

    console.log(filterActive, "filterActive");
    request({
      url: `${api.doctor}?type=${filterType ? filterType : ""}&status=${
        filterActive ? filterActive : ""
      }&page=${pagination ? pagination.current : 1
        }&pageSize=${pagination ? pagination.pageSize : 10
        }&start_date=${startDate ? startDate : ""}&end_date=${endDate ? endDate : ""} `,
      method: "GET",
      onSuccess: ({data}) => {
        setLoading(false);
        setList(data.list.docs);

        setPagination((prev) => ({
          ...prev,
          current: pagination.current,
          total: data.list.totalDocs,
        }));
        setTotalRecords(data.list.totalDocs);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleChange = (pagination, filters) => {
    setFilter(filters)
    fetchData(pagination, filters);
  };

  const handleChangeDate = (e) => {
    if (e != null) {
      setStartDate(moment(e[0]._d).format("DD-MM-YYYY"));
      setEndDate(moment(e[1]._d).format("DD-MM-YYYY"));
    } else {
      setStartDate();
      setEndDate();
    }
  };

  return (
    <>
      <SectionWrapper
        cardHeading={lang("Leave") + " " + lang("list")}
        extra={
          <>
            <div className="w-100 d-grid align-items-baseline text-head_right_cont">
              <div className="pageHeadingSearch pageHeadingbig d-flex gap-2">
                <RangePicker
                  style={{ height: 44 }}
                  format="DD-MM-YY"
                  disabledDate={(current) => current.isAfter(Date.now())}
                  value={[
                    startDate ? moment(startDate) : null,
                    endDate ? moment(endDate) : null,
                  ]}
                  onChange={handleChangeDate}
                />
              </div>
            </div>
          </>
        }
      >
        {/* <h4 className="text-right">TotalRecords: {totalRecords}</h4> */}
        <div className="table-responsive customPagination">
          <Table
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={{ 
              ...pagination,
              defaultPageSize: 10,
               responsive: true, 
              //  total: pagination.total, 
               showSizeChanger: true, 
               pageSizeOptions: ['10', '20', '30', '50'] 
              }}
            onChange={handleChange}
            className="ant-border-space"
          />
          {selectedRecord && (
            <StatusModal
            refresh={()=>setRefresh(prev => !prev)}
              visible={isModalVisible}
              onClose={handleModalClose}
              onSubmit={handleStatusSubmit}
              leaveId={selectedRecord._id}

            />
          )}
        </div>
      </SectionWrapper>

      {showDelete && (
        <DeleteModal
          title={"Delete Patient"}
          subtitle={`Are you sure you want to Delete this patient?`}
          show={showDelete}
          hide={() => {
            setShowDelete(false);
            setSelected();
          }}
          onOk={() => onDelete(selected?._id)}
        />
      )}
    </>
  );
}

export default Index;
