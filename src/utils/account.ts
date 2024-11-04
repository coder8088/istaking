import {Address} from "viem";
import {addresses} from "../config";

export const isOwner = (account: Address) => {
    return account?.toLowerCase() === addresses.owner;
}