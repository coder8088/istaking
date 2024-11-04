import {Button, Card, Flex, InputNumber, message, Typography} from "antd";
import {useWriteContract} from "wagmi";
import {addresses, config} from "../../../config";
import {useState} from "react";
import "./StartStakingCard.css";
import contractABI from "../../../../artifacts/contracts/IStaking.sol/IStaking.json";
import {Address, BaseError} from "viem";
import {readContract, waitForTransactionReceipt} from "viem/actions";
import {formatDatetime, formatDatetimeFromTimestamp} from "../../../utils/datetime.ts";

const day = 24 * 60 * 60 * 1000;

export const StartStakingCard = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const {writeContract} = useWriteContract({config});

    const [totalRewards, setTotalRewards] = useState<string>('10000');
    const [extraRewardsRatios, setExtraRewardsRatios] = useState<string>('20');
    const [stakingDuration, setStakingDuration] = useState<string>('30');
    const [stakingStartTime, setStakingStartTime] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const startStaking = async () => {
        setLoading(true);
        try {
            writeContract({
                address: addresses.contractAddress as Address,
                abi: contractABI.abi,
                functionName: "start",
                args: [Number(totalRewards), Number(extraRewardsRatios), Number(stakingDuration) * day],
            }, {
                onSuccess: async (data) => {
                    console.log(data);
                    const txReceipt = await waitForTransactionReceipt(config.getClient(), {hash: data});
                    console.log(txReceipt);
                    if (txReceipt.status === 'success') {
                        messageApi.success("Start staking successfully");
                    }
                    setLoading(false);
                },
                onError: (error) => {
                    console.warn(error);
                    messageApi.error(error.cause?.reason || 'Start staking failed');
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error(error);
            messageApi.error('Start staking failed: ' + (error as BaseError).details);
            setLoading(false);
        }
    }

    const getStakingStartTime = async () => {
        const result = await readContract(config.getClient(), {
            address: addresses.contractAddress as Address,
            abi: contractABI.abi,
            functionName: "stakingStartTime",
            args: [],
        });
        setStakingStartTime(formatDatetimeFromTimestamp(Number(result) * 1000));
    }

    return (
        <>
            {contextHolder}
            <Card title="Start Staking" className="start-staking-card">
                <Flex vertical gap={10} align="center" style={{width: '100%'}}>
                    <InputNumber suffix="RWT" step={1} precision={0} min="0" size="large"
                                 placeholder="Enter total rewards" style={{width: '100%'}} value={totalRewards}
                                 onChange={(value) => setTotalRewards(value ?? '')}/>
                    <InputNumber suffix="%" min="0" max="100" step={1} precision={0} size="large"
                                 placeholder="Enter extra rewards ratios" style={{width: '100%'}}
                                 value={extraRewardsRatios}
                                 onChange={(value) => setExtraRewardsRatios(value ?? '')}/>
                    <InputNumber suffix="Days" step={1} precision={0} min="0" size="large"
                                 placeholder="Enter staking duration" style={{width: '100%'}} value={stakingDuration}
                                 onChange={(value) => setStakingDuration(value ?? '')}/>

                    <Button size="large" loading={loading} type="primary" onClick={startStaking}
                            style={{width: 100}}>Start</Button>
                    <Typography.Text>
                        Staking started at {stakingStartTime}.<Button type="link" onClick={getStakingStartTime}>Refresh</Button>
                    </Typography.Text>
                    <Typography.Text>
                        Staking duration: {stakingDuration} days.
                    </Typography.Text>
                </Flex>
            </Card>
        </>
    )
}