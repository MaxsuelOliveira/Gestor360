import DOMPurify from "dompurify";
const SafeHTMLRenderer = ({ html }: { html: string }) => {
  const cleanHTML = DOMPurify.sanitize(html);

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
};

export default SafeHTMLRenderer;
