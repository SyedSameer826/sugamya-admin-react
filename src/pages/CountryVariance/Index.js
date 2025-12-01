import { Button, Card, Col, Input, Row, Switch, Table, Tooltip } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AppStateContext } from "../../context/AppContext";

import Plus from "../../assets/images/plus.svg";
import DeleteModal from "../../components/DeleteModal";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { AuthContext } from "../../context/AuthContext";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import AddForm from "./AddVarianceForm";

function Index() {
  const heading = lang("Country Variance");
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Country Variance";
  const routeName = "country-variance";

  const { currency } = useContext(AuthContext);

  const api = {
    discount: apiPath.countryVariance,
  };

  const [visible, setVisible] = useState(false);
  const { request } = useRequest();
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get("page");
  const pageSize = urlParams.get("pageSize");
  const search = urlParams.get("search");
  const [list, setList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(search ?? "");
  const [refresh, setRefresh] = useState(false);
  const [rowFilter, setRowFilter] = useState({});
  const [pagination, setPagination] = useState({
    current: +page ? +page : 1,
    pageSize: +pageSize ? +pageSize : 10,
  });
  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");
  const [filter, setFilter] = useState({});
  const [selectedDiscount, setSelectedDiscount] = useState();

  const activity = (id) => {
    navigate(`/user/activity/${id}`);
  };
  const onDelete = (id) => {
    request({
      url: apiPath.addVariance + "/" + id,
      method: "DELETE",
      onSuccess: (data) => {
        setLoading(false);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const handleChangeStatus = (id) => {
    request({
      url: apiPath.addVariance + "/" + id + "/status",
      method: "PUT",
      onSuccess: (data) => {
        setLoading(false);
        setRefresh((prev) => !prev);
        ShowToast("Status changed successfully", Severty.SUCCESS);
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const view = (id) => {
    navigate(`/${routeName}/view/${id}`);
  };

  const discountColumns = [
    {
      title: lang("S. No"),
      dataIndex: "index",
      key: "index",
      render: (value, item, index) =>
        pagination.current === 1
          ? index + 1
          : (pagination.current - 1) * 10 + (index + 1),
    },
    {
      title: lang("Country Name"),
      dataIndex: "name",
      render: (_, { name }) => {
        return name ? <span className="cap">{name}</span> : "-";
      },
    },
    {
      title: lang("Variance (%)"),
      dataIndex: "variance",
      key: "variance",
      sorter: (a, b) => (a?.variance || 0) - (b?.variance || 0),
      render: (_, { variance }) => {
        return variance || "0";
      },
    },
    {
      title: lang("Fixed Logistics Cost (USD)"),
      dataIndex: "fixed_cost",
      key: "fixed_cost",
      sorter: (a, b) => (a?.fixed_cost || 0) - (b?.fixed_cost || 0),
      render: (_, { fixed_cost }) => {
        return fixed_cost || "0";
      },
    },
    {
      title: lang("Status"),
      key: "is_active",
      dataIndex: "is_active",
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
      render: (_, { _id, is_active }) => {
        return (
          <Switch
            onChange={() => {
              handleChangeStatus(_id);
            }}
            checked={is_active}
          />
        );
      },
    },
    {
      title: lang("Created At"),
      dataIndex: "created_at",
      key: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at)?.format("DD-MM-YYYY");
      },
    },
    {
      title: lang("Action"),
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            <Tooltip
              title={lang("Edit")}
              color={"purple"}
              key={"update" + routeName}
            >
              <Button
                title={lang("Edit")}
                className="Edit-cls btnStyle primary_btn"
                onClick={() => {
                  setSelectedDiscount(record);
                  setVisible(true);
                }}
              >
                <i class="fas fa-edit"></i>
                {/* <span>{lang("Edit")}</span> */}
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

            {/* <Tooltip title={lang("Delete")} color={"purple"} key={"Delete"}>
              <Button
                title={lang("Delete")}
                className="btnStyle deleteDangerbtn"
                onClick={() => {
                  setSelectedDiscount(record);
                  setShowDelete(true);
                }}
              >
                  <i class="fa fa-light fa-trash"></i>
              </Button>
            </Tooltip> */}
          </div>
        );
      },
    },
  ];

  const fetchData = (pagination, filters,sorter) => {
    const filterActive = filters ? filters.is_active : rowFilter?.is_active;
    console.log(pagination, filterActive);

    setLoading(true);

    navigate(
      `/country-variance?search=${encodeURIComponent(
        debouncedSearchText
      )}&page=${encodeURIComponent(
        pagination.current ?? 1
      )}&pageSize=${encodeURIComponent(pagination.pageSize ?? 10)}`
    );
    request({
      url:
        apiPath.addVariance +
        `?status=${
          filterActive ? filterActive.join(",") : ""
        }&search=${debouncedSearchText}&page=${
          pagination ? pagination.current : 1
        }&pageSize=${pagination?.pageSize ? pagination?.pageSize : 10}${sorter ? `&${sorter}` : ""}`,
      method: "GET",
      onSuccess: ({ status, data }) => {
        if (!status) return;
        setList(data.docs);
        setPagination((prev) => ({
          current: pagination?.current,
          pageSize: pagination?.pageSize,
          total: data?.totalDocs,
        }));
        setLoading(false);
      },
      onError: (err) => {
        setLoading(false);
      },
    });
  };



  const handleChange = (pagination, filters,sorter) => {
    const { field, order } = sorter;

   let query = undefined;
   if (field && order) {
     query = `${field}=${order}`;
   }
   setRowFilter(filters);
    fetchData(pagination, filters,query);
  };

  useEffect(() => {
    setLoading(true);
    fetchData(pagination);
  }, [refresh, debouncedSearchText, selectedTab, rowFilter ]);

  const onSearch = (e) => {
    setSearchText(e.target.value);
    setPagination({ current: 1, pageSize: pagination?.pageSize });
  };



  return (
    <>
      <div className="tabled quoteManagement">
        <Row gutter={[24, 0]}>
          <Col xs={24} xl={24}>
            <Card bordered={false} className="criclebox tablespace mb-24">
              <SectionWrapper
                cardHeading={lang("Country Variance")}
                extra={
                  <>
                    <div className="w-100 text-head_right_cont">
                      <div className="pageHeadingSearch d-flex gap-2">
                        <Input.Search
                          className="searchInput"
                          placeholder="Name of Country , Fix Cost , Variance"
                          onChange={onSearch}
                          allowClear
                          value={searchText}
                        />
                    

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
                          {lang("Create Variance")}
                        </Button>
                      </div>
                    </div>
                  </>
                }
              >
                <div className="table-responsive customPagination">
                  <h4 className="text-right">
                    Total Records: {pagination.total ?? 0}
                  </h4>
                  <Table
                    loading={loading}
                    columns={discountColumns}
                    dataSource={list}
                    pagination={{
                      current: pagination?.current,
                      defaultPageSize: +pageSize
                        ? +pageSize
                        : +pagination.pageSize ?? 10,
                      responsive: true,
                      total: pagination?.total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      pageSizeOptions: ["10", "20", "30", "50"],
                    }}
                    onChange={handleChange}
                    className="ant-border-space"
                  />
                </div>
              </SectionWrapper>
            </Card>
          </Col>
        </Row>
        {visible && (
          <AddForm
            section={sectionName}
            api={api}
            show={visible}
            hide={() => {
              setSelectedDiscount();
              setVisible(false);
            }}
            data={selectedDiscount}
            refresh={() => {
              setRefresh((prev) => !prev);
              fetchData(pagination);
            }}
          />
        )}
      </div>
      {showDelete && (
        <DeleteModal
          title={lang("Delete Variance")}
          subtitle={lang("Are you sure you want to Delete this variance?")}
          show={showDelete}
          hide={() => {
            setShowDelete(false);
            setSelectedDiscount();
          }}
          onOk={() => onDelete(selectedDiscount?._id)}
        />
      )}
    </>
  );
}

export default Index;
