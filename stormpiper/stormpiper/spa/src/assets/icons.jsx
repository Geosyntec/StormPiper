import ReactDOMServer from "react-dom/server";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export function svgToDataURL(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function iconToDataURL({ component }) {
  const iconString = ReactDOMServer.renderToString(component);
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(iconString, "image/svg+xml");
  const iconSVG = svgDoc.querySelector("svg").innerHTML;

  const template = `
  <svg width="240" height="240" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    ${iconSVG}
  </svg>
`;

  console.log(template);

  return svgToDataURL(template);
}

export const locationIconUrl = iconToDataURL({
  component: <LocationOnIcon />,
});
