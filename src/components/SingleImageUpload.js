import { Button, message, Upload as UploadAntd, Image , Spin} from "antd";
import React, { useState, useEffect } from "react";
import { UploadOutlined } from '@ant-design/icons';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
// import { s3Config } from '../config/s3Config';
const s3Config = {
     region: 'us-east-1',
  credentials: {
    accessKeyId: "AKIAIH0BXENCX9UCW1I7V",
    secretAccessKey: "5Yhmu97Th5ij/aU5HevbfkAhjPrsf2jUW2rPRqrV",
  },
  endpoint: "https://s3-noi.aces3.ai/",
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED"
    };

const s3Client = new S3Client(s3Config);
const SingleImageUpload = ({ fileType, imageType, btnName, onChange ,value }) => {
 const [loading, setLoading] = useState(false);
    const [file, setFile] = useState([]);

    const beforeUpload = (file) => {
      console.log(file.type, "file type>>>>>>.")
        if (fileType.includes(file.type)) {

        } else {
            message.error("File format is not correct")
            return false
        }
        const isLt2M = file.size / 1024 / 1024 < 5;

        if (!isLt2M) {
            message.error(`Image must be smaller than 5 MB!`)
            return false
        }
        return true
    }
    
    const handleRemove = (file) => {
        setFile([])
        if (onChange) {
            onChange([]);
        }
        // onDelete(file.url)
    };


    const uploadFileToS3 = async (file, bucketName) => {
      console.log(file,"fileeeeee")
        const key = "sugamya/" + imageType + "/" + `${file?.name ?  `${file?.name}` : `image_${new Date().getTime()}.${file.type.split('/')[1]}`}`
        const params = {
          Bucket: bucketName,
          Key: key,
          Body: file,
          ContentType: file.type
        };
    
        const upload = new Upload({
          client: s3Client,
          params: params,
        });
    
        try {
          const data = await upload.done();
          console.log(data)
          return data;
        } catch (err) {
          throw err;
        }
      };
    
      const handleImgChange = async (event) => {
        const { file } = event;
        setFile([file]);
        setLoading(true)
        try {
          // const compressedFile = await compressImage(file);
          const data = await uploadFileToS3(file, 'sugamaya-bucket');
          // const compressedData = await uploadFileToS3(compressedFile, 'invent-colab-obj-bucket');
          // console.log(compressedData, "compressData>>>>>")
          const fileData = {
            uid: file.uid,
            name: `image_${new Date().getTime()}`,
            status: 'done',
            url: data.Location,
            thumbUrl: data.Location,
          };
          setFile([fileData]);
          if (onChange) {
            onChange([fileData]);
        }
        //   setFile([fileData]);
          console.log(data);
        } catch (err) {
          console.error(err);
        }finally {
        setLoading(false); // Stop loading
      }
      };

      // useEffect(() => {
      //   console.log(value,"value")
      //   if (value) { 
      //     setFile([value]) 
      //     } else{
      //     setFile([])
      //      };
      // }, [value]);

    return (
             <Spin spinning={loading}>
        <UploadAntd
            listType="picture"
            maxCount={1}
            beforeUpload={beforeUpload}
            customRequest={handleImgChange}
            onRemove={handleRemove}
            fileList={file}
        >
            {file && file.length > 0 && file !== "" ? null : <Button icon={<UploadOutlined />}>Upload {btnName}</Button>}
        </UploadAntd>
      </Spin>
    );
};

export default SingleImageUpload;