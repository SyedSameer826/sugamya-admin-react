import {
  Row,
  Col,
  Card,
  Form,
  Table,
  Button,
  Input,
  Tag,
  Tabs,
  Tooltip,
  Select,
  Modal,
  Radio,
  Image,
  Rate,
} from "antd";
import Currency from "../../components/Currency";
import { UndoOutlined } from "@ant-design/icons";
import { useState, useEffect, useContext } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import { Last20Years, Months } from "../../constants/var";
// import { useNavigate } from "react-router";
import apiPath from "../../constants/apiPath";
// import { PRICE } from "../../constants/conts";
import moment from "moment";
// import { DownloadExcel, SampleFileDownload } from "../../components/ExcelFile";
// import SingleImageUpload from "../../components/SingleImageUpload";

import notfound from "../../assets/images/not_found.png";
// import Plus from "../../assets/images/plus.svg";
import { AppStateContext } from "../../context/AppContext";
// import DriverImg from "../../assets/images/face-6.jpeg";
// const Search = Input.Search;
const { TabPane } = Tabs;

export const QuoteStatus = {
  REQUEST: "request",
  RECEIVED: "received",
  COMPLETE: "complete",
  FULLFILL: "fulfill",
  ADDONS: "addons",
  ITEMDEALS: "itemdeals",
};

function Index() {
  // const routeName = "delivery";

  const api = {
    status: apiPath.statusQuote,
    list: apiPath.history,
  };
  // const [visible, setVisible] = useState(false);
  // const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [refresh, setRefresh] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  //For Filters
  // const [filter, setFilter] = useState();

  const [selectedTab, setSelectedTab] = useState("all");

  const handleTabChange = (status) => {
    setSelectedTab(status);
    // fetchData(pagination, '', status)
  };

  const fetchData = (pagination, status) => {
    setLoading(true);

    const payload = {};
    payload.page = pagination ? pagination.current : 1;
    payload.pageSize = pagination ? pagination?.pageSize : 10;

    request({
      url: api.list,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        setList(data.data.list.docs);
        setPagination((prev) => ({
          ...prev,
          current: pagination.current,
          total: data.data.list.totalDocs,
        }));
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  return (
    <>
      <div className="tabled quoteManagement">
        <Row gutter={[24, 0]}>
          <Col xs={24} xl={24}>
            <Card bordered={false} className="criclebox tablespace mb-24">
              <Tabs
                className="main_tabs"
                onTabClick={handleTabChange}
                activeKey={selectedTab}
                tabBarStyle={{ color: "green" }}
              >
                <TabPane tab="Delivery Agent history" key="all">
                  <DriverOrder />
                </TabPane>

                <TabPane tab="Customer order history" key={QuoteStatus.REQUEST}>
                  <CustomerOrder />
                </TabPane>

                <TabPane
                  tab="Restaurant order history"
                  key={QuoteStatus.RECEIVED}
                >
                  <RestaurantOrder />
                  {/* <h4 className="text-right mb-1">{pagination.total ? ShowTotal(pagination.total) : ShowTotal(0)}</h4> */}
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

const DriverOrder = ({}) => {
  const { setPageHeading, country } = useContext(AppStateContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selected, setSelected] = useState();
  const { request } = useRequest();
  const api = {
    status: apiPath.statusQuote,
    list: apiPath.history,
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filter, setFilter] = useState({
    year: undefined,
    month: undefined,
  });

  const handleChange = (pagination, sorter, filters) => {
    if (!sorter) {
      fetchData(pagination);
    }
  };

  const fetchData = (pagination, status) => {
    setLoading(true);

    const payload = {};
    payload.page = pagination ? pagination.current : 1;
    payload.pageSize = pagination ? pagination?.pageSize : 10;

    const queryString = Object.entries(payload)
      .filter(([_, v]) => v)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");

    request({
      url: api.list + `${queryString ? `?${queryString}` : ""}`,
      method: "GET",
      onSuccess: ({ data, total, status }) => {
        setLoading(false);
        if (status) {
          setList(data);
          setPagination((prev) => ({
            ...prev,
            current: pagination.current,
            total: total,
          }));
        }
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchData(pagination);
  }, [refresh, country.country_id, filter]);

  const columns = [
    {
      title: "Driver id",
      dataIndex: "id",
      render: (_, { driver_id }) =>
        driver_id ? <span className="cap">#{driver_id.uid}</span> : "-",
    },
    {
      title: "DRIVER NAME",
      dataIndex: "name",
      key: "name",
      render: (_, { driver_id }) =>
        driver_id ? (
          <>
            <Image
              width={40}
              height={40}
              src={driver_id.image ? driver_id.image : notfound}
              className="table-img"
            />
            {driver_id.name ? (
              <span className="cap">{driver_id.name}</span>
            ) : (
              "-"
            )}
          </>
        ) : (
          "-"
        ),
    },
    {
      title: "date & time",
      dataIndex: "created_at",
      key: "created_at",
      render: (_, { created_at }) =>
        created_at ? moment(created_at).format("lll") : "-",
    },
    {
      title: "Pickup point",
      dataIndex: "pickup_point",
      key: "pickup_point",
      render: (_, { restaurant_id }) =>
        restaurant_id ? (
          <span className="cap">
            {restaurant_id.name} ,<p>{restaurant_id.address}</p>
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "payment Method",
      dataIndex: "payment_Method",
      key: "payment_Method",
      render: (_, { payment_mod }) =>
        payment_mod ? <span className="cap">{payment_mod}</span> : "-",
    },
    {
      title: "delivery status",
      dataIndex: "delivery_status",
      key: "delivery_status",
      render: (_, { status }) =>
        status ? <span className="cap">{status}</span> : "-",
    },
    {
      title: "Item Description",
      dataIndex: "Item_Description",
      key: "Item_Description",
      render: (_, { items }) =>
        items.length
          ? items.map((item, idx) => (
              <span key={idx} className="cap">
                {item.qty} X {item.food.name}
              </span>
            ))
          : "-",
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <>
            <Tooltip title="View" color={"purple"} key={"viewDetail"}>
              <Button
                className="ms-sm-2 mt-xs-2 primary_btn btnStyle "
                onClick={() => {
                  setSelected(record);
                  setIsModalOpen(true);
                }}
              >
                View Detail
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

  const onChange = (key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="tab_inner_tit">
        <div className="tab-upload-wrap d-flex align-items-center justify-content-between">
          <h3>Delivery Agent List</h3>
          <div className="d-flex align-items-center gap-3">
            <div className="city-wrap">
              <Select
                width="250"
                style={{ minWidth: "150px" }}
                defaultValue="Select Agent"
                options={[
                  { value: "Agent 1", label: "Agent 1" },
                  { value: "Agent 2", label: "Agent 2" },
                ]}
              />
            </div>
            <div className="role-wrap">
              <Select
                width="110px"
                placeholder="Year"
                showSearch
                value={filter.year}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                options={Last20Years.map((item) => ({
                  value: item,
                  label: item,
                }))}
                onChange={(value) => onChange("year", value)}
              />
            </div>
            <div className="role-wrap">
              <Select
                width="110px"
                placeholder="Month"
                showSearch
                value={filter.month}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                options={Months.map((item) => ({
                  ...item,
                }))}
                onChange={(value) => onChange("month", value)}
              />
            </div>

            <Button
              onClick={() =>
                setFilter({
                  country_id: undefined,
                  city_id: undefined,
                  year: undefined,
                  month: undefined,
                })
              }
              type="primary"
              icon={<UndoOutlined />}
            >
              Reset
            </Button>
            <div className="btn_grp">
              <Button className="primary_btn btnStyle">Export to Excel</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive customPagination withOutSearilNo">
        <Table
          loading={loading}
          columns={columns}
          dataSource={list}
          pagination={{
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
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          width={750}
          okText="Approve"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          className="tab_modal"
        >
          <h4 className="modal_title_cls border-title">
            Delivery Agent History
          </h4>
          <div className="delivery_agent_dtl">
            <div className="delivery_single_agent">
              <h5>Driver Profile : </h5>
              <div className="agent-right">
                <div className="driver-img">
                  <img src={selected.driver_id.image} />
                </div>
              </div>
            </div>
            <div className="delivery_single_agent">
              <h5>Driver Name : </h5>
              <div className="agent-right">
                <h6>{selected.driver_id.name}</h6>
              </div>
            </div>
            <div className="delivery_single_agent">
              <h5>Driver ID : </h5>
              <div className="agent-right">
                <h6>#{selected.driver_id.uid}</h6>
              </div>
            </div>
            <div className="delivery_single_agent">
              <h5>Date & Time : </h5>
              <div className="agent-right">
                <h6>{moment(selected.created_at).format("lll")}</h6>
              </div>
            </div>
            <div className="delivery_single_agent">
              <h5>Pickup Point : </h5>
              <div className="agent-right">
                <h6>
                  {selected.restaurant_id.name}
                  <span>{selected.restaurant_id.address}</span>
                </h6>
              </div>
            </div>
            <div className="delivery_single_agent">
              <h5>Payment Method : </h5>
              <div className="agent-right">
                <h6>
                  {selected.payment_mod == "cod"
                    ? `Cash On Delivery`
                    : selected.payment_mod}
                </h6>
              </div>
            </div>
            <div className="delivery_single_agent">
              <h5>Delivery Status : </h5>
              <div className="agent-right">
                <h6>{selected.status}</h6>
              </div>
            </div>
            <div className="delivery_single_agent">
              <h5>Item Description : </h5>
              <div className="agent-right">
                {selected.items.map((item, idx) => (
                  <h6 key={idx}>
                    {item.qty} x {item.food.name}
                  </h6>
                ))}
              </div>
            </div>
            <div className="delivery_single_agent">
              <h5>Price : </h5>
              <div className="agent-right">
                <h6>
                  <Currency price={selected.total_payable} />{" "}
                </h6>
              </div>
            </div>
            <div className="delivery_single_agent">
              <h5>Delivery fees : </h5>
              <div className="agent-right">
                <h6>
                  <Currency price={selected.delivery_fee} />
                </h6>
              </div>
            </div>
            <div className="delivery_single_agent">
              <h5>Tawasi Commission : </h5>
              <div className="agent-right">
                <h6>
                  <Currency price={selected.tip} />
                </h6>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

const CustomerOrder = ({}) => {
  const { setPageHeading, country } = useContext(AppStateContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { request } = useRequest();
  const api = {
    status: apiPath.statusQuote,
    list: apiPath.history,
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleChange = (pagination, sorter, filters) => {
    if (!sorter) {
      fetchData(pagination);
    }
  };

  const fetchData = (pagination, status) => {
    setLoading(true);

    const payload = {};
    payload.page = pagination ? pagination.current : 1;
    payload.pageSize = pagination ? pagination?.pageSize : 10;

    const queryString = Object.entries(payload)
      .filter(([_, v]) => v)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");

    request({
      url: api.list + `${queryString ? `?${queryString}` : ""}`,
      method: "GET",
      onSuccess: ({ data, total, status }) => {
        setLoading(false);
        if (status) {
          setList(data);
          setPagination((prev) => ({
            ...prev,
            current: pagination.current,
            total: total,
          }));
        }
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchData(pagination);
  }, [refresh, country.country_id]);

  const columns = [
    {
      title: "order id",
      dataIndex: "id",
      render: (_, { uid }) => (uid ? <span className="cap">#{uid}</span> : "-"),
    },
    {
      title: "Customer NAME",
      dataIndex: "name",
      key: "name",
      render: (_, { customer_id }) =>
        customer_id ? (
          <>
            <Image
              width={40}
              height={40}
              src={customer_id.image ? customer_id.image : notfound}
              className="table-img"
            />
            {customer_id.name ? (
              <span className="cap">{customer_id.name}</span>
            ) : (
              "-"
            )}
          </>
        ) : (
          "-"
        ),
    },
    {
      title: "order date & time",
      dataIndex: "dateTime",
      key: "dateTime",
      render: (_, { created_at }) =>
        created_at ? moment(created_at).format("lll") : "-",
    },
    {
      title: "Restaurant NAME",
      dataIndex: "name",
      key: "name",
      render: (_, { restaurant_id }) =>
        restaurant_id ? (
          <span className="cap">
            {restaurant_id.name} ,<p>{restaurant_id.address}</p>
          </span>
        ) : (
          "-"
        ),
    },

    {
      title: "payment Method",
      dataIndex: "payment_Method",
      key: "payment_Method",
      render: (_, { payment_mod }) =>
        payment_mod ? <span className="cap">{payment_mod}</span> : "-",
    },
    {
      title: "delivery status",
      dataIndex: "delivery_status",
      key: "delivery_status",
      render: (_, { status }) =>
        status ? <span className="cap">{status}</span> : "-",
    },
    {
      title: "Item Description",
      dataIndex: "Item_Description",
      key: "Item_Description",
      render: (_, { items }) =>
        items.length
          ? items.map((item, idx) => (
              <span key={idx} className="cap">
                {item.qty} X {item.food.name}
              </span>
            ))
          : "-",
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <>
            <Tooltip title="View Detail" color={"purple"} key={"viewDetail"}>
              <Button
                className="ms-sm-2 mt-xs-2 primary_btn btnStyle"
                // onClick={(e) => view(record._id)}
              >
                View Detail
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];

  return (
    <>
      <div className="tab_inner_tit">
        <div className="tab-upload-wrap d-flex align-items-center justify-content-between">
          <h3>Customer Order List</h3>
          <div className="d-flex align-items-center gap-3">
            <div className="city-wrap">
              <Select
                width="250"
                style={{ minWidth: "150px" }}
                defaultValue="Select Customer"
                options={[
                  { value: "Customer 1", label: "Customer 1" },
                  { value: "Customer 2", label: "Customer 2" },
                ]}
              />
            </div>
            <div className="role-wrap">
              <Select
                width="110px"
                defaultValue="Year"
                options={[
                  { value: "2023", label: "2023" },
                  { value: "2024", label: "2024" },
                ]}
              />
            </div>
            <div className="role-wrap">
              <Select
                width="110px"
                defaultValue="Month"
                options={[
                  { value: "01", label: "01" },
                  { value: "02", label: "02" },
                ]}
              />
            </div>
            <div className="btn_grp">
              <Button className="primary_btn btnStyle">Export to Excel</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="table-responsive customPagination">
        <Table
          loading={loading}
          columns={columns}
          dataSource={list}
          pagination={{
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
    </>
  );
};

const RestaurantOrder = ({}) => {
  const { setPageHeading, country } = useContext(AppStateContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { request } = useRequest();
  const api = {
    status: apiPath.statusQuote,
    list: apiPath.history,
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleChange = (pagination, sorter, filters) => {
    if (!sorter) {
      fetchData(pagination);
    }
  };

  const fetchData = (pagination, status) => {
    setLoading(true);

    const payload = {};
    payload.page = pagination ? pagination.current : 1;
    payload.pageSize = pagination ? pagination?.pageSize : 10;

    const queryString = Object.entries(payload)
      .filter(([_, v]) => v)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");

    request({
      url: api.list + `${queryString ? `?${queryString}` : ""}`,
      method: "GET",
      onSuccess: ({ data, total, status }) => {
        setLoading(false);
        if (status) {
          setList(data);
          setPagination((prev) => ({
            ...prev,
            current: pagination.current,
            total: total,
          }));
        }
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchData(pagination);
  }, [refresh, country.country_id]);

  const columns = [
    {
      title: "Restro id",
      dataIndex: "id",
      render: (_, { restaurant_id }) =>
        restaurant_id ? <span className="cap">#{restaurant_id.uid}</span> : "-",
    },
    {
      title: "Restaurant NAME",
      dataIndex: "name",
      key: "name",
      render: (_, { restaurant_id }) =>
        restaurant_id ? (
          <>
            <Image
              width={40}
              height={40}
              src={
                restaurant_id.image.length ? restaurant_id.image[0] : notfound
              }
              className="table-img"
            />
            {restaurant_id.name ? (
              <span className="cap">{restaurant_id.name}</span>
            ) : (
              "-"
            )}
          </>
        ) : (
          "-"
        ),
    },
    {
      title: "order date & time",
      dataIndex: "dateTime",
      key: "dateTime",
      render: (_, { created_at }) =>
        created_at ? moment(created_at).format("lll") : "-",
    },
    {
      title: "Customer NAME",
      dataIndex: "name",
      key: "name",
      render: (_, { customer_id }) =>
        customer_id ? (
          <>
            <Image
              width={40}
              height={40}
              src={customer_id.image ? customer_id.image : notfound}
              className="table-img"
            />
            {customer_id.name ? (
              <span className="cap">{customer_id.name}</span>
            ) : (
              "-"
            )}
          </>
        ) : (
          "-"
        ),
    },
    {
      title: "payment Method",
      dataIndex: "payment_Method",
      key: "payment_Method",
      render: (_, { payment_mod }) =>
        payment_mod ? <span className="cap">{payment_mod}</span> : "-",
    },
    {
      title: "delivery status",
      dataIndex: "delivery_status",
      key: "delivery_status",
      render: (_, { status }) =>
        status ? <span className="cap">{status}</span> : "-",
    },
    {
      title: "Item Description",
      dataIndex: "Item_Description",
      key: "Item_Description",
      render: (_, { items }) =>
        items.length
          ? items.map((item, idx) => (
              <span key={idx} className="cap">
                {item.qty} X {item.food.name}
              </span>
            ))
          : "-",
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <>
            <Tooltip title="View Detail" color={"purple"} key={"viewDetail"}>
              <Button
                className="ms-sm-2 mt-xs-2 primary_btn btnStyle"
                // onClick={(e) => view(record._id)}
              >
                View Detail
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];

  return (
    <>
      <div className="tab_inner_tit">
        <div className="tab-upload-wrap d-flex align-items-center justify-content-between">
          <h3>Restaurant Order List</h3>
          <div className="d-flex align-items-center gap-3">
            <div className="city-wrap">
              <Select
                width="250"
                style={{ minWidth: "150px" }}
                defaultValue="Select Restaurant"
                options={[
                  { value: "Restaurant 1", label: "Restaurant 1" },
                  { value: "Restaurant 2", label: "Restaurant 2" },
                ]}
              />
            </div>
            <div className="role-wrap">
              <Select
                width="110px"
                defaultValue="Year"
                options={[
                  { value: "2023", label: "2023" },
                  { value: "2024", label: "2024" },
                ]}
              />
            </div>
            <div className="role-wrap">
              <Select
                width="110px"
                defaultValue="Month"
                options={[
                  { value: "01", label: "01" },
                  { value: "02", label: "02" },
                ]}
              />
            </div>
            <div className="btn_grp">
              <Button className="primary_btn btnStyle">Export to Excel</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="table-responsive customPagination">
        <Table
          loading={loading}
          columns={columns}
          dataSource={list}
          pagination={{
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
    </>
  );
};

export default Index;
