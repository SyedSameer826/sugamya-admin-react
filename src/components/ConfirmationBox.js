import { Button, Modal } from "antd";
import { ShowToast, Severty } from "../helper/toast";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import useRequest from "../hooks/useRequest";
const { confirm } = Modal;

const ConfirmationBox = () => {
  const { request } = useRequest();

  const showConfirm = ({ record, path, onLoading, onSuccess, type }) => {
    setTimeout(() => {
      confirm({
        icon: <ExclamationCircleOutlined />,
        content: <Button>Are you sure you want change the status ?</Button>,
        onOk() {
          statusChange(record, path, onLoading, onSuccess, type);
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    }, 5);
  };

  const showDeleteConfirm = ({ record, path, onSuccess }) => {
    console.log("Show Delete Confirm", record);
    setTimeout(() => {
      confirm({
        icon: <ExclamationCircleOutlined />,
        content: (
          <Button>Are you sure you want delete the selected columns ?</Button>
        ),
        onOk() {
          handleItemDelete(record, path, onSuccess);
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    }, 5);
  };

  const handleItemDelete = (record, path, onSuccess) => {
    console.log(path, "hfjdhfkdhkfhdk 43 from confirmation box");
    const url = path + "/" + record._id;
    request({
      url: url,
      method: "DELETE",
      onSuccess: (data) => {
        onSuccess();
      },
      onError: (error) => {
        console.log(error);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const statusChange = (record, path, onLoading, onSuccess, type) => {
    onLoading(true);
    let url = "";
    if (type === "status-change") {
      url = path;
    } else if (type !== null && type !== undefined) {
      url = path + "/" + type + "/" + record;
    } else {
      url = path + "/" + record;
    }
    request({
      url: url,
      method: "PUT",
      onSuccess: (data) => {
        console.log(data, 733)
        if (data.status == false) {
          ShowToast(data.message, Severty.ERROR)
        }
        onSuccess();
        onLoading(false);
      },
      onError: (error) => {
        console.log(error);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  return { showConfirm, showDeleteConfirm };
};

export default ConfirmationBox;
