import {
  Row,
  Col,
  Card,
  Button,
  Skeleton,
  Avatar,
  Image,
  Tooltip,
  Table,
  Tag,
  Modal,
} from "antd";

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useRequest from "../../../hooks/useRequest";
import { ShowToast, Severty } from "../../../helper/toast";
import apiPath from "../../../constants/apiPath";
import { Badge } from "antd";
import moment from "moment-timezone";
import DeleteModal from "../../../components/DeleteModal";
import AddAvailability from "./AddAvailability";
import { IstConvert } from "../../../helper/functions";
import * as XLSX from "xlsx";

function ViewAvailability({ show, hide, data ,selectedDr}) {
  const sectionName = "Doctor";
  const routeName = "doctor";
  const params = useParams();
  const navigate = useNavigate();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [selected, setSelected] = useState();
  const [getRecord, setRecord] = useState();
  const [viewSlots, setSlots] = useState();
  const [addAvail, setShowAvail] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const api = {
    doctor: apiPath.doctor,
  };

  const fetchData = (id) => {
    request({
      url: api.doctor + "/availability/" + id,
      method: "GET",
      onSuccess: (data) => {
        setAvailability(data.data);
        setLoading(false);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const onDelete = (id) => {
    request({
      url: api.doctor + "/availability/" + id,
      method: "DELETE",
      onSuccess: (data) => {
        setLoading(false);
        setRefresh((prev) => !prev);
        ShowToast(data?.message, Severty.SUCCESS)
        // fetchData(data);

      },
      onError: (error) => {
        setLoading(false);
        console.log(error,"errorrrrrr")
        ShowToast(error?.response?.data?.message, Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    console.log(data, 123);
    fetchData(data);
  }, [refresh]);

  const AvailabilityColumn = [
    {
      title: "S. No",
      dataIndex: "index",
      key: "index",
      render: (value, item, index) => `${index + 1}`,
    },
    {
      title: "Availability Day",
      dataIndex: "availability",
      key: "availability",
      render: (_, { _id, availability_day }) =>
        // <Image width={50} src={image ? apiPath.assetURL + image : notfound} />
        {
          return (
            <div style={{ cursor: "pointer" }} onClick={() => handleSlots(_id)}>
              {availability_day}
            </div>
          );
        },
    },
    {
      title: "slot Date",
      dataIndex: "slot",
      key: "slot",
      render: (_, { slot_date }) =>
        // <Image width={50} src={image ? apiPath.assetURL + image : notfound} />
        {
          return <p>{slot_date ? moment(slot_date).format("DD-MM-YYYY") : "-"}</p>;
        },
    },
    {
      title: "Availability Time",
      dataIndex: "availability",
      key: "availability",
      render: (_, { availability_time_to, availability_time_from }) => {
        const IST_availability_time_from = moment(
          availability_time_from
        ).format("hh:mm a");
        const IST_availability_time_to =
          moment(availability_time_to).format("hh:mm a");

        // Return JSX with IST times
        return (
          <p>
            {IST_availability_time_from} - {IST_availability_time_to}
          </p>
        );
      },
    },
    {
      title: "Appointment Status",
      key: "status",
      dataIndex: "status",
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
           {!record.is_deleted ?
            <Tooltip title={"Delete"} color={"purple"} key={"Delete"}>
              <Button
                title=""
                className="btnStyle primary_btn"
                onClick={() => {
                  setShowDelete(true);
                  setSelected(record._id);
                }}
              >
                <i className="fa fa-trash-alt" style={{ fontSize: "14px" }}></i>
              </Button>
            </Tooltip> : "" }
          </div>
        );
      },
    },
  ];
  const SlotColumn = [
    {
      title: "slot Day",
      dataIndex: "slot",
      key: "slot",
      render: (_, { slot_day }) =>
        // <Image width={50} src={image ? apiPath.assetURL + image : notfound} />
        {
          return <p>{slot_day}</p>;
        },
    },
    {
      title: "slot Date",
      dataIndex: "slot",
      key: "slot",
      render: (_, { slot_date }) =>
        // <Image width={50} src={image ? apiPath.assetURL + image : notfound} />
        {
          return <p>{moment(slot_date).format("DD-MM-YYYY")}</p>;
        },
    },
    {
      title: "slot Time",
      dataIndex: "slot",
      key: "slot",
      render: (_, { slot_time_to, slot_time_from }) => {
   
        // const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // console.log(localTimeZone, "time zone>>>>>");
        // const IST_slot_time_from = moment
        //   .utc(slot_time_from, "HH:mm")
        //   .tz(localTimeZone)
        //   .format("hh:mm A");

        // const IST_slot_time_to = moment
        //   .utc(slot_time_to, "HH:mm")
        //   .tz(localTimeZone)
        //   .format("hh:mm A");
          const timeInLocalTo = moment.utc(slot_time_to, "HH:mm").local();
          const timeInLocalFrom = moment.utc(slot_time_from, "HH:mm").local();
        // Return JSX with IST times
        return (
          <p>
            {timeInLocalFrom.isValid() ? timeInLocalFrom.format("hh:mm A") : "-"}-{timeInLocalTo.isValid() ? timeInLocalTo.format("hh:mm A") : "-"}
            {/* {IST_slot_time_from} - {IST_slot_time_to} */}
          </p>
        );
      },
    },
    {
      title: "Slot Status",
      key: "status",
      dataIndex: "status",
      render: (_, { status }) => {
        return <p>{status === "Pending" ? "Open" : status}</p>;
      },
    },
  ];

  const handleSlots = (id) => {
    fetchAdditionalData(id);
  };

  const addAvailibility = () => {
    setShowAvail(true);
    console.log("set>>>>>>>..");
    // hide()
  };

  const fetchAdditionalData = (record) => {
    console.log(record, 100);
    request({
      url: api.doctor + "/slots/" + record,
      method: "GET",
      onSuccess: (data) => {
        console.log(data.slots);
        // setLoading(false);
        // setRefresh((prev) => !prev);
        setRecord(data.slots);
        setSlots(true);
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
    // Return JSX to display additional data
  };

  const getExportData = async (record) => {
    try {
      setExportLoading(true);
      request({
        url: api.doctor + "/availability/" + data,
        method: "GET",
        onSuccess: ({ data, status, total, message }) => {
          setExportLoading(false);
          if (status) {
            excelData(data ?? []);
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

    const data = exportData.map((row, index) => {
      const IST_availability_time_from = moment(
        row?.availability_time_from
      ).format("hh:mm a");
      const IST_availability_time_to = moment(row?.availability_time_to).format(
        "hh:mm a"
      );
      return {
        "S.No.": index + 1,
        "Availability day": row?.availability_day ? row?.availability_day : "-",
        "Slot Date": moment(row?.slot_date).format("DD_MM_YYYY"),
        "Availability Time":
          `${IST_availability_time_from}-${IST_availability_time_to}` || "-",
        "Appointment Status": row?.status ? row.status : "-",
        "Registered On": moment(row.created_at).format("DD_MM_YYYY"),
      };
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Availability Data");
    XLSX.writeFile(
      workbook,
      `${moment().format("DD-MM-YYYY")}_Dr.${selectedDr?.name}_availability.xlsx`
    );
  };




  const excelSlotsData = () => {
    if (!getRecord.length) return;

    const data = getRecord.map((row, index) => {
      const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log(localTimeZone, "time zone>>>>>");
      const IST_slot_time_from = moment
        .utc(row?.slot_time_from, "HH:mm")
        .tz(localTimeZone)
        .format("hh:mm A");

      const IST_slot_time_to = moment
        .utc(row?.slot_time_to, "HH:mm")
        .tz(localTimeZone)
        .format("hh:mm A");
      return {
        "S.No.": index + 1,
        "slot Day": row?.slot_day ? row?.slot_day : "-",
        "slot Date": row?.slot_date ? row?.slot_date : "-",
        "slot Time":
          `${IST_slot_time_from}-${IST_slot_time_to}` || "-",
        "Slot Status": row?.status === "Pending" ? "Open" : row.status ,
        "Registered On": moment(row.created_at).format("DD_MM_YYYY"),
      };
    });
    const getDay = getRecord?.length ? getRecord?.[0]?.slot_day : ""
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Data");
    XLSX.writeFile(
      workbook,
      `${moment().format("DD-MM-YYYY")}_Dr.${selectedDr?.name}_${getDay}_slots.xlsx`
    );
  };

  return (
    <>
      <Modal
        open={show}
        width={1050}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="tab_modal"
        footer={null}
      >
        <Card className="mt-3" title="Appointments">
          <Row gutter={16}>
            <div className="float-end mt-3 w-100 text-right">
              <Button className="primary_btn btnStyle" onClick={() => hide()}>
                Back
              </Button>
              <Button
                  className="btnStyle  primary_btn"
                  loading={exportLoading}
                  onClick={() => getExportData()}
                >
                  Export
                </Button>
              <Button
                className="primary_btn btnStyle"
                onClick={addAvailibility}
              >
                Add
              </Button>
            </div>
          </Row>
          <div className="tabled mt-3">
            <Row gutter={[24, 0]}>
              <Col xs={24} xl={24}>
                <div className="table-responsive customPagination">
                  <Table
                    loading={loading}
                    columns={AvailabilityColumn}
                    dataSource={availability}
                    pagination={true}
                    className="ant-border-space"
                    rowClassName={(record) => {
                      return record.is_deleted ? "deleted-row" : "";
                    }}
                  />
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      </Modal>
      {/* Conditionally render AddAvailability component */}

      {viewSlots && (
        <Modal
          open={viewSlots}
          close={() => setSlots(false)}
          width={1050}
          aria-labelledby="contained-modal-title-vcenter"
          centered
          className="tab_modal"
          footer={null}
        >
          <Card className="mt-3" title="Slots">
            <Row gutter={16}>
              <div className="float-end mt-3 w-100 text-right">
                <Button
                  className="primary_btn btnStyle"
                  onClick={() => setSlots(false)}
                >
                  Back
                </Button>
                <Button
                  className="btnStyle  primary_btn"
                  loading={exportLoading}
                  onClick={() => excelSlotsData()}
                >
                  Export
                </Button>
              </div>
            </Row>
            <div className="tabled mt-3">
              <Row gutter={[24, 0]}>
                <Col xs={24} xl={24}>
                  <div className="table-responsive customPagination">
                    <Table
                      loading={loading}
                      columns={SlotColumn}
                      dataSource={getRecord}
                      pagination={true}
                      className="ant-border-space"
                      rowClassName={(record) => {
                        return record.status === "Booked" ? "deleted-row" : "";
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Modal>
      )}

      {addAvail && (
        <AddAvailability
          section={"Add Availability"}
          api={api}
          show={addAvail}
          hide={() => {
            setSelected();
            setShowAvail(false);
            //show();
          }}
          data={data}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}

      {showDelete && (
        <DeleteModal
          title={"Delete User"}
          subtitle={`Are you sure you want to Delete Availability?`}
          show={showDelete}
          hide={() => {
            setShowDelete(false);
            setSelected();
          }}
          onOk={() => onDelete(selected)}
        />
      )}
    </>
  );
}

export default ViewAvailability;
