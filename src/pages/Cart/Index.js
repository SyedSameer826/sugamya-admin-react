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
import React, { useContext, useEffect, useState } from "react";
import useApi from "../../hooks/useApi";
import * as XLSX from "xlsx";

import Plus from "../../assets/images/plus.svg";
import ConfirmationBox from "../../components/ConfirmationBox";
import DeleteModal from "../../components/DeleteModal";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { AppStateContext, useAppContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import AddFrom from "./_AddFrom";

import { useNavigate } from "react-router";
import moment from "moment";
import { Link } from "react-router-dom";

function Index() {
  const heading = lang("Cart");
  const { setPageHeading } = useContext(AppStateContext);
  const { country } = useAppContext();
  const { getState, getCity, getCountry } = useApi();

  const sectionName = "Cart";
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get("status");
  const [exportLoading, setExportLoading] = useState(false);

  const api = {
    doctor: apiPath.getCart,
    updateCart: apiPath.updatecart,
  };

  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState();
  const [cartStatus, setCartStatus] = useState();
  const [availability, setAvailability] = useState(false);
  //For Filters
  const [filter, setFilter] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();

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

  const handleChangeStatus = (id, status) => {
    console.log("check Id", id, status);
    request({
      url: `${api.updateCart}/${id}/${status}`,
      method: "PUT",
      onSuccess: (data) => {
        console.log(data);
        if (data.status === false) {
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
          : (pagination.current - 1) * 10 + (index + 1),
    },
    {
      title: "Cart ID",
      dataIndex: "cartId",
      key: "cartId",
      sorter : (a,b) => a?.cartId?.localeCompare(b?.cartId),
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
        return created_at ? moment(created_at).format("DD-MM-YYYY hh:mm A") : "-";
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
      render: (_,{cartTotal}) => (
        <>
        <span>{cartTotal ? `$ ${cartTotal?.toFixed(2)}` : "$0"}</span>
        </>
      ),
    },
    {
      title: "Cart Display Price",
      dataIndex: "productDetails",
      key: "productPrice",
      render: (_,{total_amount}) => (
        <>
           <span>{total_amount ? `$ ${Math.round(total_amount?.toFixed(2))}` : "$0"}</span>
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
              onClick={(e) => {
                !admin_approval
                  ? showConfirm({
                      record: _id,
                      path: apiPath.cartApproval,
                      onLoading: () => setLoading(true),
                      onSuccess: () => setRefresh((prev) => !prev),
                    })
                  : message.error("Cart Already approved!");
              }}
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
      // onFilter: (value, record) => record.cartStatus === value,
      render: (cartStatus, record) => (
        <>
        {console.log(record?.cartStatus, "45")}
        
        {record?.cartStatus == "checkout" ?   <Tag
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
            onClick={() => handleCartStatus(record)}
            style={{ cursor: "pointer" }}
          >
            {cartStatus}
          </Tag> }
        </>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            {(record?.cartStatus !== "checkout" && record?.cartStatus !== "expiry") ? (
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
            ) : (
              ""
            )}
          </div>
        );
      },
    },
  ];

const handleCartStatus = (record) => {

  let status =  "checkout"  
  if(record.cartStatus === "pending"){
    status = "checkout"
  }else if(record.cartStatus === "expiry") {
    status = "pending"
  }

    setShowStatus(true); // Open the modal
    setSelected(record); // Set the selected cart item 
    setCartStatus(status)
}

  useEffect(() => {
    setLoading(true);
    fetchData({ ...pagination, current: 1 }, filter);
  }, [refresh, debouncedSearchText]);

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const fetchData = (pagination, filters) => {
    console.log( filters, " filters");
    request({
      url:
        api.doctor +
        `?search=${debouncedSearchText}&page=${
          pagination ? pagination.current : 1
        }&pageSize=${pagination?.pageSize ? pagination.pageSize : 10}&cartStatus=${
          filters?.cartStatus ? filters.cartStatus : ""}`,
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setLoading(false);
        if (status) {
          console.log(data.docs);
          setList(data.docs);
          setDocs(data);

          setPagination((prev) => ({
            current: pagination.current,
            total: data.totalDocs,
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
    setFilter(filters);
    fetchData(pagination, filters);
  };

  const getExportData = async () => {
    try {
      setExportLoading(true);
      request({
        url:
          api.doctor +
          `?search=${debouncedSearchText}&page=${1}&pageSize=${
            pagination?.total ? pagination.total : 1000
          }`,
        method: "GET",
        onSuccess: ({ data, status, total, message }) => {
          setExportLoading(false);
          console.log(status, data, "data11111");

          excelData(data.docs ?? []);
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
    console.log(exportData, "exportData");
    if (!exportData.length) return;
    const data = exportData.map((row, index) => ({
      "S.No.": index + 1,
      "Cart Id": row?.cartId ? row?.cartId : "-",
      "Appointment Id": row?.appointmentDetails?.appointment_id
        ? row?.appointmentDetails?.appointment_id
        : "-",
      UHID: row?.patientDetails?.uhid ? row?.patientDetails?.uhid : "-",
      "Patient Name": row?.patientDetails?.name
        ? row?.patientDetails?.name
        : "-",
      "Patient Email": row?.patientDetails?.email
        ? row?.patientDetails?.email
        : "-",
      "Patient MobileNo.":
        row?.patientDetails?.country_code && row?.patientDetails?.mobile_number
          ? `+${row?.patientDetails?.country_code ?? 91}-${
              row?.patientDetails?.mobile_number ?? "-"
            }`
          : "-",
      "Cart Date and Time": row?.created_at
  ? moment(row?.created_at).format("DD-MM-YYYY hh:mm A")
  : "-",
      "Cart Expiry": row?.cartExpiry
        ? row?.cartExpiry
        : "-",
      "Doctor Name": row?.doctorDetails?.name ? row?.doctorDetails?.name : "-",

      products: row?.products?.length
        ? row?.products
            .map(
              (product) =>
                `${product?.productDetails?.[0]?.name ?? ""}-${product.qty ?? ""}`
            )
            .join(", ")
        : "-",
        "Cart Basic Price ($)": row?.cartTotal ? row?.cartTotal?.toFixed(2) : "0",
        "Cart Display Price ($)": row?.total_amount ? Math.round(row?.total_amount?.toFixed(2)) : "0",
        "Duration": row?.duration ? row?.duration : "-",
        "Gst Amount ($)": row?.gst_amount ? row?.gst_amount?.toFixed(2) : "0",
        "Admin approval": row?.admin_approval ? "Approved" : "Not-Approved",
        "Doctor approval": row?.doctor_approval ? "Approved" : "Not-Approved",
        "Cart Status": row?.cartStatus ? row?.cartStatus : "-",
        // "Registered On": moment(row.created_at).format("DD_MM_YYYY"),
    }));
    // alert(row.languageId.name)

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cart Data");
    XLSX.writeFile(
      workbook,
      `${moment().format("DD-MM-YYYY")}_Carts${
        debouncedSearchText ? `_${debouncedSearchText}` : ""
      }.xlsx`
    );
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
  };
  return (
    <>
      <SectionWrapper
        cardHeading={lang("Cart") + " " + lang("list")}
        extra={
          <>
            <div className="w-100 d-grid align-items-baseline text-head_right_cont">
              <div className="pageHeadingSearch pageHeadingbig d-flex gap-2">
                <Input.Search
                  className="searchInput"
                  placeholder="Search by name, uhid, appointment id"
                  onChange={onSearch}
                  allowClear
                />
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
                    setVisible(true);
                    setSearchText("");
                  }}
                >
                  <span className="add-Ic">
                    <img src={Plus} />
                  </span>
                  Add {sectionName}
                </Button>
                {/* <Button className="btnStyle  primary_btn" onClick={() => handleExport()}>Export</Button> */}
              </div>
            </div>
          </>
        }
      >
        <div className="table-responsive customPagination">
          <h4 className="text-right">Total Records: {docs?.totalDocs}</h4>
          <Table
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={pagination}
            onChange={handleChange}
            className="ant-border-space"
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

      {showStatus && selected?._id && (
        <DeleteModal
          title={`Change Cart Status`}
          subtitle={`Are you sure you want to change the status of this cart to ${cartStatus}?`}
          show={showStatus}
          hide={() => {
            setShowStatus(false);
            setSelected();
            setCartStatus()
          }}
          onOk={() =>
            handleChangeStatus(
              selected?._id,
              cartStatus
            )
          }
        />
      )}
    </>
  );
}

export default Index;
