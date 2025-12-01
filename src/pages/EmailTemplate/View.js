import { Row, Col, Card, Button, Skeleton } from "antd";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import apiPath from "../../constants/apiPath";
import { Badge } from "antd";
import moment from "moment";

function View() {
  const sectionName = "Email Template";
  const routeName = "email-template";
  const params = useParams();
  const { request } = useRequest();
  const [list, setList] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchData = (id) => {
    request({
      url: apiPath.viewEmailTemplate + "/" + id,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setList(data.data);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const rawHTML = `
    <html lang="en">
        <body style="font-family: 'Lato', 'Merriweather', 'Roboto', sans-serif;">
            <div className="mainEmailWraper" style="max-width: 680px; margin: 0 auto;">
                <div className="emailHeader" style="display: flex;align-items: center;justify-content: center;padding: 16px;background: repeating-linear-gradient(90deg, #D11E8F 0px, #D11E8F 10px, #C41287 10px, #C41287 12px);border-radius: 8px 8px 0 0;">
                  <div className="logoOuter" style="display: flex; align-items: center; justify-content: center;">
                    <img src="/Hz_White.png" alt="Sugamya Logo" width="40%" />
                  </div>
                </div>
        
                <div className="emailTempBody" style="">
                    <div style="padding: 16px; background-color: #fff; gap: 16px;">
                      ${list.description}
                    </div>
                </div>
                
                <div style="font-size: 14px; background: repeating-linear-gradient(90deg, #D11E8F 0px, #D11E8F 10px, #C41287 10px, #C41287 12px);border-radius: 8px 8px 0 0; background-color: #D11E8F;  color: #000; text-align:center;">
                  <div style="font-size: 16px; padding-top:40px; font-weight: 400; font-style: italic; color: #ffffffff;">Let's Connect!</div> 
                  <hr style="border: 2px solid white; width:60% ; margin: 10px auto;" />

                  <div style="font-size: 14px; font-weight: 600; color: #ffffffff;">
                    <a href="tel:+91 976 976 4414" style="text-decoration: none; color: #ffffffff; font-size: 16px;">+91 976 976 4414</a> |
                    <a href="mailto:support@wellness.online" style="text-decoration: none; color: #ffffffff; font-size: 16px;">  support@sugamya-ayurveda.com</a>
                    </div>
                  <div style="background-color: #F39237; margin:0; padding:12px; display: flex; justify-content: center; align-items: center; margin-top: 30px;">
                    <div style="width:2px; height: 50px; background-color: white; margin-right: 15px;"></div>

                  <ul style="list-style: none; padding: 0; margin: 0; display: flex; align-items: center; gap: 16px; justify-content: center;">
                    <li style="">
                      <a href="https://www.facebook.com/sugamya.ayurveda" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50px; background: white;">
                        <svg width="22" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="gradientFacebook" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style="stop-color: #FF9A56; stop-opacity: 1;" />
                              <stop offset="100%" style="stop-color: #FF1493; stop-opacity: 1;" />
                            </linearGradient>
                          </defs>
                          <path d="M12.8327 12.3757H15.1243L16.041 8.70898H12.8327V6.87565C12.8327 5.93148 12.8327 5.04232 14.666 5.04232H16.041V1.96232C15.7422 1.9229 14.6138 1.83398 13.4221 1.83398C10.9333 1.83398 9.16602 3.3529 9.16602 6.14232V8.70898H6.41602V12.3757H9.16602V20.1673H12.8327V12.3757Z" fill="url(#gradientFacebook)"/>
                        </svg>
                      </a>
                    </li>

                    <li style="">
                      <a href="https://www.instagram.com/sugamyaayurveda/#" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50px; background: white;">
                        <svg width="22" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="gradientInstagram" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style="stop-color: #FF9A56; stop-opacity: 1;" />
                              <stop offset="100%" style="stop-color: #FF1493; stop-opacity: 1;" />
                            </linearGradient>
                          </defs>
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" fill="url(#gradientInstagram)" stroke="none"/>
                        </svg>
                      </a>
                    </li>
                    
                  
                    <li style="">
                    <a href="https://www.linkedin.com/authwall?trk=bf&trkInfo=AQFMP6xS22c2LgAAAZnxsskQP7XajnChkHkueYCulD4VP06_n7v7zlZbP5utUAYybyulEERWarz-FobZ2VnjWZgu8sV7btivubldL_59wVnAWBZW-m1qR0ltOP5q1heJ4WhXtPE=&original_referer=&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fsugamya-ayurveda" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50px; background: white;">
                      <svg width="22" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="gradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color: #FF9A56; stop-opacity: 1;" />
                            <stop offset="100%" style="stop-color: #FF1493; stop-opacity: 1;" />
                          </linearGradient>
                        </defs>
                        <path d="M6.36198 4.58425C6.36174 5.07048 6.16835 5.5367 5.82436 5.88034C5.48037 6.22399 5.01396 6.41691 4.52773 6.41667C4.0415 6.41642 3.57528 6.22304 3.23164 5.87905C2.88799 5.53506 2.69507 5.06865 2.69531 4.58242C2.69556 4.09619 2.88894 3.62997 3.23293 3.28632C3.57692 2.94268 4.04333 2.74976 4.52956 2.75C5.01579 2.75024 5.48201 2.94363 5.82566 3.28762C6.1693 3.63161 6.36222 4.09802 6.36198 4.58425ZM6.41698 7.77425H2.75031V19.2509H6.41698V7.77425ZM12.2103 7.77425H8.56198V19.2509H12.1736V13.2284C12.1736 9.87342 16.5461 9.56175 16.5461 13.2284V19.2509H20.167V11.9817C20.167 6.32592 13.6953 6.53675 12.1736 9.31425L12.2103 7.77425Z" fill="url(#gradientIcon)"/>
                      </svg>
                    </a>
                    </li>
                   <li style="">
                    <a href="https://x.com/SugamyaAyurveda" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50px; background: white;">
                      <svg width="22" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="gradientX" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color: #FF9A56; stop-opacity: 1;" />
                            <stop offset="100%" style="stop-color: #FF1493; stop-opacity: 1;" />
                          </linearGradient>
                        </defs>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.07-6.614L2.896 21.75H.588l7.753-8.835L.581 2.25h6.467l4.588 6.055L18.244 2.25zM17.745 19.5h1.83L6.031 3.75H4.11l13.635 15.75z" fill="url(#gradientX)"/>
                      </svg>
                    </a>
                  </li>


                  <li style="">
                    <a href="https://www.youtube.com/@SugamyaAyurveda" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50px; background: white;">
                      <svg width="22" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="gradientYouTube" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color: #FF9A56; stop-opacity: 1;" />
                            <stop offset="100%" style="stop-color: #FF1493; stop-opacity: 1;" />
                          </linearGradient>
                        </defs>
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="url(#gradientYouTube)" stroke="url(#gradientYouTube)" stroke-width="0.5"/>
                      </svg>
                    </a>
                  </li>
                                      
                  </ul>
                    <div style=" width: 2px; height: 50px; background-color: white; margin-left:15px"></div>

                </div>
                <div className="emailFooter" style="padding: 16px; background: repeating-linear-gradient(90deg, #D11E8F 0px, #D11E8F 10px, #C41287 10px, #C41287 12px);border-radius: 8px 8px 0 0; background-color: #D11E8F; border-radius: 0 0 8px 8px; text-align: center;">
                    <div className="title" style="font-size: 14px;  color: #fff; font-weight: 600;">Copyright © 2025 Sugamya Ayurveda™. All rights reserved.</div>
                </div>
            </div>
        </body>
    </html>`;

  useEffect(() => {
    setLoading(true);
    fetchData(params.id);
  }, []);

  return (
    <>
      <Card title={sectionName + " Details"}>
        <Row gutter={16}>
          <Col span={12} xs={24} md={24}>
            {loading ? (
              [1, 2, 3].map((item) => <Skeleton active key={item} />)
            ) : (
              <div className="view-main-list">
                <div className="view-inner-cls">
                  <h5>Title:</h5>
                  <h6>{list.title}</h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Subject:</h5>
                  <h6>{list.subject}</h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Status:</h5>
                  <h6>
                    {list.is_active ? (
                      <Badge colorSuccess status="success" text="Active" />
                    ) : (
                      <Badge status="error" text="InActive" />
                    )}
                  </h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Created On:</h5>
                  <h6>
                    {list.created_at
                      ? moment(list.created_at).format("DD-MM-YYYY")
                      : "-"}
                  </h6>
                </div>

                <div className="view-inner-cls float-right">
                  <Link
                    className="ant-btn ant-btn-primary"
                    to={`/${routeName}/`}
                  >
                    Back
                  </Link>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {list && list.description ? (
        <Card title="Email Preview" className="mt-3">
          <Row gutter={16}>
            <Col span={12} xs={24} md={24}>
              {loading ? (
                <Skeleton active />
              ) : (
                <div className="view-main-list">
                  <h6>
                    {<p dangerouslySetInnerHTML={{ __html: rawHTML }}></p>}
                  </h6>
                </div>
              )}
            </Col>
          </Row>
        </Card>
      ) : null}
    </>
  );
}

export default View;
