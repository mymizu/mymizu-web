import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { ListModal } from "./Components/ListModal";
import { ListCard } from "./Components/ListCard";
import { ListGrid } from "./Components/Grid";

function ListSearchComponent() {
  const [data, setData] = useState();

  //async function to dataSet
  const getData = async () => {
    await axios.get(`./data/data.json`).then((response) => {
      setData(response.data);
    });
  };

  //run get Data
  useEffect(() => {
    getData();
  }, []);

  return <div className="App">
<ListModal>
  <ListGrid>
  {data && <ListCard data={data}/>}
  </ListGrid>
</ListModal>

  </div>;
}

export default ListSearchComponent;
