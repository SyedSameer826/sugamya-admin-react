import {
  Button,
  DatePicker,
  Input,
  Select,
  Table,
  Modal,
  Form,
  Tooltip,
} from "antd";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ConfirmationBox from "../../components/ConfirmationBox";
import DeleteModal from "../../components/DeleteModal";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { AppStateContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import { Link } from "react-router-dom";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import EditForm from "./EditModal";
import ViewModal from "./ViewModal";
import * as XLSX from "xlsx";

import moment from "moment";
import AddForm from "./_AddForm";
const { Option } = Select;
export const OrderStatus = {
  ACCEPT: "accepted",
  PENDING: "pending",
  PROCESSING: "processing",
  READY: "ready to pickup",
  PICKUP: "picked up",
  CANCEL: "cancelled",
  DELIVERED: "delivered",
};

const { RangePicker } = DatePicker;

function Index() {
  const { setPageHeading, country } = useContext(AppStateContext);
  const heading = lang("order");
  const [form] = Form.useForm();
  const sectionName = "Category";
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get("status");
  const params = useParams();
  const [exportLoading, setExportLoading] = useState(false);

  const api = {
    status: apiPath.order,
    addEdit: apiPath.order,
    list: apiPath.order,
    importFile: apiPath.order + "/" + params.type,
  };
  //For Filters
  const [filter, setFilter] = useState();
  const [inputValue, setInputValue] = useState("");

  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleDocket, setVisibleDocket] = useState(false);
  const [viewModal, showViewModal] = useState(false);
  const [selected, setSelected] = useState();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);
  const [cancelModal, showCancelModal] = useState(false);
  const [cancellation, setReasonModal] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [cancelData, setCancelData] = useState({});
  const handleOk = () => {
    form.validateFields().then((values) => {
      console.log("Submitted value:", values.inputField);
      let data = { ...cancelData, reason: values.inputField };
      updateOrderStatus(data);
      setReasonModal(false); // Close the modal after submission
    });
  };
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

  const updateOrderStatus = (data) => {
    const id = data.id;
    const status = data.status;
    const payload = { cancellationReason: data.reason };
    request({
      url: api.status + "/" + id + "/" + status,
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
          <span className="cap">{moment(created_at).format("hh:mm A")}</span>
        ) : (
          "-"
        ),
    },
    {
      title: "UHID",
      dataIndex: "booked_by",
      key: "booked_by",
      render: (_, { patientDetail }) =>
        patientDetail ? <span className="cap">{patientDetail.uhid}</span> : "-",
    },
    {
      title: "Patient Name",
      dataIndex: "booked_for",
      key: "booked_for",
      render: (_, { patientDetail }) =>
        patientDetail ? <span className="cap">{patientDetail.name}</span> : "-",
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
        return cart && cart.cartId ? <p>{cart.cartId}</p> : "-";
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
            {`${userAddress?.pinCode ? `${userAddress?.pinCode},` : ""} ${
              userAddress?.building_no
            },${userAddress?.address}, ${userAddress?.landmark}, ${
              userAddress?.city?.name
            },${userAddress?.state?.name} , ${userAddress?.country?.name}`}
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "Cart Price",
      dataIndex: "price",
      key: "price",
      render: (_, { cart }) =>
        cart ? (
          <span className="cap">{Math.round(cart.total_amount)}</span>
        ) : (
          "$0"
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
      render: (_, { discountedAmount, cart, deliveryCharges }) =>
        cart ? (
          <span className="cap">
            ${Math.round(cart.total_amount - discountedAmount)}
          </span>
        ) : (
          "$0"
        ),
    },
    // {
    //   title: "Discounted Price",
    //   dataIndex: "discountedPrice",
    //   key: "discountedPrice",
    //   render: (_, { discountedPrice }) =>
    //     discountedPrice ? <span className="cap">${discountedPrice}</span> : "-",
    // },
    // {
    //   title: "Products",
    //   dataIndex: "productDetail",
    //   key: "products",
    //   render: (_, { productDetail }) =>
    //     productDetail.length > 0 ? (
    //       <ul>
    //         {productDetail.map((product) => (
    //           <li key={product._id}>
    //             {product.name} - {product.quantity} {product.unit}
    //           </li>
    //         ))}
    //       </ul>
    //     ) : (
    //       "-"
    //     ),
    // },

    {
      title: "Order Price",
      dataIndex: "doctor_id",
      key: "doctor_id",
      render: (_, { discountedAmount, discountedPrice }) =>
        discountedAmount ? (
          <span className="cap">${Math.round(discountedAmount)}</span>
        ) : (
          "$0"
        ),
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
    {
      
      title: "Action",
      render: (_, record) => {
        return (
          <div>
            {
              <>
                <Tooltip title={"Edit"} color={"purple"} key={"update"}>
                  <Button
                    title="Edit"
                    className="edit-cls btnStyle primary_btn"
                    onClick={() => {
                      setSelected(record);
                      setVisibleDocket(true);
                    }}
                  >
                    <i class="fas fa-edit"></i>
                    {/* <span>Edit</span> */}
                  </Button>
                </Tooltip>
              </>
            }
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetchData({ ...pagination, current: 1 }, filter);
  }, [refresh, debouncedSearchText, startDate, endDate]);

  useEffect(() => {
    setPageHeading(heading);
  }, []);

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.orderStatus : null;
    const filterStatus = filters ? filters.status : null; // Add status filter

    request({
      url:
        api.list +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&pageSize=${
          pagination ? pagination.pageSize : 10
        }&search=${debouncedSearchText}${
          path ? `&status=${path}` : ""
        }&start_date=${startDate ? startDate : ""}&end_date=${
          endDate ? endDate : ""
        }`,
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setLoading(false);
        if (status) {
          setList(data.docs);

          setPagination((prev) => ({
            ...prev,
            current: pagination.current,
            total: data.totalDocs,
          }));
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

  const onSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleChangeDate = (e) => {
    if (e != null) {
      setStartDate(moment(e[0]._d).format("YYYY-MM-DD"));
      setEndDate(moment(e[1]._d).format("YYYY-MM-DD "));
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
  //       "S.No.": index +1,
  //       "Order id": row?.order_id,
  //       "Order Date": moment(row?.created_at).format("DD-MM-YYYY"),
  //       "Order Time": moment(row?.created_at).format("HH:mm"),
  //       "UHID": row?.patientDetail.uhid,
  //       "Patient Name": row?.patientDetail.name,
  //       "Appointment ID": row?.appointmentDetails?.appointment_id,
  //       "Cart ID": row?.cart.cartId,
  //       "Agency": row?.agency,
  //       "Docket Number": row?.docketNumber,
  //       "Docket Date": moment(row?.docketDate).format("DD-MM-YYYY"),
  //       "Address": row?.userAddress?.building_no +
  //         "," +
  //         row?.userAddress?.city?.name +
  //         "," +
  //         row?.userAddress?.country?.name,
  //         "Cart Price": row?.discountedAmount,
  //       "Discount Code": row?.discountCode,
  //       "Discounted Amount": row?.discountedAmount - row?.discountedPrice,
  //       "Order Price":row?.discountedPrice,
  //       // "Products": row?.productDetail.map((product) => (
  //       //   <li key={product._id}>
  //       //     {product.name} - {product.quantity} {product.unit}
  //       //   </li>
  //       // )),
  //       "Order Price": row?.discountedAmount - row?.discountedPrice,
  //       Status: row?.orderStatus,
  //       "Delivery Date": moment(row?.deliveryDate).format("DD-MM-YYYY")
  //     }));
  //   // alert(row.user.languageId.name)

  //   const workbook = XLSX.utils.book_new();
  //   const worksheet = XLSX.utils.json_to_sheet(data);
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Transaction Data");
  //   XLSX.writeFile(
  //     workbook,
  //     `Orders(${ moment(new Date()).format("DD-MM-YYYY")}).xlsx`,
  //   );
  // };

  const getExportData = async (pagination, filters) => {
    const filterActive = filters ? filters.orderStatus : null;

    try {
      setExportLoading(true);
      request({
        url:
          api.list +
          `?status=${
            filterActive ? filterActive.join(",") : ""
          }&page=${1}&pageSize=${
            pagination ? pagination.total : 1000
          }&search=${debouncedSearchText}${
            path ? `&status=${path}` : ""
          }&start_date=${startDate ? startDate : ""}&end_date=${
            endDate ? endDate : ""
          }`,
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
      "Order ID": row?.order_id ? row?.order_id : "-",
      "Order Date": row?.created_at
        ? moment(row?.created_at).format("DD-MM-YYYY")
        : "-",
      "Order Time": row?.created_at
        ? moment(row?.created_at).format("hh:mm A")
        : "-",
      UHID: row?.patientDetail?.uhid ? row?.patientDetail?.uhid : "-",
      "Patient Name": row?.patientDetail?.name ? row?.patientDetail?.name : "-",
      "Appointment ID": row?.appointmentDetails?.appointment_id
        ? row?.appointmentDetails?.appointment_id
        : "-",
      "Cart ID": row?.cart?.cartId ? row?.cart?.cartId : "-",
      Agency: row?.agency ? row?.agency : "-",
      "Docket Number": row?.docketNumber ? row?.docketNumber : "-",
      "Docket Date": row?.docketDate
        ? moment(row?.docketDate).format("DD-MM-YYYY")
        : "-",
      Address:
        row?.userAddress?.building_no ||
        row?.userAddress?.city?.name ||
        row?.userAddress?.country?.name
          ? `${
              row?.userAddress?.pinCode +
              "," +
              row?.userAddress?.building_no +
              "," +
              row?.userAddress?.address +
              "," +
              row?.userAddress?.landmark +
              "," +
              row?.userAddress?.city?.name +
              "," +
              row?.userAddress?.state?.name +
              "," +
              row?.userAddress?.country?.name
            }`
          : "-",

      "Cart Price ($)": row?.discountedAmount
        ? Math.round(row?.discountedAmount)
        : "0",
      "Discount Code": row?.discountCode ? row?.discountCode : "-",
      "Discounted Amount": row?.discountedAmount
        ? Math.round(row?.discountedAmount - row?.discountedPrice)
        : "0",
      "Order Price": row?.discountedPrice
        ? Math.round(row?.discountedPrice)
        : "0",
      "Gst Amount": row?.gst_amount ? Math.round(row?.gst_amount) : "0",
      // "Products": row?.productDetail.map((product) => (
      //   <li key={product._id}>
      //     {product.name} - {product.quantity} {product.unit}
      //   </li>
      // )),
      Status: row?.orderStatus ? row?.orderStatus : "-",
      "Delivery Date": row?.deliveryDate
        ? moment(row?.deliveryDate).format("DD-MM-YYYY")
        : "-",
    }));
    // alert(row.languageId.name)

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Order Data");
    XLSX.writeFile(
      workbook,
      `${moment().format("DD-MM-YYYY")}_Orders${
        startDate ? `_${moment(startDate).format("DD-MM-YYYY")}` : ""
      }${endDate ? `-${moment(endDate).format("DD-MM-YYYY")}` : ""}${
        debouncedSearchText ? `_${debouncedSearchText}` : ""
      }.xlsx`
    );
  };

  return (
    <>
      <SectionWrapper
        cardHeading={"Ongoing Orders List"}
        extra={
          <>
            <div className="w-100 text-head_right_cont">
              {/* <Button
                onClick={() => setFilter({
                  country_id: undefined,
                  city_id: undefined,
                  year: undefined,
                  month: undefined,
                })}
                type="primary" icon={<UndoOutlined />}>
                Reset
              </Button> */}
              <div className="pageHeadingSearch d-flex gap-2">
                <RangePicker
                format="DD-MM-YY"
                  style={{ height: 42 }}
                  disabledDate={(current) => current.isAfter(Date.now())}
                  onChange={handleChangeDate}
                />
                <Input.Search
                  className="searchInput"
                  placeholder="Search by agency, docket no., country, name, uhid, cart Id, appointment Id"
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
              </div>
            </div>
          </>
        }
      >
        <div className="table-responsive customPagination withOutSearilNo">
          <h4 className="text-right">
            Total Records: {pagination.total ? pagination.total : list.length}
          </h4>

          <Table
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={{
              current: pagination.current,
              defaultPageSize: 10,
              responsive: true,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "30", "50"],
            }}
            onChange={handleChange}
            className="ant-border-space"
          />
        </div>
      </SectionWrapper>

      {visibleDocket && (
        <AddForm
          section={sectionName}
          api={api}
          show={visibleDocket}
          hide={() => {
            setSelected();
            setVisibleDocket(false);
          }}
          selected={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}
      {visible && (
        <EditForm
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

      {cancellation && (
        // <Modal
        //   open={cancellation}
        //   width={950}
        //   className="p-10"
        //   okText="Add"
        //   onOk={handleOk}
        //   onCancel={() => setReasonModal(false)}
        //   cancelText="Cancel"
        // >
        //   {/* <Form form={form}>
        //     <Form.Item
        //       name="inputField"
        //       label="Reason for canceling order"
        //       rules={[{ required: true, message: "Input is required!" }]}
        //     >
        //       <Input
        //         value={inputValue}
        //         onChange={(e) => setInputValue(e.target.value)}
        //         placeholder="Type here"
        //       />
        //     </Form.Item>
        //   </Form> */}
        // </Modal>

        <Modal
          open={cancellation}
          width={600}
          title="Cancel Order"
          onCancel={() => setReasonModal(false)}
          footer={[
            <Button key="cancel" onClick={() => setReasonModal(false)}>
              Cancel
            </Button>,
            <Button
              key="submit"
              htmlType="submit"
              type="primary"
              className="bg-gradient-to-r from-pink-500 to-orange-500 border-none shadow-md hover:opacity-90 rounded-xl"
              onClick={() => form.submit()}
            >
              Add
            </Button>,
          ]}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleOk}
            className="mt-4"
          >
            <Form.Item
              name="reason"
              label={
                <span className="font-medium text-gray-700">
                  Reason for canceling
                </span>
              }
              rules={[{ required: true, message: "Please enter a reason" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Type your reason here..."
                className="rounded-xl border-gray-300 focus:border-pink-500 focus:ring-pink-500"
              />
            </Form.Item>
          </Form>
        </Modal>
      )}

      {viewModal && (
        <ViewModal
          api={api}
          show={viewModal}
          hide={() => {
            setSelected();
            showViewModal(false);
          }}
          data={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}

      {cancelModal && (
        <DeleteModal
          title={"Cancel Order"}
          subtitle={`Are you sure you want to cancel this order?`}
          show={cancelModal}
          hide={() => {
            showCancelModal(false);
            setSelected();
          }}
          onOk={() => handleChangeStatus(selected?._id, OrderStatus.CANCEL)}
        />
      )}
    </>
  );
}

export default Index;
