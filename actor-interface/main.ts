import { opine } from "https://deno.land/x/opine@2.1.1/src/opine.ts";
import { opineCors } from "https://deno.land/x/cors/mod.ts";
import { Storage } from "../contract-actor/components/storage.ts";

export function main() {
  const app = opine();
  app.use(opineCors());

  app.get("/log", (req, res) => {
    res.json(Storage.getConsoleLog(req.query.id));
  });

  app.get("/iteration", (req, res) => {
    res.json(Storage.getIteration(req.query.id));
  });

  app.get("/priority", (req, res) => {
    res.json(Storage.getPriority());
  });

  app.get("/count", (req, res) => {
    res.send(String(Storage.getIterationCounter()));
  });

  app.get("/", (req, res) => {
    res.sendFile(Deno.cwd() + "/actor-interface/main.html");
  });

  app.listen(3001, () => console.log("Starting at: http://localhost:3001"));
}
