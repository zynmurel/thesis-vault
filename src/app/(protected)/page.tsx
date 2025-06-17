// "use client";
// // import { redirect } from "next/navigation";
// import React from "react";
// import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import type { LatLngTuple } from "leaflet";


// function Page() {
//  const shapeCoords: LatLngTuple[] = [
//    [14.5995, 120.9842],
//    [14.6, 121],
//    [14.58, 121],
//    [14.58, 120.98],
//  ];
//  const shapeCoords2: LatLngTuple[] = [
//    [14.605, 121.0],
//    [14.61, 121.02],
//    [14.595, 121.025],
//    [14.59, 121.005],
//  ];
//  // redirect("/dashboard");
//  return (
//    <div>
//      <MapContainer
//        center={[14.5995, 120.9842]}
//        zoom={14}
//        style={{ height: "500px", width: "100%" }}
//      >
//        <TileLayer
//          attribution="&copy; OpenStreetMap contributors"
//          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//        />
//        <Polygon positions={shapeCoords}  pathOptions={{
//    color: 'red',      // line color
//    weight: 3,         // line thickness
//    fillColor: 'yellow', // fill color inside the polygon
//    fillOpacity: 0.5   // fill transparency
//  }}>
//          <Popup>
//            <div>
//              <strong>Shape Info</strong>
//              <p>This is a custom area.</p>
//            </div>
//          </Popup>
//        </Polygon>{" "}
//        <Polygon positions={shapeCoords2}>
//          <Popup>
//            <div>
//              <strong>Shape Info</strong>
//              <p>This is a custom area.</p>
//            </div>
//          </Popup>
//        </Polygon>
//      </MapContainer>
//    </div>
//  );
// }


// export default Page;

import { redirect } from "next/navigation";
import React from "react";

function Page() {
  redirect("/dashboard");
  return <div>Page</div>;
}

export default Page;
