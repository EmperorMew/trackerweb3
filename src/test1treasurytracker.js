import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { formatUnits } from 'web3-utils';
import { BigNumber } from 'bignumber.js';
import { Table } from 'react-bootstrap';

const web3 = new Web3(new Web3.providers.HttpProvider('https://avalanche-fuji.infura.io/v3/1e69b4de2e624b3f80021f6167332669'));
const treasuryContract = new web3.eth.Contract(treasuryAbi, treasuryAddress);

function TreasuryTracker() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function fetchTreasuryData() {
      // Fetch the DAO's treasury balance
      const balanceWei = await treasuryContract.methods.getBalance().call();
      const balance = formatUnits(new BigNumber(balanceWei), 18);
      setBalance(balance);

      // Fetch the 10 most recent transactions from the treasury
      const blockNumber = await web3.eth.getBlockNumber();
      const events = await treasuryContract.getPastEvents('Transfer', {
        fromBlock: blockNumber - 1000,
        toBlock: 'latest'
      });

      const recentTransactions = events.map(event => {
        const { blockNumber, returnValues: { from, to, value } } = event;
        return {
          blockNumber,
          from,
          to,
          value: formatUnits(new BigNumber(value), 18)
        };
      }).slice(0, 10);

      setTransactions(recentTransactions);
    }

    fetchTreasuryData();
  }, []);

  return (
    <div>
      <h2>Treasury Tracker</h2>
      <p>The DAO's treasury balance is: {balance} AVAX</p>
      <h3>Recent Transactions</h3>
      <Table>
        <thead>
          <tr>
            <th>Block Number</th>
            <th>From</th>
            <th>To</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.blockNumber}>
              <td>{tx.blockNumber}</td>
              <td>{tx.from}</td>
              <td>{tx.to}</td>
              <td>{tx.value} AVAX</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default TreasuryTracker;
