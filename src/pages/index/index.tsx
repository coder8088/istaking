import {ConnectButton} from "@rainbow-me/rainbowkit";
import {waitForTransactionReceipt} from "viem/actions";
import {addresses, config} from "../../config";
import './index.css';

import contractABI from "../../../artifacts/contracts/IStaking.sol/IStaking.json";
import {Address, BaseError, parseEther} from "viem";
import {useAccount, useWriteContract} from "wagmi";
import {Button, Flex, Layout, Typography} from "antd";
import {Content, Header} from "antd/es/layout/layout";
import {StakingCard} from "./components/StakingCard.tsx";
import {MintCard} from "./components/MintCard.tsx";
import {isOwner} from "../../utils/account.ts";
import {StartStakingCard} from "./components/StartStakingCard.tsx";

export const Index = () => {
    const {address} = useAccount();
    const {writeContract} = useWriteContract({config});

    const startStaking = async () => {
        try {
            writeContract({
                address: addresses.sktTokenAddress as Address,
                abi: contractABI.abi,
                functionName: "start",
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
        <Flex gap="middle" wrap vertical className="app-container">
            <Layout>
                <Header>
                    <Typography.Text strong style={{fontSize: '36px'}}>iStaking</Typography.Text>
                    <ConnectButton/>
                </Header>
                <Content>
                    <Flex vertical gap={"md"} align="center">
                        {isOwner(address as Address) &&
                            <Flex gap={20} vertical align="center" style={{width: '100%'}}>
                                <MintCard />
                                <StartStakingCard />
                            </Flex>
                        }
                        <StakingCard />
                    </Flex>
                </Content>
            </Layout>
        </Flex>
    )
}