import ReactDOMServer from "react-dom/server";
import GridOnIcon from "@mui/icons-material/GridOn";
import SvgIcon from "@mui/material/SvgIcon";

export function svgToDataURL(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function iconToDataURL({ component }) {
  const iconString = ReactDOMServer.renderToString(component);
  const url = svgToDataURL(iconString);
  return url;
}

//import LocationOnIcon from "@mui/icons-material/LocationOn";
export const locationIconUrl = iconToDataURL({
  component: (
    <SvgIcon
      width="720"
      height="240"
      viewBox="0 0 72 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(3, 3) scale(0.75) ">
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"
          stroke="white"
          strokeWidth={5}
        ></path>
        <path
          fill="steelblue"
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        ></path>
      </g>

      <g transform="translate(27, 3)  scale(0.75) ">
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"
          stroke="white"
          strokeWidth={5}
        ></path>
        <path
          fill="orange"
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        ></path>
      </g>
      <g transform="translate(51, 3)  scale(0.75) ">
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"
          stroke="white"
          strokeWidth={5}
        ></path>
        <path
          fill="yellow"
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        ></path>
      </g>
    </SvgIcon>
  ),
});

export const inletIconUrl = iconToDataURL({
  component: (
    <SvgIcon
      width="240"
      height="240"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <GridOnIcon />
    </SvgIcon>
  ),
});
