<script setup>
function notif(text) {
    const notifElement = document.createElement('div');
    notifElement.textContent = text;
    document.querySelector('.notification-drawer').appendChild(notifElement);
    setTimeout(() => {
        notifElement.style.opacity = '0';
        notifElement.style.transform = 'translateX(100%)';
        setTimeout(() => notifElement.remove(), 300);
    }, 5000);
}
function copy() {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    notif("Link copied to clipboard!");
}
</script>

<template>
    <div class="handybar">
        <div class="handybar-content">
            <RouterLink to="/articles">
                <div class="handybar-item">
                    <button class="handybar-button"><i class="fa-solid fa-arrow-left"></i> Go back</button>
                </div>
            </RouterLink>
            <div class="handybar-item">
                <button class="handybar-button" @click="copy()"><i class="fa-solid fa-clipboard"></i> Copy URL</button>
            </div>
        </div>
    </div>
    <div class="notification-drawer"></div>
    <div class="article-container">
        <div class="article-content" v-html="parsedMarkdown"></div>
    </div>
</template>

<script>
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import xss from "xss";

marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
}));

export default {
    data() {
        return {
            markdownContent: "",
            parsedMarkdown: "",
        };
    },
    async created() {
        const articleName = this.$route.params.article;
        try {
            const response = await fetch(`/articlefiles/${articleName}.md`);
            this.markdownContent = await response.text();

            let markedContent = marked(this.markdownContent);
            markedContent = xss(markedContent, {
                whiteList: {
                    a: ['href', 'title', 'target', 'class'],
                    img: ['src', 'alt', 'title'],
                    h1: [],
                    h2: [],
                    h3: [],
                    h4: [],
                    h5: [],
                    h6: [],
                    pre: [],
                    code: ["class"],
                    blockquote: [],
                    ul: [],
                    ol: [],
                    li: [],
                    hr: [],
                    br: [],
                    div: [],
                    table: [],
                    thead: [],
                    tbody: [],
                    tfoot: [],
                    tr: [],
                    th: [],
                    td: [],
                    em: [],
                    strong: [],
                    b: [],
                    i: [],
                    p: ["class"],
                    sup: [],
                    sub: [],
                    del: [],
                    mark: [],
                    q: [],
                    abbr: [],
                    dfn: [],
                    small: [],
                    s: [],
                    span: ["class"],
                    summary: [],
                    details: [],
                    time: [],
                    cite: [],
                    ins: [],
                    kbd: [],
                    samp: [],
                    var: [],
                    ul: [],
                    ol: [],
                    li: [],
                    dl: [],
                    dt: [],
                    dd: []
                }
            });
            this.parsedMarkdown = markedContent;
        } catch (error) {
            console.error("Error loading article:", error);
        }
    },
};
</script>

<style scoped lang="scss">
.notification-drawer {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 300px;
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 9999;
    display: flex;
    flex-direction: column-reverse;
    gap: 10px;
    padding: 10px;
    pointer-events: none;

    & > * {
        pointer-events: all;
        background: rgba(30, 30, 50, 0.8);
        border: 1px solid rgba(140, 140, 255, 0.2);
        backdrop-filter: blur(10px);
        padding: 15px;
        border-radius: 8px;
        color: #fff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: notification-slide 0.3s ease-out;
        transition: all 0.3s ease;

        &:hover {
            transform: translateX(-5px);
            border-color: rgba(140, 140, 255, 0.4);
        }
    }
}

@keyframes notification-slide {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

a {
    text-decoration: none;
}

.handybar {
    position: sticky;
    top: 0;
    padding: 10px 15px;
    z-index: 100;
    border-bottom: 1px solid #ffffff10;
    font-family: "Iosevka Regular";
    backdrop-filter: blur(10px);
    i {
        margin-right: 10px;
    }
}

.handybar-content {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: fit-content;
    margin: 0 auto;
    margin-left: 0;
}

.handybar-item {
    display: flex;
    align-items: flex-start;
    margin-left: 0;
    width: fit-content;
}

.handybar-button {
    background-color: #ffffff20;
    border: 1px solid #ffffff40;
    color: #ddddff;
    padding: 8px 24px;
    border-radius: 16px;
    cursor: pointer;
    font-family: 'Iosevka Aile Regular', sans-serif;
    transition: all 0.2s ease;
}

.handybar-button:hover {
    background-color: #ffffff60;
    border-color: #ffffffa0;
    color: #ffffff;
}

.article-container {
    padding: 40px;
    margin: 10px auto;
    height: calc(100% - 15px);
    max-width: 1000px;
    width: calc(100% - 15px);
    background: #ffffff08;
    border: 1px solid #ffffff10;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-radius: 8px;
}

.article-content {
    font-family: 'Iosevka Aile Regular', serif;
    line-height: 1.8;
    font-size: 1.1rem;
    /* color: #ddddffd0; */
}

/* .article-content p {
    margin-bottom: 1.2em;
} */

.article-content a {
    color: #1976d2;
    text-decoration: none;
}

.article-content a:hover {
    text-decoration: underline;
}
</style>
<style>
code.hljs.language-author {
    margin-top: 20px;
    background: #262b3f!important;
    padding: 2px 8px;

    &:before {
        content: '\f007';
        font-family: var(--fa-style-family-classic)!important;
        margin-right: 8px;
    }
}

ul {
    margin-left: 20px;
}

.article-content img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 1em 0;
}
h1, h2, h3 {
    & {
        color: #ddddff;
    }
    font-family: 'Iosevka Aile Thin';
}
.article-content blockquote {
    border-left: 4px solid #2986e2;
    margin: 1.5em 0;
    padding-left: 1em;
    padding-right: 1em;
    color: #ddddff;
    background: #2986e220;
    width: fit-content;
    font-style: italic;
}

.article-content code {
    display: block;
    background: #00001060!important;
    border: 1px solid #ffffff20;
    padding: 0.2em 0.4em;
    border-radius: 8px;
    font-family: 'Iosevka Extended', monospace;
    font-size: 0.9em;
    width: fit-content;
    margin-left: 0;
    max-width: 100%;
    text-wrap: wrap;
    word-wrap: break-word;
}
</style>
