import { Card, Col, Row, Table } from "antd";
import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import apiPath from "../../constants/apiPath";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import SectionWrapper from "../../components/SectionWrapper";

function Index() {

  const api = { policy: apiPath.policy }; // Assuming this is the correct API path for transactions
  const { request } = useRequest();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        request({
          url: api.policy, // Replace with the correct API endpoint for transactions
          method: "GET",
          onSuccess: ({ data }) => {
            setLoading(false);
            setList(data.data)
          },
          onError: (error) => {
            setLoading(false);
            ShowToast(error, Severty.ERROR);
          },
        });
      } catch (error) {
        setLoading(false);
        ShowToast(error.message, Severty.ERROR);
      }
    };

    fetchData()
  }, [refresh]);
 console.log("list::::::::::::::::",list)
  const columns = [
    {
      title: "Policy Type",
      dataIndex: "policy_type",
      key: "policy_type",
      render: (text, record) => record?.policy_type || "N/A", // Ensure policy_type is correctly accessed
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Applicable Conditions",
      dataIndex: "applicable_conditions",
      key: "applicable_conditions",
    },
    {
      title: "Refund Percentage",
      dataIndex: "refund_percentage",
      key: "refund_percentage",
      render: (text) => `${text}%`,
    },
    {
      title: "Reschedule Charge",
      dataIndex: "reschedule_charge",
      key: "reschedule_charge",
      render: (text) => `$${text}`,
    },
    {
      title: "Time Frame (hours)",
      dataIndex: "time_frame_hours",
      key: "time_frame_hours",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => moment(text).format("ll"),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (text) => moment(text).format("ll"),
    },
  ];

  return (
    <>
      <SectionWrapper
        cardHeading={`Cancelation Policy`}
        // extra={<div className="w-100 text-head_right_cont"></div>}
      >
        <div className="table-responsive customPagination checkBoxSrNo">
          <Table
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={{
              defaultPageSize: 10,
              responsive: true,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["10", "20", "30", "50"],
            }}
            className="ant-border-space"
          />
        </div>
      </SectionWrapper>
    </>
  );
}

export default Index;
