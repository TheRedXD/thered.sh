<template>
    <div class="error-container">
        <div class="error-content">
            <h1 class="error-title">4<span class="error-zero">0</span>4</h1>
            <p class="error-message">Oops! Page Not Found</p>
            <p class="error-description">
                The page you are looking for might have been removed, had its
                name changed, or is temporarily unavailable.
            </p>
            <router-link to="/" class="error-button">Go Back Home</router-link>
        </div>
    </div>
</template>
<style scoped>
.error-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #8587fa20 0%, #8587fa20 100%);
    text-align: center;
    padding: 20px;
}
.error-content {
    max-width: 600px;
}
.error-title {
    font-size: 120px;
    margin: 0;
    background: linear-gradient(45deg, #6b6bff, #556270);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 900;
}
.error-zero {
    animation: pulse 2s infinite;
}
.error-message {
    font-size: 32px;
    margin: 20px 0;
    color: #8882f0;
}
.error-description {
    color: #ddf;
    margin-bottom: 30px;
    line-height: 1.6;
}
.error-button {
    display: inline-block;
    padding: 15px 30px;
    background: linear-gradient(45deg, #6b6bff, #5562f0);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    transition: all 0.3s ease;
}
.error-button:hover {
    transform: translateY(-3px);
    background: white;
    color: black;
}
@keyframes pulse {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
    100% {
        opacity: 1;
    }
}
</style>
