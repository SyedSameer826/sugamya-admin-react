import { Button, Image, Switch, Table, Tag, Tooltip } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import EditIcon from "../../assets/images/edit.svg";
import deleteWhiteIcon from "../../assets/images/icon/deleteWhiteIcon.png";
import notfound from "../../assets/images/not_found.png";
import Plus from "../../assets/images/plus.svg";
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
import { useNavigate } from "react-router";

function Index() {
  const heading = lang("appointment Price");
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Base Proce Manager";
  const routeName = "appointment-price";
  const params = useParams();

  const api = {
    appointmentPrice: apiPath.appointmentPrice,
  };

  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [deleteModal, showDeleteModal] = useState(false);
  const [deleteAllModal, showDeleteAllModal] = useState(false);
  const [selected, setSelected] = useState();
  //For Filters
  const [filter, setFilter] = useState();

  const [selectedIds, setSelectedIds] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();

  const activity = (id) => {
    navigate(`/user/activity/${id}`);
  };

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
      title: "S. No",
      dataIndex: "index",
      key: "index",
      render: (value, item, index) =>
        pagination.current === 1
          ? index + 1
          : (pagination.current - 1) * 10 + (index + 1),
    },
    {
      title: "Appointment Type",
      dataIndex: "type",
      key: "type",
      render: (_, { type }) =>
        type ? <span className="cap">{type}</span> : "-",
    },
    {
      title: "Appointment Category",
      dataIndex: "appointment_category",
      key: "appointment_category",
      render: (_, { appointment_category }) => {
        return appointment_category ? (
          <span className="cap">{appointment_category}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Base Price",
      dataIndex: "price",
      key: "price",
      render: (_, { price }) => {
        return price ? <span className="cap">${price}</span> : "$0";
      },
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
                  path: api.appointmentPrice + "/status",
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
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            <Tooltip
              title={"Update " + sectionName}
              color={"purple"}
              key={"update" + routeName}
            >
              <Button
                title="Edit"
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
            <Tooltip
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
            </Tooltip>

            <Tooltip title={"Delete"} color={"purple"} key={"Delete"}>
              <Button
                title="Delete"
                className="delete-cls ail"
                onClick={() => {
                  setSelected(record);
                  showDeleteModal(true);
                }}
              >
                <i class="fa fa-light fa-trash"></i>
                {/* <span>Delete</span> */}
              </Button>
            </Tooltip>
          </div>
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
        api.appointmentPrice +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&pageSize=${
          pagination?.pageSize ? pagination.pageSize : 10
        }&search=${debouncedSearchText}`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setList(data.data.docs);
        setPagination((prev) => ({
          current: pagination.current,
          total: data.data?.totalDocs,
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

  return (
    <>
      <SectionWrapper
        cardHeading={`Appointment Base Prices`}
        // cardSubheading={"(e.g New, Follow-Up)"}
        extra={
          <>
            {/* <div className="button_group justify-content-end w-100"> */}
            <div className="w-100 text-head_right_cont">
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
                Add New Type
              </Button>
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
              pageSizeOptions: ["10", "20", "30", "50"],
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
