<svelte:head>
  <link
      rel="stylesheet"
      href="https://unpkg.com/carbon-components-svelte/css/white.css"
  />
</svelte:head>

<script>
  export let amountOfIterations
  export let transactionExplorer

  import Main from "@/components/Main.svelte";
  import Dashboard from "@/components/Dashboard.svelte";
  import SiteHeader from "@/components/SiteHeader.svelte";
  import { fade } from "svelte/transition";

</script>

<main transition:fade>
  <SiteHeader/>
  <div style="height: 3rem"></div>
  <Main/>
  <hr>
  <Dashboard amountOfIterations={amountOfIterations} transactionExplorer={transactionExplorer}/>
</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }

    :global(.bx--accordion__item--active .bx--accordion__content) {
        padding: 0 !important;
        margin: 0 !important;
    }

    :global(.bx--structured-list) {
        margin: 0 !important;
    }
</style>
