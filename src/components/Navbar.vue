<template>
    <div class="navbar">
        <RouterLink to="/article/v2beta" class="news-link"><div class="news">
            <p><i class="fa-solid fa-newspaper"></i> TheRed.SH v2 beta is out! <i class="fa-solid fa-arrow-right"></i></p>
        </div></RouterLink>
        <div class="buttons-right">
            <a target="_blank" href="https://www.youtube.com/@its.thered"><button><i class="fa-brands fa-youtube"></i> YouTube</button></a>
            <a target="_blank" href="https://discord.gg/YyvhgeB6rA"><button><i class="fa-brands fa-discord"></i> Discord</button></a>
            <a target="_blank" href="https://bsky.app/profile/theredxd.bsky.social"><button><i class="fa-brands fa-bluesky"></i> Bluesky</button></a>
            <span style="border-right: 1px solid #ddddff60"></span>
            <RouterLink to="/articles"><button><i class="fa-solid fa-newspaper"></i> Articles</button></RouterLink>
        </div>
    </div>
</template>

<style scoped>
.news-link {
    display: flex;
    width: fit-content;
    margin-left: 0;
    text-decoration: none;
}
.news {
    width: fit-content;
    display: flex;
    gap: 1rem;
    align-items: right;
    justify-content: flex-start;
    margin-right: auto;
    margin-left: 0;
    color: #ccccfc;
    background: #615fda40;
    border: 1px solid #615fda;
    padding: 4px 12px;
    border-radius: 4px;
    transition: all .1s ease-in-out;
    backdrop-filter: blur(5px);
    &:hover {
        transform: scale(1.05);
        color: white;
        border-color: white;
        background-color: #ffffff20;
    }
}

button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.4rem 1.5rem;
    border-radius: 8px;
    color: #ddddff;
    font-family: "Iosevka Regular", sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    backdrop-filter: blur(10px);
    transition: all 0.2s ease;
    cursor: pointer;
}

button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

button:active {
    transform: translateY(0px);
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: rgba(0, 0, 0, 0.0);
    backdrop-filter: blur(0px);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 100;
}

.buttons-right {
    width: fit-content;
    display: flex;
    gap: 1rem;
    align-items: right;
    justify-content: flex-end;
    margin-right: 0;
    margin-left: auto;
}
</style>