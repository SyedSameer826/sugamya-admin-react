import { Row, Col, Upload, Modal, Form, Button, message, Divider } from "antd";
import React, { useState, useEffect, useRef } from "react";
import useRequest from "../hooks/useRequest";
import { ShowToast, Severty } from "../helper/toast";
import * as XLSX from 'xlsx';
import { InboxOutlined } from "@ant-design/icons";
import { DownloadExcel , SampleFileDownload } from "./ExcelFile";
const { Dragger } = Upload;

const ImportForm = ({ path, sectionName, show, hide, existingData, refresh }) => {
    const [form]                        =   Form.useForm();
    const { request }                   =   useRequest();
    const [loading, setLoading]         =   useState(false);
    const [importFile, setImportFile]   =   useState([]);
    const [file, setFile]               =   useState([]);
    const fileType                      =   [".csv","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel"];

    const handleImport = (info) => {
      const { file } = info;
      if (file) {
        
        if (!fileType.includes(file.type)) {
          message.error("File format is not correct")
          return false
        }

        const fileData  = {
          lastModified      : file.lastModified,
          lastModifiedDate  : file.lastModifiedDate,
          name              : file.name,
          uid               : file.uid,
          status            : 'done',
          originFileObj     : file.originFileObj,
          size              : file.size,
          type              : file.type,
          percent           : file.percent,
        }
        
        setFile([fileData]);
        parseExcel(file.originFileObj);
      }
    };

    const parseExcel = (file) => {
      const reader            = new FileReader();
    
      reader.onload = (e) => {
        const data            = new Uint8Array(e.target.result);
        const workbook        = XLSX.read(data, { type: 'array' });
        const firstSheetName  = workbook.SheetNames[0];
        const worksheet       = workbook.Sheets[firstSheetName];
    
        // Parse the worksheet data into an array of objects
        const parsedData = XLSX.utils.sheet_to_json(worksheet);
    
        // Filter data based on some conditions like below
        const filteredData = parsedData.filter((row) => {

          const email         = row.email;
          const country_code  = row.country_code;
          const mobile_number = row.mobile_number;
          const name          = row.name;

          const shouldExclude = () => {
            let exclude = false;

            // Check conditions for name (case-insensitive)
            if (name && ['Brand', 'Category', 'Product'].includes(sectionName)) {
              const isDuplicateName = existingData.some(existingRow => existingRow.name.toLowerCase() === name.toLowerCase());
              exclude = exclude || isDuplicateName;
            }

            // Check conditions for email
            if (email) {
              const isDuplicateEmail = existingData.some((existingRow) => existingRow.email.toLowerCase() === email.toLowerCase());
              exclude = exclude || isDuplicateEmail;
            }

            // Check conditions for country_code and mobile_number together
            if (country_code && mobile_number) {
              const isMatchingCountryMobile = existingData.some((existingRow) => existingRow.country_code === country_code && existingRow.mobile_number === mobile_number);
              exclude = exclude || isMatchingCountryMobile;
            }
        
            return exclude;
          };

          return !shouldExclude();
        });
    
        // Extract the remaining rows and set to setImportFile state
        setImportFile(filteredData);
    
        // Excluded rows and download the excel file with name of duplicate
        const excludedRows = parsedData.filter((row) => !filteredData.includes(row));
        if(excludedRows && excludedRows.length > 0){
          const name  = "Duplicate" + "-" + sectionName;
          // DownloadExcel(excludedRows, name)
        }
      };
    
      reader.readAsArrayBuffer(file);
    };
     

    const onImport = () => {
      setLoading(true);
      const payload         =   {}
      payload.import_file   =   importFile;      
      request({
        url: path,
        method: 'POST',
        data: payload,
        onSuccess: (data) => {
          setLoading(false);
          if (data.status) {
            ShowToast(data.message, Severty.SUCCESS);
            hide();
            refresh();
          } else {
            ShowToast(data.message, Severty.ERROR);
          }
        },
        onError: (error) => {
          console.log(error);
          ShowToast(error.response.data.errors[0].message, Severty.ERROR);
          setLoading(false);
        },
      })
    };

    return (
      <Modal open={show} title="Import Excel" okText="Import" onCancel={hide} okButtonProps={{
          form: 'create',
          htmlType: 'submit',
          loading: loading,
        }}
      >
        <Form id="create" form={form} onFinish={onImport} layout="vertical"> 
          <Row>
             
            <Col span={24}>
              <Form.Item name="import_file">
      
                <div className="text-center">
                  <Button title="Download Sample File" onClick={()=>SampleFileDownload(sectionName)}><i class="fas fa-download"></i>&nbsp;&nbsp;Download Sample File</Button>
                </div>

                <Divider orientation="center" orientationMargin={0} className="devider-color">OR</Divider>

                <Dragger fileList={file} onRemove={(e) => setFile([])} maxCount={1} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  onChange={handleImport} customRequest={(e) => null} >
                  <p className="ant-upload-drag-icon"> <InboxOutlined /> </p>
                  <p className="ant-upload-text">Click or Drag File to This Area to Upload</p>
                  <p className="ant-upload-hint">Please Select an Excel File.</p>
                </Dragger>
                
              </Form.Item>
            </Col>
  
          </Row>
        </Form>
      </Modal>
    )
};

export default ImportForm;