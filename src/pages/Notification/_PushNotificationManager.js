import { Button, Image, Modal, Table, Tooltip } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import deleteWhiteIcon from "../../assets/images/icon/deleteWhiteIcon.png";
import notfound from "../../assets/images/not_found.png";
import Plus from "../../assets/images/plus.svg";
import DeleteModal from "../../components/DeleteModal";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import EditIcon from "../../assets/images/edit.svg";
import AddNotificationModal from "./_AddNotificationModal";
// import AdvertisementBannerForm from "./AdvertisementBannerForm";

const { confirm } = Modal;

const PushNotificationManager = ({ sectionName }) => {
  const [pagination, setPagination] = useState({
    current: 1,
    total: 10,
  });

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDelete, setShowDelete] = useState(false);

  const [selectedAddBanner, setSelectedAddBanner] = useState();
  const [visible, setVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const { request } = useRequest();

  const handleChange = (pagination, sorter, filters) => {
    if (!sorter) {
      setPagination((prev) => ({
        current: pagination.current,
        total: 10,
      }));
    }
  };

  const onDelete = (record) => {
    request({
      url: apiPath.notification + "/" + record?._id,
      method: "DELETE",
      onSuccess: (data) => {
        setLoading(false);
        setRefresh(prev => !prev)
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const fetchData = () => {
    request({
      url:
        apiPath.notification +
        `?status=${""}&page=${pagination ? pagination.current : 1}&pageSize=${pagination && pagination?.total ? pagination?.total : 10
        }&search=${""}`,
      method: "GET",
      onSuccess: (data) => {
        setList(data.data);
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const columns = [
    {
      title: "S. No",
      dataIndex: "index",
      key: "index",
      render: (value, item, index) =>
        pagination.current === 1
          ? index + 1
          : (pagination.current - 1) * 10 + (index + 1),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (_, { title }) => title,
    },
    {
      title: "Notifications",
      dataIndex: "message",
      key: "message",
      render: (_, { message }) => message,
    },

    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (_, { country_id }) => country_id?.name ?? "-",
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      render: (_, { city_id }) => city_id?.name ?? "-",
    },

    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (_, { start_date }) => {
        return moment(start_date).format("DD-MM-YYYY");
      },
    },

    {
      title: "Target Audience",
      dataIndex: "audience",
      key: "audience",
      render: (_, { audience }) => {
        return audience ? <span className="cap">{audience}</span> : "-";
      },
    },
    {
      title: "Category",
      dataIndex: "category_id",
      key: "category_id",
      render: (_, { category_id }) => {
        return category_id && category_id?.name ? category_id?.name : "-";
      },
    },

    {
      title: "Action", 
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            {record?.status === "Draft" && (
              <>
                <Tooltip
                  title={"Send"}
                  color={"purple"}
                  key={"update"}
                >
                  <Button
                    title="Edit"
                    className="btnStyle btnOutlineDelete"
                    onClick={() => {
                    // ShowToast('Notification')
                    }}
                  >
                    <span>Send</span>
                  </Button>
                </Tooltip>
                <Tooltip title={"Edit"} color={"purple"} key={"Edit"}>
                  <Button
                    title="Edit"
                    className="edit-cls btnStyle primary_btn"
                    onClick={() => {
                      setSelectedAddBanner(record);
                      setVisible(true);
                    }}
                  >
                    <img src={EditIcon} />
                    <span>Edit</span>
                  </Button>
                </Tooltip>
              </>
            )}

            <Tooltip title={"Delete"} color={"purple"} key={"Delete"}>
              <Button
                title="Delete"
                className="btnStyle deleteDangerbtn"
                onClick={(e) => {
                  setSelectedAddBanner(record);
                  setShowDelete(true);
                }}
              >
                <img src={deleteWhiteIcon} />
                <span>Delete</span>
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, { status }) => {
        return status ? status : "-";
      },
    },
  ];

  useEffect(() => {
    fetchData(pagination);
  }, [refresh]);

  return (
    <>
      <SectionWrapper
        cardHeading={"Push Notifications"}
        extra={
          <>
            <div className="w-100 text-head_right_cont">
              <Button
                className="primary_btn btnStyle"
                onClick={(e) => {
                  setVisible(true);
                }}
              >
                <span className="add-Ic">
                  <img src={Plus} />
                </span>
                Add Notification
              </Button>
            </div>
          </>
        }
      >
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
              showQuickJumper: true,
              pageSizeOptions: ["10", "20", "30", "50"],
            }}
            onChange={handleChange}
            className="ant-border-space"
          />
        </div>
      </SectionWrapper>

      {visible && (
        <AddNotificationModal
          type={sectionName}
          sectionName={sectionName}
          show={visible}
          hide={() => {
            setSelectedAddBanner();
            setVisible(false);
          }}
          ant-btn-default
          data={selectedAddBanner}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}

      {showDelete && (
        <DeleteModal
          title={"Delete Notification"}
          subtitle={`Are you sure you want to Delete this notification?`}
          show={showDelete}
          hide={() => {
            setShowDelete(false);
            setSelectedAddBanner();
          }}
          onOk={() => onDelete(selectedAddBanner)}
        />
      )}
    </>
  );
};

export default PushNotificationManager;
