import { Progress } from "antd"
import { useEffect, useState } from "react"

const ProgressBar = ({ count, name, total }) => {

    const [percentage, setPercentage] = useState(0)

    useEffect(() => {
        console.log(count, total);
        const per = parseFloat(((count / total) * 100).toFixed(2))
        setPercentage(per)
    }, [count])

    return (
        <div className="home_progress" >
            <span className="progreess-left">
                <h4>{count} </h4><h5>{name}</h5>
            </span>
            <Progress percent={percentage ?? 0} />
            <span className="progress-right">
                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L10 8L15 13" stroke="#28C76F" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
                </svg>{percentage ?? 0} %
            </span>
        </div>
    )
}

export default ProgressBar