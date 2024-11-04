import {Button, Card, Flex, Input, InputNumber, message, Space} from "antd";
import {useState} from "react";
import "./MintCard.css";
import contractABI from "../../../../artifacts/contracts/IToken.sol/IToken.json";
import {waitForTransactionReceipt} from "viem/actions";
import {addresses, config} from "../../../config";
import {Address, BaseError, parseEther} from "viem";
import {useWriteContract} from "wagmi";

export const MintCard = () => {
    const [recipientAddress, setRecipientAddress] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const [messageApi, contextHolder] = message.useMessage();
    const {writeContract} = useWriteContract({config});

    const handleMintSkt = async () => {
        handleMint(addresses.sktTokenAddress as Address)
    }

    const handleMintRwt = async () => {
        handleMint(addresses.rwtTokenAddress as Address)
    }

    const handleMint = async (tokenAddress: Address) => {
        const n = Number(amount);
        if (n <= 0) {
            return messageApi.warning('Please enter a positive number for the amount!');
        }
        if (!recipientAddress) {
            return messageApi.warning('Please enter a recipient address!');
        }
        setLoading(true);
        try {
            writeContract({
                address: tokenAddress,
                abi: contractABI.abi,
                functionName: "mint",
                args: [recipientAddress, parseEther(n.toString())],
            }, {
                onSuccess: async (data) => {
                    console.log(data);
                    const txReceipt = await waitForTransactionReceipt(config.getClient(), {hash: data});
                    console.log(txReceipt);
                    if (txReceipt.status === 'success') {
                        messageApi.success("Staked successfully");
                    }
                    setAmount('');
                    setRecipientAddress('');
                    setLoading(false);
                },
                onError: (error) => {
                    console.warn(error);
                    messageApi.error(error.cause?.reason || 'Staking failed');
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error(error);
            messageApi.error('Staking failed: ' + (error as BaseError).details);
            setLoading(false);
        }
    }

    return (
        <>
            {contextHolder}
            <Card title="Mint SKT" className="mint-skt-card">
                <Space direction="vertical" size={10} style={{width: '100%'}}>
                    <Input size="large" placeholder="Enter recipient address" value={recipientAddress}
                           onChange={(e) => setRecipientAddress(e.target.value)}/>
                    <Flex gap={10} align="center" justify="space-between">
                        <InputNumber size="large" placeholder="Enter amount" style={{width: '100%'}} value={amount}
                                     onChange={(value) => setAmount(value ?? '')}/>
                        <Button size="large" loading={loading} type="primary" onClick={handleMintSkt}>Mint SKT</Button>
                        <Button size="large" loading={loading} type="primary" onClick={handleMintRwt}>Mint RWT</Button>
                    </Flex>
                </Space>
            </Card>
        </>
    )
}