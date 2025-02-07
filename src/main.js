import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import Projection from "ol/proj/Projection";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import WMTS from "ol/source/WMTS";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { optionsFromCapabilities } from "ol/source/WMTS";
import WMTSCapabilities from "ol/format/WMTSCapabilities";

import "./style.css";
const parser = new WMTSCapabilities();
proj4.defs(
  "EPSG:2056",
  "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1" +
    " +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs"
);
register(proj4);

const projection = new Projection({
  code: "EPSG:2056",
});

fetch("https://sitn.ne.ch/services/wmts?SERVICE=WMTS&REQUEST=GetCapabilities")
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    const result = parser.read(text);
    const options = optionsFromCapabilities(result, {
      layer: "plan_ville",
      matrixSet: "EPSG2056",
    });
    let wmtsSource = new WMTS(options);
    const extent = wmtsSource.getTileGrid().getExtent();
    const resolutions = wmtsSource.getResolutions();
    const matrixIds = [];
    for (let i = 0; i < resolutions.length; i += 1) {
      matrixIds.push(i);
    }
    const tileGrid = new WMTSTileGrid({
        origin: [extent[0], extent[3]],
        resolutions,
        matrixIds,
      });
    wmtsSource.tileGrid = tileGrid;
    wmtsSource.projection = projection;

    new Map({
      layers: [
        new TileLayer({
          opacity: 1,
          source: wmtsSource,
        }),
      ],
      target: "map",
      view: new View({
        center: [2549925, 1194224],
        projection,
        resolution: 1,
        resolutions: resolutions,
        constrainResolution: true,
      }),
    });
  });
