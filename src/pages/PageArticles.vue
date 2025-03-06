<script setup>
function copy() {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
}
</script>

<template>
    <div class="handybar">
        <div class="handybar-content">
            <RouterLink to="/">
                <div class="handybar-item">
                    <button class="handybar-button"><i class="fa-solid fa-arrow-left"></i> Go back</button>
                </div>
            </RouterLink>
            <div class="handybar-item">
                <button class="handybar-button" @click="copy()"><i class="fa-solid fa-clipboard"></i> Copy URL</button>
            </div>
        </div>
    </div>
    <div class="articles-container">
        <h1>List of articles</h1>
        <br>
        <div v-if="loading" class="loading-spinner"></div>
        <ul v-else class="articles-list">
        <li v-for="article in articles" :key="article.id" class="article-item" @click="$router.push(`/article/${article.file}`)">
            <div class="article-header">
                <h2 class="article-title">{{ article.title }}</h2>
                <span class="article-author">By {{ article.author }}</span>
                <span class="article-date">{{ article.date }}</span>
            </div>
        </li>
        </ul>
    </div>
</template>

<script>
export default {
    data() {
        return {
            articles: [],
            loading: true
        };
    },
    async created() {
        try {
            const response = await fetch("/articles.json");
            this.articles = await response.json();
        } finally {
            this.loading = false;
        }
    },
};
</script>

<style scoped>
a {
    text-decoration: none;
}

.handybar {
    position: relative;
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

.articles-container {
    margin: 0 auto;
    padding: 20px;
}

.articles-list {
    list-style-type: none;
    padding: 0px 10px;
    overflow-y: auto;
    max-height: 80vh;
}

.article-item {
    padding: 20px;
    margin-bottom: 5px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    background-color: #1d203060;
    border: 1px solid #334;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}

.article-item:hover {
    transform: scale(1.01);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    background-color: #2d304070;
    border-color: #445;
}

.article-header {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
}

.article-title {
    margin: 0;
    font-size: 1.0em;
    color: #ffffff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 400px;
}

.article-author {
    font-weight: 500;
    color: #aaf;
    font-size: 0.9em;
    margin-left: 10px;
    margin-right: auto;
}

.article-date {
    color: #a0a0f0a0;
    font-size: 0.9em;
    margin-left: auto;
    margin-right: 0;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #8498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 20px auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
