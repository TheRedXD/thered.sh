import express from "express";

let app = express();

app.use(express.static("./dist/"));

app.use((req, res) => {
    res.sendFile("index.html", { root: "./dist/" });
});

app.listen(3030);