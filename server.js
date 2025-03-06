import express from "express";

let app = express();

app.use(express.static("./dist/"));

app.use((req, res, next) => {
    res.sendFile("index.html", { root: "./dist/" });
    next();
});

app.listen(3030);