import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Input,
  Tag,
  Tooltip,
  Image,
  Tabs,
} from "antd";
import React, { useState, useEffect, useContext } from "react";
import useRequest from "../../hooks/useRequest";
import DeleteModal from "../../components/DeleteModal";

import { ShowToast, Severty } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import ShowTotal from "../../components/ShowTotal";
import { useLocation, useNavigate, useParams } from "react-router";
import ConfirmationBox from "../../components/ConfirmationBox";
import apiPath from "../../constants/apiPath";
import moment from "moment";
import notfound from "../../assets/images/not_found.png";
import { AppStateContext, useAppContext } from "../../context/AppContext";
import Plus from "../../assets/images/plus.svg";
import Banner from "../Banner/Index";
import Videos from "../Videos/Index";
import Contents from "../Content/Index";

const Search = Input.Search;
const { TabPane } = Tabs;

function Index(props) {
  const { setPageHeading } = useContext(AppStateContext);

  const sectionName = "Blog";
  const routeName = "blogs";

  const api = {
    status: apiPath.statusBlog,
    list: apiPath.listBlog,
  };

  const activity = (id) => {
    navigate(`/user/activity/${id}`);
  };
  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const [list, setList] = useState([]);
  const { showConfirm } = ConfirmationBox();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selected, setSelected] = useState();
  const [showDeleteeBlog, setShowDeleteeBlog] = useState(false);
  //For Filters
  const [filter, setFilter] = useState();

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();
  const paramsKey = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("key");
  console.log(type, "state");

  const view = (id) => {
    navigate(`/${routeName}/view/${id}`);
  };
  useEffect(() => {
    setPageHeading("Blogs");
  }, []);

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
      title: "Thumbnail",
      dataIndex: "thumbnail",
      key: "thumbnail",
      render: (_, { thumbnail }) => (
        <Image width={60} src={thumbnail ? thumbnail : notfound} />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
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
      render: (_, { is_active, _id }) => {
        let color = is_active ? "green" : "red";
        return (
          <a>
            <Tag
              onClick={(e) =>
                showConfirm({
                  record: _id,
                  path: api.status,
                  onLoading: () => setLoading(true),
                  onSuccess: () => setRefresh((prev) => !prev),
                })
              }
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
      title: "Created On",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <>
            <Tooltip
              title={"Update " + sectionName}
              color={"purple"}
              key={"update" + routeName}
            >
              <Button
                className="ant-btn ant-btn-default"
                title="Edit"
                onClick={() =>
                  navigate(`/${routeName}/edit/` + (record ? record._id : null))
                }
              >
                <i class="fas fa-edit"></i>
              </Button>
            </Tooltip>
            {/* <Tooltip
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
            </Tooltip> */}
            <Tooltip
              title={"Delete"}
              color={"purple"}
              key={"delete" + routeName}
            >
              <Button
                className="delete-cls"
                title="Delete"
                onClick={() => {
                  setSelected(record);
                  setShowDeleteeBlog(true);
                }}
              >
                <i class="fa fa-light fa-trash"></i>
                {/* <span>Delete</span> */}
              </Button>
            </Tooltip>
            <Tooltip
              title={"View " + sectionName}
              color={"purple"}
              key={"viewblog" + routeName}
            >
              <Button
                className="ant-btn ant-btn-default"
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
  }, [refresh, debouncedSearchText]);

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;

    request({
      url:
        api.list +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&pageSize=${
          pagination ? pagination.pageSize : 10
        }&search=${debouncedSearchText}`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setList(data.data.list.docs);
        setPagination((prev) => ({
          current: pagination.current,
          pageSize: 10,
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
    setFilter(filters);
    fetchData(pagination, filters);
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
    setPagination({ current: 1, pageSize: 10 });
  };
  const [activeTab, setActiveTab] = useState(type ? type : "1");
  const handleTabChange = (key) => {
    setActiveTab(key);
    // Add any other state updates or logic you need here
  };

  const onDeleted = (id) => {
    request({
      url: apiPath.deleteBlog + "/" + id,
      method: "DELETE",
      onSuccess: (data) => {
        setLoading(false);
        ShowToast(data.message, Severty.SUCCESS);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  return (
    <>
      <div className="tabled blog">
        <Row gutter={[24, 0]}>
          <Col xs={24} xl={24}>
            <Tabs
              className="blog-panel-tab"
              activeKey={activeTab}
              onChange={handleTabChange}
            >
              <TabPane className="blogs-tab" tab="Blogs" key="1">
                <Card
                  bordered={false}
                  className="criclebox tablespace mb-24"
                  title={sectionName + " Listing"}
                  extra={
                    <>
                      <div className="button_group justify-content-end w-100">
                        <div className="pageHeadingSearch">
                          <Input.Search
                            className="searchInput"
                            allowClear
                            size="large"
                            onChange={onSearch}
                            value={searchText}
                            onPressEnter={onSearch}
                            placeholder="Search By Title"
                          />
                        </div>
                        <Button
                          className="primary_btn btnStyle"
                          onClick={() => navigate(`/${routeName}/add`)}
                        >
                          <span className="add-Ic">
                            <img src={Plus} />
                          </span>
                          Add {sectionName}
                        </Button>
                      </div>
                    </>
                  }
                >
                  <div className="table-responsive customPagination">
                    <h4 className="text-right">
                      Total Records:{" "}
                      {pagination.total ? pagination.total : list.length}
                    </h4>

                    <Table
                      loading={loading}
                      columns={columns}
                      dataSource={list}
                      pagination={{
                        defaultPageSize: 10,
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
                </Card>
              </TabPane>
              <TabPane className="blogs-tab" tab="Banners" key="2">
                <Banner />
              </TabPane>
              <TabPane className="blogs-tab" tab="Interactive Video" key="3">
                <Videos />
              </TabPane>
              <TabPane className="blogs-tab" tab="Content" key="4">
                <Contents />
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </div>
      {showDeleteeBlog && (
        <DeleteModal
          title={"Delete Blog"}
          subtitle={`Are you sure you want to Delete this Blog?`}
          show={showDeleteeBlog}
          hide={() => {
            setShowDeleteeBlog(false);
            setSelected();
          }}
          onOk={() => onDeleted(selected?._id)}
        />
      )}
    </>
  );
}

export default Index;
