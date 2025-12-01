import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Input,
  Tag,
  Tooltip,
  Avatar,
  Image,
} from "antd";
import React, { useState, useEffect, useContext } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import ShowTotal from "../../components/ShowTotal";
import { useNavigate } from "react-router";
import ConfirmationBox from "../../components/ConfirmationBox";
import apiPath from "../../constants/apiPath";
import moment from "moment";
import DeleteModal from "../../components/DeleteModal";

import { AppStateContext, useAppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";
import Plus from "../../assets/images/plus.svg";
const Search = Input.Search;

function Videos() {
  const { setPageHeading } = useContext(AppStateContext);

  const sectionName = "Interactive Videos";
  const routeName = "videos";

  const api = {
    status: apiPath.statusVideos,
    list: apiPath.listVideos,
  };
  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const [list, setList] = useState([]);
  const { showConfirm } = ConfirmationBox();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState();
  const [showDeleteeBlog, setShowDeleteeBlog] = useState(false);
 //For Filters
 const [filter, setFilter] = useState();

  const [refresh, setRefresh] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();
  const activity = (id) => {
    navigate(`/user/activity/${id}`);
  };
  const view = (id) => {
    navigate(`/${routeName}/view/${id}`);
  };
  useEffect(() => {
    setPageHeading("Interactive Video");
  }, []);

  const extractYouTubeID = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/shorts\/|\/watch\?v=|\/.*[?&]v=))([^\s&]+)/);
    return match ? match[1] : null;
  };

  const columns = [
    {
      title: "S.No.",
      dataIndex: "sno",
      key: "sno",
      render: (_, __, index) =>  pagination.current === 1
      ? index + 1
      : (pagination.current - 1) * 10 + (index + 1),

    },
    {
      title: "Thumbnail",
      dataIndex: "video",
      key: "video",
      render: (_, { video }) => (
        <iframe
        width="320"
        height="240"
        src={`https://www.youtube.com/embed/${extractYouTubeID(video)}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
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
              <Link
                className="ant-btn ant-btn-default"
                title="Edit"
                to={`/${routeName}/edit/` + (record ? record._id : null)}
              >
                    <i class="fas fa-edit"></i>
              </Link>
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
           
          </>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetchData(pagination,filter);
  }, [refresh, debouncedSearchText]);

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;

    request({
      url:
        api.list +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&pageSize=10&limit=${
          pagination ? pagination.pageSize : 10
        }&search=${debouncedSearchText}`,
      method: "GET",
      onSuccess: ({data}) => {
        setLoading(false);
        setList(data.list.docs);
        setPagination((prev) => ({
          current: pagination.current,
          total: data.list.totalDocs,
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
    setFilter(filters)
    fetchData(pagination, filters);
  };

 

  const onDeleted = (id) => {
    request({
      url: apiPath.deleteVideo + "/" + id,
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
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              title={sectionName + "Listing"}
              extra={
                <>
                  
                  <div className="button_group justify-content-end w-100">
                    <Link
                      className="primary_btn btnStyle"
                      to={`/${routeName}/add`}
                    >
                        <span className="add-Ic">
                          <img src={Plus} />
                        </span>
                      Add {sectionName}
                    </Link>
                  </div>
                </>
              }
            >

              <div className="table-responsive customPagination">
              <h4 className="text-right">Total Records: {pagination.total ? pagination.total : list.length}</h4>

                <Table
                  loading={loading}
                  columns={columns}
                  dataSource={list}
                  pagination={pagination}
                  onChange={handleChange}
                  className="ant-border-space"
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      {showDeleteeBlog && (
        <DeleteModal
          title={"Delete Video"}
          subtitle={`Are you sure you want to Delete this video?`}
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

export default Videos;
