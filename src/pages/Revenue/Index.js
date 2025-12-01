import { Button, Image, Input, Table, Tag, Tooltip, DatePicker, Select } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import ConfirmationBox from "../../components/ConfirmationBox";
import DeleteModal from "../../components/DeleteModal";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { AppStateContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import AddForm from "./AddForm";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import * as XLSX from "xlsx";
import { transactionType } from "../../constants/var";
const { RangePicker } = DatePicker;


function Index() {
  const heading = lang("Transaction");
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Transaction";
  const routeName = "patient";
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get("status");
  const [exportLoading, setExportLoading] = useState(false);

  const api = {
    patient: apiPath.listTransaction,
    addEdit: apiPath.listPatient,
  };


  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  //For Filters
  const [filter, setFilter] = useState();

  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [deleteModal, showDeleteModal] = useState(false);
  const [deleteAllModal, showDeleteAllModal] = useState(false);
  const [selected, setSelected] = useState();
  const [selectedIds, setSelectedIds] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();

  const onDelete = (id) => {
    request({
      url: api.appointmentPrice + "/" + id,
      method: "DELETE",
      onSuccess: (data) => {
        ShowToast(data.message, Severty.SUCCESS);
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

  const DeleteAll = () => {
    if (!selectedIds.length) return;
    request({
      url: api.appointmentPrice + "/delete-all",
      method: "POST",
      data: {
        ids: selectedIds,
      },
      onSuccess: (data) => {
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
          <Link style={{cursor : "pointer"}} to={`/${routeName}/view/${transaction_id}`}>{uhid}</Link>
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
          <Link  to={`/${routeName}/view/${transaction_id}`}>{uhid}</Link>
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
                                  style={{color: "red" ,cursor : "pointer"}}
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
          <span className="cap">${Math.round(gst_amount)}</span>
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
    setLoading(true);
    fetchData(pagination, filter);
  }, [refresh, debouncedSearchText, startDate,endDate,filter]);

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;
    const filterType = filters ? filters.type : null;
   
console.log(filterActive,"filterActive")
    request({
      url:`${api.patient}?status=${filterActive ? filterActive : ""}&type=${filterType ? filterType : ""}&search=${debouncedSearchText}&start_date=${
          startDate ? startDate : ""
        }&end_date=${endDate ? endDate : ""}&page=${pagination ? pagination.current : 1}&pageSize=${pagination ? pagination.pageSize : 10}`,
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setLoading(false);
        if (status) {
          setList(total.docs);
          // setTotalRecords(data.totalDocs)

          setPagination((prev) => ({
            ...prev,
            current: pagination.current,
            total: total.totalDocs,
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
    setFilter(filters)
    fetchData(pagination, filters);
  };
  const onSearch = (e) => {
    setSearchText(e.target.value);
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
  const handleExport = () => {
    console.log("transactions>>>>>>>>>");

    // Ensure 'list' is defined and has items
    const data = list && list.length > 0
      ? list.map((row, index) => ({
          "S.No.": index + 1,
          "Transaction Id": row.uhid,
          "Payment Id": row.uhid,
          "Transaction Date": moment(row.created_at).format("DD-MM-YYYY"),
          "Patients": row.patient_id?.name ?? "N/A",
          "Appointment ID": row.appointment_id?.appointment_id ?? "N/A",
          "Order ID": row.order_id?.order_id ?? "N/A",
          "Order Date": moment(row.created_at).format("DD-MM-YYYY"),
          "Order Type": row.type,
          "Order Amount": row.transaction_amount,
          "Payment Mode": row.payment_mod,
        }))
      : []; // Set default to empty array if list is empty or undefined

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Data");

    // Generate filename with current timestamp
    const fileName = `Transactions(${ moment(new Date()).format("DD-MM-YYYY")}).xlsx`;
    XLSX.writeFile(workbook, fileName);
};


const getExportData = async ( filters) => {
  const filterActive = filters ? filters.status : null;
  const filterType = filters ? filters.type : null;

  try {
    setExportLoading(true);
    request({
      url:
      `${api.patient}?status=${filterActive ? filterActive : ""}&type=${filterType ? filterType : ""}&search=${debouncedSearchText}&start_date=${
        startDate ? startDate : ""
      }&end_date=${endDate ? endDate : ""}&page=${ 1}&pageSize=${pagination ? pagination.total : 1000}`,
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setExportLoading(false);
        if (status) {
          excelData(total.docs?? []);
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
    "Transaction Id": row?.uhid ? row?.uhid : (row?.transaction_id ? row?.transaction_id : "-") ,
    "Payment Id": row?.uhid ? row.uhid : (row?.transaction_id ? row?.transaction_id : "-"),
    "Transaction Date": row.created_at ? moment(row.created_at).format("DD-MM-YYYY") : "-",
    "Patients Uhid": row.patient_id?.uhid ? row.patient_id?.uhid  : "-",
    "Patients Name": row.patient_id?.name ? row.patient_id?.name  : "-",
    "Patients Email": row.patient_id?.email ? row.patient_id?.email  : "-",
    "Patients Mobile Number": (row.patient_id?.country_code && row.patient_id?.mobile_number ) ? `+${row.patient_id?.country_code || 91}-${row.patient_id?.mobile_number || ""}` : "-",
    "Appointment ID": row.appointment_id?.appointment_id ? row.appointment_id?.appointment_id  : "-",
    "Order ID": row.order_id?.order_id ? row.order_id?.order_id  : "-",
    "Order Date": row.created_at ? moment(row.created_at).format("DD-MM-YYYY") : "-",
    "Order Type": row?.type ? row?.type : "-",
    "Order Amount": row?.transaction_amount ? row?.transaction_amount : "0",
    "Gst Amount": row?.gst_amount ? Math.round(row?.gst_amount) : "0",
    "Payment Mode": row?.payment_mod ? row?.payment_mod : "-",
  }));
  // alert(row.languageId.name)

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transaction Data");
  XLSX.writeFile(
    workbook,
    `${moment().format("DD-MM-YYYY")}_Transactions${
      startDate
        ? `_${moment(startDate).format("DD-MM-YYYY")}`
        : ""
    }${
      endDate
        ? `-${moment(endDate).format("DD-MM-YYYY")}`
        : ""
    }${debouncedSearchText ? `_${debouncedSearchText}` : ""}${filter?.type ? `_${filter?.type}` : ""}.xlsx`
   

  );
};

const onChange = (key, value) => {

    setFilter((prev) => ({ ...prev, [key]: value }));
  
};
 
  return (
    <>
      <SectionWrapper
        cardHeading={`Transactions`}
        extra={
          <>
            <div className="w-100 text-head_right_cont">
              <div className="pageHeadingSearch d-flex gap-2">
                <RangePicker
  style={{ height: 44 }}
  format="DD-MM-YY"
  disabledDate={(current) => current && current.isAfter(moment().endOf("day"))}
  onChange={handleChangeDate}
  value={
    startDate && endDate
      ? [moment(startDate, "DD-MM-YYYY"), moment(endDate, "DD-MM-YYYY")]
      : null
  }
/>
                <Input.Search
                  className="searchInput"
                  placeholder="Order Id, Appointment Id, UHID"
                  onChange={onSearch}
                  allowClear
                  value={searchText}
                />
                  <div className="role-wrap">
                <Select
                  width="110px"
                  placeholder="Type"
                  value={filter?.type}
                  filterOption={false}
                  options={transactionType.map((item) => ({
                    value: item.name,
                    label: item.label,
                  }))}
                  onChange={(value) => onChange("type", value)}
                />
              </div>
                 <Button
                  className="btnStyle  primary_btn"
                  onClick={() => {
                    setFilter()
                    setStartDate();
                    setEndDate();
                    setSearchText("");
                  }}
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
                </div>
            </div>
          </>
        }
      >
       
        <div className="table-responsive customPagination checkBoxSrNo">
        <h4 className="text-right">Total Records: {pagination.total ?? 0}</h4>
          <Table
            loading={loading}
            columns={columns}
            // rowSelection={rowSelection}
            dataSource={list}
            pagination={{
              defaultPageSize: 10,
              responsive: true,
              total: pagination.total,
              showSizeChanger: false,
              showQuickJumper: false,
              // pageSizeOptions: ["10", "20", "30", "50"],
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

      {deleteModal && (
        <DeleteModal
          title={"Delete Category"}
          subtitle={`Are you sure you want to Delete this appointment-price?`}
          show={deleteModal}
          hide={() => {
            showDeleteModal(false);
            setSelected();
          }}
          onOk={() => onDelete(selected?._id)}
        />
      )}

      {deleteAllModal && (
        <DeleteModal
          title={"Delete All Category"}
          subtitle={`Are you sure you want to Delete all appointment-price's?`}
          show={deleteAllModal}
          hide={() => {
            showDeleteAllModal(false);
            setSelectedIds([]);
          }}
          onOk={() => DeleteAll()}
        />
      )}
    </>
  );
}

export default Index;
