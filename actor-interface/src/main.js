import Home from './Home.svelte';

const home = new Home({
  target: document.querySelector('#__snel'),
  props: { amountOfIterations: 24, transactionExplorer: 'https://rinkeby.etherscan.io/tx/' },
});
