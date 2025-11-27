import { useCallback, useEffect } from "react";
import type { EventState } from "./types";

const InputManager = ({setSwung, canSwing} : {setSwung:(state:EventState) => void, canSwing:boolean}) => {
    
  const swingCallback = useCallback((event: KeyboardEvent) => {
    console.log(canSwing)
    if (canSwing && (event.key === " " || event.key === "Enter")) {
      setSwung('Swung');
    }
  }, [canSwing]);

  useEffect(() => {
    document.addEventListener("keydown", swingCallback, false);

    return () => {
      document.removeEventListener("keydown", swingCallback, false);
    };
  }, [swingCallback]);

  return (   
    <input />
  )
};

export default InputManager;