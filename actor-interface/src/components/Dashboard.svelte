<script>
  import Iterations from "./Iterations.svelte";
  import Row from "https://denopkg.com/crewdevio/Snel-carbon@main/components/Grid/Row.svelte";
  import Grid from "https://denopkg.com/crewdevio/Snel-carbon@main/components/Grid/Grid.svelte";
  import Column from "https://denopkg.com/crewdevio/Snel-carbon@main/components/Grid/Column.svelte";
  import Tile from "https://denopkg.com/crewdevio/Snel-carbon@main/components/Tile/Tile.svelte";

  export let amountOfIterations
  export let transactionExplorer
  let iterations = []
  let counter = 0

  // get max amount of iterations
  fetch("/count").then(async (countResponse) => {
    counter = await countResponse.json()

    // get past iterations
    for (let i = counter; i >= ((counter - amountOfIterations) < 0 ? 0 : (counter - amountOfIterations)); i--) {
      const response = await fetch(`/iteration?id=${ i }`)
      iterations.push(await response.json())
    }
    // assign to create iterations component
    iterations = iterations
  })

  /**
   * returns amount of successful iterations
   *
   * @return {number}
   */
  function amountSuccessfulIterations() {
    return iterations.filter((iteration) => iteration.success && !iteration.inProgress).length
  }

  /**
   * returns amount of fetched iterations
   *
   * @return {number}
   */
  function amountIterations() {
    return iterations.length
  }

  /**
   * return amount of traded iterations
   *
   * @return {number}
   */
  function tradedIterations() {
    return iterations.filter((iteration) => iteration.traded !== "hold").length
  }

  /**
   * estimate amount of fees spent for previous iterations
   *
   * @return {number}
   */
  function calculateFees() {
    return iterations.reduce((prev, iteration) => prev + iteration.tx.reduce((prev, current) => current.gasLimit * current.gasPrice + prev, 0), 0) / (10 ** 18)
  }
</script>

{#if iterations.length > 0}
  <h2 style="padding: 25px">Dashboard</h2>
  <Grid narrow class="titleGrid">
    <Row padding="30px">
      <Column>
        <Tile>
          {amountSuccessfulIterations()} / {amountIterations()} Successful Iterations
        </Tile>
      </Column>
      <Column>
        <Tile>
          {tradedIterations()} Swap Operations
        </Tile>
      </Column>
      <Column>
        <Tile>
          {calculateFees().toFixed(8)} Eth Fees in the Past {amountIterations()} Transactions
        </Tile>
      </Column>
    </Row>
  </Grid>

  <Iterations iterations={iterations} counter={counter} transactionExplorer={transactionExplorer}/>
{/if}
