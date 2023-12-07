import { useState, useEffect } from "react";
import "./App.css";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

type StationInfo = {
  station_id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  capacity: number;
};

type StationStatus = {
  station_id: string;
  is_installed: number;
  is_renting: number;
  num_bikes_available: number;
  num_docks_available: number;
  last_reported: number;
  is_returning: number;
};

type StationCombined = {
  key: React.Key;
  name: string;
  num_bikes_available: number | undefined;
  num_docks_available: number | undefined;
};

function App() {
  const [mergedData, setMergedData] = useState<StationCombined[]>([]);
  const url = "https://gbfs.urbansharing.com";

  useEffect(() => {
    const headers = { "Client-Identifier": "intervju-bym" };

    Promise.all([
      fetch(`${url}/oslobysykkel.no/station_information.json`, { headers }),
      fetch(`${url}/oslobysykkel.no/station_status.json`, { headers }),
    ])
      .then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
      .then(([data1, data2]) => {
        const stationInfo: StationInfo[] = data1.data.stations;
        const stationStatus: StationStatus[] = data2.data.stations;

        const merged: StationCombined[] = stationInfo.map((station) => {
          const status = stationStatus.find(
            (status) => status.station_id === station.station_id
          );

          return {
            name: station?.name || "Ukjent stasjon",
            num_bikes_available: status?.num_bikes_available,
            num_docks_available: status?.num_docks_available,
            key: station?.station_id,
          };
        });

        setMergedData(merged);
      })
      .catch((error) => console.error("Error fetching data: ", error));
  }, []);

  const columns: ColumnsType<StationCombined> = [
    {
      title: "Navn",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Ledige låser",
      dataIndex: "num_docks_available",
      key: "num_docks_available",
    },
    {
      title: "Ledige sykler",
      dataIndex: "num_bikes_available",
      key: "num_bikes_available",
    },
  ];

  return (
    <>
      <h1>Oslo Bysykkel</h1>
      <Table bordered columns={columns} dataSource={mergedData} />
    </>
  );
}

export default App;
