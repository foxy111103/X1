# X1 Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

## Getting Started

1. Clone the Repository-->
   git clone https://github.com/foxy111103/X1.git
   cd X1

## Install Dependencies
   npm install

## Start a Local Node
   npx hardhat node

## Scripts (run this scripts in another terminal)
1. Compile Contracts-->
   npx hardhat compile
   
2. Run Tests-->
   npx hardhat test (deployment will be done automatically while testing)

## Manual Deploy
   npx hardhat run scripts/deploy.js


Project Structure==>

contracts/: Contains Solidity smart contracts.

scripts/: Deployment scripts.

test/: Test files for the contracts.

ignition/modules/: Deployment modules for Hardhat Ignition.
