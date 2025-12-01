import { Row, Col, Card, Table, Button, Input, Tooltip, Tag } from "antd";
import React, { useState, useEffect, useContext } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import { useNavigate } from "react-router";
import ShowTotal from "../../components/ShowTotal";
import apiPath from "../../constants/apiPath";
import ConfirmationBox from "../../components/ConfirmationBox";
import SectionWrapper from "../../components/SectionWrapper";
import { AppStateContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";

import moment from "moment";
import { Link } from "react-router-dom";

const Search = Input.Search;

function Index() {
  const heading = lang("Email Template");
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Email Template";
  const routeName = "email-template";

  const api = {
    status: apiPath.statusEmailTemplate,
    list: apiPath.listEmailTemplate,
  };

  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  //For Filters
  const [filter, setFilter] = useState();

  const [refresh, setRefresh] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();

  const view = (id) => {
    navigate(`/${routeName}/view/${id}`);
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
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
            <Tooltip
              title={"Update " + sectionName}
              color={"purple"}
              key={"update" + routeName}
            >
              <Link
                className="edit-cl btnStyle primary_btn"
                to={`/${routeName}/update/` + (record ? record._id : null)}
              >
                {" "}
                <i class="fas fa-edit"></i>{" "}
              </Link>
            </Tooltip>
            <Tooltip
              title={"View " + sectionName}
              color={"purple"}
              key={"view" + routeName}
            >
              <Button
                className="edit-cl btnStyle  primary_btn view-eye"
                onClick={() => {
                  view(record._id);
                }}
              >
                {" "}
                <i
                  className="fa fa-light fa-eye"
                  style={{ fontSize: "14px" }}
                ></i>
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
  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);
  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;

    request({
      url:
        api.list +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&limit=${
          pagination ? pagination.pageSize : 10
        }&search=${debouncedSearchText}`,
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

  const handleChange = (pagination, filters) => {
    console.log(pagination, filters);
    setFilter(filters);
    fetchData(pagination, filters);
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
    setPagination({ current: 1 });
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
                  placeholder="Search By Title"
                  onChange={onSearch}
                  allowClear
                />
              </div>
              <Button>
                <span className="add-Ic">{/* <img src={Plus} /> */}</span>
              </Button>
            </div>
          </>
        }
      >
        <div className="table-responsive customPagination">
          <h4 className="text-right">Total Records: {pagination.total}</h4>

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
      </SectionWrapper>
    </>
  );
}

export default Index;
