import clsx from "clsx";

interface Props
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  className?: string;
}

export const TokenboundLogo = ({ className, ...props }: Props) => {
  return (
    <div
      className={clsx(
        className,
        "hover:cursor-pointer p-2 rounded-full bg-tb-transparent shadow-tb-shadow border-2 border-transparent bg-white"
      )}
      {...props}
    >
      <svg
        width="14"
        height="15"
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#000000"
          stroke="#000000" 
          strokeWidth="25" 
          d="M10,128c0,13.7,11.1,24.9,24.9,24.9c13.7,0,24.9-11.1,24.9-24.9c0-13.7-11.1-24.9-24.9-24.9C21.1,103.1,10,114.3,10,128L10,128z"
        />
        <path
          fill="#000000"
          stroke="#000000" 
          strokeWidth="25"
          d="M103.1,128c0,13.7,11.1,24.9,24.9,24.9c13.7,0,24.9-11.1,24.9-24.9c0-13.7-11.1-24.9-24.9-24.9C114.3,103.1,103.1,114.3,103.1,128L103.1,128z"
        />
        <path
          fill="#000000"
          stroke="#000000" 
          strokeWidth="25"
          d="M196.3,128c0,13.7,11.1,24.9,24.9,24.9c13.7,0,24.9-11.1,24.9-24.9c0-13.7-11.1-24.9-24.9-24.9S196.3,114.3,196.3,128L196.3,128z"
        />
      </svg>
    </div>
  );
};