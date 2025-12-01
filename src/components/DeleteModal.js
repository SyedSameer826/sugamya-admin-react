import { useState } from "react";
import { Form, Modal, Row, Col, Radio } from "antd";

const DeleteModal = ({ show, hide, onOk, title, subtitle }) => {
  return (
    <Modal
      width={700}
      open={show}
      onOk={() => {
        if (onOk) onOk();
        hide();
      }}
      onCancel={hide}
      centered
      className="tab_modal deleteWarningModal"
    >
      <Form layout="vertical" className="p-2">
        <h4 className="modal_title_cls mb-2">{title}</h4>
        <h4 className="modal_sub_title_cls mb-2">{subtitle}</h4>
      </Form>
    </Modal>
  );
};

export default DeleteModal;
