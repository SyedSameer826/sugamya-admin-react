import {
  Avatar,
  Button,
  Image,
  Input,
  Select,
  Table,
  Col,
  Tag,
  Tooltip,
} from "antd";
import React, { useContext, useEffect, useState } from "react";
import * as XLSX from "xlsx";

import Plus from "../../assets/images/plus.svg";
import DeleteModal from "../../components/DeleteModal";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { AppStateContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import AddForm from "./AddForm";

import moment from "moment";
import ConfirmationBox from "../../components/ConfirmationBox";
import { useNavigate } from "react-router";

function Index() {
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Product";
  const routeName = "product";

  const api = {
    product: apiPath.product,
  };

  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  // const [showDelete, setShowDelete] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  //For Filters
  const [tableFilter, setTableFilter] = useState();

  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();

  const activity = (id) => {
    navigate(`/user/activity/${id}`);
  };

  const [filter, setFilter] = useState({
    country_id: undefined,
    city_id: undefined,
    year: undefined,
    month: undefined,
  });

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
      title: "Product Id",
      dataIndex: "prodId",
      key: "prodId",
      render: (_, { prodId }) => {
        return prodId ? (
          <span >{prodId}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, { name, _id, image }) => {
        return !image ? (
          <>
            <Avatar
              style={{ backgroundColor: "#00a2ae", verticalAlign: "middle" }}
              className="cap"
              size={40}
            >
              {" "}
              {name?.charAt(0)}{" "}
            </Avatar>
            <a style={{ marginLeft: 12 }} className="cap">
              {name}
            </a>
          </>
        ) : (
          <>
            <Image className="image-index-radius" src={image} />
            <a style={{ marginLeft: 12 }} className="cap">
              {name}
            </a>
          </>
        );
      },
      sorter: (a, b) => {
        let nameA = a.name?.toLowerCase();
        let nameB = b.name?.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      },
    },
    {
      title: "Generic Name",
      dataIndex: "generic_name",
      key: "generic_name",
      render: (_, { generic_name }) => {
        return generic_name ? (
          <span style={{ textTransform: "lowercase" }}>{generic_name}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Price($)",
      dataIndex: "price",
      key: "price",
      render: (_, { price }) => {
        return price ? (
          <span style={{ textTransform: "lowercase" }}>${price}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      render: (_, { unit }) => {
        return unit ? <span>{unit}</span> : "-";
      },
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (_, { source }) => {
        return source ? <span className="log-width">{source}</span> : "-";
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (_, { quantity }) => {
        return quantity ? (
          <span style={{ textTransform: "lowercase" }}>{quantity}</span>
        ) : (
          "-"
        );
      },
    },
    // {
    //   title: "Batch",
    //   dataIndex: "batch",
    //   key: "batch",
    //   render: (_, { batch }) => {
    //     return batch ? (
    //       <span style={{ textTransform: "lowercase" }}>{batch}</span>
    //     ) : (
    //       "-"
    //     );
    //   },
    // },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (_, { description }) => {
        return description ? (
          <span className="log-width" style={{ textTransform: "lowercase" }}>
            {description}
          </span>
        ) : (
          "-"
        );
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
                  record: "/status/" + _id,
                  path: api.product,
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
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <>
            <Tooltip title={"Edit"} color={"purple"} key={"update" + routeName}>
              <Button
                title="Edit"
                className="edit-cl btnStyle primary_btn"
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
              title={"Delete"}
              color={"purple"}
              key={"delete" + routeName}
            >
              <Button
                className="delete-cls ail"
                title="Delete"
                onClick={() => {
                  setSelected(record);
                  setShowDelete(true);
                }}
              >
                <i class="fa fa-light fa-trash"></i>
                {/* <span>Delete</span> */}
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
          </>
        );
      },
    },
  ];

  const handleExport = () => {
    const data =
      list &&
      list.length > 0 &&
      list.map((row, index) => ({
        "S.No.": index + 1,
        "Product Id": row.prodId,
        "Product Name": row.name,
        "Product Generic Name": row.generic_name,
        "Price(per unit)": row.price,
        Unit: row.unit,
        Source: row.source,
        Quantity: row.quantity,
        Batch: row.batch,
        Description: row.description,
        Status: row.is_active,

        "Registered On": moment(row.created_at).format("DD-MM-YYYY"),
      }));
      // alert(row.languageId.name)

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");
    XLSX.writeFile(
      workbook,
      `${
        moment().milliseconds() +
        1000 * (moment().seconds() + 60 * 60) +
        "-products"
      }.xlsx`,
    );
  };

  const getExportData = async (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;

    const queryString = Object.entries(filter)
      .filter(([_, v]) => v)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");

    try {
      setExportLoading(true);
      request({
        url:
        api.product +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
         1
        }&pageSize=${
          pagination && pagination.total ? pagination.total : 1000
        }&search=${debouncedSearchText}${queryString ? `&${queryString}` : ""}`,
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

    const data = exportData.map((row, index) => ({
      "S.No.": index + 1,
      "Product Id": row?.prodId ? row?.prodId : "-",
      "Product Name": row?.name ? row?.name : "-",
      "Product Generic Name": row?.generic_name ? row?.generic_name : "-",
      "Price(per unit)": row?.price ? row?.price : "-",
      Unit: row?.unit ? row?.unit : "-",
      Source: row?.source ? row?.source : "-",
      Quantity: row?.quantity ? row?.quantity : "-",
      Batch: row.batch ? row.batch : "-",
      Description: row.description ? row.description : "-",
      Status: row?.is_active ? "Active" : "Inactive",

      "Created On": row.created_at ? moment(row.created_at).format("DD_MM_YYYY") : "-",
    }));
    // alert(row.languageId.name)

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");
    XLSX.writeFile(
      workbook,
      `${moment().format("DD-MM-YYYY")}_Products${debouncedSearchText ? `/${debouncedSearchText}` : ""}.xlsx`
    );
  };

  const onDelete = (id) => {
    request({
      url: api.product + "/" + id,
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

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;

    const queryString = Object.entries(filter)
      .filter(([_, v]) => v)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");

    request({
      url:
        api.product +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&pageSize=${
          pagination && pagination.pageSize ? pagination.pageSize : 10
        }&search=${debouncedSearchText}${queryString ? `&${queryString}` : ""}`,
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setLoading(false);

        setList(data);
        console.log(total, "total");
        setPagination((prev) => ({
          ...prev,
          current: pagination.current,
          total: total,
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
    // setFilter(filters);
    fetchData(pagination, filters);
  };

  useEffect(() => {
    setLoading(true);
    fetchData(pagination, filter);
  }, [refresh, debouncedSearchText, filter]);

  useEffect(() => {
    setPageHeading("Product");
  }, []);

  const onSearch = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <>
      <SectionWrapper
        cardHeading={lang("Product") + " " + lang("list")}
        extra={
          <>
            <div className="w-100 text-head_right_cont">
              <div className="pageHeadingSearch">
                <Input.Search
                  className="searchInput"
                  placeholder="Search by Product Name, generic name,productId,unit,price,source"
                  onChange={onSearch}
                  allowClear
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
                Add {sectionName}
              </Button>
              <Button
                className="btnStyle  primary_btn"
                loading={exportLoading}
                onClick={() => getExportData()}
              >
                Export
              </Button>
            </div>
          </>
        }
      >
        <div className="table-responsive customPagination">
        <h4 className="text-right">Total Records: {pagination.total ?? 0}</h4>
          <Table
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={{
              defaultPageSize: 10,
              responsive: true,
              total: pagination.total,
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
          selected={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}

      {showDelete && (
        <DeleteModal
          title={"Delete Product"}
          subtitle={`Are you sure you want to Delete this product?`}
          show={showDelete}
          hide={() => {
            setShowDelete(false);
            setSelected();
          }}
          onOk={() => onDelete(selected?._id)}
        />
      )}
    </>
  );
}

export default Index;
