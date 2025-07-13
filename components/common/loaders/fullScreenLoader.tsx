import { BounceLoader, GridLoader } from "react-spinners";
import BounceLoaderWrapper from "./bounceLoader";
import GridLoaderWrapper from "./gridLoader";
import PuffLoaderWrapper from "./puffLoader";
import BeatLoaderWrapper from "./beatLoader";

type Loader = "BounceLoader" | "GridLoader" | "PuffLoader" | "BeatLoader";

export type LoaderProps = {
  height?: number;
  width?: number;
  message?: any;
  color?: string;
  loader?: Loader;
  backGround?: "dark" | "light";
};

const renderLoader = ({ loader, height, width, color }: LoaderProps) => {
  switch (loader) {
    case "BeatLoader":
    case undefined:
    case null:
      return <BeatLoaderWrapper height={height} width={width} color={color} />;
    case "BounceLoader":
      return (
        <BounceLoaderWrapper height={height} width={width} color={color} />
      );
    case "GridLoader":
      return <GridLoaderWrapper height={height} width={width} color={color} />;
    case "PuffLoader":
      return <PuffLoaderWrapper height={height} width={width} color={color} />;
    default:
      return <BeatLoaderWrapper height={height} width={width} color={color} />;
  }
};

export default function FullScreenLoader({
  message,
  height,
  width,
  loader,
  color,
  backGround,
}: Readonly<LoaderProps>) {
  return (
    <div
      className={`fixed flex items-center justify-center bottom-0 left-0 right-0 top-0 z-50 overflow-auto ${
        !backGround || backGround === "dark" ? "bg-[#000000ab]" : "#fff"
      }`}
    >
      <div className="p-5 text-center">
        <h6 className="mb-1 text-xl font-medium text-white opacity-80">
          {message}
        </h6>
        {renderLoader({ loader, height, width, color })}
      </div>
    </div>
  );
}
