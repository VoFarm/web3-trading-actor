<script>
  import Row from "https://denopkg.com/crewdevio/Snel-carbon@main/components/Grid/Row.svelte";
  import Grid from "https://denopkg.com/crewdevio/Snel-carbon@main/components/Grid/Grid.svelte";
  import Column from "https://denopkg.com/crewdevio/Snel-carbon@main/components/Grid/Column.svelte";
  import Link from "https://denopkg.com/crewdevio/Snel-carbon@main/components/Link/Link.svelte";
  import Folder24 from "https://denopkg.com/crewdevio/Snel-carbon@main/icons/Folder24/Folder24.svelte";
  import Document24 from "https://denopkg.com/crewdevio/Snel-carbon@main/icons/Document24/Document24.svelte";
  import Chat24 from "https://denopkg.com/crewdevio/Snel-carbon@main/icons/Chat24/Chat24.svelte";
</script>


<div id="header">
  <div style="margin: 12px auto; margin-right: 0;">
    <img width="125px" src="https://raw.githubusercontent.com/michael-spengler/decentralized-finance/main/logo-v2.svg" alt="DeFi Logo">
    <h2 id="title">Volatility Farm</h2>
  </div>
  <Grid id="titleGrid" style="margin: 12px auto;">
    <Row padding="30px">
      <Column style="outline: 1px solid">
        <Link href="https://github.com/distributed-ledger-technology">
          <div>
            <Folder24/>
            <p>Source Code</p>
          </div>
        </Link>
      </Column>
    </Row>
    <Row padding="30px">
      <Column style="outline: 1px solid">
        <Link href="https://github.com/distributed-ledger-technology">
          <div>
            <Document24/>
            <p>VoFarm Smart Contract</p>
          </div>
        </Link>
      </Column>
    </Row>
    <Row padding="30px">
      <Column style="outline: 1px solid">
        <Link href="https://github.com/distributed-ledger-technology">
          <div>
            <Chat24/>
            <p>Community</p>
          </div>
        </Link>
      </Column>
    </Row>
  </Grid>
</div>

<style>
    #header {
        width: 50%;
        margin: 0 auto;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    #title {
        white-space: nowrap;
        padding-top: 30px;
    }
</style>
