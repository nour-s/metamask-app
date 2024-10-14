// SendETHModal.js
import { useState } from 'react';
import ReactModal from 'react-modal';
import './SendETHModal.css';

interface SendETHModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    handleSendTransaction: (from: string, to: string, amount: string) => void;
    accounts: Map<string, { balance: number }>;
}

const SendETHModal: React.FC<SendETHModalProps> = ({ isOpen, setIsOpen, onClose, handleSendTransaction, accounts }) => {

    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        handleSendTransaction(from, to, amount);
        onClose();
    };

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            contentLabel="Transfer ETH"
            className="modal-content"
            style={{
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(1px)',
                },
            }}
        >
            <h2 className="modal-title">Send ETH</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="fromAccount">From:</label>
                    <select
                        id="fromAccount"
                        className="form-control"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    >
                        <option value="">Select Account</option>
                        {Array.from(accounts.keys()).map((id) => (
                            <option key={id} value={id}>
                                {id} (Balance: {accounts.get(id)?.balance} ETH)
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="toAccount">To:</label>
                    <input
                        type="text"
                        id="toAccount"
                        className="form-control"
                        placeholder="Enter recipient address"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Amount (ETH):</label>
                    <input
                        type="number"
                        id="amount"
                        className="form-control"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Send
                </button>
            </form>
        </ReactModal>
    );
};

export default SendETHModal;
