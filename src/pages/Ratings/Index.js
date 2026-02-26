import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Input,
  Tooltip,
  Tag,
  Tabs,
  Select,
} from "antd";
import AddReviewRatingForm from "./AddReviewRatingForm.js";
import Plus from "../../assets/images/plus.svg";
import { StarFilled } from "@ant-design/icons";
import React, { useState, useEffect, useContext } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import { useNavigate, useLocation } from "react-router";
import ShowTotal from "../../components/ShowTotal";
import apiPath from "../../constants/apiPath";
import ConfirmationBox from "../../components/ConfirmationBox";
import EditIcon from "../../assets/images/edit.svg";
import SectionWrapper from "../../components/SectionWrapper";
import { AppStateContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import DeleteModal from "../../components/DeleteModal";
import ReviewForm from "./EditForm";
import moment from "moment";
import { Link } from "react-router-dom";
import { set } from "lodash";
import AddAppointment from "../User/Patient/AddAppointment.js";

const Search = Input.Search;
const { TabPane } = Tabs;

function Index() {
  const heading = lang("Review & Rating");
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Review & Rating";
  const routeName = "reviews";
  const [visible, setVisible] = useState(false);
  const api = {
    list: apiPath.listReviews,
    userReviews: apiPath.userReviews,
    testimonial: apiPath.testimonial,
    status: apiPath.statusReview,
    addEdit: apiPath.addEditReview,
    appointment: apiPath.appointment,
    addReview: apiPath.addReview,
  };

  const [searchText, setSearchText] = useState("");
  const [visibleAddReviewRating, setVisibleAddReviewRating] = useState(false);
  const { request } = useRequest();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  //For Filters
  const [filter, setFilter] = useState({
    rate: "all",
  });
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const type = queryParams.get("key");

  const [selected, setSelected] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [userPagination, setUserPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [testPagination, setTestPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [userReviews, setUserReview] = useState([]);
  const [userTestimonial, setTestimonial] = useState();
  const debouncedSearchText = useDebounce(searchText, 300);
  const [activeTab, setActiveTab] = useState(type ? type : "1");
  const handleTabChange = (key) => {
    setActiveTab(key);
    // Add any other state updates or logic you need here
  };

  const navigate = useNavigate();

  const columns = [
    {
      title: "S.No.",
      dataIndex: "sno",
      key: "sno",
      render: (_, __, index) => {
        return <p>{index + 1}</p>;
      },
    },
    {
      title: "Appointment Id",
      dataIndex: "appointment_id",
      key: "appointment_id",
      render: (_, { appointments }) => {
        return (
          <Link to={`/appointment/view/${appointments?._id}`}>
            {appointments?.appointment_id}
          </Link>
        );
      },
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (_, { rating }) => {
        return (
          <p className="d-flex align-items-center">
            {rating}
            <div className="rating-icons" style={{ marginLeft: "10px" }}>
              {Array.from({ length: 5 }, (_, index) => (
                <StarFilled
                  key={index}
                  className={index < rating ? "active" : ""}
                  style={{ color: index < rating ? "#ffc107" : "#e4e5e9" }} // Highlight based on rating
                />
              ))}
            </div>
          </p>
        );
      },
    },
    {
      title: "Reviews",
      dataIndex: "review",
      key: "review",
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
      fixed: "right",
      className: "td-btn",
      render: (_, record) => {
        return (
          <>
            {activeTab === "3" && (
              <Tooltip title={"Edit"} color={"purple"} key={"edit"}>
                <Button
                  className="edit-cls btnStyle primary_btn"
                  onClick={() => {
                    setSelected(record);
                    setVisible(true);
                  }}
                >
                  <i class="fas fa-edit"></i>
                  {/* <span>Edit</span> */}
                </Button>
              </Tooltip>
            )}
            <Tooltip
              title={"Delete"}
              color={"purple"}
              key={"delete" + routeName}
            >
              <Button
                className="delete-cls ail"
                title="Delete"
                onClick={() => {
                  setSelected(record);
                  setShowDelete(true);
                }}
              >
                <i class="fa fa-light fa-trash"></i>
                {/* <span>Delete</span> */}
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];
  const onDelete = (id) => {
    request({
      url: apiPath.deleteReview + id,
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

  useEffect(() => {
    setLoading(true);
    fetchData(pagination);
    fetchUserReviews();
    fetchTestimonial();
  }, [refresh, debouncedSearchText, filter]);

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;
    const queryString = Object.entries(filter)
      .filter(([_, v]) => v)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");

    request({
      url:
        api.list +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&limit=${
          pagination ? pagination.pageSize : 10
        }&search=${debouncedSearchText}${
          queryString ? `&${queryString} ` : ""
        }`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setList(data.data.list.docs);
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

  const fetchUserReviews = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;
    const queryString = Object.entries(filter)
      .filter(([_, v]) => v)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");
    request({
      url:
        api.userReviews +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&limit=${
          pagination ? pagination.pageSize : 10
        }&search=${debouncedSearchText}${
          queryString ? `&${queryString} ` : ""
        }`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setUserReview(data.data.list.docs);
        setUserPagination((prev) => ({
          current: userPagination.current,
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

  const fetchTestimonial = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;
    const queryString = Object.entries(filter)
      .filter(([_, v]) => v)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");
    request({
      url:
        api.testimonial +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&limit=${
          pagination ? pagination.pageSize : 10
        }&search=${debouncedSearchText}${
          queryString ? `&${queryString} ` : ""
        }`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setTestimonial(data.data.list.docs);
        setTestPagination((prev) => ({
          current: testPagination.current,
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
    console.log(pagination, filters);
    fetchData(pagination, filters);
  };
  const handleUserChange = (pagination, filters) => {
    setFilter(filters);
    console.log(pagination, filters);
    fetchUserReviews(pagination, filters);
  };
  const handleTestChange = (pagination, filters) => {
    setFilter(filters);
    console.log(pagination, filters);
    fetchTestimonial(pagination, filters);
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
    setPagination({ current: 1 });
  };

  const onChange = (key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <SectionWrapper
        cardHeading={sectionName}
        extra={
          <>
            <div className="w-100 text-head_right_cont">
              <div className="pageHeadingSearch d-flex gap-2">
                <Input.Search
                  className="searchInput"
                  value={searchText}
                  onPressEnter={onSearch}
                  placeholder="Appointment id"
                  onChange={onSearch}
                  allowClear
                />
              </div>
              <div className="pageHeadingSearch d-flex gap-2">
                <Select
                  defaultValue="all"
                  style={{
                    width: 120,
                  }}
                  value={filter?.rate}
                  onChange={(value) => onChange("rate", value)}
                  options={[
                    {
                      value: "all",
                      label: lang("All"),
                    },
                    {
                      value: "5",
                      label: lang("Rate 5"),
                    },
                    {
                      value: "4",
                      label: lang("Rate 4"),
                    },
                    {
                      value: "3",
                      label: lang("Rate 3"),
                    },
                    {
                      value: "2",
                      label: lang("Rate 2"),
                    },
                    {
                      value: "1",
                      label: lang("Rate 1"),
                    },
                  ]}
                />
              </div>
            </div>
          </>
        }
      >
        <Tabs
          className="blog-panel-tab pl-4"
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarStyle={{ paddingLeft: "16px" }}
        >
          <TabPane
            className="blogs-tab"
            tab="Patient to Doctor Reviews"
            key="2"
          >
            <div className="table-responsive customPagination">
              <h4 className="text-right">
                Total Records: {userPagination.total ? userPagination.total : 0}
              </h4>

              <Table
                loading={loading}
                columns={columns}
                dataSource={userReviews}
                pagination={{
                  defaultPageSize: 10,
                  responsive: true,
                  total: userPagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "30", "50"],
                }}
                onChange={handleUserChange}
                className="ant-border-space"
              />
            </div>
          </TabPane>
          <TabPane
            className="blogs-tab"
            tab="Doctor to Patient Reviews"
            key="1"
          >
            <div className="table-responsive customPagination">
              <h4 className="text-right">
                Total Records: {pagination.total ? pagination.total : 0}
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
                  pageSizeOptions: ["10", "20", "30", "50"],
                }}
                onChange={handleChange}
                className="ant-border-space"
              />
            </div>
          </TabPane>

          <TabPane className="blogs-tab" tab="User Testimonial" key="3">
            <div className="table-responsive customPagination">
              <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                <Button
                  className="primary_btn btnStyle"
                  onClick={(e) => {
                    setVisibleAddReviewRating(true);
                    setSearchText("");
                  }}
                >
                  <span className="add-Ic">
                    <img src={Plus} />
                  </span>
                  Add Reviews & Rating
                </Button>
                <h4 className="text-right">
                  Total Records:{" "}
                  {testPagination.total ? testPagination.total : 0}
                </h4>
              </div>

              <Table
                loading={loading}
                columns={columns}
                dataSource={userTestimonial}
                pagination={{
                  defaultPageSize: 10,
                  responsive: true,
                  total: testPagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "30", "50"],
                }}
                onChange={handleTestChange}
                className="ant-border-space"
              />
            </div>
          </TabPane>
        </Tabs>
      </SectionWrapper>
      {visible && (
        <ReviewForm
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
      {visibleAddReviewRating && (
        <AddReviewRatingForm
          section={sectionName}
          api={api}
          show={visibleAddReviewRating}
          hide={() => {
            setSelected();
            setVisibleAddReviewRating(false);
          }}
          data={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}
      {showDelete && (
        <DeleteModal
          title={"Delete Review"}
          subtitle={`Are you sure you want to Delete this review?`}
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
