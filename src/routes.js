function genRoute(path, name) {
    return {
        path,
        name,
        component: () => import(`./pages/Page${name}.vue`),
    }
}

export default [
    genRoute("/", "Home"),
    genRoute("/articles", "Articles"),
    genRoute("/article/:article", "Article"),
    // Catch-all (404)
    genRoute("/:pathMatch(.*)*", "404"),
];
