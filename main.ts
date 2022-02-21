import { main as ContractActor } from './contract-actor/main.ts';
import { main as ActorAPI } from './actor-api/main.ts';

function main() {
  ActorAPI()

  ContractActor().then((exit) => {
    if (!exit) {
      console.log("Failed to Initialize Actor")
      Deno.exit(1)
    } else {
      Deno.exit(0)
    }
  })
}

main()
