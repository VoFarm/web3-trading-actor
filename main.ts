import { main as ContractActor } from './contract-actor/main.ts';
import { main as ActorInterface } from './actor-interface/main.ts';

localStorage.clear();

ActorInterface();
ContractActor();
