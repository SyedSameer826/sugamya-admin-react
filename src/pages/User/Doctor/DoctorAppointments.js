import { Table, DatePicker, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import useRequest from "../../../hooks/useRequest";
import apiPath from "../../../constants/apiPath";
import moment from "moment";
import SectionWrapper from "../../../components/SectionWrapper";
import lang from "../../../helper/langHelper";

function DoctorAppointments() {
  const { request } = useRequest();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [doctorFilter, setDoctorFilter] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchAppointments(1, pagination.pageSize, selectedDate);
  }, [selectedDate]);

  const fetchAppointments = (page = 1, limit = 10, date = moment()) => {
    setLoading(true);

    const formattedDate = moment(date).format("YYYY-MM-DD");

    request({
      url: `${apiPath.doctorsAppointments}?page=${page}&limit=${limit}&date=${formattedDate}`,
      method: "GET",
      onSuccess: (res) => {
        setLoading(false);

        setList(res?.data || []);

        setPagination({
          current: res?.pagination?.currentPage || 1,
          pageSize: res?.pagination?.limit || 10,
          total: res?.pagination?.totalRecords || 0,
        });
      },
      onError: () => setLoading(false),
    });
  };

  const handleTableChange = (pager, filters) => {
    setDoctorFilter(filters?.doctorName || null);
    fetchAppointments(pager.current, pager.pageSize, selectedDate);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setDoctorFilter(null); // reset doctor filter
  };

  const doctorFilters = [
    ...new Map(
      list.map((item) => [
        item?.doctor_id?._id,
        {
          text: item?.doctor_id?.name,
          value: item?.doctor_id?.name,
        },
      ]),
    ).values(),
  ];

  const columns = [
    {
      title: "Sr No",
      width: "7.5%",
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Doctor Name",
      dataIndex: ["doctor_id", "name"],
      key: "doctorName",
      filters: doctorFilters,
      filteredValue: doctorFilter,
      onFilter: (value, record) =>
        record?.doctor_id?.name?.toLowerCase().includes(value.toLowerCase()),
      render: (_, record) => record?.doctor_id?.name || "-",
    },
    {
      title: "Slot Date",
      render: (record) =>
        record?.slot_date ? moment(record.slot_date).format("DD-MM-YYYY") : "-",
    },
    {
      title: "Slot time from",
      render: (record) =>
        moment
          .utc(record.slot_time_from, "HH:mm") // treat as UTC
          .local() // convert to local timezone
          .format("hh:mm A"),
    },
    {
      title: "Slot time to",
      render: (record) =>
        moment.utc(record.slot_time_to, "HH:mm").local().format("hh:mm A"),
    },
    {
      title: "Slot day",
      dataIndex: "slot_day",
    },
  ];

  return (
    <div className="table-responsive">
      <SectionWrapper
        cardHeading={lang("Doctors") + " " + lang(" Appointments")}
        extra={
          <div className="w-100 d-grid align-items-baseline text-head_right_cont">
            <div className="pageHeadingSearch pageHeadingbig d-flex gap-2">
              <div className="role-wrap">
                <Row style={{ marginBottom: 16 }}>
                  <Col>
                    <DatePicker
                      value={selectedDate}
                      onChange={handleDateChange}
                      format="DD-MM-YYYY"
                      allowClear={false}
                    />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        }
      >
        <Table
          rowKey={(record) => record._id}
          loading={loading}
          columns={columns}
          dataSource={list}
          pagination={pagination}
          onChange={handleTableChange}
          rowClassName={(record) =>
            record?.status === "Booked" ? "deleted-row" : ""
          }
        />
      </SectionWrapper>
    </div>
  );
}

export default DoctorAppointments;
