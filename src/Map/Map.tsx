import { useRef, useEffect, useState } from "react";

import WorldMapGeoJSON from "./data.json";
import TurkeyMapGeoJSON from "./trdata.json";

// @ts-ignore
import * as d3 from "d3";

function Map({ spinHandle, cordinat, setCordinat, marker }: any) {
  const mapContainerRef = useRef();

  useEffect(() => {
    // @ts-ignore
    const width = d3
      // @ts-ignore
      .select(mapContainerRef.current)
      .node()
      // @ts-ignore
      .getBoundingClientRect().width;

    // @ts-ignore
    const height = d3
      // @ts-ignore
      .select(mapContainerRef.current)
      .node()
      // @ts-ignore
      .getBoundingClientRect().height;

    const sensitivity = 75;

    const projection = d3
      .geoOrthographic()
      .scale(width / 2)
      .center([0, 0])
      .rotate(cordinat)
      .translate([width / 2, height / 2]);

    const initialScale = projection.scale();
    const path = d3.geoPath().projection(projection).pointRadius(4);

    const svg = d3
      // @ts-ignore
      .select(mapContainerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const defs = svg.append("defs");

    // https://yqnn.github.io/svg-path-editor/

    defs
      .append("path")
      .attr("id", "mark-true")
      // M 0 0 L -2 -9 C -6 -12 -5 -18 0 -18 L 0 -18 C 6 -18 6 -12 2 -9 L 2 -9 z
      .attr(
        "d",
        "M 0 0 L 0 0 C -5 -16 -10 -25 0 -26 L 0 -26 M 0 -26 C 10 -25 5 -16 0 0 L 0 -15 C 4 -15 4 -21 0 -21 C -4 -21 -4 -15 0 -15 z"
      );

    defs
      .append("path")
      .attr("id", "mark-false")
      // M 0 0 L -2 -9 C -6 -12 -5 -18 0 -18 L 0 -18 C 6 -18 6 -12 2 -9 L 2 -9 z
      .attr(
        "d",
        "M 0 0 L 0 0 C -5 -16 -10 -25 0 -26 L 0 -26 M 0 -26 C 10 -25 5 -16 0 0 L 0 -15 C 4 -15 4 -21 0 -21 C -4 -21 -4 -15 0 -15 z"
      );

    const filter = defs.append("filter").attr("id", "shadow2");
    filter.append("feFlood").attr("flood-color", "#696969");
    filter
      .append("feComposite")
      .attr("operator", "out")
      .attr("in2", "SourceGraphic");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "10")
      .attr("flood-opacity", "1");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "10")
      .attr("flood-opacity", "1");
    filter
      .append("feComposite")
      .attr("operator", "atop")
      .attr("in2", "SourceGraphic");
    filter
      .append("feDropShadow")
      .attr("dx", "0")
      .attr("dy", "0")
      .attr("stdDeviation", "30")
      .attr("flood-color", "rgb(36 5 5)")
      .attr("flood-opacity", "0.7");

    const globe = svg
      .append("circle")
      .attr("fill", "#1d1c1e")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", initialScale)
      .style("filter", "url(#shadow2)");

    svg
      .append("g")
      .attr("class", "countries")
      .selectAll("path")
      .data(WorldMapGeoJSON.features)
      .enter()
      .append("path")
      // @ts-ignore
      .attr(
        "class",
        (d: any) => "country_" + d.properties.name.replace(" ", "_")
      )
      // @ts-ignore
      .attr("d", path)
      .attr("fill", "#292929")
      .style("stroke", "#696969") // 3d3d3d
      .style("stroke-width", 0.3);

    svg
      .append("g")
      .attr("class", "countries")
      .selectAll("path")
      .data(TurkeyMapGeoJSON.features)
      .enter()
      .append("path")
      // @ts-ignore
      .attr(
        "class",
        (d: any) => "country_" + d.properties.name.replace(" ", "_")
      )
      // @ts-ignore
      .attr("d", path)
      .attr("fill", "#292929")
      .style("stroke", "#696969") // 3d3d3d
      .style("stroke-width", 0.3);

    const coord = (d: any) => {
      let str = path(d);
      if (str) {
        // @ts-ignore
        let [sub, x, y] = str.match(/^M([-0-9.]+),([-0-9.]+)/);
        return [+x, +y];
      }
      return [0, 0];
    };

    svg
      .selectAll("use")
      .data(marker.geometries)
      .enter()
      .append("use")
      .attr("href", (d: any) =>
        d.properties.detected ? "#mark-true" : "#mark-false"
      )
      .attr("transform", (d: any) => `translate(${coord(d)})`);

    svg
      .call(
        // @ts-ignore
        d3.drag().on("drag", (e) => {
          const rotate = projection.rotate();
          const k = sensitivity / projection.scale();
          projection.rotate([rotate[0] + e.dx * k, rotate[1] - e.dy * k]);
          const path = d3.geoPath().projection(projection);
          // @ts-ignore
          svg.selectAll("g path").attr("d", path);

          svg
            .selectAll("use")
            .attr("transform", (d: any) => `translate(${coord(d)})`);
        })
      )
      .call(
        // @ts-ignore
        d3.zoom().on("zoom", (e) => {
          if (e.transform.k < 1) {
            e.transform.k = 1;
          } else {
            projection.scale(initialScale * e.transform.k);
            const path = d3.geoPath().projection(projection);
            // @ts-ignore
            svg.selectAll("g path").attr("d", path);

            globe.attr("r", projection.scale());

            svg
              .selectAll("use")
              .attr("transform", (d: any) => `translate(${coord(d)})`);
          }
        })
      );

    // @ts-ignore
    const d3timerF = d3.timer(function (elapsed) {
      const rotate = projection.rotate();
      const k = sensitivity / projection.scale();
      // projection.rotate([rotate[0] - 1 * k, rotate[1]]);
      // projection.rotate([rotate[0] + 1 * k, rotate[1]]);
      projection.rotate([rotate[0] + 0.5 * k, rotate[1]]);

      setCordinat([rotate[0] + 0.5 * k, rotate[1]]);

      const path = d3.geoPath().projection(projection);
      // @ts-ignore
      svg.selectAll("g path").attr("d", path);

      svg
        .selectAll("use")
        .attr("transform", (d: any) => `translate(${coord(d)})`);
    }, 50);

    return () => {
      // @ts-ignore
      d3timerF.stop();
    };
  }, []);

  return (
    <section
      onClick={spinHandle}
      // @ts-ignore
      ref={mapContainerRef}
      id="map"
    ></section>
  );
}

export default Map;
