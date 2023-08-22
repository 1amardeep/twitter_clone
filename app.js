const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const moongoose = require("./database");
const session = require("express-session");

const port = process.env.PORT || 3003;
const middleware = require("./middleware");

const server = app.listen(port, () =>
  console.log("server listening on port :" + port)
);

app.set("view engine", "pug");
app.set("views", "views");

app.use(
  session({
    secret: "twitter clone",
    resave: true,
    saveUninitialized: false,
  })
);

//static css path

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

//routes
const loginRouter = require("./routes/loginRoutes");
const registerRouter = require("./routes/registerRoutes");
const logoutRouter = require("./routes/logout");
const postPageRouter = require("./routes/postRoutes");

// api routes
const postApiRouter = require("./routes/api/posts");

app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/logout", logoutRouter);
app.use("/posts", middleware.requiredLogin, postPageRouter);

app.use("/api/posts", postApiRouter);

app.get("/", middleware.requiredLogin, (req, res, next) => {
  var payload = {
    user: req.session.user,
    application: "Twitter",
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render("home", payload);
});
