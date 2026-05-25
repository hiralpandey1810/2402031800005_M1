import { useState} from "react";
import
function Counter(){
    const [count, setCount] = useState(0)
    const increase = () => {
        setCount(count +1)
    }
    return(
        <header> 
            <div> 
                <nav>
                    <a> Home</a>
                </nav>
            </div>
        <div>
            <h2> Count : {count}</h2>
            <button onClick={increase}>Increase</button>
        </div>
    )
}
export default Counter