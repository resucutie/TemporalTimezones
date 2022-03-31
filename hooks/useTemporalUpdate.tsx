import * as webpack from "ittai/webpack";
const { 
    React: { useState, useEffect }
} = webpack

export const useTemporalUpdate = (update: () => any): any => {
    const [temporal, setTemporal] = useState(update());

    useEffect(() => {
        const id = setInterval(() => setTemporal(update()), 1000);
        return () => {
            clearInterval(id);
        }
    }, []);

    return temporal
}