import { Row, Col, Card, Button, Image, Skeleton, Avatar } from "antd";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import apiPath from "../../constants/apiPath";
import { Badge } from 'antd';
import { PRICE } from "../../constants/conts";
import moment from "moment";

function View() {

  const sectionName = "Quote";
  const routeName = "quote";

  const params = useParams();
  const { request } = useRequest();
  const [list, setList] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchData = (id) => {
    request({
      url: apiPath.viewQuote + "/" + id,
      method: 'GET',
      onSuccess: (data) => {
        setLoading(false);
        setList(data.data);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR)
      }
    })
  }

  useEffect(() => {
    setLoading(true)
    fetchData(params.id)
  }, [])

  return (
    <>
      <Card title="Customer Detail">
        <Row gutter={16}>
          <Col span={12} xs={24} md={24}>

            {loading ? [1, 2, 3, 4].map(item => <Skeleton active key={item} />) :
              <div className="view-main-list">
                <div className="view-inner-cls">
                  <h5>Customer Name:</h5>
                  <h6><span className="cap">{list && list.user_id && list.user_id.name ? list.user_id.name : '-'}</span></h6>
                </div>
                <div className="view-inner-cls">
                  <h5> Customer Phone Number:</h5>
                  <h6>{list?.user_id ? '+' + list.user_id.country_code + '-' : '+965'}{list?.user_id ? list.user_id.mobile_number : '-'}</h6>
                </div>

                <div className="view-inner-cls">
                  <h5> Customer Location:</h5>
                  <h6>{list?.user_id ? list.user_id.location : '-'}</h6>
                </div>

                {
                  list?.vehicle_id &&
                  <>
                    <div className="view-inner-cls">
                      <h5>Vehicle Image:</h5>
                      <h6>
                        {list && !list.vehicle_id?.image ?
                          <Avatar style={{ backgroundColor: "#00a2ae", verticalAlign: 'middle' }} className="cap" size={50}>
                            {list?.make_id.name?.charAt(0)}
                          </Avatar>
                          :
                          <Image className="image-radius" src={apiPath.assetURL + list.vehicle_id?.image} />
                        }
                      </h6>
                    </div>

                    <div className="view-inner-cls">
                      <h5>Vehicle Make:</h5>
                      <h6>{list?.make_id ? list.make_id.name : '-'}</h6>
                    </div>
                    <div className="view-inner-cls">
                      <h5> Vehicle Model:</h5>
                      <h6>{list?.model_id ? list.model_id.name : '-'}</h6>
                    </div>
                    <div className="view-inner-cls">
                      <h5> Vehicle Number:</h5>
                      <h6>{list?.vehicle_id ? list.vehicle_id.vin_number : '-'}</h6>
                    </div>
                    <div className="view-inner-cls">
                      <h5> Vehicle Registration Year:</h5>
                      <h6>{list?.vehicle_id ? list.vehicle_id.year : '-'}</h6>
                    </div>
                  </>
                }
              </div>
            }
          </Col>
        </Row>
      </Card>
      <Card className="mt-3" title={sectionName + " Details"}>
        <Row gutter={16}>
          <Col span={12} xs={24} md={24}>

            {loading ? [1, 2, 3, 4].map(item => <Skeleton active key={item} />) :
              <div className="view-main-list">

                <div className="view-inner-cls">
                  <h5>Image:</h5>
                  <h6>
                    {list && !list.image ?
                      <Avatar style={{ backgroundColor: "#00a2ae", verticalAlign: 'middle' }} className="cap" size={50}>
                        {list?.name?.charAt(0)}
                      </Avatar>
                      :
                      <Image className="image-radius" src={apiPath.assetURL + list.image} />
                    }
                  </h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Category:</h5>
                  <h6><span className="cap">{list && list.category_id && list.category_id.name ? list.category_id.name : '-'}</span></h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Part Number:</h5>
                  <h6><span className="cap">{list && list.part_number ? list.part_number : '-'}</span></h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Part Type:</h5>
                  <h6><span className="cap">{list && list.part_type ? list.part_type.includes('Both') ? 'New,Used' : list.part_type : '-'}</span></h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Description:</h5>
                  <h6><span className="cap">{list && list.description ? list.description : '-'}</span></h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Amount:</h5>
                  <h6><span className="cap">{list && list.amount ? list.amount + " (" + (PRICE) + ")" : '-'}</span></h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Status:</h5>
                  <h6>{list.status == 'fulfill' ? <Badge status="success" text="Fulfill" /> : list.status == 'received' ? <Badge status="processing" text="Received" /> : <Badge status="warning" text="Request" />}</h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Quote On:</h5>
                  <h6>{list.created_at ? moment(list.created_at).format('DD-MM-YYYY') : '-'}</h6>
                </div>



              </div>
            }
          </Col>
        </Row>
      </Card>


      {list && list?.quote_reply_id ?
        <Card className="mt-3" title="Fulfill By">
          <Row gutter={16}>
            <Col span={12} xs={24} md={24}>
              <div className="view-main-list">
                <div className="view-inner-cls">
                  <h5>{list?.quote_reply_id?.vendor_id?.type ?? ''} Name:</h5>
                  <h6><span className="cap">{list && list?.quote_reply_id?.vendor_id && list?.quote_reply_id?.vendor_id?.name ? list?.quote_reply_id?.vendor_id?.name : '-'}</span></h6>
                </div>
                <div className="view-inner-cls">
                  <h5> {list?.quote_reply_id?.vendor_id?.type ?? ''} Phone Number:</h5>
                  <h6>{list?.quote_reply_id?.vendor_id ? '+' + list?.quote_reply_id?.vendor_id?.country_code + '-' : '+965'}{list?.quote_reply_id?.vendor_id ? list?.quote_reply_id?.vendor_id?.mobile_number : '-'}</h6>
                </div>
                <div className="view-inner-cls">
                  <h5> {list?.quote_reply_id?.vendor_id?.type ?? ''} Location:</h5>
                  <h6>{list?.quote_reply_id?.vendor_id ? list?.quote_reply_id?.vendor_id?.location : '-'}</h6>
                </div>
                <div className="view-inner-cls">
                  <h5> Amount:</h5>
                  <h6>{list?.quote_reply_id ? list?.quote_reply_id?.price : '-'}</h6>
                </div>
              </div>

            </Col>
          </Row>
        </Card> :
        ''
      }

      <div className="view-inner-cls float-right">
        <Link className="ant-btn ant-btn-primary" to={`/${routeName}`}>Back</Link>
      </div>
    </>
  );
}

export default View;
