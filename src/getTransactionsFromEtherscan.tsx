import axios from "axios";

// get transactions of an account
const getTransactions = async (accId: string) => {
    try {
        // Use Etherscan API to get transaction history
        // Note: Replace 'YOUR_ETHERSCAN_API_KEY' with your actual Etherscan API key
        const etherscanApiKey = process.env.VITE_ETHERSCAN_API_KEY;
        const etherscanApiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${accId}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`;

        const response = await axios.get(etherscanApiUrl);
        const transactions = response.data.result;

        console.log('Transaction history:', transactions);
        return transactions;
    } catch (error) {
        console.error('Error fetching transaction history:', error);
    }
};

export default getTransactions;
