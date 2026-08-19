import { Fragment, ReactNode } from "react";
import { Link } from "react-router-dom";

const LINK_RE = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

/**
 * Rend un texte contenant des liens au format markdown simplifié `[ancre](/chemin)`
 * sous forme de liens internes React Router (maillage interne contextuel).
 */
export const renderInlineLinks = (text: string): ReactNode => {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(LINK_RE.source, "g");

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    nodes.push(
      <Link
        key={`l-${match.index}`}
        to={match[2]}
        className="text-primary underline underline-offset-4 hover:text-secondary transition-colors"
      >
        {match[1]}
      </Link>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`t-${lastIndex}`}>{text.slice(lastIndex)}</Fragment>);
  }

  return nodes;
};

/** Version texte pur (sans balisage de lien), utilisée pour les données structurées JSON-LD. */
export const stripInlineLinks = (text: string): string =>
  text.replace(new RegExp(LINK_RE.source, "g"), "$1");

interface InlineLinkTextProps {
  text: string;
  className?: string;
}

const InlineLinkText = ({ text, className }: InlineLinkTextProps) => (
  <span className={className}>{renderInlineLinks(text)}</span>
);

export default InlineLinkText;
