import { useState, useEffect } from "react";

export const useTemporalUpdate = (update: () => any): any => {
    console.log(useState, useEffect);
    if(typeof update !== "function") return
    
    const [temporal, setTemporal] = useState(update());

    useEffect(() => {
        const id = setInterval(() => setTemporal(update()), 1000);
        return () => {
            clearInterval(id);
        }
    }, []);

    return temporal
}