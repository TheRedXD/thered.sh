import express from "express";
import { marked } from "marked";
import hljs from "highlight.js";
import path from "path";
let __dirname = path.resolve();

marked.use({
    extensions: [{
        name: 'highlight',
        renderer: {
            code(token) {
                const lang = token.lang;
                if (lang) {
                    try {
                        const highlighted = hljs.highlight(token.text, { language: lang }).value;
                        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
                    } catch (err) {
                        console.error(err);
                    }
                }
                return `<pre><code>${token.text}</code></pre>`;
            }
        }
    }]
});

const parseMarkdown = (markdown) => {
    try {
        return marked.parse(markdown);
    } catch (err) {
        console.error(err);
        return markdown;
    }
};

const app = express();

app.use(express.static(path.join(__dirname, "./dist")));

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "./dist/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
