const main = async () => {
  const contractFactory = await hre.ethers.getContractFactory("Fanime");
  const contract = await contractFactory.deploy(
    ["Light", "Tanjiro", "Eren"],
    [
      "https://media.giphy.com/media/EcnAlQcGnZq9y/giphy.gif",
      "https://media.giphy.com/media/TdoiN7rZuGDJPs2rAS/giphy.gif",
      "https://media.giphy.com/media/3o7bugwhhJE9WhxkYw/giphy.gif",
    ],
    [1000, 500, 100],
    [100, 500, 1000],
    "Rick and Morty",
    "https://media0.giphy.com/media/8HhbENQPdWUoM/giphy.gif?cid=ecf05e4764fo6uajsl6soddksx5pcemcew2168d5jdnydxcg&rid=giphy.gif&ct=g",
    2000,
    50
  );
  await contract.deployed();
  console.log("Contract Address:", contract.address);
  let txn;
  txn = await contract.mint(2);
  await txn.wait();
  txn = await contract.attack();
  await txn.wait();
};

const run = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
