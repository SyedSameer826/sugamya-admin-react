import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = (
    <LoadingOutlined
        style={{
            fontSize: 35,
            color: `#000000`,
            
        }}
        spin
    />
);

const Loader = () => {
    return (
        <div className="spin_loader">
            <Spin indicator={antIcon} />
        </div>
    )
}

export default Loader