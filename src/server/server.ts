import * as errorHandler from "errorhandler";
import { http, app } from "./app";

// Remove for production
app.use(errorHandler());

http.listen(app.get("port"), () => {
  console.log(("  App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
  console.log("  Press CTRL-C to stop\n");
});
