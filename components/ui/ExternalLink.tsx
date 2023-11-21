import clsx from "clsx";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";

interface Props
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {
  link?: string;
  className?: string;
}

export function ExternalLink({ link, className, ...rest }: Props) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={link}
      className={clsx("cursor-pointer", className)}
      style={{marginTop: "-19px"}}
      {...rest}
    >
      <ExternalLinkIcon height={"33px"} width={"33px"} color="#A1A1AA"/>
    </a>
  );
}
