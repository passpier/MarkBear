use pulldown_cmark::{html, Options, Parser};
use std::path::Path;

use super::ConversionError;

const STYLE: &str = r#"
    body {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
    }
    img { max-width: 100%; }
    pre {
      background: #f5f5f5;
      padding: 0.75rem 1rem;
      overflow-x: auto;
      border-radius: 6px;
    }
    code {
      background: #f5f5f5;
      padding: 0.15em 0.35em;
      border-radius: 4px;
      font-size: 0.9em;
    }
    pre code { background: none; padding: 0; }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #d0d0d0;
      padding: 0.4rem 0.7rem;
      text-align: left;
    }
    blockquote {
      margin: 0;
      padding-left: 1rem;
      border-left: 4px solid #d0d0d0;
      color: #555;
    }
"#;

/// HTML-escape text for safe placement inside a `<title>` element.
fn escape_html(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

/// Convert Markdown to a standalone HTML5 document.
/// The document embeds minimal CSS for readable typography, tables, and code
/// blocks so it renders and prints well on its own (for web sharing/embedding).
/// Image `src` attributes are carried over as-is from the Markdown, so
/// relative sidecar image paths only resolve when the `.html` file is saved
/// alongside the document's assets folder — the same relative-path model
/// used by Markdown itself.
pub fn markdown_to_html(markdown: &str, path: &str) -> Result<(), ConversionError> {
    let options = Options::ENABLE_TABLES
        | Options::ENABLE_STRIKETHROUGH
        | Options::ENABLE_TASKLISTS
        | Options::ENABLE_FOOTNOTES;
    let parser = Parser::new_ext(markdown, options);

    let mut body = String::new();
    html::push_html(&mut body, parser);

    let title = Path::new(path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Document");

    let document = format!(
        r#"<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>{style}</style>
</head>
<body>
{body}
</body>
</html>
"#,
        title = escape_html(title),
        style = STYLE,
        body = body,
    );

    std::fs::write(path, document)
        .map_err(|e| ConversionError(format!("Failed to write HTML file: {}", e)))?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_escape_html_title() {
        assert_eq!(escape_html("A & B <tag>"), "A &amp; B &lt;tag&gt;");
    }

    #[test]
    fn test_markdown_to_html_writes_standalone_document() {
        let dir = std::env::temp_dir().join(format!("pourdown-html-test-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("My Doc.html");

        markdown_to_html("# Hello\n\n**bold** text", path.to_str().unwrap()).unwrap();

        let written = std::fs::read_to_string(&path).unwrap();
        assert!(written.contains("<!doctype html>"));
        assert!(written.contains("<title>My Doc</title>"));
        assert!(written.contains("<h1>Hello</h1>"));
        assert!(written.contains("<strong>bold</strong>"));

        let _ = std::fs::remove_dir_all(&dir);
    }
}
