import {Avatar, Button, Card, Flex, message, Space} from "antd";
import {useEffect, useState} from "react";
import "./StakingCard.css";
import {readContract, waitForTransactionReceipt} from "viem/actions";
import {addresses, config} from "../../../config";
import contractABI from "../../../../artifacts/contracts/IStaking.sol/IStaking.json";
import {useAccount, useBalance, useWriteContract} from "wagmi";
import {Address, BaseError, formatEther} from "viem";

export const StakingCard = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [amountStr, setAmountStr] = useState<string>('');
    const [rwtBalance, setRwtBalance] = useState<string>('');
    const [stakedAmount, setStakedAmount] = useState<string>('');
    const amount = Number(amountStr);
    const account = useAccount();

    const {writeContract} = useWriteContract({config});

    const sktBalance = useBalance({
        address: account.address,
        token: addresses.sktTokenAddress as Address,
        config
    });

    // console.log(sktBalance);

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmountStr(event.target.value);
    }

    useEffect(() => {
        if (account && account.address) {
            getStakeInfo();
        }
    });

/*    const result = useReadContract({
        address: addresses.contractAddress as Address,
        abi: contractABI.abi,
        functionName: "getStakeInfo",
        args: [],
        account: account.address
    });*/


    const getStakeInfo = async () => {
        if (!account) {
            return messageApi.error("Connect wallet first");
        }
        try {
            const [staked, rewards] = await readContract(config.getClient(), {
                address: addresses.contractAddress as Address,
                abi: contractABI.abi,
                functionName: "getStakeInfo",
                args: [],
                account: account.address
            }) as [bigint, bigint, bigint];
            setStakedAmount(staked.toString());
            setRwtBalance(rewards.toString());
        } catch (error) {
            console.error(error);
            messageApi.error('Getting staking info failed: ' + (error as BaseError).details);
        }
    }

    const stack = async () => {
        if (amount > 50) {
            if (!account) {
                return messageApi.error("Connect wallet first");
            }
            try {
                writeContract({
                    address: addresses.contractAddress as Address,
                    abi: contractABI.abi,
                    functionName: "stake",
                    args: [amount],

                }, {
                    onSuccess: async (data) => {
                        console.log(data);
                        const txReceipt = await waitForTransactionReceipt(config.getClient(), {hash: data});
                        console.log(txReceipt);
                        if (txReceipt.status === 'success') {
                            messageApi.success("Staked successfully");
                        }
                    },
                    onError: (error) => {
                        console.warn(error);
                        messageApi.error(error.cause?.reason || 'Staking failed');
                    }
                });
            } catch (error) {
                console.error(error);
                messageApi.error('Staking failed: ' + (error as BaseError).details);
            }
        } else {
            messageApi.warning("50 SKT at least");
        }
    }

    return (
        <>
            {contextHolder}
            <Card title="Lock SKT to get RWT and IST" className="staking-card">
                <Space direction="vertical" size="middle" style={{display: "flex"}}>
                    <div className="amount-card">
                        <Flex align="center">
                            <Avatar size={50} style={{backgroundColor: "#7a6eaa"}}>SKT</Avatar>
                            <Flex align="center" className="staking-input-wrapper">
                                <Flex vertical>
                                    <input pattern="^[0-9]*$"
                                           inputMode="decimal"
                                           min="0"
                                           placeholder="0.0"
                                           value={amountStr}
                                           className="amount-input"
                                           onChange={handleAmountChange}/>
                                    <span style={{
                                        padding: "0 16px",
                                        color: "#7a6eaa",
                                        fontSize: 12,
                                        lineHeight: 1.5,
                                        fontWeight: 400,
                                        marginTop: 0
                                    }}>Balance: {formatEther(sktBalance.data?.value ?? 0n)}</span>
                                </Flex>
                                <Flex vertical align="end" justify="center">
                                    <Button size="middle" type="primary" style={{marginTop: 0}} onClick={stack}>Stack</Button>
                                    <span style={{
                                        color: "#8a7ecc",
                                        fontSize: 13,
                                        marginRight: 5,
                                        marginTop: 5
                                    }}>Staked: {stakedAmount}</span>
                                </Flex>
                            </Flex>
                        </Flex>
                    </div>
                    <div className="reward-card">
                        <Flex align="center" gap="middle">
                            <Avatar size={50} style={{backgroundColor: "#f5a623"}}>RWT</Avatar>
                            <Flex align="center" className="reward-balance-wrapper">
                                <div className="reward-label">MY Rewards (RWT)</div>
                                <div className="reward-balance">{formatEther(rwtBalance.data?.value ?? 0n)}</div>
                            </Flex>
                        </Flex>
                    </div>
                </Space>
            </Card>
        </>
    )
}