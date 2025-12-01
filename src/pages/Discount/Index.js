import {
  Button,
  Card,
  Col,
  DatePicker,
  Image,
  Row,
  Input,
  Switch,
  Table,
  Tooltip,
  Select,
} from "antd";
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
import AddForm from "./AddDiscountForm";
const { RangePicker } = DatePicker;
export const DISCOUNT_TABS = {
  discount: "discount",
  revenue: "discount revenue",
};

function Index() {
  const heading = lang("Discount");
  const { setPageHeading, country } = useContext(AppStateContext);
  const { Option } = Select;
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const sectionName = "Discount";
  const routeName = "discount";

  const { currency } = useContext(AuthContext);

  const api = {
    discount: apiPath.discount,
    revenue: apiPath.revenue,
  };

  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();

  const [list, setList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();
  //For Filters
  const [filter, setFilter] = useState();

  const [showDelete, setShowDelete] = useState(false);
  const [selectedTab, setSelectedTab] = useState(DISCOUNT_TABS.discount);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [selectedDiscount, setSelectedDiscount] = useState();

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const onDelete = (id) => {
    request({
      url: api.discount + "/" + id,
      method: "DELETE",
      onSuccess: (data) => {
        ShowToast(data.message, Severty.SUCCESS);
        setLoading(false);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  // const handleChangeStatus = (id) => {
  //   request({
  //     url: api.discount + "/" + id + "/status",
  //     method: "PUT",
  //     onSuccess: (data) => {
  //       setLoading(false);
  //       setRefresh((prev) => !prev);
  //     },
  //     onError: (error) => {
  //       console.log(error);
  //       setLoading(false);
  //       ShowToast(error, Severty.ERROR);
  //     },
  //   });
  // };

 const handleChangeStatus = (id) => {
  setStatusLoadingId(id); // show loader on this switch

  request({
    url: api.discount + "/" + id + "/status",
    method: "PUT",
    onSuccess: () => {
      setStatusLoadingId(null); // hide loader
      setRefresh((prev) => !prev);
    },
    onError: (error) => {
      setStatusLoadingId(null); // hide loader
      ShowToast(error, Severty.ERROR);
    },
  });
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
      title: lang("Discount Name"),
      dataIndex: "name",
      render: (_, { name }) => {
        return name ? <span className="cap">{name ? name : "-"}</span> : "-";
      },
    },
    // {
    //   title: lang("Banner Image"),
    //   dataIndex: "image",
    //   key: "image",
    //   render: (_, { image }) => (
    //     <Image
    //       width={40}
    //       src={image ? image : notfound}
    //       className="table-img"
    //     />
    //   ),
    // },

    {
      title: lang("Type"),
      dataIndex: "discount_type",
      render: (_, { discount_type }) => {
        return discount_type ? (
          <span className="cap">{discount_type ? discount_type : "-"}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: lang("Discount Percentage"),
      dataIndex: "amount",
      key: "amount",
      render: (_, { amount, discount_type }) => {
        return amount
          ? discount_type === "percentage"
            ? amount + " " + "%"
            : "-"
          : "-";
      },
    },
    {
      title: lang("Fixed Amount"),
      dataIndex: "amount",
      key: "amount",
      render: (_, { amount, discount_type }) => {
        return amount
          ? discount_type === "percentage"
            ? "-"
            : amount + "(USD)"
          : "-";
      },
    },
    {
      title: lang("Category"),
      dataIndex: "category",
      render: (_, { category }) => {
        return category ? (
          <span className="cap">{category ? category : "-"}</span>
        ) : (
          "-"
        );
      },
    },
    // {
    //   title: lang("Admin Percentage"),
    //   dataIndex: "admin_percentage",
    //   render: (_, { admin_percentage }) => {
    //     return admin_percentage ? (
    //       <span className="cap">
    //         {admin_percentage ? admin_percentage : "-"}
    //       </span>
    //     ) : (
    //       "-"
    //     );
    //   },
    // },
    {
      title: lang("Maximum Discount"),
      dataIndex: "max_discount",
      render: (_, { max_discount }) => {
        return max_discount ? (
          <span className="cap">{max_discount ? max_discount : "-"}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: lang("Minimum Order Price"),
      dataIndex: "min_order_price",
      render: (_, { min_order_price }) => {
        return min_order_price ? (
          <span className="cap">{min_order_price ? min_order_price : "-"}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: lang("Maximum No. of use"),
      dataIndex: "max_uses",
      render: (_, { max_uses }) => {
        return max_uses ? (
          <span className="cap">{max_uses ? max_uses : "-"}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: lang("Code"),
      dataIndex: "code",
      render: (_, { code }) => {
        return code ? <span className="cap">{code ? code : "-"}</span> : "-";
      },
    },
    {
      title: lang("Description"),
      dataIndex: "description",
      render: (_, { description }) => {
        return description ? (
          <span className="log-width">{description ? description : "-"}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: lang("Start Date"),
      dataIndex: "start_date",
      key: "start_date",
      render: (_, { start_date }) => {
        return moment(start_date).format("DD-MM-YYYY");
      },
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
    },
    {
      title: lang("End Date"),
      dataIndex: "end_date",
      key: "end_date",
      render: (_, { end_date }) => {
        return moment(end_date).format("DD-MM-YYYY");
      },
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
    },
    {
      title: lang("Created At"),
      dataIndex: "created_at",
      key: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: lang("Status"),
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
      render: (_, { _id, is_active }) => {
        return (
          <Switch
            onChange={() => handleChangeStatus(_id)}
            checked={is_active}
            loading={statusLoadingId === _id}
          />
        );
      },
    },
    {
      title: lang("Action"),
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            <Tooltip
              title={lang("edit")}
              color={"purple"}
              key={"update" + routeName}
            >
              <Button
                title={lang("edit")}
                className="edit-cls btnStyle primary_btn"
                onClick={() => {
                  setSelectedDiscount(record);
                  setVisible(true);
                }}
              >
                <i class="fas fa-edit"></i>
              </Button>
            </Tooltip>

            <Tooltip title={lang("delete")} color={"purple"} key={"Delete"}>
              <Button
                title={lang("delete")}
                className="delete-cls ail"
                onClick={() => {
                  setSelectedDiscount(record);
                  setShowDelete(true);
                }}
              >
                <i class="fa fa-light fa-trash"></i>
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const fetchDiscountList = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;

    request({
      url:
        api.discount +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&pageSize=${
          pagination && pagination?.pageSize ? pagination?.pageSize : 10
        }&start_date=${startDate ? startDate : ""}&end_date=${
          endDate ? endDate : ""
        }&search=${debouncedSearchText}`,
      method: "GET",
      // data: payload,
      onSuccess: (data) => {
        setLoading(false);
        setList(data.data.docs);

        setPagination((prev) => ({
          ...prev,
          current: pagination.current,
          total: data.data.totalDocs,
        }));
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleChange = (pagination, filters, sorter) => {
    console.log("filters", filters);
    setFilter(filters);
    fetchDiscountList(pagination, filters);
    // }
  };

const handleChangeDate = (e) => {
  if (e && e[0] && e[1]) {
    setStartDate(moment(e[0]).format("YYYY-MM-DD")); 
    setEndDate(moment(e[1]).format("YYYY-MM-DD"));
  } else {
    setStartDate(undefined);
    setEndDate(undefined);
  }
};
  useEffect(() => {
    setLoading(true);
    console.log("hello");
    fetchDiscountList(pagination, filter);
  }, [refresh, debouncedSearchText, selectedTab, startDate, endDate]);
  const onSearch = (e) => {
    setSearchText(e.target.value);
    setPagination({ current: 1 });
  };

  return (
    <>
      <div className="tabled quoteManagement">
        <Row gutter={[24, 0]}>
          <Col xs={24} xl={24}>
            <Card bordered={false} className="criclebox tablespace mb-24">
              <SectionWrapper
                cardHeading={lang("Discounts")}
                extra={
                  <>
                    <div className="w-100 text-head_right_cont">
                      <div className="pageHeadingSearch d-flex gap-2">
                        <Input.Search
                          className="searchInput"
                          placeholder="Search by Discount Name"
                          onChange={onSearch}
                          allowClear
                        />
                  <RangePicker
  style={{ height: 44 }}
  format="DD-MM-YY"
  disabledDate={(current) => current && current.isAfter(moment().endOf("day"))}
  value={[
    startDate ? moment(startDate, "YYYY-MM-DD") : null,
    endDate ? moment(endDate, "YYYY-MM-DD") : null,
  ]}
  onChange={handleChangeDate}
/>

                      </div>
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
                        {lang("Create Discount")}
                      </Button>
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
                    pagination={pagination}
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
            refresh={
              () =>
                // console.log("refreshingg............")
                setRefresh((prev) => !prev)
              // fetchDiscountList(pagination);
            }
          />
        )}
      </div>
      {showDelete && (
        <DeleteModal
          title={lang("Delete Discount")}
          subtitle={lang("Are you sure you want to Delete this discount?")}
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
