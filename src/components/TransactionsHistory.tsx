import { TransactionResponse } from 'ethers'
import DataTable, { createTheme } from 'react-data-table-component'
import { formatAddress } from '../utils';

createTheme('solarized', {
    text: {
        primary: '#88ffff',
        secondary: '#2aa198',
    },
    background: {
        default: '#2b2b36',
    },
    context: {
        background: '#cb4b16',
        text: '#FFFFFF',
    },
    divider: {
        default: '#073642',
    },
    action: {
        button: 'rgba(0,0,0,.54)',
        hover: 'rgba(0,0,0,.08)',
        disabled: 'rgba(0,0,0,.12)',
    },
}, 'dark');

const TransactionsHistory = ({ transactions }: { transactions: TransactionResponse[] }) => {
    if (transactions.length === 0) {
        return <div>Loading transactions...</div>
    }

    return (
        <DataTable columns={[
            {
                name: 'Hash',
                selector: r => formatAddress(r.hash),
                sortable: true,
                wrap: true
            },
            {
                name: 'From',
                selector: r => formatAddress(r.from),
                sortable: true,
                wrap: true
            },
            {
                name: 'To',
                selector: r => formatAddress(r.to),
                sortable: true,
                wrap: true
            },
            {
                name: 'Value',
                selector: r => r.value.toString(),
                sortable: true,
                wrap: true
            },
            {
                name: 'Block Number',
                selector: r => r.blockNumber?.toString(),
                sortable: true,
                wrap: true
            },
        ]}
            data={transactions}
            highlightOnHover
            theme="solarized"

        />
    )
}

export default TransactionsHistory
