import { message,Upload as UploadAntd } from "antd";
import React, { useState, useEffect } from "react";
import { PlusOutlined } from '@ant-design/icons';
import { uploadFile } from 'react-s3';
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


const MultipleImageUpload = ({ data, fileType, imageType, btnName, onDelete, onChange ,value}) => {

    const [fileList, setFileList] = useState([]);

    const beforeUpload = (file) => {
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


    useEffect(() => {
      if (!data) return;
      const multipleFileList = data.map((url, index) => ({
          uid: `${index + 1}`,
          name: url,
          status: 'done',
          url: url,
      }));
      setFileList(multipleFileList)
  }, [data])


    const handleImgChangeOLD = async (event) => {
        const { file } = event;
        uploadFile(file, s3Config(imageType)).then(data => {
            const fileData = {
                uid: file.uid,
                name: `image_${new Date().getTime()}`,
                status: 'done',
                url: data.location,
                thumbUrl: data.location,
            }
            setFileList([...fileList, fileData]);
            if (onChange) {
                onChange([...fileList, fileData]);
            }
        }).catch(err => console.error(err));
    };

    // const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

    const uploadButton = (
        <div> <PlusOutlined /> <div style={{ marginTop: 8 }}>Upload {btnName}</div> </div>
    );

    const handleRemove = (file) => {
        console.log(fileList, file);
        const newFile = fileList.filter(item => item.uid != file.uid)
        setFileList(newFile)
        if (onChange) {
            onChange([...newFile]);
        }
        // onDelete(file.url)
    };



    const uploadFileToS3 = async (file, bucketName) => {
      console.log(file, "file>>>>>>>.")
        // const key = "sugamya/" + imageType + "/" +`image_${new Date().getTime()}.${file.type.split('/')[1]}`
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
        setFileList([file]);
        try {
          const data = await uploadFileToS3(file, 'sugamaya-bucket');
          const fileData = {
            uid: file.uid,
            name:`image_${new Date().getTime()}`,
            status: 'done',
            url: data.Location,
            thumbUrl: data.Location,
          };
          setFileList([...fileList, fileData]);
          if (onChange) {
            onChange([...fileList, fileData]);
        }
        //   setFile([fileData]);
          console.log(data);
        } catch (err) {
          console.error(err);
        }
      };
    return (

        <UploadAntd
            listType="picture-card"
            onRemove={handleRemove}
            maxCount={8}
            beforeUpload={beforeUpload}
            fileList={fileList}
            //onChange={handleChange}
            customRequest={handleImgChange}
        >
            {fileList.length >= 8 ? null : uploadButton}
        </UploadAntd>
    );
};

export default MultipleImageUpload;