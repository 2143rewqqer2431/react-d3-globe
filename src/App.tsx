import "./styles.css";

import Map from "./Map";

export default function App() {
  return (
    <section>
      <Map
        marker={{
          geometries: [
            {
              coordinates: [289757, 41.0197],
              properties: { adi: "aaa" },
              type: "Point"
            }
          ],
          type: "GeometryCollection"
        }}
      />
    </section>
  );
}
