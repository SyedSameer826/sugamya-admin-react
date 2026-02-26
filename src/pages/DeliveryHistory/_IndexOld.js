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
} from "antd";
import { useState, useEffect, useContext } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import { useNavigate } from "react-router";
import apiPath from "../../constants/apiPath";
// import { PRICE } from "../../constants/conts";
import moment from "moment";
// import { DownloadExcel, SampleFileDownload } from "../../components/ExcelFile";
import SingleImageUpload from "../../components/SingleImageUpload";

import notfound from "../../assets/images/not_found.png";
// import Plus from "../../assets/images/plus.svg";
import DeleteIcon from "../../assets/images/delete.svg";
import { AppStateContext } from "../../context/AppContext";
const Search = Input.Search;
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
  const { setPageHeading } = useContext(AppStateContext);
  const sectionName = "Quote";
  const routeName = "quote";

  const api = {
    status: apiPath.statusQuote,
    list: apiPath.listQuote,
  };
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();
  const [selectedQuote, setSelectedQuote] = useState();
  const [categoryIds, setCategoryIds] = useState([]);
  const [brandIds, setBrandIds] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [modal, showModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    setPageHeading("Delivery History");
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get("tab");
    switch (path) {
      case QuoteStatus.REQUEST:
        return setSelectedTab(QuoteStatus.REQUEST);
      default:
        break;
    }
  }, []);

  const view = (id) => {
    navigate(`/${routeName}/view/${id}`);
  };

  const getBrandList = () => {
    request({
      url: apiPath.brandList,
      method: "GET",
      onSuccess: (data) => {
        setBrandList(data.data);
      },
      onError: (error) => {
        console.log(error);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const getCategoryList = () => {
    request({
      url: apiPath.categoryList,
      method: "GET",
      onSuccess: (data) => {
        setCategoryList(data.data);
      },
      onError: (error) => {
        console.log(error);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleReset = (e) => {
    setBrandIds([]);
    setCategoryIds([]);
  };

  // const handleSort = (e) => {
  //   const sortedList = list.sort((a, b) => a.name - b.name)
  //   setList(sortedList);

  //   // setLoading(true)
  //   // const payload = {};
  //   // payload.page = pagination ? pagination.current : 1;
  //   // payload.limit = pagination ? pagination?.pageSize : 10;
  //   // payload.status = selectedTab ? selectedTab : "all";
  //   // payload.search = debouncedSearchText;
  //   // payload.brand_ids = brandIds ? brandIds : "";
  //   // payload.category_ids = categoryIds ? categoryIds : "";
  //   // request({
  //   //   url: api.list,
  //   //   method: 'POST',
  //   //   data: payload,
  //   //   onSuccess: (data) => {
  //   //     setLoading(false)
  //   //     setList(data.data.list.docs)
  //   //     setPagination(prev => ({ ...prev, current: pagination.current, total: data.data.list.totalDocs }))
  //   //   },
  //   //   onError: (error) => {
  //   //     setLoading(false)
  //   //     ShowToast(error, Severty.ERROR)
  //   //   }
  //   // })
  // }

  const columns = [
    {
      title: "Driver id",
      dataIndex: "id",
    },
    {
      title: "DRIVER NAME",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "date & time",
      dataIndex: "dateTime",
      key: "dateTime",
    },
    {
      title: "Pickup point",
      dataIndex: "pickup_point",
      key: "pickup_point",
    },
    {
      title: "payment Method",
      dataIndex: "payment_Method",
      key: "payment_Method",
    },
    {
      title: "delivery status",
      dataIndex: "delivery_status",
      key: "delivery_status",
    },
    {
      title: "Item Description",
      dataIndex: "Item_Description",
      key: "Item_Description",
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <>
            <Tooltip title="View Detail" color={"purple"} key={"viewDetail"}>
              <Button
                className="ms-sm-2 mt-xs-2 primary_btn btnStyle"
                onClick={(e) => view(record._id)}
              >
                View Detail
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];

  const handleCategory = (e) => {
    setCategoryIds(e);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  useEffect(() => {
    getCategoryList();
    getBrandList();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData({ current: 1 }, selectedTab);
  }, [refresh, debouncedSearchText, categoryIds, brandIds, selectedTab]);

  const handleTabChange = (status) => {
    setSelectedTab(status);
    // fetchData(pagination, '', status)
  };

  const fetchData = (pagination, status) => {
    setLoading(true);

    const payload = {};
    payload.page = pagination ? pagination.current : 1;
    payload.limit = pagination ? pagination?.pageSize : 10;
    payload.status = selectedTab ? selectedTab : "all";
    payload.search = debouncedSearchText;
    payload.brand_ids = brandIds ? brandIds : "";
    payload.category_ids = categoryIds ? categoryIds : "";
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

  const excelData = list.map((row) => ({
    Name: row.user_id && row.user_id.name ? row.user_id.name : "-",
    Category:
      row.category_id && row.category_id.name ? row.category_id.name : "-",
    "Part Number": row.part_number ? row.part_number : "-",
    "Part Type": row.part_type ? row.part_type : "-",
    Location: row.location ? row.location : "-",
    "Amount (ZAR)": row.amount ? row.amount : "-",
    Status: row.is_active ? "Active" : "Inactive",
    "Quote On": moment(row.created_at).format("DD-MM-YYYY"),
  }));

  const handleChange = (pagination, sorter, filters) => {
    if (!sorter) {
      fetchData(pagination);
    }
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
    setPagination({ current: 1 });
  };

  return (
    <>
      <div className="tabled quoteManagement">
        <Row gutter={[24, 0]}>
          <Col xs={24} xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              // title={sectionName + " Management"}
              // extra={
              //   <>
              //     <Search
              //       allowClear
              //       size="small"
              //       maxWidth={282}
              //       onChange={onSearch}
              //       onPressEnter={onSearch}
              //       value={searchText}
              //       placeholder="Search By Customer, Vehicle, Category"
              //     />
              //     <div className="button_group justify-content-end w-100">
              //       <Button title="Export" onClick={(e) => DownloadExcel(excelData, sectionName)}><i class="fas fa-cloud-download-alt"></i>&nbsp;&nbsp;Export</Button>
              //     </div>
              //   </>
              // }
            >
              {/* <Row gutter={[24, 0]} className="mb-24">
                  <Col xs={24} xl={24} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="selectQuote" style={{ display: "flex", alignItems: "end", gap: "8px", width: "100%" }}>
                      <Select style={{ width: '100%' }} value={brandIds} placeholder="Filter By Brand (Multiple)" mode="multiple" name="brand_id" onChange={handleBrand}>
                        {brandList && brandList && brandList.length > 0 ? brandList.map((item, index) => (
                          <option key={index} value={item._id}> {item.name} </option>
                        )) : null}
                      </Select>
                      <Select style={{ width: '100%' }} value={categoryIds} placeholder="Filter By Category (Multiple)" mode="multiple" name="categrory_id" onChange={handleCategory}>
                        {categoryList && categoryList && categoryList.length > 0 ? categoryList.map((item, index) => (
                          <option key={index} value={item._id}> {item.name} </option>
                        )) : null}
                      </Select>
                    </div>
  
                    <Button onClick={handleReset}><i class="fas fa-sync-alt"></i></Button>
                  </Col>
                </Row> */}

              <Tabs
                className="main_tabs"
                onTabClick={handleTabChange}
                activeKey={selectedTab}
                tabBarStyle={{ color: "green" }}
              >
                <TabPane tab="Delivery Agent history" key="all">
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
                          <Button className="primary_btn btnStyle">
                            Export to Excel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <h4 className="text-right mb-1">{pagination.total ? ShowTotal(pagination.total) : ShowTotal(0)}</h4> */}

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
                </TabPane>

                <TabPane tab="Customer order history" key={QuoteStatus.REQUEST}>
                  {/* <h4 className="text-right mb-1">{pagination.total ? ShowTotal(pagination.total) : ShowTotal(0)}</h4> */}
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
                          <Button className="primary_btn btnStyle">
                            Export to Excel
                          </Button>
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
                </TabPane>

                <TabPane
                  tab="Restaurant order history"
                  key={QuoteStatus.RECEIVED}
                >
                  {/* <h4 className="text-right mb-1">{pagination.total ? ShowTotal(pagination.total) : ShowTotal(0)}</h4> */}
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
                          <Button className="primary_btn btnStyle">
                            Export to Excel
                          </Button>
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
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
        {modal && (
          <AddForm3
            show={modal}
            hide={() => {
              showModal(false);
              setSelectedQuote();
            }}
          />
        )}
      </div>
    </>
  );
}

const AddForm = ({ section, api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [file, setFile] = useState([]);
  const [image, setImage] = useState([]);
  const [loading, setLoading] = useState(false);
  const FileType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/avif",
    "image/webp",
    "image/gif",
  ];

  const handleImage = (data) => {
    setImage(data);
    data.length > 0 ? setFile(data[0].url) : setFile([]);
  };

  useEffect(() => {
    if (!data) return;
    console.log(data);
    form.setFieldsValue({ ...data });
    setFile([data.image]);
  }, [data]);

  const onCreate = (values) => {
    const { name, ar_name, status } = values;
    console.log(values, "values");
    const payload = {};
    setLoading(true);
    payload.name = name;
    payload.ar_name = ar_name;
    payload.is_active = status;
    payload.image = image && image.length > 0 ? image[0].url : "";

    console.log(payload, "hfdjhjkhgjkfhgjkfhg");
    request({
      url: `${data ? api.addEdit + "/" + data._id : api.addEdit}`,
      method: data ? "PUT" : "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          hide();
          refresh();
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  return (
    <Modal
      visible={show}
      width={750}
      // title={`${data ? "Update " + section : "Create a New " + section}`}
      okText="Add"
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
    >
      <Form id="create" form={form} onFinish={onCreate} layout="vertical">
        <h4 className="modal_title_cls">Add New Category</h4>
        <Row gutter={[16, 0]}>
          <Col span={24} sm={12}>
            <Form.Item
              label={`Category Name`}
              name="ar_name"
              rules={[
                {
                  max: 20,
                  message: "Name should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Category Name`} />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={`Category Name Arabic`}
              name="fr_name"
              rules={[
                {
                  max: 20,
                  message: "Name should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`أدخل اسم الفئة`} />
            </Form.Item>
          </Col>

          <Col span={24} sm={24}>
            <div className="status_wrap">
              <Form.Item label="Status" name="is_active">
                <Radio.Group>
                  <Radio value={true}>Active</Radio>
                  <Radio value={false}>De Active</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
          </Col>

          <Col span={24}>
            <Form.Item
              className="upload_wrap"
              rules={[
                {
                  validator: (_, value) => {
                    if (value !== undefined && value?.length > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Image is required"));
                  },
                },
              ]}
              label={"Upload Image"}
              name="image"
            >
              <SingleImageUpload
                value={image}
                fileType={FileType}
                imageType={"category"}
                btnName={"Thumbnail"}
                onChange={(data) => handleImage(data)}
              />
            </Form.Item>
            {file && file.length > 0 && (
              <div className="mt-2">
                {" "}
                <Image
                  width={120}
                  src={file !== "" ? file : notfound}
                ></Image>{" "}
              </div>
            )}
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
const AddForm1 = ({ section, api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [file, setFile] = useState([]);
  const [image, setImage] = useState([]);
  const [loading, setLoading] = useState(false);
  const FileType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/avif",
    "image/webp",
    "image/gif",
  ];

  const handleImage = (data) => {
    setImage(data);
    data.length > 0 ? setFile(data[0].url) : setFile([]);
  };

  useEffect(() => {
    if (!data) return;
    console.log(data);
    form.setFieldsValue({ ...data });
    setFile([data.image]);
  }, [data]);

  const onCreate = (values) => {
    const { name, ar_name, status } = values;
    console.log(values, "values");
    const payload = {};
    setLoading(true);
    payload.name = name;
    payload.ar_name = ar_name;
    payload.is_active = status;
    payload.image = image && image.length > 0 ? image[0].url : "";

    console.log(payload, "hfdjhjkhgjkfhgjkfhg");
    request({
      url: `${data ? api.addEdit + "/" + data._id : api.addEdit}`,
      method: data ? "PUT" : "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          hide();
          refresh();
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  return (
    <Modal
      visible={show}
      width={750}
      // title={`${data ? "Update " + section : "Create a New " + section}`}
      okText="Add"
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
    >
      <Form id="create" form={form} onFinish={onCreate} layout="vertical">
        <h4 className="modal_title_cls">Add New Item Size </h4>
        <Row gutter={[16, 0]}>
          <Col span={24} sm={24}>
            <Form.Item
              label={`Size Name`}
              name="ar_name"
              rules={[
                {
                  max: 20,
                  message: "Name should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Size Name`} />
            </Form.Item>
          </Col>
          <Col span={24} sm={24}>
            <Form.Item
              label={`Size Name Arabic`}
              name="ar_name"
              className="size_feald_wrap"
              rules={[
                {
                  max: 20,
                  message: "Name should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Size Name`} />
              <div className="DeleteWrap">
                <Button className="btn_primary">
                  <img src={DeleteIcon} />
                </Button>
              </div>
            </Form.Item>
          </Col>
          <Col span={24} md={24}>
            <div className="AddMore-wrap">
              <Button className="primary_btn">Add More</Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
const AddForm2 = ({ section, api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [file, setFile] = useState([]);
  const [image, setImage] = useState([]);
  const [loading, setLoading] = useState(false);
  const FileType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/avif",
    "image/webp",
    "image/gif",
  ];

  const handleImage = (data) => {
    setImage(data);
    data.length > 0 ? setFile(data[0].url) : setFile([]);
  };

  useEffect(() => {
    if (!data) return;
    console.log(data);
    form.setFieldsValue({ ...data });
    setFile([data.image]);
  }, [data]);

  const onCreate = (values) => {
    const { name, ar_name, status } = values;
    console.log(values, "values");
    const payload = {};
    setLoading(true);
    payload.name = name;
    payload.ar_name = ar_name;
    payload.is_active = status;
    payload.image = image && image.length > 0 ? image[0].url : "";

    console.log(payload, "hfdjhjkhgjkfhgjkfhg");
    request({
      url: `${data ? api.addEdit + "/" + data._id : api.addEdit}`,
      method: data ? "PUT" : "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          hide();
          refresh();
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  return (
    <Modal
      visible={show}
      width={750}
      // title={`${data ? "Update " + section : "Create a New " + section}`}
      okText="Add"
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
    >
      <Form id="create" form={form} onFinish={onCreate} layout="vertical">
        <h4 className="modal_title_cls">Add New Category</h4>
        <Row gutter={[16, 0]}>
          <Col span={24} sm={12}>
            <Form.Item
              label={`Category Name`}
              name="ar_name"
              rules={[
                {
                  max: 20,
                  message: "Name should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Category Name`} />
            </Form.Item>
          </Col>
          <Col span={24} sm={12}>
            <Form.Item
              label={`Category Name Arabic`}
              name="fr_name"
              rules={[
                {
                  max: 20,
                  message: "Name should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`أدخل اسم الفئة`} />
            </Form.Item>
          </Col>
          <Col span={24} sm={24}>
            <div className="status_wrap">
              <Form.Item label="Status" name="is_active">
                <Radio.Group>
                  <Radio value={true}>Active</Radio>
                  <Radio value={false}>De Active</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
          </Col>
          <Col span={24} md={24}>
            <Form.Item
              label={`Size Name Arabic`}
              name="ar_name"
              className="add_remove_wrap"
              rules={[
                {
                  max: 20,
                  message: "Name should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Row gutter={10}>
                <Col md={10}>
                  <Input autoComplete="off" placeholder={`Enter Size Name`} />
                </Col>
                <Col md={10}>
                  <Input autoComplete="off" placeholder={`Enter Size Name`} />
                </Col>
                <Col md={4}>
                  <div className="AddWrap">
                    <Button className="btn_primary">Add</Button>
                  </div>
                </Col>
              </Row>
            </Form.Item>
          </Col>
          <Col span={24} md={24}>
            <Form.Item
              label={`Size Name Arabic`}
              name="ar_name"
              className="add_remove_wrap"
              rules={[
                {
                  max: 20,
                  message: "Name should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Row gutter={10}>
                <Col md={10}>
                  <Input autoComplete="off" placeholder={`Enter Size Name`} />
                </Col>
                <Col md={10}>
                  <Input autoComplete="off" placeholder={`Enter Size Name`} />
                </Col>
                <Col md={4}>
                  <div className="DeleteWrap">
                    <Button className="btn_primary">
                      <img src={DeleteIcon} />
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

const AddForm3 = ({ section, api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [file, setFile] = useState([]);
  const [image, setImage] = useState([]);
  const [loading, setLoading] = useState(false);
  const FileType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/avif",
    "image/webp",
    "image/gif",
  ];

  const handleImage = (data) => {
    setImage(data);
    data.length > 0 ? setFile(data[0].url) : setFile([]);
  };

  useEffect(() => {
    if (!data) return;
    console.log(data);
    form.setFieldsValue({ ...data });
    setFile([data.image]);
  }, [data]);

  const onCreate = (values) => {
    const { name, ar_name, status } = values;
    console.log(values, "values");
    const payload = {};
    setLoading(true);
    payload.name = name;
    payload.ar_name = ar_name;
    payload.is_active = status;
    payload.image = image && image.length > 0 ? image[0].url : "";

    console.log(payload, "hfdjhjkhgjkfhgjkfhg");
    request({
      url: `${data ? api.addEdit + "/" + data._id : api.addEdit}`,
      method: data ? "PUT" : "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          hide();
          refresh();
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  return (
    <Modal
      visible={show}
      width={750}
      // title={`${data ? "Update " + section : "Create a New " + section}`}
      okText="Add"
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
    >
      <Form id="create" form={form} onFinish={onCreate} layout="vertical">
        <h4 className="modal_title_cls">Add New Ingredients Category</h4>
        <Row gutter={[16, 0]}>
          <Col span={24} sm={12}>
            <Form.Item
              label={`Toppings Category Name`}
              name="ar_name"
              rules={[
                {
                  max: 20,
                  message: "Name should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input
                autoComplete="off"
                placeholder={`Enter Toppings Category Name  `}
              />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={`Toppings Category Name Arabic`}
              name="fr_name"
              rules={[
                {
                  max: 20,
                  message: "Name should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`أدخل اسم فئة الطبقة`} />
            </Form.Item>
          </Col>

          <Col span={24} sm={24}>
            <div className="status_wrap">
              <Form.Item label="Status" name="is_active">
                <Radio.Group>
                  <Radio value={true}>Active</Radio>
                  <Radio value={false}>De Active</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default Index;
