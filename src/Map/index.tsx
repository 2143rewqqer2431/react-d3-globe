import { useState } from "react";

import Map from "./Map";
import MapNoSpin from "./MapNoSpin";

function MapContainer({ marker }: any) {
  const [spin, setSpin] = useState(true);
  const [cordinat, setCordinat] = useState([0, -30]);

  return (
    <section>
      {spin ? (
        <Map
          marker={marker}
          spinHandle={() => setSpin(!spin)}
          cordinat={cordinat}
          setCordinat={setCordinat}
        />
      ) : (
        <MapNoSpin
          marker={marker}
          spinHandle={() => setSpin(!spin)}
          cordinat={cordinat}
          setCordinat={setCordinat}
        />
      )}
    </section>
  );
}

export default MapContainer;
