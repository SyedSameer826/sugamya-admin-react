import { Row, Col, Card, Table, DatePicker, Tag } from "antd";
import React, { useState, useEffect } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import moment from "moment";
import ShowTotal from "../../components/ShowTotal";
import apiPath from "../../constants/apiPath";
import { Link, useParams } from "react-router-dom";
const { RangePicker } = DatePicker;

function Activity() {
  const sectionName = "Activity";
  const routeName = "activity";
  const params = useParams();

  const api = {
    list: apiPath.productActivity,
  };

  const { request } = useRequest();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const columns = [
    {
      title: "Product Name",
      dataIndex: "product",
      key: "product",
      render: (_, { product, _id }) => {
        return product && product.name ? (
          <span className="cap text-info"> {product.name} </span>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Device Type",
      dataIndex: "device_type",
      key: "device_type",
      render: (_, { device_type }) => {
        return device_type ? (
          <Tag color={"green"}>
            <span className="cap">{device_type}</span>
          </Tag>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Active On",
      key: "active_on",
      dataIndex: "active_on",
      render: (_, { active_on }) => {
        return active_on
          ? moment(active_on).format("DD-MM-YYYY hh:mm A")
          : "-";
      },
    },
    {
      title: "Inactive On",
      key: "inactive_on",
      dataIndex: "inactive_on",
      render: (_, { inactive_on }) => {
        return inactive_on
          ? moment(inactive_on).format("DD-MM-YYYY HH:mm A")
          : "-";
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetchData(params.id, pagination);
  }, [refresh, startDate, endDate]);

  const fetchData = (userId, pagination, filters) => {
    request({
      url:
        api.list +
        `/${userId}` +
        `?page=${pagination ? pagination.current : 1}&limit=${
          pagination ? pagination.pageSize : 10
        }&start_date=${startDate ? startDate : ""}&end_date=${
          endDate ? endDate : ""
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

  const handleChange = (pagination, filters) => {
    fetchData(pagination, filters);
  };

  const handleChangeDate = (e) => {
    if (e != null) {
      setStartDate(moment(e[0]._d).format("DD-MM-YYYY"));
      setEndDate(moment(e[1]._d).format("DD-MM-YYYY"));
    } else {
      setStartDate();
      setEndDate();
    }
  };

  return (
    <>
      <div className="tabled customerMain">
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              title={sectionName + " Management"}
              extra={
                <>
                  <div className="searchOuter">
                    <RangePicker
                    format="DD-MM-YY"
                      disabledDate={(current) => current.isAfter(Date.now())}
                      onChange={handleChangeDate}
                    />
                  </div>
                </>
              }
            >
              <h4 className="text-right mb-1">
                {pagination.total ? ShowTotal(pagination.total) : ShowTotal(0)}
              </h4>
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
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
export default Activity;
