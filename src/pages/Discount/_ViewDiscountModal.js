import { Button, Col, Image, Modal, Row, Card } from "antd";
import moment from "moment";
import React, { useState } from "react";

import "react-phone-input-2/lib/style.css";
import notfound from "../../assets/images/not_found.png";
import DiscountImg from "../../assets/images/discount-ic.svg";
import apiPath from "../../constants/apiPath";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";

export const ApproveStatus = {
  REJECT: "rejected",
  ACCEPT: "accepted",
  SUSPENDED: "suspended",
  PENDING: "pending",
};

const ViewDiscountModal = ({ section, api, show, hide, data, refresh }) => {
  const { request } = useRequest();

  return (
    <Modal
      visible={show}
      width={900}
      cancelText={null}
      onCancel={hide}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
      // title={`${data ? data?.name : "Discount"}`}
      footer={[
        <Button key="okay" type="primary" onClick={hide}>
          Okay
        </Button>,
      ]}
    >
      <h4 className="modal_title_cls">Special Deals Combo</h4>
      <Row gutter={24} style={{ padding: "6px" }}>
        <Col span={24} md={8}>
          <Card>
            <div className="discount-wrap">
              <div className="discount-img">
                <img src={DiscountImg} />
              </div>
              <div className="discount-cont">
                <h4>No. of Restaurant Participate</h4>
                <p>100</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={24} md={8}>
          <Card>
            <div className="discount-wrap">
              <div className="discount-img">
                <img src={DiscountImg} />
              </div>
              <div className="discount-cont">
                <h4>Total Overall Orders</h4>
                <p>100</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={24} md={8}>
          <Card style={{ background: "#F3E008" }}>
            <div className="discount-wrap">
              <div className="discount-img">
                <img src={DiscountImg} />
              </div>
              <div className="discount-cont">
                <h4>Total Sales</h4>
                <p>AED 10,000</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={24} style={{ padding: "6px" }}>
        <Col span={24} md={10}>
          <Card style={{ background: "#F3E008" }}>
            <div className="discount-wrap">
              <div className="discount-img">
                <img src={DiscountImg} />
              </div>
              <div className="discount-cont">
                <h4>Total Sales After 20% Discount</h4>
                <p>AED 8,000</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={24} style={{ padding: "6px" }}>
        <Col span={24} md={8}>
          <Card>
            <div className="discount-wrap">
              <div className="discount-img">
                <img src={DiscountImg} />
              </div>
              <div className="discount-cont">
                <h4>Total Online Sales</h4>
                <p>80,000</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={24} md={8}>
          <Card>
            <div className="discount-wrap">
              <div className="discount-img">
                <img src={DiscountImg} />
              </div>
              <div className="discount-cont">
                <h4>Total COD Sales</h4>
                <p>80,000</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <h6 className="disc_inner_title" style={{ margin: "40px 6px 10px" }}>
        Admin Needs to Pay Online Order Payment to the vendor
      </h6>
      <Row gutter={24} style={{ padding: "6px" }}>
        <Col span={24} md={10}>
          <Card style={{ background: "#414454", color: "#FFFFFF" }}>
            <div className="discount-wrap total-payment">
              <div className="discount-img">
                <img src={DiscountImg} />
              </div>
              <div className="discount-cont">
                <h4>Total Payable Amount</h4>
                <p>80,000</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default ViewDiscountModal;
